import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/ratelimit';
import { verifyToken, getCookieName } from '@/lib/auth';

/**
 * AI 电商主图生成 · Pipeline 03 后端
 *
 * 生图提供商优先级：
 *   1. 阿里通义万相 wanx (默认, 复用 AI_API_KEY · 无需额外配置) ← 当前激活
 *   2. FAL_KEY                  → 走 fal.ai Flux Schnell (预留)
 *   3. REPLICATE_API_TOKEN      → 走 Replicate (预留)
 *   4. Mock (Picsum 占位, 最后回退)
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

// Scene presets per category
const SCENE_PROMPTS: Record<string, Record<string, string>> = {
  home: {
    'home-kitchen': 'on clean white kitchen countertop, morning light from left, minimal Scandinavian style, shallow depth of field',
    'home-pantry': 'organized pantry shelf, neat labels, warm ambient light, Pinterest aesthetic',
    'home-living': 'on walnut coffee table next to succulent and coffee mug, natural daylight',
  },
  auto: {
    'auto-dashboard': 'mounted on dashboard of modern sedan, sunset through windshield, cinematic composition',
    'auto-steering': 'centered above steering wheel, leather interior, moody rim light',
    'auto-detail': 'close-up macro shot showing mounting mechanism, shallow DoF, tech product photography style',
  },
  digital: {
    'digital-desk': 'on minimal desk with MacBook and notebook, morning window light, editorial style',
    'digital-outdoor': 'clipped to backpack strap, hiking trail bokeh background, golden hour',
    'digital-detail': 'studio product shot on seamless gradient backdrop, key light from 45 degrees',
  },
  tool: {
    'tool-workshop': 'on workshop bench with sawdust and wood scraps, warm tungsten light, craftsman aesthetic',
    'tool-hand': 'hand holding the tool in use, soft focus background, documentary photography',
    'tool-kit': 'laid out with accessories in organized flat lay, top-down view, studio lighting',
  },
  living: {
    'living-bathroom': 'on marble bathroom counter, soft morning light, hotel aesthetic',
    'living-kitchen': 'on kitchen island with fresh ingredients, natural light, food magazine style',
    'living-outdoor': 'on picnic blanket with snacks, grass background, lifestyle photography',
  },
};

const OUTPUT_DESCRIPTIONS = {
  main: { label: '主图', prompt: 'pure white background, centered product shot, 45-degree angle, product fills 80% of frame, soft shadow, Amazon listing style' },
  scene: { label: '场景图', prompt: 'in real usage environment (see scene preset), natural context, lifestyle shot' },
  detail: { label: '细节图', prompt: 'macro close-up showing material texture and craftsmanship, studio lighting, razor-sharp focus' },
  lifestyle: { label: '使用图', prompt: 'hands-on usage moment, person interacting naturally, warm tones, candid moment' },
  compare: { label: '对比图', prompt: 'side-by-side with competitor or old version, clean diagram overlay, infographic style' },
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
  // 1. 为每个 output 构造 prompt
  const promptJobs = args.outputs.map(type => {
    const meta = OUTPUT_DESCRIPTIONS[type];
    const fullPrompt = `${meta.prompt}${args.scenePrompt ? ', ' + args.scenePrompt : ''}. Product: ${args.skuInfo.slice(0, 180)}`;
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

  // 速率限制（Pipeline 级配额）
  let rateKey = request.headers.get('x-tenant-id') || 'default';
  try {
    const token = request.cookies.get(getCookieName())?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.username) rateKey = payload.username;
    }
  } catch {}

  const fromPipeline = request.headers.get('x-from-pipeline') === '1';
  if (!fromPipeline) {
    const limit = await checkRateLimit('pipeline:product-image', rateKey);
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
    } catch (err) {
      console.warn('[image-gen] wanx failed, falling back to mock:', err);
      // 继续走 mock 分支
    }
  }

  // ========================================
  // 分支 2：Mock 模式（fallback）
  // ========================================
  const mockImages = outputs.map(type => {
    const meta = OUTPUT_DESCRIPTIONS[type];
    const fullPrompt = `${meta.prompt}${scenePrompt ? ', ' + scenePrompt : ''}. Product: ${cleanSku.slice(0, 200)}`;
    const seed = Math.floor(Math.random() * 9999);
    return {
      type,
      label: meta.label,
      prompt: fullPrompt,
      // Unsplash picsum 占位，实际部署时换 fal/replicate 输出
      url: `https://picsum.photos/seed/wenai-${type}-${seed}/800/800`,
      width: 800,
      height: 800,
      provider: 'mock',
    };
  });

  return NextResponse.json({
    mock: true,
    notice: 'AI 生图模块为展示占位。配置 FAL_KEY 或 REPLICATE_API_TOKEN 后切换为真生成。',
    images: mockImages,
    scenePromptUsed: scenePrompt,
    categoryUsed: body.category,
  });
}
