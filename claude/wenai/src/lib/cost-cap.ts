/**
 * 单 org 24h 成本闸 · 借鉴 clico/worker/lib/cost-logger.ts 简化版
 *
 * 防止 ToB 客户(或恶意用户)烧爆 HappyHorse / OpenAI / Gemini 配额
 * Redis 累加每个 org 当天总花费(分),超过阈值直接 429
 *
 * 阈值层级 (env COST_CAP_DAILY_CNY 可覆盖默认):
 *   - default: ¥50/d/org   (Free / Beta 用户)
 *   - team: 后端 logic 可加倍 (¥500/d)  · 当前未实装,将来 RBAC 接入
 *
 * 失败模式:
 *   - Redis 不可用 → 用内存 Map (serverless cold start 会丢, 防滥用降级)
 */

import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

interface MemBucket {
  cents: number;
  resetAt: number;
}
const memCounter = new Map<string, MemBucket>();

const DEFAULT_CAP_CNY = parseInt(process.env.COST_CAP_DAILY_CNY || '50', 10);

function todayKey(orgId: string): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `wenai:cost:${orgId}:${y}-${m}-${day}`;
}

export interface CostCapResult {
  allowed: boolean;
  currentCents: number;
  capCents: number;
  remainingCents: number;
  reason?: string;
}

/**
 * 调用前预检 · 估算这次开销不会爆掉每日额度
 */
export async function checkCostCap(
  orgId: string,
  estimatedCents: number,
  capCnyOverride?: number
): Promise<CostCapResult> {
  const capCny = capCnyOverride ?? DEFAULT_CAP_CNY;
  const capCents = capCny * 100;
  const key = todayKey(orgId);

  let currentCents = 0;
  if (redis) {
    try {
      const v = await redis.get<number>(key);
      currentCents = typeof v === 'number' ? v : 0;
    } catch {
      // Redis 抖动 → 直接放行 (不阻塞正常用户), 但记日志
      console.warn('[cost-cap] redis read failed, allowing');
    }
  } else {
    const now = Date.now();
    const bucket = memCounter.get(key);
    if (bucket && now < bucket.resetAt) currentCents = bucket.cents;
  }

  const wouldBe = currentCents + estimatedCents;
  const allowed = wouldBe <= capCents;
  return {
    allowed,
    currentCents,
    capCents,
    remainingCents: Math.max(0, capCents - currentCents),
    reason: allowed ? undefined : `今日累计 ¥${(currentCents / 100).toFixed(2)} 已接近 ¥${capCny} 配额上限`,
  };
}

/**
 * 调用后回写实际开销 · 累加进当日计数器
 */
export async function recordCost(orgId: string, cents: number): Promise<void> {
  if (cents <= 0) return;
  const key = todayKey(orgId);
  if (redis) {
    try {
      await redis.incrby(key, cents);
      await redis.expire(key, 36 * 3600); // 36h TTL · 跨日有缓冲
    } catch (e) {
      console.warn('[cost-cap] redis incr failed', e);
    }
  } else {
    const now = Date.now();
    const bucket = memCounter.get(key) ?? { cents: 0, resetAt: now + 24 * 3600 * 1000 };
    bucket.cents += cents;
    memCounter.set(key, bucket);
  }
}

export async function getDailyCost(orgId: string): Promise<number> {
  const key = todayKey(orgId);
  if (redis) {
    try {
      const v = await redis.get<number>(key);
      return typeof v === 'number' ? v : 0;
    } catch {
      return 0;
    }
  }
  const bucket = memCounter.get(key);
  if (bucket && Date.now() < bucket.resetAt) return bucket.cents;
  return 0;
}

/**
 * 模型 → 单次估算成本 (人民币分)
 *
 * HappyHorse 不公开返回成本, 按经验估算:
 *   - GPT Image 2 标准: ¥0.30 / 张 = 30 分
 *   - GPT Image 2 高清: ¥1.20 / 张 = 120 分
 *   - hh i2v 5s 720p:    ¥3-5 / 条 = 400 分
 *   - hh i2v 5s 1080p:   ¥7-10 / 条 = 800 分
 *   - Gemini 2.5 Flash 视频拆解 8MB 约 30s: ~¥0.10 = 10 分
 *   - DeepSeek/qwen chat 1K token: ~¥0.005 = 0.5 分 (忽略)
 */
export const COST_ESTIMATE_CENTS = {
  'image-medium': 30,
  'image-high': 120,
  'video-720p': 400,
  'video-1080p': 800,
  'video-teardown': 10,
  'chat-default': 1,
} as const;
