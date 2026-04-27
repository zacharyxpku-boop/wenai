import { NextRequest, NextResponse } from 'next/server';
import { listCostDetails } from '@/lib/cost-cap';
import { resolveOrgId } from '@/lib/org-id';

/**
 * GET /api/user/sku-cost?skuId=xxx&days=7
 *
 * 反向聚合: 当前 orgId 在指定 SKU 上累计花了多少 cents
 * 当前实现: 只看当日 (cost-cap detail TTL 7 天, 但 list 只一日 key)
 * Phase-2 (待做): 跨多日聚合, 需要 cost-cap 改成滚动 7 日 list
 */

export async function GET(req: NextRequest) {
  const orgId = await resolveOrgId(req);
  const url = new URL(req.url);
  const skuId = url.searchParams.get('skuId');
  if (!skuId) {
    return NextResponse.json({ error: 'skuId 必填' }, { status: 400 });
  }

  const details = await listCostDetails(orgId, 200);
  const matched = details.filter(d => d.skuId === skuId);
  const totalCents = matched.reduce((s, d) => s + d.cents, 0);

  // 按模块聚合
  const byModule: Record<string, { cents: number; count: number }> = {};
  for (const d of matched) {
    const m = byModule[d.module] ?? { cents: 0, count: 0 };
    m.cents += d.cents;
    m.count += 1;
    byModule[d.module] = m;
  }

  return NextResponse.json({
    skuId,
    callCount: matched.length,
    totalCents,
    totalCny: +(totalCents / 100).toFixed(2),
    byModule,
    recent: matched.slice(0, 20),
    notice: '当前仅当日聚合, phase-2 跨 7 日',
  });
}
