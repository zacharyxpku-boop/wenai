import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { listSkus } from '@/lib/sku-history';
import { getDailyCost } from '@/lib/cost-cap';
import { getCacheStatSnapshot } from '@/lib/cache-stats';

/**
 * Admin 跨 org 信号总览
 *
 * GET /api/admin/alerts
 *   扫所有有 SKU/cost 活动的 org, 跑 alerts 6 类轻量检测
 *   返回每个 org 的 critical/warning/info 计数 + 总条数
 *   按 critical 数降序 (谁问题最严重显在前)
 *
 * 与 /api/user/alerts 区别:
 *   user 看自己具体问题
 *   admin 看哪些 org 该被销售/客服主动联系 (高 critical 流失风险)
 */

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const STALE_DAYS = 30;
const COST_CAP_CENTS = parseInt(process.env.COST_CAP_DAILY_CENTS || '5000', 10);

interface OrgAlertSummary {
  orgId: string;
  critical: number;
  warning: number;
  info: number;
  total: number;
  topReason: string; // 一句话说最严重的问题
  skuCount: number;
  todayCny: number;
}

async function discoverOrgs(): Promise<Set<string>> {
  if (!redis) return new Set();
  const orgs = new Set<string>();
  // 扫 SKU 列表 + 当日 cost 双路, 取并集
  const today = new Date().toISOString().slice(0, 10);
  for (const pattern of [
    `wenai:sku:list:*`,
    `wenai:cost:*:${today}`,
  ]) {
    let cursor: string | number = 0;
    let iter = 0;
    try {
      do {
        const res: [string | number, string[]] = await redis.scan(cursor, { match: pattern, count: 200 });
        cursor = res[0];
        for (const key of res[1]) {
          if (key.includes(':detail:')) continue;
          // wenai:sku:list:<orgId>  或  wenai:cost:<orgId>:<date>
          let orgId: string | null = null;
          if (key.startsWith('wenai:sku:list:')) {
            orgId = key.slice('wenai:sku:list:'.length);
          } else if (key.startsWith('wenai:cost:')) {
            const parts = key.split(':');
            orgId = parts.slice(2, parts.length - 1).join(':');
          }
          if (orgId) orgs.add(orgId);
        }
        iter++;
        if (iter > 30) break;
      } while (cursor !== '0' && cursor !== 0);
    } catch {
      // 继续下一 pattern
    }
  }
  return orgs;
}

async function summarizeOrg(orgId: string): Promise<OrgAlertSummary> {
  let critical = 0;
  let warning = 0;
  let info = 0;
  let topReason = '';

  const [skus, dailyCents] = await Promise.all([
    listSkus(orgId, 200),
    getDailyCost(orgId),
  ]);

  // stale-sku
  const staleCutoff = Date.now() - STALE_DAYS * 24 * 3600 * 1000;
  const stale = skus.filter(s =>
    s.status === 'launched' && new Date(s.updatedAt).getTime() < staleCutoff
  ).length;
  if (stale >= 5) {
    critical++;
    if (!topReason) topReason = `${stale} 个上架 SKU 死掉`;
  } else if (stale > 0) {
    warning++;
    if (!topReason) topReason = `${stale} 个上架 SKU 该复评`;
  }

  // no-perf
  const noPerf = skus.filter(s => s.status === 'launched' && !s.performance?.testedAt).length;
  if (noPerf >= 3) {
    warning++;
    if (!topReason) topReason = `${noPerf} 个上架 SKU 没回填实战`;
  } else if (noPerf > 0) {
    info++;
  }

  // cost-near-cap
  const ratio = dailyCents / COST_CAP_CENTS;
  if (ratio >= 1) {
    critical++;
    topReason = '今日已达成本上限';
  } else if (ratio >= 0.7) {
    warning++;
    if (!topReason) topReason = `今日成本 ${(ratio * 100).toFixed(0)}% × cap`;
  }

  // low-cache-rate (近 7 天)
  let totalHits = 0;
  let totalCalls = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const dStr = d.toISOString().slice(0, 10);
    const snap = await getCacheStatSnapshot(orgId, dStr);
    totalHits += snap.totalHits;
    totalCalls += snap.totalHits + snap.totalMisses;
  }
  if (totalCalls >= 30) {
    const rate = totalHits / totalCalls;
    if (rate < 0.10) {
      info++;
      if (!topReason) topReason = `命中率仅 ${(rate * 100).toFixed(1)}%`;
    }
  }

  // no-bench
  const withPerf = skus.filter(s => s.performance?.testedAt).length;
  if (skus.length >= 5 && withPerf < 3) {
    info++;
    if (!topReason) topReason = `自建 benchmark 不足 (${withPerf}/${skus.length})`;
  }

  if (!topReason && skus.length === 0) topReason = '空 SKU 库 (新用户?)';
  if (!topReason) topReason = '健康 ✓';

  return {
    orgId,
    critical, warning, info,
    total: critical + warning + info,
    topReason,
    skuCount: skus.length,
    todayCny: +(dailyCents / 100).toFixed(2),
  };
}

export async function GET() {
  if (!redis) {
    return NextResponse.json({ orgs: [], totalOrgs: 0, error: '当前为本地试用模式，告警统计仅显示本地数据。' });
  }
  const orgs = await discoverOrgs();
  const summaries: OrgAlertSummary[] = [];
  // 限到前 200 org · 防爆
  const orgList = Array.from(orgs).slice(0, 200);
  // 串行 (避免 Redis 并发淹)
  for (const orgId of orgList) {
    try {
      summaries.push(await summarizeOrg(orgId));
    } catch {
      // skip 失败 org
    }
  }
  summaries.sort((a, b) => {
    if (b.critical !== a.critical) return b.critical - a.critical;
    if (b.warning !== a.warning) return b.warning - a.warning;
    return b.total - a.total;
  });
  return NextResponse.json({
    totalOrgs: summaries.length,
    criticalOrgs: summaries.filter(o => o.critical > 0).length,
    warningOrgs: summaries.filter(o => o.warning > 0 && o.critical === 0).length,
    healthyOrgs: summaries.filter(o => o.total === 0).length,
    orgs: summaries,
  });
}
