import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { getDailyCost } from '@/lib/cost-cap';

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
    return NextResponse.json({
      orgId,
      date: todayDateStr(),
      currentCents: cents,
      currentCny: +(cents / 100).toFixed(2),
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
