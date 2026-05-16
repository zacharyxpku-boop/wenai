import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/ratelimit';
import { checkCostCap, recordCostWithDetail, COST_ESTIMATE_CENTS } from '@/lib/cost-cap';
import { resolveOrgContext } from '@/lib/org-id';
import { buildImageCacheKey, getImageCache, setImageCache } from '@/lib/image-cache';
import { recordCacheEvent } from '@/lib/cache-stats';

/**
 * AI 视频生成 · 阿里通义万相 wanx2.1 i2v (image-to-video)
 *
 * 复用现有 AI_API_KEY (DashScope),不需要新 key
 * 参考: https://help.aliyun.com/zh/model-studio/developer-reference/image-to-video-api-reference
 *
 * 计费 (2025 公开报价):
 *   - wanx2.1-i2v-turbo:  ~¥0.7/s · 720p · 4-5s 视频
 *   - wanx2.1-i2v-plus :  ~¥1.4/s · 1080p · 更高画质
 *
 * 替代真人拍摄/剪辑成本 ¥500-3K/条
 *
 * 工作流闭环 (来自冉胖子方法):
 *   AI 影棚生模特图 → 模特换装 → 这里生成动态展示视频
 */

// ============================================================
// Provider 选择
//   1. HAPPYHORSE_API_KEY 存在 → 走国内中转 hh 接口 (推荐, base64 直传不要公网 URL)
//   2. 否则 AI_API_KEY 存在 → 走 DashScope 直连 wanx (要求公网 imageUrl)
//   3. 都没有 → 503
// ============================================================

// DashScope 直连
const I2V_SUBMIT_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis';
const I2V_TASK_URL = 'https://dashscope.aliyuncs.com/api/v1/tasks';

// HappyHorse / Leone Cloud
const HH_BASE = process.env.HAPPYHORSE_BASE_URL || 'https://mm-internal-cn.leonecloud.com';
const HH_HH_CREATE = `${HH_BASE}/api/v2/open/aigc/hh`;
const HH_HH_QUERY = (id: string) => `${HH_BASE}/api/v2/open/aigc/${id}`;

interface VideoBody {
  scenario: 'model-display' | 'product-rotate' | 'lifestyle-clip' | 'custom';
  prompt: string;
  imageUrl?: string;       // 公网可访问图片 URL
  imageBase64?: string;    // 或 dataURL (HappyHorse 模式直接拿 base64,免上传图床)
  duration?: number;       // 3-15s (HappyHorse), 4-5s (wanx 直连)
  resolution?: '720P' | '1080P';
  ratio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  model?: 'wanx2.1-i2v-turbo' | 'wanx2.1-i2v-plus';
  watermark?: boolean;
  fromPipeline?: boolean;
  dryRun?: boolean;
  skuId?: string;
}

const SCENARIO_ALLOWED = new Set(['model-display', 'product-rotate', 'lifestyle-clip', 'custom']);

interface WanxVideoTask {
  output?: {
    task_id?: string;
    task_status?: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
    video_url?: string;
    message?: string;
  };
}

async function submitTask(apiKey: string, body: {
  model: string;
  prompt: string;
  imageUrl: string;
  duration: number;
  resolution: string;
}): Promise<string | null> {
  const res = await fetch(I2V_SUBMIT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: body.model,
      input: {
        prompt: body.prompt,
        img_url: body.imageUrl,
      },
      parameters: {
        duration: body.duration,
        resolution: body.resolution,
        prompt_extend: true,
      },
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`wanx i2v submit HTTP ${res.status}: ${txt.slice(0, 300)}`);
  }
  const data: WanxVideoTask = await res.json();
  return data.output?.task_id || null;
}

