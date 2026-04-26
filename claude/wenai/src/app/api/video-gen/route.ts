import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/ratelimit';
import { verifyToken, getCookieName } from '@/lib/auth';

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

const I2V_SUBMIT_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis';
const I2V_TASK_URL = 'https://dashscope.aliyuncs.com/api/v1/tasks';

interface VideoBody {
  scenario: 'model-display' | 'product-rotate' | 'lifestyle-clip' | 'custom';
  prompt: string;
  imageUrl?: string;     // 公网可访问图片 URL (推荐)
  imageBase64?: string;  // 或 dataURL (内部 base64,wanx i2v 实测部分支持)
  duration?: 4 | 5;      // wanx-turbo 支持 4 或 5 秒
  resolution?: '720P' | '1080P';
  model?: 'wanx2.1-i2v-turbo' | 'wanx2.1-i2v-plus';
  fromPipeline?: boolean;
  dryRun?: boolean;
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
  if (!body.imageUrl) {
    return NextResponse.json(
      { error: 'imageUrl 必填 (wanx i2v 当前仅支持公网图片 URL · 请先把图传到 OSS/Cloudinary/picgo)', code: 'NO_IMAGE_URL' },
      { status: 400 }
    );
  }

  const duration = body.duration === 4 ? 4 : 5;
  const resolution = body.resolution === '1080P' ? '1080P' : '720P';
  const model = body.model || 'wanx2.1-i2v-turbo';

  if (body.dryRun) {
    return NextResponse.json({
      dryRun: true,
      validated: { scenario: body.scenario, duration, resolution, model, promptLength: body.prompt.length, imageUrl: body.imageUrl.slice(0, 100) },
    });
  }

  // 限流
  let rateKey = request.headers.get('x-tenant-id') || 'default';
  try {
    const token = request.cookies.get(getCookieName())?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.username) rateKey = payload.username;
    }
  } catch {}

  if (!body.fromPipeline) {
    const limit = await checkRateLimit('video-gen', rateKey);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'AI 视频配额已达上限,明日再试', resetAt: limit.resetAt },
        { status: 429 }
      );
    }
  }

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI_API_KEY 未配置 (DashScope)', code: 'NO_KEY' },
      { status: 503 }
    );
  }

  try {
    const taskId = await submitTask(apiKey, {
      model,
      prompt: body.prompt,
      imageUrl: body.imageUrl,
      duration,
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
    return NextResponse.json({
      ok: true,
      videoUrl: poll.videoUrl,
      taskId,
      duration,
      resolution,
      model,
      cost: { perSecondCny: perSec, totalCny: +(perSec * duration).toFixed(2) },
    });
  } catch (err) {
    console.error('[video-gen] fatal', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '未知错误', code: 'INTERNAL' },
      { status: 500 }
    );
  }
}
