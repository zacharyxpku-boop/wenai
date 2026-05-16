import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { resolveOrgId } from '@/lib/org-id';

/**
 * GET /api/user/digest
 *   返回当前 orgId 最近 N 份 digest 快照
 *   用于 /me/alerts 页"上次推送预览"+ 历史走势
 *
 * 数据由 /api/cron/daily-digest 每日写入
 */

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export async function GET(req: NextRequest) {
  const orgId = await resolveOrgId(req);
  const limit = Math.min(parseInt(new URL(req.url).searchParams.get('limit') || '7', 10), 30);

  if (!redis) {
    return NextResponse.json({ digests: [], error: '当前为本地试用模式，摘要历史不会跨环境持久化。' });
  }
  try {
    const dates = (await redis.lrange(`wenai:digest:list:${orgId}`, 0, limit - 1)) as string[];
    if (!dates || dates.length === 0) {
      return NextResponse.json({ digests: [], lastDate: null });
    }
    const items = await Promise.all(
      dates.map(async d => {
        const raw = await redis!.get(`wenai:digest:${orgId}:${d}`);
        if (!raw) return null;
        try {
          return typeof raw === 'string' ? JSON.parse(raw) : raw;
        } catch {
          return null;
        }
      })
    );
    const digests = items.filter(Boolean);
    return NextResponse.json({
      digests,
      lastDate: digests[0]?.date ?? null,
      count: digests.length,
    });
  } catch (e) {
    return NextResponse.json({ digests: [], error: e instanceof Error ? e.message : 'unknown' });
  }
}
