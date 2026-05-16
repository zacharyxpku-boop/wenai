import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/ratelimit';
import { checkCostCap, recordCostWithDetail, COST_ESTIMATE_CENTS } from '@/lib/cost-cap';
import { resolveOrgContext } from '@/lib/org-id';
import { buildImageCacheKey, getImageCache, setImageCache } from '@/lib/image-cache';
import { recordCacheEvent } from '@/lib/cache-stats';

/**
 * OpenAI gpt-image-1 后端 · AI 影棚旗舰模块
 *
 * 接两条路径:
 *   1. POST /v1/images/generations  (mode: 'generate', 纯 prompt 出图)
 *   2. POST /v1/images/edits       (mode: 'edit', 上传产品图 + prompt 生模特/场景图)
 *
 * 计费 (2025-04 OpenAI 公开报价):
 *   - low quality:    $0.011 / image
 *   - medium quality: $0.042 / image
 *   - high quality:   $0.167 / image
 *   - 1024×1024 / 1024×1536 / 1536×1024 三档
 *
 * 替代真人模特拍摄 ¥3-8K/组的核心论点 → 这条路由是商家最愿付费的入口
 */

// ============================================================
// 影棚后端 · 全部走 HappyHorse / Leone Cloud (GPT Image 2 国内中转)
// 同款 OpenAI 模型, 国内访问稳定, 一个 fc_xxx key 同时调图 + 视频
// ============================================================

const HH_BASE = process.env.HAPPYHORSE_BASE_URL || 'https://mm-internal-cn.leonecloud.com';
const HH_CREATE = `${HH_BASE}/api/v2/open/aigc/gpt-image`;
const HH_QUERY = (id: string) => `${HH_BASE}/api/v2/open/aigc/${id}`;

interface GenerateBody {
  mode?: 'generate' | 'edit';
  scenario:
    | 'model-generate'   // 纯文字生 AI 模特
    | 'outfit-swap'      // 模特图 + 服装图 → 换装
    | 'pose-change'      // 模特图 → 4 种姿势
    | 'scene-change'     // 模特图 → 多场景
    | 'ootd-flatlay'     // 整体造型图 → 单品平铺
    | 'model-photo'      // (历史兼容)
    | 'scene-photo'      // (历史兼容)
    | 'product-enhance'; // (历史兼容)
  prompt: string;
  referenceImage?: string;       // 单图 (历史兼容)
  referenceImages?: string[];    // 多图垫图 · gpt-image-1 /v1/images/edits 支持多个 image[]
  size?: '1024x1024' | '1024x1536' | '1536x1024' | 'auto';
  quality?: 'low' | 'medium' | 'high' | 'auto';
  n?: number;
  fromPipeline?: boolean;
  dryRun?: boolean;
  skuId?: string;  // 关联到我的 SKU 库 (前端从 ?skuId= 读到带过来)
}

const SCENARIO_ALLOWED = new Set([
  'model-generate', 'outfit-swap', 'pose-change', 'scene-change', 'ootd-flatlay',
  'model-photo', 'scene-photo', 'product-enhance', // 历史兼容
]);
const SIZE_ALLOWED = new Set(['1024x1024', '1024x1536', '1536x1024', 'auto']);
const QUALITY_ALLOWED = new Set(['low', 'medium', 'high', 'auto']);

function dataUrlToBuffer(dataUrl: string): { buf: Buffer; mime: string } | null {
  const m = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!m) return null;
  return { mime: m[1], buf: Buffer.from(m[2], 'base64') };
}

// ============================================================
// HappyHorse / Leone Cloud · 国内中转
// 异步任务: POST 创建拿 taskId → GET 轮询 → result URL
// ============================================================

// OpenAI size → HappyHorse aspectRatio 映射
const HH_SIZE_MAP: Record<string, string> = {
  '1024x1024': '1:1',
  '1024x1536': '2:3',
  '1536x1024': '3:2',
  'auto': 'auto',
};

interface HHTaskCreate {
  code: number;
  msg: string;
  data?: { taskId: string; status: string };
}
interface HHTaskQuery {
  code: number;
  msg: string;
  data?: {
    taskId: string;
    status: 'processing' | 'success' | 'failed';
    result?: string[];
    errorMsg?: string;
  };
}

