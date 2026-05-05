/**
 * Rate limiter with Upstash Redis backend.
 * Falls back to in-memory when UPSTASH_REDIS_REST_URL is not configured.
 *
 * Setup: add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { getModuleLimitForPlan } from './entitlements';

// --- Upstash Redis backend ---
let redis: Redis | null = null;
const redisRatelimits = new Map<string, Ratelimit>();

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
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
  tenantId: string,
  plan?: string | null
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = `${tenantId}:${moduleId}`;
  const limit = getModuleLimitForPlan(moduleId, plan);

  if (redis) {
    try {
      const limiterKey = `${plan || 'free'}:${moduleId}:${limit}`;
      let limiter = redisRatelimits.get(limiterKey);
      if (!limiter) {
        limiter = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(limit, '1 d'),
          prefix: `wenai:rl:${plan || 'free'}:${moduleId}`,
        });
        redisRatelimits.set(limiterKey, limiter);
      }
      const result = await limiter.limit(key);
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

export function getModuleLimit(moduleId: string, plan?: string | null): number {
  return getModuleLimitForPlan(moduleId, plan);
}
