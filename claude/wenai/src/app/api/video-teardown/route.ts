import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/ratelimit';
import { verifyToken, getCookieName } from '@/lib/auth';
import { resolveOrgContext } from '@/lib/org-id';
import { checkCostCap, recordCostWithDetail } from '@/lib/cost-cap';
import { hashVideoBase64, getTeardownCache, setTeardownCache } from '@/lib/teardown-cache';
import { recordCacheEvent } from '@/lib/cache-stats';

/**
 * 爆款视频拆解 · Gemini 2.5 Flash Vision · 简化版 (无 yt-dlp + 无 BullMQ)
 *
 * 借鉴 clico/worker/workers/analysis.worker.ts 的 storyboard 拆解逻辑,
 * 简化为 inline base64 上传(限 8MB · ≤ 30s 视频),不走 Gemini Files API
 * 不走异步队列,Vercel serverless 直接同步返回(单次 ~15-30s)
 *
 * 输入: 用户上传 mp4 / mov / webm (用户自己从 TikTok/抖音/小红书 下载好)
 * 输出: storyboard JSON (hook/pacing/cta + 多个 scene 含图像生成 prompt)
 *
 * 闭环: 拆完每个 scene 的 prompt 一键带去 /pipelines/ai-photoshoot 生静态图
 */

const GEMINI_BASE = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com';
const GEMINI_MODEL = 'gemini-2.5-flash';

interface TeardownBody {
  videoBase64: string; // dataURL: "data:video/mp4;base64,..."
  productHint?: string; // 用户产品提示,Gemini 在 scene prompt 里会替换主体
  fromPipeline?: boolean;
  dryRun?: boolean;
  skuId?: string; // 关联 SKU (从 ?skuId= 进来时, 成本归因到该 SKU)
}

const STORYBOARD_PROMPT = `分析这个短视频,返回结构化 JSON storyboard,字段如下:

- hook_type: 钩子类型,五选一: "question"(提问) | "statement"(陈述) | "demo"(展示) | "story"(故事) | "shock"(震惊)
- scene_count: 镜头数量(1-6,超过 6 取最关键的 6 个)
- pacing: 节奏,三选一: "fast"(每镜头 < 3 秒) | "medium"(3-6 秒) | "slow"(> 6 秒)
- cta_position: 转化引导位置: "early"(开头) | "middle"(中间) | "end"(结尾)
- emotional_arc: 情绪曲线数组,每个镜头一个情绪词(如 "好奇" "惊讶" "认同" "想要")
- scenes: 镜头数组,每个含:
    - index: 镜头序号(从 0 开始)
    - description: 这个镜头里发生了什么(20-50 字中文)
    - duration_seconds: 镜头时长(秒,数字)
    - caption_text: 镜头里出现的字幕/口播文本(原样保留)
    - prompt: 一段图像生成 prompt,描述这个镜头的视觉构图、光影、人物姿态、场景布置(80-150 字中文)。
              重要: 如果用户提供了 productHint,在 prompt 中把原视频里的产品替换为 productHint 描述的产品,其他构图保持一致。

只输出严格符合 schema 的 JSON,不要 markdown 代码块,不要任何解释文字。`;

const STORYBOARD_SCHEMA = {
  type: 'OBJECT',
  required: ['hook_type', 'scene_count', 'pacing', 'cta_position', 'emotional_arc', 'scenes'],
  properties: {
    hook_type: { type: 'STRING', enum: ['question', 'statement', 'demo', 'story', 'shock'] },
    scene_count: { type: 'INTEGER', minimum: 1, maximum: 6 },
    pacing: { type: 'STRING', enum: ['fast', 'medium', 'slow'] },
    cta_position: { type: 'STRING', enum: ['early', 'middle', 'end'] },
    emotional_arc: { type: 'ARRAY', items: { type: 'STRING' } },
    scenes: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        required: ['index', 'description', 'duration_seconds', 'caption_text', 'prompt'],
        properties: {
          index: { type: 'INTEGER' },
          description: { type: 'STRING' },
          duration_seconds: { type: 'NUMBER' },
          caption_text: { type: 'STRING' },
          prompt: { type: 'STRING' },
        },
      },
    },
  },
};

function parseDataUrl(dataUrl: string): { mime: string; base64: string } | null {
  const m = dataUrl.match(/^data:(video\/[a-zA-Z0-9+\-.]+);base64,(.+)$/);
  if (!m) return null;
  return { mime: m[1], base64: m[2] };
}