async function pollTask(apiKey: string, taskId: string, maxMs = 180000): Promise<{
  ok: boolean;
  videoUrl?: string;
  error?: string;
}> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    await new Promise(r => setTimeout(r, 4000));
    const res = await fetch(`${I2V_TASK_URL}/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) continue;
    const data: WanxVideoTask = await res.json();
    const status = data.output?.task_status;
    if (status === 'SUCCEEDED') {
      const url = data.output?.video_url;
      if (url) return { ok: true, videoUrl: url };
      return { ok: false, error: 'no video_url in result' };
    }
    if (status === 'FAILED') {
      return { ok: false, error: data.output?.message || 'task failed' };
    }
  }
  return { ok: false, error: 'timeout (3 min)' };
}

// ============================================================
// HappyHorse hh 接口 · 国内中转, base64 直传
// ============================================================

interface HHHTaskCreate {
  code: number;
  msg: string;
  data?: { taskId: string; status: string };
}
interface HHHTaskQuery {
  code: number;
  msg: string;
  data?: {
    taskId: string;
    status: 'processing' | 'success' | 'failed';
    result?: string[];
    errorMsg?: string;
  };
}

function dataUrlToBase64(s: string): string | null {
  const m = s.match(/^data:image\/[a-zA-Z+]+;base64,(.+)$/);
  return m ? m[1] : null;
}

async function viaHappyhorseHh(args: {
  apiKey: string;
  prompt: string;
  imageUrl?: string;
  imageBase64?: string;
  resolution: string;
  ratio: string;
  duration: number;
  watermark: boolean;
  scenario: string;
}): Promise<NextResponse> {
  const { apiKey, prompt, imageUrl, imageBase64, resolution, ratio, duration, watermark, scenario } = args;

  const create: Record<string, unknown> = {
    prompt,
    resolution,
    ratio,
    duration,
    watermark,
  };

  // 优先 base64 (HappyHorse 接受 base64File, 不带 data: 前缀)
  if (imageBase64) {
    const b64 = imageBase64.startsWith('data:') ? dataUrlToBase64(imageBase64) : imageBase64;
    if (b64) {
      create.genType = 'i2v';
      create.base64File = b64;
    }
  } else if (imageUrl) {
    create.genType = 'i2v';
    create.imageUrls = [imageUrl];
  }
  // 否则 t2v (默认)

  const r = await fetch(HH_HH_CREATE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(create),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    return NextResponse.json(
      {
        error: `HappyHorse hh HTTP ${r.status}`,
        detail: txt.slice(0, 600),
        code: r.status === 401 ? 'INVALID_KEY' : 'HH_UPSTREAM',
      },
      { status: r.status === 401 ? 401 : 502 }
    );
  }
  const created: HHHTaskCreate = await r.json();
  if (created.code !== 0 || !created.data?.taskId) {
    return NextResponse.json(
      { error: `HappyHorse 创建视频任务失败: ${created.msg ?? 'unknown'}`, raw: created },
      { status: 502 }
    );
  }
  const taskId = created.data.taskId;

  // 轮询 (HappyHorse 文档: 3s -> 5s -> 10s 阶梯, 视频 1-3 分钟)
  const start = Date.now();
  const timeoutMs = 240_000;
  let pollDelay = 3_000;
  let queried: HHHTaskQuery | null = null;
  while (Date.now() - start < timeoutMs) {
    await new Promise(rs => setTimeout(rs, pollDelay));
    const elapsed = Date.now() - start;
    if (elapsed > 30_000) pollDelay = 5_000;
    if (elapsed > 120_000) pollDelay = 10_000;

    const qr = await fetch(HH_HH_QUERY(taskId), {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!qr.ok) continue;
    queried = await qr.json();
    if (!queried || queried.code !== 0) continue;
    const st = queried.data?.status;
    if (st === 'success' || st === 'failed') break;
  }

  if (!queried?.data) {
    return NextResponse.json({ error: 'HappyHorse hh 轮询超时', taskId }, { status: 504 });
  }
  if (queried.data.status === 'failed') {
    return NextResponse.json(
      { error: `HappyHorse hh 失败: ${queried.data.errorMsg ?? '未知'}`, taskId },
      { status: 502 }
    );
  }
  const urls = queried.data.result ?? [];
  if (urls.length === 0) {
    return NextResponse.json({ error: 'HappyHorse 成功但无视频 URL', taskId }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    videoUrl: urls[0],
    taskId,
    duration,
    resolution,
    ratio,
    model: 'happyhorse-hh',
    cost: { perSecondCny: 0, totalCny: 0, note: 'HappyHorse 计费走账户' },
    scenario,
  });
}

export async function POST(request: NextRequest) {
  let body: VideoBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  if (!body.prompt?.trim() || body.prompt.length > 4000) {
    return NextResponse.json({ error: 'prompt 必填且 ≤ 4000 字' }, { status: 400 });
  }
  if (!SCENARIO_ALLOWED.has(body.scenario)) {
    return NextResponse.json(
      { error: `未知场景 ${body.scenario}`, code: 'INVALID_SCENARIO' },
      { status: 400 }
    );
  }
  // imageUrl 或 imageBase64 二选一 (HappyHorse 模式接受 base64), 都没就走 t2v
  const hasImage = !!(body.imageUrl || body.imageBase64);

  const duration = Math.min(Math.max(body.duration ?? 5, 3), 15);
  const resolution = body.resolution === '1080P' ? '1080P' : '720P';
  const ratio = body.ratio || '16:9';
  const model = body.model || 'wanx2.1-i2v-turbo';
  const watermark = body.watermark !== false;

  if (body.dryRun) {
    return NextResponse.json({
      dryRun: true,
      validated: {
        scenario: body.scenario, duration, resolution, ratio, model,
        promptLength: body.prompt.length,
        hasImage,
        imageMode: body.imageBase64 ? 'base64' : body.imageUrl ? 'url' : 't2v',
      },
    });
  }

  // 限流 · orgId 走统一 helper
  const { orgId: rateKey, plan } = await resolveOrgContext(request);

  if (!body.fromPipeline) {
    const limit = await checkRateLimit('video-gen', rateKey, plan);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'AI 视频配额已达上限,明日再试', resetAt: limit.resetAt },
        { status: 429 }
      );
    }
  }

  // 内容哈希缓存 · 同 prompt + 同图 + 同尺寸/时长/模型 ¥0 复用
  // 视频比图更贵 (¥3-7/条), 缓存 ROI 更高
  // ?fresh=1 强刷
  const fresh = request.nextUrl?.searchParams?.get('fresh') === '1';
  const refForCache = body.imageBase64 || body.imageUrl || '';
  const videoCacheHash = buildImageCacheKey({
    prompt: body.prompt,
    mode: 'video',
    scenario: body.scenario,
    size: `${resolution}-${ratio}`,
    quality: `${model}-d${duration}-${watermark ? 'wm' : 'nowm'}`,
    refs: refForCache ? [refForCache] : [],
  });
  if (!fresh) {
    try {
      const cached = await getImageCache(rateKey, videoCacheHash);
      if (cached && typeof cached === 'object') {
        recordCacheEvent(rateKey, 'video', true).catch(() => {});
        return NextResponse.json({
          ...(cached as Record<string, unknown>),
          fromCache: true,
          cacheHash: videoCacheHash,
        });
      }
    } catch {
      /* 缓存读失败不阻塞 */
    }
  }
  recordCacheEvent(rateKey, 'video', false).catch(() => {});

  // 单 org 24h 成本闸 · 视频比图贵, 阈值收紧
  const estVideoCents = resolution === '1080P'
    ? COST_ESTIMATE_CENTS['video-1080p']
    : COST_ESTIMATE_CENTS['video-720p'];
  const cap = await checkCostCap(rateKey, estVideoCents);
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

  // Provider 选择: HappyHorse 优先 (国内中转 + base64 直传)
  const happyhorseKey = process.env.HAPPYHORSE_API_KEY;
  const dashscopeKey = process.env.AI_API_KEY;

  if (happyhorseKey) {
    const r = await viaHappyhorseHh({
      apiKey: happyhorseKey,
      prompt: body.prompt,
      imageUrl: body.imageUrl,
      imageBase64: body.imageBase64,
      resolution,
      ratio,
      duration,
      watermark,
      scenario: body.scenario,
    });
    if (r.status === 200) {
      let taskId: string | undefined;
      let parsedBody: Record<string, unknown> | null = null;
      try {
        const clone = r.clone();
        parsedBody = await clone.json();
        taskId = parsedBody?.taskId as string | undefined;
      } catch {}
      await recordCostWithDetail(rateKey, estVideoCents, {
        module: 'video-gen',
        taskId,
        skuId: body.skuId,
        meta: { scenario: body.scenario, duration, model, size: resolution },
      });
      if (parsedBody) {
        setImageCache(rateKey, videoCacheHash, parsedBody).catch(() => {});
      }
    }
    return r;
  }

  // DashScope 直连 fallback (要求公网 imageUrl)
  if (!dashscopeKey) {
    return NextResponse.json(
      { error: '视频生成服务暂未启用。请先导出生产规格交给团队执行。', code: 'VIDEO_PROVIDER_NOT_CONFIGURED' },
      { status: 503 }
    );
  }
  if (!body.imageUrl) {
    return NextResponse.json(
      { error: '当前视频生成通道需要可访问的参考图链接。请改为导出生产规格手动执行，或补充可访问图片链接后重试。', code: 'VIDEO_REFERENCE_IMAGE_REQUIRED' },
      { status: 400 }
    );
  }
  const apiKey = dashscopeKey;

  try {
    const taskId = await submitTask(apiKey, {
      model,
      prompt: body.prompt,
      imageUrl: body.imageUrl,
      duration: Math.min(Math.max(duration, 4), 5) as 4 | 5,
      resolution,
    });
    if (!taskId) {
      return NextResponse.json({ error: 'wanx 未返回 task_id' }, { status: 502 });
    }

    const poll = await pollTask(apiKey, taskId);
    if (!poll.ok || !poll.videoUrl) {
      return NextResponse.json(
        { error: poll.error || '视频生成失败', taskId, code: 'POLL_FAILED' },
        { status: 502 }
      );
    }

    const perSec = model.includes('plus') ? 1.4 : 0.7;
    const successPayload = {
      ok: true,
      videoUrl: poll.videoUrl,
      taskId,
      duration,
      resolution,
      model,
      cost: { perSecondCny: perSec, totalCny: +(perSec * duration).toFixed(2) },
    };
    // DashScope 直连成功也写一笔成本明细 + 缓存 (此前未对账)
    await recordCostWithDetail(rateKey, estVideoCents, {
      module: 'video-gen',
      taskId,
      skuId: body.skuId,
      meta: { scenario: body.scenario, duration, model, size: resolution },
    });
    setImageCache(rateKey, videoCacheHash, successPayload).catch(() => {});
    return NextResponse.json(successPayload);
  } catch (err) {
    console.error('[video-gen] fatal', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '未知错误', code: 'INTERNAL' },
      { status: 500 }
    );
  }
}
