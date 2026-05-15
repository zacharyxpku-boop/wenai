import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/ratelimit';
import { verifyToken, getCookieName } from '@/lib/auth';
import { inferPlanFromUser } from '@/lib/entitlements';

/**
 * AI 电商主图生成 · Pipeline 03 后端
 *
 * 生图提供商优先级：
 *   1. 阿里通义万相 wanx (默认, 复用 AI_API_KEY · 无需额外配置) ← 当前激活
 *   2. 未配置时返回 503, 前端应导出生产规格交给团队执行
 *
 * 差异化对标 HotClaw：
 * - 品类专属场景预设（5 类 × 3 预设）
 * - 1 SKU → 5 图组合（主图/场景/细节/使用/对比）
 * - 合规前置（商标词在生成 prompt 前被移除）
 * - 阿里万相中文 prompt 原生支持（HotClaw 用英文 Flux 不如本地化）
 */

interface ImageRequest {
  category?: string;
  skuInfo: string;
  scenePreset?: string; // e.g. 'home-kitchen' / 'auto-interior'
  outputs?: Array<'main' | 'scene' | 'detail' | 'lifestyle' | 'compare'>;
}

// Scene presets per category · 中文 prompt 喂 wanx 效果优于英文
const SCENE_PROMPTS: Record<string, Record<string, string>> = {
  home: {
    'home-kitchen': '干净白色厨房台面，晨光从左侧射入，极简北欧风格，浅景深',
    'home-pantry': '整齐的食品储藏货架，标签清晰，暖色环境光，Pinterest 美学',
    'home-living': '胡桃木茶几上，旁边配多肉植物和咖啡杯，自然日光',
  },
  auto: {
    'auto-dashboard': '安装在现代轿车仪表台上，挡风玻璃外夕阳余晖，电影感构图',
    'auto-steering': '方向盘正上方居中摆放，真皮内饰，轮廓光营造氛围',
    'auto-detail': '特写微距拍摄安装机构细节，浅景深，科技产品摄影风格',
  },
  digital: {
    'digital-desk': '极简办公桌上，旁配笔记本电脑和笔记本，晨光透过窗户，编辑摄影风格',
    'digital-outdoor': '夹在徒步背包肩带上，户外徒步小径背景虚化，黄金时刻',
    'digital-detail': '影棚产品拍摄，无缝渐变背景，45 度角主光',
  },
  tool: {
    'tool-workshop': '工匠工作台上，周围散落木屑和木块，温暖钨丝灯光，匠人美学',
    'tool-hand': '人手持工具使用瞬间，背景柔焦，纪实摄影风格',
    'tool-kit': '配件井然排开，俯视平铺构图，影棚灯光',
  },
  living: {
    'living-bathroom': '大理石浴室台面上，柔和晨光，酒店般精致感',
    'living-kitchen': '厨房岛台上，旁配新鲜食材，自然光，美食杂志风格',
    'living-outdoor': '户外野餐布上，旁配零食，草地背景，生活方式摄影',
  },
};

const OUTPUT_DESCRIPTIONS = {
  main: { label: '主图', prompt: '纯白背景电商主图，居中产品，45 度俯视，产品占画面 80%，柔和投影，Amazon listing 规范，超清细节' },
  scene: { label: '场景图', prompt: '真实使用环境中的产品，自然场景，lifestyle 摄影风格，讲故事感' },
  detail: { label: '细节图', prompt: '产品材质工艺微距特写，影棚打光，锐利对焦，工业设计美学' },
  lifestyle: { label: '使用图', prompt: '人手互动使用瞬间，温暖色调，自然抓拍，真实感' },
  compare: { label: '对比图', prompt: '产品与竞品或旧款并列对比，干净示意图叠加，信息图风格' },
};

// Brand word filter — 避免生成 Apple 类商标近似图
const BLOCKED_WORDS = /\b(AirPods|iPhone|Apple|Sony|Samsung|Fluke|Stanley|DeWalt|Yeti|Anker)\b/gi;

function sanitizePrompt(text: string): string {
  return text.replace(BLOCKED_WORDS, '[brand]');
}

