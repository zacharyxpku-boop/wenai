import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/ratelimit';
import { verifyToken, getCookieName } from '@/lib/auth';

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

const OPENAI_GENERATIONS = 'https://api.openai.com/v1/images/generations';
const OPENAI_EDITS = 'https://api.openai.com/v1/images/edits';
const MODEL = 'gpt-image-1';

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
}

const SCENARIO_ALLOWED = new Set([
  'model-generate', 'outfit-swap', 'pose-change', 'scene-change', 'ootd-flatlay',
  'model-photo', 'scene-photo', 'product-enhance', // 历史兼容
]);
const SIZE_ALLOWED = new Set(['1024x1024', '1024x1536', '1536x1024', 'auto']);
const QUALITY_ALLOWED = new Set(['low', 'medium', 'high', 'auto']);

interface OpenAIImageResult {
  url?: string;
  b64_json?: string;
  revised_prompt?: string;
}

interface OpenAIResponse {
  created: number;
  data: OpenAIImageResult[];
}

function dataUrlToBuffer(dataUrl: string): { buf: Buffer; mime: string } | null {
  const m = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!m) return null;
  return { mime: m[1], buf: Buffer.from(m[2], 'base64') };
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

  // 限流 · 单独配额(生图昂贵)
  let rateKey = request.headers.get('x-tenant-id') || 'default';
  try {
    const token = request.cookies.get(getCookieName())?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.username) rateKey = payload.username;
    }
  } catch {}

  if (!body.fromPipeline) {
    const limit = await checkRateLimit('openai-image', rateKey);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'AI 影棚配额已达上限,明日再试', resetAt: limit.resetAt },
        { status: 429 }
      );
    }
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'OPENAI_API_KEY 未配置',
        notice: '请在 .env.local 添加 OPENAI_API_KEY=sk-xxx 后重启',
        code: 'NO_KEY',
      },
      { status: 503 }
    );
  }

  try {
    let upstream: Response;
    // 收集垫图: 优先用 referenceImages 数组, 其次用单图 referenceImage (历史兼容)
    const refList: string[] = body.referenceImages && body.referenceImages.length > 0
      ? body.referenceImages
      : (body.referenceImage ? [body.referenceImage] : []);

    if (mode === 'edit' && refList.length > 0) {
      // multipart/form-data → /v1/images/edits · gpt-image-1 支持 image[] 多图
      const fd = new FormData();
      fd.append('model', MODEL);
      fd.append('prompt', body.prompt);
      fd.append('size', size);
      fd.append('quality', quality);
      fd.append('n', String(n));
      for (let i = 0; i < refList.length; i++) {
        const ref = dataUrlToBuffer(refList[i]);
        if (!ref) {
          return NextResponse.json(
            { error: `referenceImages[${i}] 必须是 data:image/...;base64,... 格式` },
            { status: 400 }
          );
        }
        const ext = ref.mime.includes('png') ? 'png' : ref.mime.includes('webp') ? 'webp' : 'jpg';
        // gpt-image-1 多图 field 名为 'image[]' 或重复 'image'; 用重复 image (官方推荐)
        fd.append('image', new Blob([new Uint8Array(ref.buf)], { type: ref.mime }), `ref-${i}.${ext}`);
      }

      upstream = await fetch(OPENAI_EDITS, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: fd,
      });
    } else {
      // application/json → /v1/images/generations
      upstream = await fetch(OPENAI_GENERATIONS, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          prompt: body.prompt,
          size,
          quality,
          n,
        }),
      });
    }

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => '');
      console.warn('[openai-image] upstream error', upstream.status, errText.slice(0, 400));
      return NextResponse.json(
        {
          error: `OpenAI HTTP ${upstream.status}`,
          detail: errText.slice(0, 600),
          code: upstream.status === 401 ? 'INVALID_KEY' : upstream.status === 429 ? 'OPENAI_QUOTA' : 'UPSTREAM',
        },
        { status: upstream.status === 401 ? 401 : 502 }
      );
    }

    const data: OpenAIResponse = await upstream.json();
    const images = (data.data || []).map((d, i) => {
      // gpt-image-1 默认返回 b64_json (没有 url 字段)
      const b64 = d.b64_json;
      const dataUrl = b64 ? `data:image/png;base64,${b64}` : d.url || '';
      return {
        index: i,
        url: dataUrl,
        revisedPrompt: d.revised_prompt || null,
        provider: 'openai',
        model: MODEL,
      };
    });

    return NextResponse.json({
      mode,
      scenario: body.scenario,
      size,
      quality,
      images,
      cost: estimateCost(quality, n),
    });
  } catch (err) {
    console.error('[openai-image] fatal', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '未知错误', code: 'INTERNAL' },
      { status: 500 }
    );
  }
}

function estimateCost(quality: string, n: number): { perImageUsd: number; totalUsd: number } {
  const map: Record<string, number> = { low: 0.011, medium: 0.042, high: 0.167, auto: 0.042 };
  const per = map[quality] || 0.042;
  return { perImageUsd: per, totalUsd: +(per * n).toFixed(3) };
}
