import { NextRequest, NextResponse } from 'next/server';
import { resolveOrgId } from '@/lib/org-id';
import { listSkus } from '@/lib/sku-history';
import { getDailyCost, listCostDetailsRange } from '@/lib/cost-cap';
import { getCacheStatSnapshot } from '@/lib/cache-stats';
import { listLowOrOut } from '@/lib/inventory';

/**
 * 商家被动等触发改主动 push · 把死信号扫出来给主人看
 *
 * GET /api/user/alerts
 *   返回一个 alerts[] 数组, 每条 { id, severity, kind, headline, body, action }
 *
 * 信号源:
 *   stale-sku       上架超 30 天没更新的 SKU
 *   no-perf         SKU 上架但从未回填投放数据
 *   low-cache-rate  近 7 天命中率 < 10% (商家可能没用 cache 友好的工作流)
 *   cost-near-cap   今日成本 > 70% × 日上限
 *   no-bench        SKU 已测款但跨 org benchmark 没数据 (引导跑更多 SKU)
 *
 * 输出按 severity 排序: critical > warning > info
 */

const STALE_DAYS = 30;
const COST_CAP_CENTS_DEFAULT = parseInt(process.env.COST_CAP_DAILY_CENTS || '5000', 10); // ¥50

export interface UserAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  kind: 'stale-sku' | 'no-perf' | 'low-cache-rate' | 'cost-near-cap' | 'no-bench' | 'inventory-low' | 'inventory-out';
  headline: string;
  body: string;
  action: { label: string; href: string };
}

const SEV_RANK: Record<UserAlert['severity'], number> = {
  critical: 0, warning: 1, info: 2,
};

