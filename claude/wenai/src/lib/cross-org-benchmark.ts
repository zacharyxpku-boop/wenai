/**
 * 跨 org 匿名 CTR / CPC benchmark · MOAT-11 规模红利
 *
 * 商家用得越多, 数据越准 → 后来的商家受益 → 网络效应
 *
 * 隐私设计:
 *   - 只存数值 (ctr/cpc), 不存 orgId/skuName/产品信息
 *   - 按 category 分桶, 每个 SKU 一条记录
 *   - 给单商家返回 percentile 而不是名单, 不可反向识别
 *
 * 存储:
 *   Redis sorted set: wenai:bench:ctr:<category> (score=CTR%, member=hash)
 *                     wenai:bench:cpc:<category> (score=CPC, member=hash)
 *   member = sha1(orgId|skuId|metric).slice(0,16) 防重复写入同一 SKU 多次
 *
 * 读取场景:
 *   /pipelines/data-insights "你 CTR 排前 X%" 文案
 *   /me/skus/[id] "同品类基准 ¥X" 对照
 */

import { Redis } from '@upstash/redis';
import { createHash } from 'crypto';

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export type BenchMetric = 'ctr' | 'cpc';

const TTL_SEC = 90 * 24 * 3600; // 90 天滚动窗口 · 老数据自动淘汰防过时

function memberHash(orgId: string, skuId: string, metric: BenchMetric): string {
  return createHash('sha1').update(`${orgId}|${skuId}|${metric}`).digest('hex').slice(0, 16);
}

function bucketKey(metric: BenchMetric, category: string): string {
  // 标准化 category: 去空格 + 小写 (避免 "女装-连衣裙" / "女装连衣裙" 分桶)
  const norm = category.trim().toLowerCase().replace(/\s+/g, '');
  return `wenai:bench:${metric}:${norm}`;
}

/** 写入: 同 orgId+skuId+metric 重复写会覆盖 (member 哈希一致), 不会膨胀 */
export async function recordBench(opts: {
  orgId: string;
  skuId: string;
  category: string;
  metric: BenchMetric;
  value: number;
}): Promise<void> {
  if (!redis || !opts.value || opts.value <= 0 || !opts.category) return;
  const key = bucketKey(opts.metric, opts.category);
  const member = memberHash(opts.orgId, opts.skuId, opts.metric);
  try {
    await redis.zadd(key, { score: opts.value, member });
    await redis.expire(key, TTL_SEC);
  } catch {
    /* 写失败不阻塞 */
  }
}

export interface BenchSnapshot {
  metric: BenchMetric;
  category: string;
  count: number;        // 总样本
  p10: number | null;
  p25: number | null;
  p50: number | null;   // 中位
  p75: number | null;
  p90: number | null;
  yourValue?: number;
  yourPercentile?: number; // 0-100, 越高越好 (CTR) 或越低越好 (CPC, 反向)
}

/**
 * 列出所有有数据的 category (用于公开 /benchmark 索引页)
 *
 * 隐私控制: 只返回样本 ≥ minCount 的桶 (默认 10)
 * 防过分小桶反向识别
 */
export async function listBenchCategories(
  metric: BenchMetric,
  minCount = 10
): Promise<Array<{ category: string; count: number; median: number }>> {
  if (!redis) return [];
  const out: Array<{ category: string; count: number; median: number }> = [];
  let cursor: string | number = 0;
  const pattern = `wenai:bench:${metric}:*`;
  let iter = 0;
  try {
    do {
      const res: [string | number, string[]] = await redis.scan(cursor, { match: pattern, count: 200 });
      cursor = res[0];
      for (const key of res[1]) {
        const cat = key.replace(`wenai:bench:${metric}:`, '');
        const count = await redis.zcard(key);
        if (!count || count < minCount) continue;
        // median = element at zcard/2
        const midIdx = Math.floor(count / 2);
        const items = await redis.zrange(key, midIdx, midIdx, { withScores: true }) as (string | number)[];
        const score = items[1];
        const num = typeof score === 'number' ? score : parseFloat(String(score));
        if (isNaN(num)) continue;
        out.push({ category: cat, count, median: +num.toFixed(2) });
      }
      iter++;
      if (iter > 50) break;
    } while (cursor !== '0' && cursor !== 0);
  } catch {
    /* 读失败返回已收集到的部分 */
  }
  out.sort((a, b) => b.count - a.count);
  return out;
}

/** 读取分桶 + 算商家自己的 percentile */
export async function getBenchSnapshot(
  metric: BenchMetric,
  category: string,
  yourValue?: number
): Promise<BenchSnapshot> {
  const key = bucketKey(metric, category);
  const empty: BenchSnapshot = {
    metric,
    category,
    count: 0,
    p10: null, p25: null, p50: null, p75: null, p90: null,
  };
  if (!redis) return empty;

  try {
    const count = await redis.zcard(key);
    if (!count || count < 5) return { ...empty, count: count || 0 };

    // 拉所有 score · 单 category 不会超过几千条 (90 天 TTL 控量)
    // upstash zrange-by-score 0 +inf with scores
    const items = await redis.zrange(key, 0, -1, { withScores: true }) as (string | number)[];
    // upstash 返回 [member1, score1, member2, score2, ...]
    const scores: number[] = [];
    for (let i = 1; i < items.length; i += 2) {
      const v = items[i];
      const num = typeof v === 'number' ? v : parseFloat(String(v));
      if (!isNaN(num)) scores.push(num);
    }
    scores.sort((a, b) => a - b);

    const pct = (p: number) => {
      const idx = Math.floor((p / 100) * (scores.length - 1));
      return scores[idx];
    };

    const result: BenchSnapshot = {
      metric,
      category,
      count: scores.length,
      p10: +pct(10).toFixed(2),
      p25: +pct(25).toFixed(2),
      p50: +pct(50).toFixed(2),
      p75: +pct(75).toFixed(2),
      p90: +pct(90).toFixed(2),
    };

    if (typeof yourValue === 'number' && yourValue > 0) {
      // 二分找 yourValue 的 rank
      let lo = 0, hi = scores.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (scores[mid] < yourValue) lo = mid + 1;
        else hi = mid;
      }
      const rank = lo; // 比你低的样本数
      // CTR: 越高越好 → percentile = rank / total
      // CPC: 越低越好 → percentile = 1 - rank / total
      const rawPct = (rank / scores.length) * 100;
      result.yourValue = yourValue;
      result.yourPercentile = metric === 'ctr'
        ? +rawPct.toFixed(0)
        : +(100 - rawPct).toFixed(0);
    }

    return result;
  } catch {
    return empty;
  }
}
