import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

/**
 * 健康检查 · 对外状态验证入口
 * GET /api/health
 *
 * 返回 3 个核心依赖的状态:
 *   ai      · AI_API_KEY 可用性 (不实际打 API, 仅检查 key 存在)
 *   redis   · Upstash 连通性 (实际 PING)
 *   wanx    · 图片生成配置状态 (基于 AI_API_KEY 和 WANX_DISABLED)
 *
 * /status 页消费此接口。正式 SLA 以主站订单或合同为准。
 */

interface Status {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latencyMs?: number;
  note?: string;
}

async function checkRedis(): Promise<Status> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { name: 'Redis (Upstash)', status: 'degraded', note: '未配置，当前使用本地文件和内存保留运行状态' };
  }
  const start = Date.now();
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    await redis.ping();
    return { name: 'Redis (Upstash)', status: 'operational', latencyMs: Date.now() - start };
  } catch (err) {
    return {
      name: 'Redis (Upstash)',
      status: 'down',
      latencyMs: Date.now() - start,
      note: err instanceof Error ? err.message.slice(0, 120) : 'ping failed',
    };
  }
}

function checkAI(): Status {
  const key = process.env.AI_API_KEY;
  if (!key) {
    return { name: 'AI · 通义千问 chat', status: 'down', note: 'AI_API_KEY 未配置' };
  }
  if (key.length < 10) {
    return { name: 'AI · 通义千问 chat', status: 'degraded', note: 'AI_API_KEY 看起来不完整' };
  }
  return { name: 'AI · 通义千问 chat', status: 'operational', note: '密钥已配置' };
}

function checkWanx(): Status {
  const key = process.env.AI_API_KEY;
  const disabled = process.env.WANX_DISABLED === '1';
  if (disabled) {
    return { name: 'AI · 通义万相 生图', status: 'degraded', note: '图像生成已关闭，当前仅导出生产规格' };
  }
  if (!key) {
    return { name: 'AI · 通义万相 生图', status: 'down', note: '复用 AI_API_KEY · 未配置' };
  }
  return { name: 'AI · 通义万相 生图', status: 'operational', note: '复用 AI_API_KEY · wanx2.1-t2i-turbo' };
}

function checkAuth(): Status {
  if (!process.env.JWT_SECRET) {
    return { name: 'Auth · JWT', status: 'down', note: 'JWT_SECRET 未配置 · 生产环境必需' };
  }
  return { name: 'Auth · JWT', status: 'operational' };
}

function checkHappyhorse(): Status {
  if (!process.env.HAPPYHORSE_API_KEY) {
    return { name: 'AI · HappyHorse 影棚/视频', status: 'degraded', note: '未配置，当前仅导出生产规格' };
  }
  return { name: 'AI · HappyHorse 影棚/视频', status: 'operational', note: 'GPT Image 2 + i2v 国内中转' };
}

function checkGemini(): Status {
  if (!process.env.GEMINI_API_KEY) {
    return { name: 'AI · Gemini Vision (拆解)', status: 'degraded', note: 'video-teardown 不可用' };
  }
  const baseUrl = process.env.GEMINI_BASE_URL;
  return {
    name: 'AI · Gemini Vision (拆解)',
    status: 'operational',
    note: baseUrl ? `经 ${new URL(baseUrl).host} 中转` : '直连 generativelanguage',
  };
}

function checkMailer(): Status {
  if (process.env.RESEND_API_KEY) {
    return { name: 'Email · Resend', status: 'operational', note: 'daily digest 走 Resend' };
  }
  if (process.env.SENDGRID_API_KEY) {
    return { name: 'Email · SendGrid', status: 'operational', note: 'daily digest 走 SendGrid' };
  }
  return { name: 'Email · Mailer', status: 'degraded', note: '未配置邮件服务，通知仅保留在本地流程中' };
}

function checkCronSecret(): Status {
  if (!process.env.CRON_SECRET) {
    return { name: 'Cron · 鉴权', status: 'degraded', note: 'CRON_SECRET 未配 · 生产建议配防外部触发' };
  }
  return { name: 'Cron · 鉴权', status: 'operational' };
}

async function checkLastDigest(): Promise<Status> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { name: 'Cron · digest 最近触发', status: 'degraded', note: '需 Redis 才能跟踪' };
  }
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    // 拼今日 + 昨日 dateStr, 任一日有 digest 就视为 cron 跑过
    const today = new Date().toISOString().slice(0, 10);
    const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let cursor: string | number = 0;
    let found = false;
    let iter = 0;
    do {
      const res: [string | number, string[]] = await redis.scan(cursor, {
        match: `wenai:digest:*:${today}`,
        count: 50,
      });
      cursor = res[0];
      if (res[1].length > 0) {
        found = true;
        break;
      }
      iter++;
      if (iter > 5) break;
    } while (cursor !== '0' && cursor !== 0);
    if (!found) {
      // try yesterday
      const r2: [string | number, string[]] = await redis.scan(0, {
        match: `wenai:digest:*:${y}`,
        count: 50,
      });
      if (r2[1].length > 0) found = true;
    }
    if (found) {
      return { name: 'Cron · digest 最近触发', status: 'operational', note: '今日或昨日已写入快照' };
    }
    return { name: 'Cron · digest 最近触发', status: 'degraded', note: '近 48h 未发现快照 (可能首次部署 / 还没用户 / cron 未跑)' };
  } catch (e) {
    return {
      name: 'Cron · digest 最近触发',
      status: 'down',
      note: e instanceof Error ? e.message.slice(0, 100) : 'scan failed',
    };
  }
}

export async function GET() {
  const [aiStatus, wanxStatus, hhStatus, geminiStatus, redisStatus, authStatus, mailerStatus, cronSecretStatus, digestStatus] = await Promise.all([
    Promise.resolve(checkAI()),
    Promise.resolve(checkWanx()),
    Promise.resolve(checkHappyhorse()),
    Promise.resolve(checkGemini()),
    checkRedis(),
    Promise.resolve(checkAuth()),
    Promise.resolve(checkMailer()),
    Promise.resolve(checkCronSecret()),
    checkLastDigest(),
  ]);

  const services = [aiStatus, wanxStatus, hhStatus, geminiStatus, redisStatus, authStatus, mailerStatus, cronSecretStatus, digestStatus];

  const allDown = services.every(s => s.status === 'down');
  const anyDown = services.some(s => s.status === 'down');
  const anyDegraded = services.some(s => s.status === 'degraded');

  const overall = allDown ? 'down' : anyDown ? 'degraded' : anyDegraded ? 'degraded' : 'operational';

  return NextResponse.json({
    overall,
    services,
    timestamp: new Date().toISOString(),
    uptime: typeof process.uptime === 'function' ? Math.round(process.uptime()) : null,
  });
}
