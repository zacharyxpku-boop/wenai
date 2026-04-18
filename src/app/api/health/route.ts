import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

/**
 * 健康检查 · 对外 SLA 验证入口
 * GET /api/health
 *
 * 返回 3 个核心依赖的状态:
 *   ai      · AI_API_KEY 可用性 (不实际打 API, 仅检查 key 存在)
 *   redis   · Upstash 连通性 (实际 PING)
 *   wanx    · 图片生成配置状态 (基于 AI_API_KEY 和 WANX_DISABLED)
 *
 * Team SLA 99.5% / Enterprise SLA 99.9% · /status 页消费此接口
 */

interface Status {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latencyMs?: number;
  note?: string;
}

async function checkRedis(): Promise<Status> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { name: 'Redis (Upstash)', status: 'degraded', note: '未配置,fallback 本地文件+内存' };
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
    return { name: 'AI · 通义万相 生图', status: 'degraded', note: 'WANX_DISABLED=1,走 mock 模式' };
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

export async function GET() {
  const [aiStatus, wanxStatus, redisStatus, authStatus] = await Promise.all([
    Promise.resolve(checkAI()),
    Promise.resolve(checkWanx()),
    checkRedis(),
    Promise.resolve(checkAuth()),
  ]);

  const services = [aiStatus, wanxStatus, redisStatus, authStatus];

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
