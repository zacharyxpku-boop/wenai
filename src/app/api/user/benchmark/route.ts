import { NextRequest, NextResponse } from 'next/server';
import { getBenchSnapshot, type BenchMetric } from '@/lib/cross-org-benchmark';

/**
 * GET /api/user/benchmark?metric=ctr&category=女装-连衣裙&value=3.2
 *   返回该 category 下全 wenai 用户匿名聚合的 p10/25/50/75/90
 *   带 value 时附加 yourPercentile
 *
 * 匿名 + 不可逆: 输入只是数值 + category, 输出是分位数, 看不到任何 orgId / SKU 名
 */

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const metric = (url.searchParams.get('metric') || 'ctr') as BenchMetric;
  const category = url.searchParams.get('category') || '';
  const valueRaw = url.searchParams.get('value');
  const value = valueRaw ? parseFloat(valueRaw) : undefined;

  if (!category.trim()) {
    return NextResponse.json({ error: 'category 必填' }, { status: 400 });
  }
  if (metric !== 'ctr' && metric !== 'cpc') {
    return NextResponse.json({ error: 'metric 必须是 ctr 或 cpc' }, { status: 400 });
  }

  const snap = await getBenchSnapshot(metric, category, value);
  return NextResponse.json(snap);
}
