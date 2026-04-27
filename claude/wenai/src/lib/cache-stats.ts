/**
 * 缓存命中率统计 · 给阁主看具体节省了多少钱
 *
 * 三条带缓存的链路 (image / video / teardown) 都调 recordCacheHit / recordCacheMiss
 * Redis hash key: wenai:cachestats:<orgId>:<date>
 *   field: <kind>:hit / <kind>:miss → counter
 *
 * 对账规则: hit 一次 = 省 1 次该 kind 的成本估算 (按 cost-cap 同样的 cents 表)
 *
 * 不阻塞主链路 · 失败 silently swallow
 */

import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const memStats = new Map<string, Record<string, number>>();
const TTL_SEC = 30 * 24 * 3600; // 30 天历史保留

export type CacheKind = 'image' | 'video' | 'teardown';

function todayKey(orgId: string): string {
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return `wenai:cachestats:${orgId}:${date}`;
}

export async function recordCacheEvent(orgId: string, kind: CacheKind, hit: boolean): Promise<void> {
  const key = todayKey(orgId);
  const field = `${kind}:${hit ? 'hit' : 'miss'}`;
  if (redis) {
    try {
      await redis.hincrby(key, field, 1);
      await redis.expire(key, TTL_SEC);
      return;
    } catch {
      /* fallthrough mem */
    }
  }
  const cur = memStats.get(key) ?? {};
  cur[field] = (cur[field] ?? 0) + 1;
  memStats.set(key, cur);
}

export interface CacheStatSnapshot {
  orgId: string;
  date: string;
  byKind: Record<CacheKind, { hits: number; misses: number; hitRate: number }>;
  totalHits: number;
  totalMisses: number;
  estimatedSavedCents: number;
}

// 各 kind 的"每次命中省多少 cents" (与 cost-cap 估算一致)
const SAVED_CENTS: Record<CacheKind, number> = {
  image: 50,    // ¥0.5 · medium quality 平均
  video: 350,   // ¥3.5 · 720p 5s 平均
  teardown: 4,  // ¥0.04 · Gemini Vision
};

export async function getCacheStatSnapshot(orgId: string, date?: string): Promise<CacheStatSnapshot> {
  const dateStr = date ?? new Date().toISOString().slice(0, 10);
  const key = `wenai:cachestats:${orgId}:${dateStr}`;
  let raw: Record<string, number | string> = {};

  if (redis) {
    try {
      raw = (await redis.hgetall(key)) || {};
    } catch {
      /* mem fallback */
    }
  }
  if (Object.keys(raw).length === 0) {
    raw = (memStats.get(key) ?? {}) as Record<string, number>;
  }

  const get = (k: string): number => {
    const v = raw[k];
    if (typeof v === 'number') return v;
    if (typeof v === 'string') return parseInt(v, 10) || 0;
    return 0;
  };

  const byKind: CacheStatSnapshot['byKind'] = {
    image: { hits: get('image:hit'), misses: get('image:miss'), hitRate: 0 },
    video: { hits: get('video:hit'), misses: get('video:miss'), hitRate: 0 },
    teardown: { hits: get('teardown:hit'), misses: get('teardown:miss'), hitRate: 0 },
  };
  let totalHits = 0;
  let totalMisses = 0;
  let saved = 0;
  for (const k of ['image', 'video', 'teardown'] as CacheKind[]) {
    const total = byKind[k].hits + byKind[k].misses;
    byKind[k].hitRate = total > 0 ? +(byKind[k].hits / total).toFixed(3) : 0;
    totalHits += byKind[k].hits;
    totalMisses += byKind[k].misses;
    saved += byKind[k].hits * SAVED_CENTS[k];
  }
  return {
    orgId,
    date: dateStr,
    byKind,
    totalHits,
    totalMisses,
    estimatedSavedCents: saved,
  };
}