// ============================================================
// 阿里通义万相 (wanx) 生图辅助
// ============================================================

const WANX_SUBMIT_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';
const WANX_TASK_URL = 'https://dashscope.aliyuncs.com/api/v1/tasks';
const WANX_MODEL = process.env.WANX_MODEL || 'wanx2.1-t2i-turbo'; // turbo 版 ~6s/图

async function submitWanxTask(apiKey: string, prompt: string): Promise<string | null> {
  const res = await fetch(WANX_SUBMIT_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: WANX_MODEL,
      input: { prompt },
      parameters: {
        size: '1024*1024',
        n: 1,
      },
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`wanx submit HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }
  const data = await res.json();
  return data?.output?.task_id || null;
}

interface WanxTaskResult {
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  url?: string;
  error?: string;
}

async function pollWanxTask(apiKey: string, taskId: string, maxMs = 45000): Promise<WanxTaskResult> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    await new Promise(r => setTimeout(r, 2500));
    const res = await fetch(`${WANX_TASK_URL}/${taskId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!res.ok) continue;
    const data = await res.json();
    const status = data?.output?.task_status;
    if (status === 'SUCCEEDED') {
      const url = data?.output?.results?.[0]?.url;
      if (url) return { status: 'SUCCEEDED', url };
      return { status: 'FAILED', error: 'no url in result' };
    }
    if (status === 'FAILED') {
      return { status: 'FAILED', error: data?.output?.message || 'task failed' };
    }
  }
  return { status: 'FAILED', error: 'timeout' };
}

interface GenViaWanxArgs {
  apiKey: string;
  outputs: Array<'main' | 'scene' | 'detail' | 'lifestyle' | 'compare'>;
  category?: string;
  scenePrompt: string;
  skuInfo: string;
}

async function generateViaWanx(args: GenViaWanxArgs): Promise<Array<{
  type: string; label: string; prompt: string; url: string;
  width: number; height: number; provider: string;
}>> {
  // 1. 为每个 output 构造 prompt (中文优先,wanx 更擅长)
  const promptJobs = args.outputs.map(type => {
    const meta = OUTPUT_DESCRIPTIONS[type];
    // 主图不注入场景（白底就是白底），其他图注入场景
    const scene = type === 'main' ? '' : (args.scenePrompt ? '，' + args.scenePrompt : '');
    const fullPrompt = `${meta.prompt}${scene}。产品信息：${args.skuInfo.slice(0, 200)}`;
    return { type, label: meta.label, prompt: fullPrompt };
  });

  // 2. 并行提交所有 task（wanx 一次 submit 不阻塞）
  const taskIds: Array<{ type: string; label: string; prompt: string; taskId: string | null }> = [];
  await Promise.all(
    promptJobs.map(async job => {
      try {
        const id = await submitWanxTask(args.apiKey, job.prompt);
        taskIds.push({ ...job, taskId: id });
      } catch (err) {
        console.warn('[wanx] submit failed for', job.type, err);
        taskIds.push({ ...job, taskId: null });
      }
    })
  );

  // 3. 并行轮询所有 task（45s 内完成，否则该图失败）
  const results = await Promise.all(
    taskIds.map(async job => {
      if (!job.taskId) return null;
      const poll = await pollWanxTask(args.apiKey, job.taskId);
      if (poll.status === 'SUCCEEDED' && poll.url) {
        return {
          type: job.type,
          label: job.label,
          prompt: job.prompt,
          url: poll.url,
          width: 1024,
          height: 1024,
          provider: 'wanx',
        };
      }
      return null;
    })
  );

  return results.filter(Boolean) as ReturnType<typeof generateViaWanx> extends Promise<infer T> ? T : never;
}