async function viaHappyhorse(args: {
  apiKey: string;
  prompt: string;
  refs: string[];              // 0-N 张垫图 dataURL 或 https URL
  size: string;
  scenario: string;
}): Promise<NextResponse> {
  const { apiKey, prompt, refs, size, scenario } = args;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  // 构造请求 body
  // HappyHorse 文档: base64File 和 imageUrls 可同时使用, base64 图片放 imageUrls 列表最前面
  // 策略: 第 1 张垫图 → base64File (本地上传走 base64), 第 2-16 张 → imageUrls 数组
  //   · 如果第 2+ 张是 https URL → 直接放 imageUrls
  //   · 如果第 2+ 张是 dataURL → 试探 imageUrls 是否接受 data URI (HappyHorse 有支持就跑通)
  const createBody: Record<string, unknown> = {
    prompt,
    aspectRatio: HH_SIZE_MAP[size] ?? 'auto',
  };
  if (refs.length > 0) {
    createBody.genType = 'i2i';
    const first = refs[0];
    if (first.startsWith('data:')) {
      const parsed = dataUrlToBuffer(first);
      if (!parsed) {
        return NextResponse.json(
          { error: 'referenceImages[0] dataURL 解析失败' },
          { status: 400 }
        );
      }
      createBody.base64File = parsed.buf.toString('base64');
    } else if (first.startsWith('http')) {
      createBody.imageUrls = [first];
    }

    // 第 2+ 张
    if (refs.length > 1) {
      const rest = refs.slice(1);
      const existingUrls = (createBody.imageUrls as string[] | undefined) ?? [];
      // 全部塞进 imageUrls (data URI 或 https URL 都试)
      createBody.imageUrls = [...existingUrls, ...rest];
    }
  }

  // 1. 创建任务
  const createRes = await fetch(HH_CREATE, {
    method: 'POST',
    headers,
    body: JSON.stringify(createBody),
  });
  if (!createRes.ok) {
    const txt = await createRes.text().catch(() => '');
    console.warn('[happyhorse] create error', createRes.status, txt.slice(0, 400));
    return NextResponse.json(
      {
        error: `HappyHorse HTTP ${createRes.status}`,
        detail: txt.slice(0, 600),
        code: createRes.status === 401 ? 'INVALID_KEY' : 'HH_UPSTREAM',
      },
      { status: createRes.status === 401 ? 401 : 502 }
    );
  }
  const created: HHTaskCreate = await createRes.json();
  if (created.code !== 0 || !created.data?.taskId) {
    return NextResponse.json(
      { error: `HappyHorse 创建任务失败: ${created.msg ?? 'unknown'}`, raw: created },
      { status: 502 }
    );
  }
  const taskId = created.data.taskId;

  // 2. 轮询任务 · 文档建议 3-10s 间隔, 最多 ~120s
  const start = Date.now();
  const timeoutMs = 180_000;
  let pollDelayMs = 3_000;
  let queried: HHTaskQuery | null = null;
  while (Date.now() - start < timeoutMs) {
    await new Promise(r => setTimeout(r, pollDelayMs));
    const elapsed = Date.now() - start;
    if (elapsed > 30_000) pollDelayMs = 5_000;
    if (elapsed > 120_000) pollDelayMs = 10_000;

    const r = await fetch(HH_QUERY(taskId), {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!r.ok) continue;
    queried = await r.json();
    if (!queried || queried.code !== 0) continue;
    const status = queried.data?.status;
    if (status === 'success' || status === 'failed') break;
  }

  if (!queried?.data) {
    return NextResponse.json({ error: 'HappyHorse 轮询超时(3 分钟)', taskId }, { status: 504 });
  }
  if (queried.data.status === 'failed') {
    return NextResponse.json(
      { error: `HappyHorse 生成失败: ${queried.data.errorMsg ?? '未知'}`, taskId },
      { status: 502 }
    );
  }
  const urls = queried.data.result ?? [];
  if (urls.length === 0) {
    return NextResponse.json({ error: 'HappyHorse 成功但无 result URL', taskId }, { status: 502 });
  }

  // 标准化输出 (跟 OpenAI 路径返回结构一致)
  return NextResponse.json({
    mode: refs.length > 0 ? 'edit' : 'generate',
    scenario,
    size,
    quality: 'medium', // HappyHorse 不暴露 quality, 给个固定值
    images: urls.map((url, i) => ({
      index: i,
      url, // 这里是公网 URL 不是 b64,前端 <img src> 直接用
      revisedPrompt: null,
      provider: 'happyhorse',
      model: 'gpt-image-2',
    })),
    cost: { perImageUsd: 0, totalUsd: 0, note: 'HappyHorse 计费按账户走, 不在响应内' },
    taskId,
  });
}

export async function POST(request: NextRequest) {
  let body: GenerateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  // 校验
  if (!body.prompt?.trim() || body.prompt.length > 4000) {
    return NextResponse.json(
      { error: 'prompt 必填且 ≤ 4000 字' },
      { status: 400 }
    );
  }
  if (!SCENARIO_ALLOWED.has(body.scenario)) {
    return NextResponse.json(
      { error: `未知场景 ${body.scenario}`, code: 'INVALID_SCENARIO' },
      { status: 400 }
    );
  }
  const size = body.size && SIZE_ALLOWED.has(body.size) ? body.size : '1024x1024';
  const quality = body.quality && QUALITY_ALLOWED.has(body.quality) ? body.quality : 'medium';
  const n = Math.min(Math.max(body.n || 1, 1), 4);
  const mode = body.mode === 'edit' ? 'edit' : 'generate';

  // dryRun · 不烧钱验证 prompt + 配额
  if (body.dryRun) {
    const refCount = body.referenceImages?.length ?? (body.referenceImage ? 1 : 0);
    return NextResponse.json({
      dryRun: true,
      validated: { mode, scenario: body.scenario, size, quality, n, promptLength: body.prompt.length, referenceCount: refCount },
    });
  }

  // 限流 · 单独配额 (生图昂贵) · orgId 走统一 helper
  const { orgId: rateKey, plan } = await resolveOrgContext(request);

  if (!body.fromPipeline) {
    const limit = await checkRateLimit('openai-image', rateKey, plan);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'AI 影棚配额已达上限,明日再试', resetAt: limit.resetAt },
        { status: 429 }
      );
    }
  }

  const happyhorseKey = process.env.HAPPYHORSE_API_KEY;
  if (!happyhorseKey) {
    return NextResponse.json(
      {
        error: '影棚生图服务暂未启用。请先导出生产规格交给团队执行。',
        notice: '当前不会返回伪图片结果。',
        code: 'IMAGE_STUDIO_NOT_CONFIGURED',
      },
      { status: 503 }
    );
  }

  // 收集垫图: 优先用 referenceImages 数组, 其次用单图 referenceImage (历史兼容)
  const refList: string[] = body.referenceImages && body.referenceImages.length > 0
    ? body.referenceImages
    : (body.referenceImage ? [body.referenceImage] : []);

  // 内容哈希缓存 · 同 prompt + 同垫图 + 同尺寸/质量 → ¥0 复用上次结果
  // ?fresh=1 强制跳缓存
  const fresh = request.nextUrl?.searchParams?.get('fresh') === '1';
  const imgCacheHash = buildImageCacheKey({
    prompt: body.prompt,
    mode,
    scenario: body.scenario,
    size,
    quality,
    refs: refList,
  });
  if (!fresh) {
    try {
      const cached = await getImageCache(rateKey, imgCacheHash);
      if (cached && typeof cached === 'object') {
        recordCacheEvent(rateKey, 'image', true).catch(() => {});
        return NextResponse.json({
          ...(cached as Record<string, unknown>),
          fromCache: true,
          cacheHash: imgCacheHash,
        });
      }
    } catch {
      /* 缓存读失败不阻塞主链路 */
    }
  }
  // 真发 → miss
  recordCacheEvent(rateKey, 'image', false).catch(() => {});

  // 单 org 24h 成本闸 · 防客户/恶意用户烧爆 HappyHorse 配额
  const estCents = quality === 'high' ? COST_ESTIMATE_CENTS['image-high'] : COST_ESTIMATE_CENTS['image-medium'];
  const cap = await checkCostCap(rateKey, estCents);
  if (!cap.allowed) {
    return NextResponse.json(
      {
        error: cap.reason ?? '今日成本配额已达上限',
        code: 'COST_CAP_REACHED',
        currentCny: +(cap.currentCents / 100).toFixed(2),
        capCny: +(cap.capCents / 100).toFixed(2),
        remainingCny: +(cap.remainingCents / 100).toFixed(2),
      },
      { status: 429 }
    );
  }

  try {
    const response = await viaHappyhorse({
      apiKey: happyhorseKey,
      prompt: body.prompt,
      refs: refList,
      size,
      scenario: body.scenario,
    });
    // 记录实际开销 + 明细 + 写缓存 (HappyHorse 不返回成本, 按估算累加)
    if (response.status === 200) {
      // 尝试从响应里抽 taskId + 完整 payload (clone body 读)
      let taskId: string | undefined;
      let parsedBody: Record<string, unknown> | null = null;
      try {
        const clone = response.clone();
        parsedBody = await clone.json();
        taskId = parsedBody?.taskId as string | undefined;
      } catch {}
      await recordCostWithDetail(rateKey, estCents, {
        module: 'openai-image',
        taskId,
        skuId: body.skuId,
        meta: { scenario: body.scenario, quality, size, count: n },
      });
      // 缓存这次成功结果 (key 已在前面算好)
      if (parsedBody) {
        setImageCache(rateKey, imgCacheHash, parsedBody).catch(() => {});
      }
    }
    return response;
  } catch (err) {
    console.error('[openai-image] fatal', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '未知错误', code: 'INTERNAL' },
      { status: 500 }
    );
  }
}