export async function GET(req: NextRequest) {
  const orgId = await resolveOrgId(req);
  const alerts: UserAlert[] = [];

  // 拉数据并发
  const [skus, dailyCents, lowInv] = await Promise.all([
    listSkus(orgId, 200),
    getDailyCost(orgId),
    listLowOrOut(orgId),
  ]);

  // 0. 库存断货优先 (商家最痛)
  const outItems = lowInv.filter(r => r.status === 'out');
  const lowItems = lowInv.filter(r => r.status === 'low');
  if (outItems.length > 0) {
    alerts.push({
      id: 'inventory-out',
      severity: 'critical',
      kind: 'inventory-out',
      headline: `${outItems.length} 个 SKU 断货 (qty=0)`,
      body: `${outItems.slice(0, 3).map(r => r.skuId).join(', ')}${outItems.length > 3 ? ' 等' : ''} 已 0 库存. 上架页继续卖会扣分, 立即下架或补货.`,
      action: { label: '看库存 →', href: '/me/inventory' },
    });
  }
  if (lowItems.length > 0) {
    alerts.push({
      id: 'inventory-low',
      severity: lowItems.length >= 5 ? 'warning' : 'info',
      kind: 'inventory-low',
      headline: `${lowItems.length} 个 SKU 库存接近阈值`,
      body: `最低 ${lowItems[0].skuId} 仅 ${lowItems[0].qty} 件 (阈值 ${lowItems[0].threshold}). 评估补货 lead time, 别等 0 才动.`,
      action: { label: '看库存 →', href: '/me/inventory' },
    });
  }

  // 1. stale-sku: launched > 30 天没更新
  const staleCutoff = Date.now() - STALE_DAYS * 24 * 3600 * 1000;
  const stale = skus.filter(s =>
    s.status === 'launched' && new Date(s.updatedAt).getTime() < staleCutoff
  );
  if (stale.length > 0) {
    const oldest = stale[0];
    const days = Math.floor((Date.now() - new Date(oldest.updatedAt).getTime()) / 86400000);
    alerts.push({
      id: 'stale-sku',
      severity: stale.length >= 5 ? 'critical' : 'warning',
      kind: 'stale-sku',
      headline: `${stale.length} 个上架 SKU 超 ${STALE_DAYS} 天没动`,
      body: `最久 ${days} 天没更新 (${oldest.name}). 爆款生命周期会衰减, 跑数据洞察找根因.`,
      action: { label: '看哪些 →', href: '/me/skus' },
    });
  }

  // 2. no-perf: 已上架但 perf.testedAt 缺失
  const noPerf = skus.filter(s =>
    s.status === 'launched' && !s.performance?.testedAt
  );
  if (noPerf.length > 0) {
    alerts.push({
      id: 'no-perf',
      severity: noPerf.length >= 3 ? 'warning' : 'info',
      kind: 'no-perf',
      headline: `${noPerf.length} 个 SKU 上架但没回填实战数据`,
      body: `没数据就跑不动 cross-org benchmark · 也看不到 CTR/CPC 排第几. 跑 ab-test 投放后填回来.`,
      action: { label: '去 ab-test →', href: '/pipelines/ab-test' },
    });
  }

  // 3. low-cache-rate: 近 7 天平均命中率 < 10%
  let totalHits = 0;
  let totalCalls = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const dStr = d.toISOString().slice(0, 10);
    const snap = await getCacheStatSnapshot(orgId, dStr);
    totalHits += snap.totalHits;
    totalCalls += snap.totalHits + snap.totalMisses;
  }
  if (totalCalls >= 30) {
    const rate = totalHits / totalCalls;
    if (rate < 0.10) {
      alerts.push({
        id: 'low-cache-rate',
        severity: 'info',
        kind: 'low-cache-rate',
        headline: `近 7 天缓存命中率 ${(rate * 100).toFixed(1)}% (低)`,
        body: `每次都新生成 prompt 可能在浪费 quota. 同一 SKU 同一 prompt 应该重复跑能复用.`,
        action: { label: '看 SKU 库 →', href: '/me/skus' },
      });
    }
  }

  // 4. cost-near-cap: 今日 > 70% × cap
  const ratio = dailyCents / COST_CAP_CENTS_DEFAULT;
  if (ratio >= 0.7 && ratio < 1) {
    alerts.push({
      id: 'cost-near-cap',
      severity: 'warning',
      kind: 'cost-near-cap',
      headline: `今日花费 ¥${(dailyCents / 100).toFixed(2)} 已达上限 ${(ratio * 100).toFixed(0)}%`,
      body: `日上限 ¥${(COST_CAP_CENTS_DEFAULT / 100).toFixed(2)}. 超后会被 429 拒绝, 优先重要 SKU.`,
      action: { label: '看明细 →', href: '/me/skus' },
    });
  } else if (ratio >= 1) {
    alerts.push({
      id: 'cost-near-cap',
      severity: 'critical',
      kind: 'cost-near-cap',
      headline: `今日已达成本上限 ¥${(COST_CAP_CENTS_DEFAULT / 100).toFixed(2)}`,
      body: `继续调用会被 429 拒绝, 明日 0 点重置. 必要时联系阁主提额.`,
      action: { label: '查询盘 →', href: '/inquire?from=cost-cap' },
    });
  }

  // 5. no-bench: 商家有 perf 数据但 listSkus 整体回填的 < 3 (无法做 self benchmark)
  const withPerf = skus.filter(s => s.performance?.testedAt);
  if (skus.length >= 5 && withPerf.length < 3) {
    alerts.push({
      id: 'no-bench',
      severity: 'info',
      kind: 'no-bench',
      headline: `自建 benchmark 样本不足 (${withPerf.length}/${skus.length})`,
      body: `回填 ≥3 个 SKU 实战数据, data-insights 才能给"你比自己均值高/低"判断.`,
      action: { label: '去 ab-test 回填 →', href: '/pipelines/ab-test' },
    });
  }

  // 用 cost-detail 检查是否有调用但没关联 skuId (优化漏斗)
  const recentDetails = await listCostDetailsRange(orgId, 3, 50);
  const noSkuCount = recentDetails.filter(d => !d.skuId).length;
  if (recentDetails.length >= 10 && noSkuCount / recentDetails.length > 0.5) {
    alerts.push({
      id: 'low-sku-attribution',
      severity: 'info',
      kind: 'no-perf',
      headline: `近 3 天 ${noSkuCount}/${recentDetails.length} 次调用没关联 SKU`,
      body: `从 SKU 库进入模块 (URL 带 ?skuId=) 才能精确归因成本到产品, 否则是黑账.`,
      action: { label: '去 SKU 库进 →', href: '/me/skus' },
    });
  }

  alerts.sort((a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity]);

  return NextResponse.json({
    orgId,
    count: alerts.length,
    criticalCount: alerts.filter(a => a.severity === 'critical').length,
    warningCount: alerts.filter(a => a.severity === 'warning').length,
    alerts,
  });
}