export async function POST(request: NextRequest) {
  let body: TeardownBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  if (!body.videoBase64) {
    return NextResponse.json({ error: 'videoBase64 必填' }, { status: 400 });
  }
  const parsed = parseDataUrl(body.videoBase64);
  if (!parsed) {
    return NextResponse.json(
      { error: 'videoBase64 必须是 data:video/mp4;base64,... 格式' },
      { status: 400 }
    );
  }

  // 8MB 限制 (Gemini inline 上限 ~20MB,留 buffer)
  const sizeBytes = Math.floor(parsed.base64.length * 0.75);
  if (sizeBytes > 8 * 1024 * 1024) {
    return NextResponse.json(
      { error: `视频 ${(sizeBytes / 1024 / 1024).toFixed(1)}MB 太大,先压到 ≤8MB (推荐 30 秒以内)` },
      { status: 413 }
    );
  }

  if (body.dryRun) {
    return NextResponse.json({
      dryRun: true,
      validated: { mime: parsed.mime, sizeMb: +(sizeBytes / 1024 / 1024).toFixed(2), productHint: body.productHint || null },
    });
  }

  // 限流
  let rateKey = request.headers.get('x-tenant-id') || 'default';
  let plan = 'free';
  try {
    const token = request.cookies.get(getCookieName())?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.username) {
        rateKey = payload.username;
        plan = payload.role === 'admin' ? 'enterprise' : payload.role === 'editor' ? 'team' : 'free';
      }
    }
  } catch {}

  if (!body.fromPipeline) {
    const limit = await checkRateLimit('video-teardown', rateKey, plan);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: '视频拆解配额已达上限,明日再试', resetAt: limit.resetAt },
        { status: 429 }
      );
    }
  }

  // 成本闸 · video-teardown 比纯 chat 贵一些 (Gemini Vision 处理视频), 估 4 cents
  const { orgId } = await resolveOrgContext(request);
  const VIDEO_TEARDOWN_COST_CENTS = 4;

  // 内容哈希缓存 · 同 orgId 重复上传同视频直接返回缓存 storyboard (省钱)
  // ?fresh=1 强制跳过, 重新跑 Gemini
  const fresh = request.nextUrl?.searchParams?.get('fresh') === '1';
  const contentHash = hashVideoBase64(parsed.base64);
  if (!fresh) {
    try {
      const cached = await getTeardownCache(orgId, contentHash);
      if (cached) {
        recordCacheEvent(orgId, 'teardown', true).catch(() => {});
        return NextResponse.json({
          ...(typeof cached === 'object' && cached ? cached : {}),
          fromCache: true,
          contentHash,
        });
      }
    } catch {
      // 缓存读失败不阻塞主链路
    }
  }
  // 走到这表示要发真请求 · 算 miss
  recordCacheEvent(orgId, 'teardown', false).catch(() => {});

  const cap = await checkCostCap(orgId, VIDEO_TEARDOWN_COST_CENTS);
  if (!cap.allowed) {
    return NextResponse.json(
      {
        error: cap.reason ?? '今日成本配额已达上限',
        code: 'COST_CAP_REACHED',
        currentCny: +(cap.currentCents / 100).toFixed(2),
        capCny: +(cap.capCents / 100).toFixed(2),
      },
      { status: 429 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: '视频拆解服务暂未启用。请先导出生产规格，或使用 CSV 决策工作台完成本地复盘。',
        notice: '当前不会返回伪拆解结果。',
        code: 'VIDEO_TEARDOWN_DISABLED',
      },
      { status: 503 }
    );
  }

  // 用户产品提示注入到 prompt 末尾
  const fullPrompt = body.productHint
    ? `${STORYBOARD_PROMPT}\n\n用户产品提示: ${body.productHint.slice(0, 300)}`
    : STORYBOARD_PROMPT;

  const url = `${GEMINI_BASE}/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inline_data: { mime_type: parsed.mime, data: parsed.base64 } },
              { text: fullPrompt },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: STORYBOARD_SCHEMA,
        },
      }),
    });

    if (!upstream.ok) {
      const txt = await upstream.text().catch(() => '');
      console.warn('[video-teardown] Gemini error', upstream.status, txt.slice(0, 400));
      return NextResponse.json(
        {
          error: `Gemini HTTP ${upstream.status}`,
          detail: txt.slice(0, 600),
          code: upstream.status === 401 || upstream.status === 403 ? 'INVALID_KEY' : 'UPSTREAM',
        },
        { status: upstream.status === 401 ? 401 : 502 }
      );
    }

    const data = await upstream.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json({ error: 'Gemini 未返回内容' }, { status: 502 });
    }

    let storyboard;
    try {
      storyboard = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: 'Gemini 返回非 JSON,看 raw', raw: text.slice(0, 800) },
        { status: 502 }
      );
    }

    const usage = data?.usageMetadata;
    const costUsd = usage
      ? ((usage.promptTokenCount ?? 0) * 0.3 + (usage.candidatesTokenCount ?? 0) * 1.25) / 1_000_000
      : null;

    // 写成本明细 · 关联 skuId (如果有)
    recordCostWithDetail(orgId, VIDEO_TEARDOWN_COST_CENTS, {
      module: 'video-teardown',
      skuId: body.skuId,
      meta: { scenario: 'storyboard', size: `${(sizeBytes / 1024 / 1024).toFixed(1)}MB` },
    }).catch(() => {});

    const payload = {
      ok: true,
      storyboard,
      usage,
      costUsd: costUsd ? +costUsd.toFixed(4) : null,
      model: GEMINI_MODEL,
      contentHash,
    };

    // 缓存写入 · 失败不阻塞 (mem 兜底)
    setTeardownCache(orgId, contentHash, payload).catch(() => {});

    return NextResponse.json(payload);
  } catch (err) {
    console.error('[video-teardown] fatal', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '未知错误', code: 'INTERNAL' },
      { status: 500 }
    );
  }
}
