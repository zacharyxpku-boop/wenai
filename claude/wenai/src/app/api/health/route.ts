import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

/**
 * Public status endpoint.
 * User-facing notes stay product-level and do not expose internal env key names.
 */

interface Status {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latencyMs?: number;
  note?: string;
}

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

function hasRedisConfig() {
  return hasValue(process.env.UPSTASH_REDIS_REST_URL) && hasValue(process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function checkRedis(): Promise<Status> {
  if (!hasRedisConfig()) {
    return {
      name: 'Storage retention',
      status: 'degraded',
      note: '当前为本地试用模式，运行状态仅保留在当前环境。',
    };
  }

  const start = Date.now();
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    await redis.ping();
    return { name: 'Storage retention', status: 'operational', latencyMs: Date.now() - start };
  } catch (err) {
    return {
      name: 'Storage retention',
      status: 'down',
      latencyMs: Date.now() - start,
      note: err instanceof Error ? err.message.slice(0, 120) : 'storage ping failed',
    };
  }
}

function checkAI(): Status {
  const key = process.env.AI_API_KEY;
  if (!hasValue(key)) {
    return {
      name: 'AI decision service',
      status: 'down',
      note: 'AI 服务暂未启用，当前可使用本地 CSV 决策链路。',
    };
  }
  if (key!.trim().length < 10) {
    return {
      name: 'AI decision service',
      status: 'degraded',
      note: 'AI 服务配置需要校验，当前可使用本地 CSV 决策链路。',
    };
  }
  return { name: 'AI decision service', status: 'operational', note: 'AI 服务已启用。' };
}

function checkImageProduction(): Status {
  const disabled = process.env.WANX_DISABLED === '1';
  if (disabled) {
    return {
      name: 'Image production service',
      status: 'degraded',
      note: '图像生成已关闭，当前仅导出生产规格。',
    };
  }
  if (!hasValue(process.env.AI_API_KEY)) {
    return {
      name: 'Image production service',
      status: 'down',
      note: '图片生成暂未启用，当前仅导出生产规格。',
    };
  }
  return { name: 'Image production service', status: 'operational', note: '图片生成服务已启用。' };
}

function checkAuth(): Status {
  if (!hasValue(process.env.JWT_SECRET)) {
    return {
      name: 'Account system',
      status: 'down',
      note: '账号体系暂未启用，当前为本地试用模式。',
    };
  }
  return { name: 'Account system', status: 'operational' };
}

function checkExternalProduction(): Status {
  if (!hasValue(process.env.HAPPYHORSE_API_KEY)) {
    return {
      name: 'External production connector',
      status: 'degraded',
      note: '外部生产连接暂未启用，当前仅导出生产规格。',
    };
  }
  return { name: 'External production connector', status: 'operational', note: '外部生产连接已启用。' };
}

function checkVideoTeardown(): Status {
  if (!hasValue(process.env.GEMINI_API_KEY)) {
    return {
      name: 'Video teardown service',
      status: 'degraded',
      note: '视频拆解暂未启用，当前仅导出生产规格。',
    };
  }
  return { name: 'Video teardown service', status: 'operational', note: '视频拆解服务已启用。' };
}

function checkMailer(): Status {
  if (hasValue(process.env.RESEND_API_KEY) || hasValue(process.env.SENDGRID_API_KEY)) {
    return { name: 'Email notification', status: 'operational', note: '通知服务已启用。' };
  }
  return {
    name: 'Email notification',
    status: 'degraded',
    note: '邮件服务暂未启用，通知仅保留在本地流程中。',
  };
}

function checkCronGuard(): Status {
  if (!hasValue(process.env.CRON_SECRET)) {
    return {
      name: 'Scheduled task guard',
      status: 'degraded',
      note: '定时任务保护暂未启用，生产发布前需要开启。',
    };
  }
  return { name: 'Scheduled task guard', status: 'operational' };
}

async function checkLastDigest(): Promise<Status> {
  if (!hasRedisConfig()) {
    return {
      name: 'Digest schedule snapshot',
      status: 'degraded',
      note: '当前为本地试用模式，暂不跨环境追踪定时任务快照。',
    };
  }

  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let cursor: string | number = 0;
    let found = false;
    let iterations = 0;

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
      iterations += 1;
      if (iterations > 5) break;
    } while (cursor !== '0' && cursor !== 0);

    if (!found) {
      const res: [string | number, string[]] = await redis.scan(0, {
        match: `wenai:digest:*:${yesterday}`,
        count: 50,
      });
      found = res[1].length > 0;
    }

    if (found) {
      return { name: 'Digest schedule snapshot', status: 'operational', note: '今日或昨日已写入快照。' };
    }
    return {
      name: 'Digest schedule snapshot',
      status: 'degraded',
      note: '近 48 小时未发现快照，可能还没有使用数据或定时任务尚未触发。',
    };
  } catch (err) {
    return {
      name: 'Digest schedule snapshot',
      status: 'down',
      note: err instanceof Error ? err.message.slice(0, 100) : 'digest scan failed',
    };
  }
}

export async function GET() {
  const services = await Promise.all([
    Promise.resolve(checkAI()),
    Promise.resolve(checkImageProduction()),
    Promise.resolve(checkExternalProduction()),
    Promise.resolve(checkVideoTeardown()),
    checkRedis(),
    Promise.resolve(checkAuth()),
    Promise.resolve(checkMailer()),
    Promise.resolve(checkCronGuard()),
    checkLastDigest(),
  ]);

  const allDown = services.every(service => service.status === 'down');
  const anyDown = services.some(service => service.status === 'down');
  const anyDegraded = services.some(service => service.status === 'degraded');
  const overall = allDown ? 'down' : anyDown || anyDegraded ? 'degraded' : 'operational';

  return NextResponse.json({
    overall,
    services,
    timestamp: new Date().toISOString(),
    uptime: typeof process.uptime === 'function' ? Math.round(process.uptime()) : null,
  });
}
