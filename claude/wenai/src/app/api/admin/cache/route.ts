import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { getCacheStatSnapshot } from '@/lib/cache-stats';

/**
 * Admin 缓存命中统计
 *
 * GET /api/admin/cache?orgId=xxx           单 org 当日命中率
 * GET /api/admin/cache?orgId=xxx&date=YYYY-MM-DD   历史某天
 * GET /api/admin/cache?list=1              全店当日聚合 (扫所有 org)
 *
 * 给阁主看具体节省了多少 ¥, 让缓存效益对内对外可见
 */

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');
  const date = searchParams.get('date') || todayStr();
  const wantList = searchParams.get('list') === '1';

  if (orgId) {
    const snap = await getCacheStatSnapshot(orgId, date);
    return NextResponse.json({
      ...snap,
      estimatedSavedCny: +(snap.estimatedSavedCents / 100).toFixed(2),
    });
  }

  if (wantList) {
    if (!redis) {
      return NextResponse.json({ error: '需要 Redis 才能聚合', orgs: [] });
    }
    // 扫 wenai:cachestats:*:<date>
    const orgs: Array<{
      orgId: string;
      totalHits: number;
      totalMisses: number;
      hitRate: number;
      savedCny: number;
    }> = [];
    let cursor: string | number = 0;
    const pattern = `wenai:cachestats:*:${date}`;
    let iter = 0;
    do {
      const res: [string | number, string[]] = await redis.scan(cursor, { match: pattern, count: 200 });
      cursor = res[0];
      for (const key of res[1]) {
        // wenai:cachestats:<orgId>:<date>
        const parts = key.split(':');
        // orgId 可能含冒号 (例 ip:1.2.3.4), 拼回
        const orgIdParsed = parts.slice(2, parts.length - 1).join(':');
        if (!orgIdParsed) continue;
        const snap = await getCacheStatSnapshot(orgIdParsed, date);
        const total = snap.totalHits + snap.totalMisses;
        if (total === 0) continue;
        orgs.push({
          orgId: orgIdParsed,
          totalHits: snap.totalHits,
          totalMisses: snap.totalMisses,
          hitRate: total > 0 ? +(snap.totalHits / total).toFixed(3) : 0,
          savedCny: +(snap.estimatedSavedCents / 100).toFixed(2),
        });
      }
      iter++;
      if (iter > 50) break; // 防爆
    } while (cursor !== '0' && cursor !== 0);

    orgs.sort((a, b) => b.savedCny - a.savedCny);
    const totalSaved = +orgs.reduce((s, o) => s + o.savedCny, 0).toFixed(2);
    return NextResponse.json({ date, count: orgs.length, totalSavedCny: totalSaved, orgs });
  }

  return NextResponse.json(
    { error: 'orgId 或 list=1 必填' },
    { status: 400 }
  );
}
