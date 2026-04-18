/**
 * Rate limiter with Upstash Redis backend.
 * Falls back to in-memory when UPSTASH_REDIS_REST_URL is not configured.
 *
 * Setup: add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const LIMITS: Record<string, number> = {
  default: 50,
  translate: 100,
  reviews: 80,
  copywriting: 80,
  outreach: 60,
  'ip-compliance': 60,
  // Pipeline 独立配额 · 1 次 Pipeline 触发 = 消耗 1 次（内部 3 路不扣单模块额）
  'pipeline:new-listing': 10,
  'pipeline:influencer-outbound': 10,
  pipeline: 10,
};

// --- Upstash Redis backend ---
let redisRatelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  redisRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 d'),
    prefix: 'wenai:rl',
  });
}

// --- In-memory fallback ---
interface RateBucket {
  count: number;
  resetAt: number;
}

const memBuckets = new Map<string, RateBucket>();

function checkMemoryLimit(key: string, limit: number): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  let bucket = memBuckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + dayMs };
    memBuckets.set(key, bucket);
  }

  bucket.count++;

  if (bucket.count > limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }
  return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

// --- Public API ---
export async function checkRateLimit(
  moduleId: string,
  tenantId: string
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = `${tenantId}:${moduleId}`;
  const limit = LIMITS[moduleId] || LIMITS.default;

  if (redisRatelimit) {
    try {
      const result = await redisRatelimit.limit(key);
      return {
        allowed: result.success,
        remaining: result.remaining,
        resetAt: result.reset,
      };
    } catch (err) {
      console.warn('[RateLimit] Redis error, falling back to memory:', err);
    }
  }

  return checkMemoryLimit(key, limit);
}

export function getModuleLimit(moduleId: string): number {
  return LIMITS[moduleId] || LIMITS.default;
}
