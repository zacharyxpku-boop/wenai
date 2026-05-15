import { NextRequest, NextResponse } from 'next/server';
import { listBenchCategories, getBenchSnapshot } from '@/lib/cross-org-benchmark';

/**
 * 公开 benchmark 索引 · 不需要登录 · SEO 流量入口
 *
 * GET /api/public/benchmarks                  全 category 索引 (CTR + CPC)
 * GET /api/public/benchmarks?category=xxx     单 category 详细分位
 *
 * 隐私规则:
 *   - 索引页只暴露 count + median (p50), 不暴露分位段
 *   - 详细页 N >= 20 才暴露 p25/p50/p75, N >= 50 才出 p10/p90
 *   - 任何路径都不暴露 orgId / SKU 名 / 时间戳
 *
 * 用途:
 *   /benchmark 页 SEO landing
 *   未登录访客查"女装连衣裙 CTR 多少" 落到这里 → 转化为试用
 */

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const category = url.searchParams.get('category');

  if (category) {
    const [ctr, cpc] = await Promise.all([
      getBenchSnapshot('ctr', category),
      getBenchSnapshot('cpc', category),
    ]);
    return NextResponse.json({
      category,
      ctr: redactByCount(ctr),
      cpc: redactByCount(cpc),
    });
  }

  const [ctrCats, cpcCats] = await Promise.all([
    listBenchCategories('ctr', 10),
    listBenchCategories('cpc', 10),
  ]);
  return NextResponse.json({
    ctrCategories: ctrCats,
    cpcCategories: cpcCats,
    totalCtrCategories: ctrCats.length,
    totalCpcCategories: cpcCats.length,
  });
}

/** 按样本数遮罩 · 小桶不出分位防反识别 */
function redactByCount<T extends {
  count: number; p10: number | null; p25: number | null; p50: number | null; p75: number | null; p90: number | null;
}>(snap: T): T {
  if (snap.count < 10) {
    return { ...snap, p10: null, p25: null, p50: null, p75: null, p90: null };
  }
  if (snap.count < 20) {
    return { ...snap, p10: null, p25: null, p75: null, p90: null }; // 只露 median
  }
  if (snap.count < 50) {
    return { ...snap, p10: null, p90: null }; // 露 p25/p50/p75
  }
  return snap; // 50+ 全开
}

/** 配 Next caching: ISR 静态化 5 分钟 (减少 Redis ZRANGE 压力) */
export const revalidate = 300;
