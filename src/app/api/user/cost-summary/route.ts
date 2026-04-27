import { NextRequest, NextResponse } from 'next/server';
import { getDailyCost, listCostDetails } from '@/lib/cost-cap';
import { listSkus } from '@/lib/sku-history';
import { resolveOrgId } from '@/lib/org-id';

/**
 * 用户自己看的成本概况 (跟 admin/cost 不同 · 这个不需要 admin 口令)
 *
 * GET /api/user/cost-summary
 *   返回当前 orgId:
 *     - 今日花费 (¥)
 *     - 今日调用次数
 *     - 按模块聚合
 *     - SKU 库总数
 *     - 平均每 SKU 成本 (粗算: 总花费 / SKU 数)
 *     - 调用 detail 最近 20 条
 *
 * 用途: SKU 详情页 + /me/skus 顶部 + 商家自己监控烧钱速度
 *
 * Phase-2 (待做): 加 skuId 字段精确到单 SKU 成本归因
 */

export async function GET(req: NextRequest) {
  const orgId = await resolveOrgId(req);
  const [cents, details, skus] = await Promise.all([
    getDailyCost(orgId),
    listCostDetails(orgId, 20),
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
    date: new Date().toISOString().slice(0, 10),
    todayCny: +(cents / 100).toFixed(2),
    todayCalls: details.length,
    byModule,
    skuCount: skus.length,
    avgCostPerSkuCny: skus.length > 0 ? +(cents / 100 / skus.length).toFixed(2) : 0,
    recentDetails: details.slice(0, 20),
  });
}
