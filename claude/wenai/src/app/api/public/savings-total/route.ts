import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { getCacheStatSnapshot } from '@/lib/cache-stats';

/**
 * 公开实时累计省钱计数器 · 首页领先动作产品
 *
 * GET /api/public/savings-total
 *   返回过去 7 天 wenai 全店替商家省了 ¥X (vs 真人/外包替代成本)
 *   外加 cache 红利
 *
 * 隐私: 只输出聚合值, 不暴露任何 orgId / SKU / 调用明细
 *
 * 性能: 5 分钟 ISR + 内部 SCAN 上限保护
 */

export const revalidate = 300;

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// 与 /api/user/savings-summary 相同的替代成本表 (¥ per call)
const MODULE_SAVINGS_CNY: Record<string, number> = {
  'openai-image': 800,
  'video-gen': 600,
  'video-teardown': 150,
  copywriting: 50,
  'ab-test': 300,
  'batch-launch': 400,
  'customer-service': 20,
  'intent-mining': 100,
  'product-discovery': 150,
  'data-insights': 200,
  reviews: 80,
  outreach: 60,
  competitor: 200,
  selection: 100,
  operations: 300,
  leads: 100,
  livestream: 100,
  positioning: 200,
  content: 60,
  'private-domain': 80,
  'ip-compliance': 200,
  'ad-optimizer': 250,
  translate: 30,
  'ocr-translate': 50,
};

interface CostDetailLite {
  module: string;
  cents: number;
}

function normalizeModule(raw: string): string {
  let m = raw;
  if (m.startsWith('chat:')) m = m.slice(5);
  if (m.includes(':')) m = m.split(':')[0];
  return m;
}

export async function GET() {
  if (!redis) {
    return NextResponse.json({
      replacementSavedCny: 0,
      cacheSavedCny: 0,
      grandTotalCny: 0,
      activeOrgCount: 0,
      windowDays: 7,
      note: '当前为本地试用模式，实时节省金额不可跨环境汇总。',
    });
  }

  const days = 7;
  let totalReplacementCny = 0;
  let totalWenaiCostCny = 0;
  let totalCacheSavedCents = 0;
  const orgSet = new Set<string>();

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const dStr = d.toISOString().slice(0, 10);

    // Pass 1: 扫该日所有 cost-detail key
    let cursor: string | number = 0;
    let iter = 0;
    try {
      do {
        const res: [string | number, string[]] = await redis.scan(cursor, {
          match: `wenai:cost:detail:*:${dStr}`,
          count: 200,
        });
        cursor = res[0];
        for (const key of res[1]) {
          // wenai:cost:detail:<orgId>:<date>
          const parts = key.split(':');
          const orgId = parts.slice(3, parts.length - 1).join(':');
          if (orgId) orgSet.add(orgId);
          try {
            const items = (await redis.lrange(key, 0, 200)) as string[];
            for (const s of items) {
              try {
                const d = JSON.parse(s) as CostDetailLite;
                const norm = normalizeModule(d.module);
                const altCny = MODULE_SAVINGS_CNY[norm];
                if (typeof altCny === 'number') {
                  totalReplacementCny += altCny - d.cents / 100;
                  totalWenaiCostCny += d.cents / 100;
                }
              } catch { /* skip malformed */ }
            }
          } catch { /* skip this key */ }
        }
        iter++;
        if (iter > 50) break;
      } while (cursor !== '0' && cursor !== 0);
    } catch {
      // 该日扫描失败, 继续下一天
    }

    // Pass 2: 同样窗口的 cache-stats 累计
    let cacheCursor: string | number = 0;
    let cacheIter = 0;
    try {
      do {
        const res: [string | number, string[]] = await redis.scan(cacheCursor, {
          match: `wenai:cachestats:*:${dStr}`,
          count: 200,
        });
        cacheCursor = res[0];
        for (const key of res[1]) {
          const parts = key.split(':');
          const orgId = parts.slice(2, parts.length - 1).join(':');
          if (!orgId) continue;
          orgSet.add(orgId);
          const snap = await getCacheStatSnapshot(orgId, dStr);
          totalCacheSavedCents += snap.estimatedSavedCents;
        }
        cacheIter++;
        if (cacheIter > 50) break;
      } while (cacheCursor !== '0' && cacheCursor !== 0);
    } catch {
      // 缓存统计扫描失败, 不阻塞主链路
    }
  }

  const cacheSavedCny = +(totalCacheSavedCents / 100).toFixed(2);
  const grandTotalCny = +(totalReplacementCny + cacheSavedCny).toFixed(2);

  return NextResponse.json({
    replacementSavedCny: +totalReplacementCny.toFixed(2),
    wenaiCostCny: +totalWenaiCostCny.toFixed(2),
    cacheSavedCny,
    grandTotalCny,
    activeOrgCount: orgSet.size,
    windowDays: days,
  });
}
