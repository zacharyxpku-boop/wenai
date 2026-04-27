import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { getDailyCost, listCostDetails } from '@/lib/cost-cap';
import { listSkus } from '@/lib/sku-history';

/**
 * Admin 成本面板 · 看任意 org 当日累计花费
 *
 * GET /api/admin/cost?orgId=xxx                查单个 org
 * GET /api/admin/cost?list=1                   列出所有有花费的 org (Redis SCAN)
 *
 * RBAC 沿用 admin 口令保护 (前端 sessionStorage)
 * Redis key 模式: wenai:cost:<orgId>:<YYYY-MM-DD>
 */

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

function todayDateStr(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');
  const wantList = searchParams.get('list') === '1';

  if (orgId) {
    const cents = await getDailyCost(orgId);
    const detailMode = searchParams.get('detail') === '1';

    if (detailMode) {
      // 钻取: 当日花费明细 + 该 orgId 的 SKU 列表 (基于 org-id helper 一致性)
      const [details, skus] = await Promise.all([
        listCostDetails(orgId, 100),
        listSkus(orgId, 50),
      ]);
      // 按模块聚合
      const byModule: Record<string, { cents: number; count: number }> = {};
      for (const d of details) {
        const m = byModule[d.module] ?? { cents: 0, count: 0 };
        m.cents += d.cents;
        m.count += 1;
        byModule[d.module] = m;
      }
      return NextResponse.json({
        orgId,
        date: todayDateStr(),
        currentCents: cents,
        currentCny: +(cents / 100).toFixed(2),
        details,
        byModule,
        skuCount: skus.length,
        skus: skus.map(s => ({
          id: s.id, name: s.name, category: s.category, status: s.status,
          modules: s.modules, addedAt: s.addedAt,
        })),
      });
    }

    return NextResponse.json({
      orgId,
      date: todayDateStr(),
      currentCents: cents,
      currentCny: +(cents / 100).toFixed(2),
    });
  }

  // ?trend=N · 全店过去 N 天每日总花费
  const trendDaysRaw = searchParams.get('trend');
  if (trendDaysRaw && redis) {
    const trendDays = Math.min(Math.max(parseInt(trendDaysRaw, 10) || 7, 1), 30);
    const points: Array<{ date: string; totalCents: number; totalCny: number; orgCount: number }> = [];
    for (let i = trendDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${day}`;
      let totalCents = 0;
      let orgCount = 0;
      let cursor: string | number = 0;
      let iter = 0;
      try {
        do {
          const res: [string | number, string[]] = await redis.scan(cursor, {
            match: `wenai:cost:*:${dStr}`,
            count: 200,
          });
          cursor = res[0];
          for (const key of res[1]) {
            // 排除 detail key (wenai:cost:detail:...)
            if (key.includes(':detail:')) continue;
            const v = await redis.get<number>(key);
            const cents = typeof v === 'number' ? v : 0;
            if (cents > 0) {
              totalCents += cents;
              orgCount++;
            }
          }
          iter++;
          if (iter > 30) break;
        } while (cursor !== '0' && cursor !== 0);
      } catch {
        // 这一天读失败给 0 占位
      }
      points.push({
        date: dStr,
        totalCents,
        totalCny: +(totalCents / 100).toFixed(2),
        orgCount,
      });
    }
    const totalCents = points.reduce((s, p) => s + p.totalCents, 0);
    return NextResponse.json({
      days: trendDays,
      points,
      totalCents,
      totalCny: +(totalCents / 100).toFixed(2),
      avgDailyCny: +(totalCents / 100 / trendDays).toFixed(2),
    });
  }

  if (wantList && redis) {
    // SCAN 当日所有 org · Upstash 支持 SCAN
    const date = todayDateStr();
    const pattern = `wenai:cost:*:${date}`;
    const items: { orgId: string; currentCents: number; currentCny: number }[] = [];
    try {
      let cursor: number | string = 0;
      do {
        const res: [string | number, string[]] = await redis.scan(cursor as number, { match: pattern, count: 100 });
        cursor = res[0];
        const keys = res[1];
        for (const k of keys) {
          const m = k.match(/^wenai:cost:(.+):\d{4}-\d{2}-\d{2}$/);
          if (!m) continue;
          const v = await redis.get<number>(k);
          const cents = typeof v === 'number' ? v : 0;
          items.push({
            orgId: m[1],
            currentCents: cents,
            currentCny: +(cents / 100).toFixed(2),
          });
        }
      } while (cursor !== 0 && cursor !== '0');
      items.sort((a, b) => b.currentCents - a.currentCents);
      const totalCents = items.reduce((s, x) => s + x.currentCents, 0);
      return NextResponse.json({
        date,
        totalCents,
        totalCny: +(totalCents / 100).toFixed(2),
        orgCount: items.length,
        items,
      });
    } catch (e) {
      return NextResponse.json(
        { error: 'Redis SCAN 失败', detail: e instanceof Error ? e.message : String(e) },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: '需要 orgId 或 list=1 参数' },
    { status: 400 }
  );
}
