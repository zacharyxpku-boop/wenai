// 简易内存速率限制器（serverless环境下每个冷启动重置）
// 生产环境应替换为 Vercel KV / Upstash Redis

interface RateBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateBucket>();

const LIMITS: Record<string, number> = {
  default: 50,    // 每模块每天50次
  translate: 100,  // 翻译高频，放宽
  reviews: 80,
};

export function checkRateLimit(moduleId: string, tenantId: string): { allowed: boolean; remaining: number; resetAt: number } {
  const key = `${tenantId}:${moduleId}`;
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const limit = LIMITS[moduleId] || LIMITS.default;

  let bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + dayMs };
    buckets.set(key, bucket);
  }

  bucket.count++;

  if (bucket.count > limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}
