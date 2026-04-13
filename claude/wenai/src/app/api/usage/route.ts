import { NextRequest, NextResponse } from 'next/server';
import { readUsage, logUsageEntry } from '@/lib/usage';

// POST: log a usage event
export async function POST(request: NextRequest) {
  let moduleId: string, tokens: number | undefined, rating: number | undefined;
  try {
    ({ moduleId, tokens, rating } = await request.json());
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }
  const tenantId = request.headers.get('x-tenant-id') || 'default';
  const userId = request.headers.get('x-username') || undefined;
  await logUsageEntry(moduleId, tokens || 0, rating, tenantId, userId);
  return NextResponse.json({ ok: true });
}

// GET: return aggregated stats (filtered by tenant from middleware)
export async function GET(request: NextRequest) {
  const data = await readUsage();
  const tenantId = request.headers.get('x-tenant-id') || 'default';
  const now = Date.now();
  const today = now - 24 * 60 * 60 * 1000;
  const week = now - 7 * 24 * 60 * 60 * 1000;

  // Filter by tenant
  const tenantEntries = data.entries.filter(e => !e.tenantId || e.tenantId === tenantId);
  const todayEntries = tenantEntries.filter(e => e.timestamp > today);
  const weekEntries = tenantEntries.filter(e => e.timestamp > week);

  // Module usage ranking (7-day)
  const moduleCount: Record<string, number> = {};
  for (const e of weekEntries) {
    moduleCount[e.moduleId] = (moduleCount[e.moduleId] || 0) + 1;
  }
  const ranking = Object.entries(moduleCount)
    .sort((a, b) => b[1] - a[1])
    .map(([moduleId, count]) => ({ moduleId, count }));

  // Average rating (all time, only entries with rating)
  const rated = tenantEntries.filter(e => e.rating && e.rating > 0);
  const avgRating = rated.length > 0
    ? Math.round((rated.reduce((s, e) => s + (e.rating || 0), 0) / rated.length) * 10) / 10
    : 0;

  // Total tokens (7-day)
  const weekTokens = weekEntries.reduce((s, e) => s + e.tokens, 0);

  // Daily trend (last 7 days)
  const dailyTrend: { date: string; count: number; tokens: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = now - (i + 1) * 24 * 60 * 60 * 1000;
    const dayEnd = now - i * 24 * 60 * 60 * 1000;
    const dayEntries = tenantEntries.filter(e => e.timestamp > dayStart && e.timestamp <= dayEnd);
    const d = new Date(dayEnd);
    dailyTrend.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      count: dayEntries.length,
      tokens: dayEntries.reduce((s, e) => s + e.tokens, 0),
    });
  }

  return NextResponse.json({
    todayCount: todayEntries.length,
    weekCount: weekEntries.length,
    totalCount: tenantEntries.length,
    weekTokens,
    avgRating,
    ratingCount: rated.length,
    ranking,
    dailyTrend,
    tenantId,
  });
}