export async function POST(request: NextRequest) {
  let body: ImageRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  const outputs = body.outputs || ['main', 'scene', 'detail', 'lifestyle', 'compare'];

  // category 白名单 · 防未知值注入 · 与 /api/ai 一致策略 (2026-04-20)
  const CAT_ALLOWED = new Set(['home', 'auto', 'digital', 'tool', 'living']);
  if (body.category && !CAT_ALLOWED.has(body.category)) {
    return NextResponse.json(
      { error: `未知 category "${body.category}"`, code: 'INVALID_CATEGORY' },
      { status: 400 }
    );
  }

  // dryRun · 调试用,验证 prompt 构造不真调 wanx
  if ((body as unknown as { dryRun?: boolean }).dryRun === true) {
    return NextResponse.json({
      dryRun: true,
      validated: {
        category: body.category || null,
        scenePreset: body.scenePreset || null,
        outputs,
        skuLength: (body.skuInfo || '').length,
      },
    });
  }

  // 速率限制（Pipeline 级配额）
  let rateKey = request.headers.get('x-tenant-id') || 'default';
  let plan = 'free';
  try {
    const token = request.cookies.get(getCookieName())?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.username) {
        rateKey = payload.username;
        plan = inferPlanFromUser(payload.role);
      }
    }
  } catch {}

  // body.fromPipeline 主路径 · 兼容旧 header 写法 (2026-04-20 前)
  const fromPipeline = (body as unknown as { fromPipeline?: boolean }).fromPipeline === true
    || request.headers.get('x-from-pipeline') === '1';
  if (!fromPipeline) {
    const limit = await checkRateLimit('pipeline:product-image', rateKey, plan);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: '图片生成配额已达上限', resetAt: limit.resetAt },
        { status: 429 }
      );
    }
  }

  const cleanSku = sanitizePrompt(body.skuInfo);
  const scenePrompt = body.scenePreset && body.category
    ? SCENE_PROMPTS[body.category]?.[body.scenePreset] || ''
    : '';

  // ========================================
  // 分支 1：阿里通义万相 wanx（默认，复用 AI_API_KEY）
  // ========================================
  const dashscopeKey = process.env.AI_API_KEY;
  const wanxDisabled = process.env.WANX_DISABLED === '1';

  if (dashscopeKey && !wanxDisabled) {
    try {
      const wanxImages = await generateViaWanx({
        apiKey: dashscopeKey,
        outputs,
        category: body.category,
        scenePrompt,
        skuInfo: cleanSku,
      });
      if (wanxImages.length > 0) {
        return NextResponse.json({
          mock: false,
          provider: 'wanx',
          images: wanxImages,
          scenePromptUsed: scenePrompt,
          categoryUsed: body.category,
        });
      }
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
          { error: '图片生成服务暂不可用，请先导出生产规格交给团队执行。', code: 'IMAGE_PROVIDER_UNAVAILABLE' },
          { status: 502 }
        );
      }
    } catch (err) {
      console.warn('[image-gen] wanx failed:', err);
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
          { error: '图片生成服务暂不可用，请先导出生产规格交给团队执行。', code: 'IMAGE_PROVIDER_UNAVAILABLE' },
          { status: 502 }
        );
      }
    }
  }

  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: '图片生成服务未配置，请先导出生产规格交给团队执行。', code: 'IMAGE_PROVIDER_NOT_CONFIGURED' },
      { status: 503 }
    );
  }

  // 开发环境调试图，仅用于本机 UI 校验，生产环境不可达。
  const localPreviewImages = outputs.map(type => {
    const meta = OUTPUT_DESCRIPTIONS[type];
    const fullPrompt = `${meta.prompt}${scenePrompt ? ', ' + scenePrompt : ''}. Product: ${cleanSku.slice(0, 200)}`;
    const seed = Math.floor(Math.random() * 9999);
    return {
      type,
      label: meta.label,
      prompt: fullPrompt,
      url: `https://picsum.photos/seed/wenai-${type}-${seed}/800/800`,
      width: 800,
      height: 800,
      provider: 'local-preview',
    };
  });

  return NextResponse.json({
    localPreview: true,
    notice: '当前为本机预览结果。正式生成需配置图片生产服务；未配置时请导出生产规格交给团队执行。',
    images: localPreviewImages,
    scenePromptUsed: scenePrompt,
    categoryUsed: body.category,
  });
}
