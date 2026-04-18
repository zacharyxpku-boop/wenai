import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/ratelimit';
import { verifyToken, getCookieName } from '@/lib/auth';

/**
 * AI 电商主图生成 · Pipeline 03 后端
 *
 * 当前实现：Mock 模式（返回 Unsplash placeholder + 每图说明），
 *          便于前端体验流畅，等下列任一 env var 配置后自动切换为真生成：
 *   FAL_KEY                  → 走 fal.ai Flux Schnell
 *   REPLICATE_API_TOKEN      → 走 Replicate black-forest-labs/flux-schnell
 *
 * 差异化对标 HotClaw：
 * - 品类专属场景预设（5 类 × 3 预设）
 * - 1 SKU → 5 图组合（主图/场景/细节/使用/对比）
 * - 合规前置（商标词在生成 prompt 前被移除）
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
  // 分支 1：Real image generation (FAL / Replicate)
  // ========================================
  const falKey = process.env.FAL_KEY;
  const replicateToken = process.env.REPLICATE_API_TOKEN;

  if (falKey || replicateToken) {
    // 暂未实现真调用 — 预留接口。到 key 配置时在此处接
    // 每个 output 调一次 /fal/run 或 /replicate/predictions，await 所有
    // 返回 { images: [{ url, label, prompt }] }
    return NextResponse.json({
      mock: false,
      pending: true,
      message: '真实生图接口已就绪但未实装。用户配置 FAL_KEY / REPLICATE_API_TOKEN 后在 route.ts 开启',
      images: [],
    });
  }

  // ========================================
  // 分支 2：Mock 模式（当前默认，用于 UI 体验流畅）
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
