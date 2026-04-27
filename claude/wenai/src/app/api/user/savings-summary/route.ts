import { NextRequest, NextResponse } from 'next/server';
import { listCostDetailsRange } from '@/lib/cost-cap';
import { getCacheStatSnapshot } from '@/lib/cache-stats';
import { resolveOrgId } from '@/lib/org-id';

/**
 * 商家自己看的"省了多少钱"面板 (跟 cost-summary 互补)
 *
 * cost-summary = "你今天花了 ¥X" (烧钱速度)
 * savings-summary = "wenai 帮你省了 ¥Y" (战利品 · 触发付费心理)
 *
 * 算法:
 *   过去 7 天每个模块的真实调用次数 × 行业替代成本 (人/外包) → 节省值
 *   外加 7 天累计缓存命中节省 (image+video+teardown 自身省的 quota)
 *
 * 真实替代成本基准 (保守低值):
 *   每张 AI 影棚图 = 真人拍摄/修图 ~¥800
 *   每条 AI 视频 = 真人拍摄+剪辑 ~¥600
 *   每次视频拆解 = 1-2 小时人工 + 主管审核 ~¥150
 *   每篇文案 = 外包文案最低价 ~¥50
 *   每次测款规划 = 投放咨询师小时费 ~¥300
 *   每次批量上架计划 = 项目经理人天碎片 ~¥400
 *   每次客服三版回复 = 客服员工 5-10 分钟 ~¥20
 *   每次意图挖掘 = 调研半天 ~¥100
 *   每次选品发现 = 选品师小时费 ~¥150
 *   每次数据洞察 = 分析师 1-2 小时 ~¥200
 *
 * GET /api/user/savings-summary
 *   返回过去 7 天 by-module + 累计节省 + cache 节省 + 调用占比
 */

interface ModuleSavingMeta {
  label: string;
  perCallCny: number;
  alt: string; // 替代方案描述
}

const MODULE_SAVINGS: Record<string, ModuleSavingMeta> = {
  'openai-image': { label: '🎬 AI 影棚生图', perCallCny: 800, alt: '真人拍摄 + 修图' },
  'video-gen': { label: '🎞️ AI 视频', perCallCny: 600, alt: '真人拍摄 + 剪辑' },
  'video-teardown': { label: '🔬 视频拆解', perCallCny: 150, alt: '1-2 小时人工拆 + 审核' },
  copywriting: { label: '✍️ 商品文案', perCallCny: 50, alt: '文案外包最低单价' },
  'ab-test': { label: '⚗️ 测款 A-B', perCallCny: 300, alt: '投放咨询师小时费' },
  'batch-launch': { label: '🏭 批量上架', perCallCny: 400, alt: '项目经理人天碎片' },
  'customer-service': { label: '🤝 销售转化客服', perCallCny: 20, alt: '客服 5-10 分钟' },
  'intent-mining': { label: '🔍 反向意图', perCallCny: 100, alt: '客户调研半天' },
  'product-discovery': { label: '🎯 选品发现', perCallCny: 150, alt: '选品师小时费' },
  'data-insights': { label: '📊 数据洞察', perCallCny: 200, alt: '分析师 1-2 小时' },
  reviews: { label: '💬 评论分析', perCallCny: 80, alt: '运营人工汇总' },
  outreach: { label: '📨 达人外联', perCallCny: 60, alt: 'BD 写邮件分钟' },
  competitor: { label: '🥷 竞品拆解', perCallCny: 200, alt: '运营人工对标' },
  selection: { label: '🎯 选品候选', perCallCny: 100, alt: '运营查同行' },
  operations: { label: '📋 运营策略', perCallCny: 300, alt: '咨询费' },
  leads: { label: '🎯 精准获客', perCallCny: 100, alt: '获客调研' },
  livestream: { label: '🎤 直播脚本', perCallCny: 100, alt: '主播脚本师' },
  positioning: { label: '🧭 定位策略', perCallCny: 200, alt: '品牌咨询' },
  content: { label: '📝 内容矩阵', perCallCny: 60, alt: '小红书代运营' },
  'private-domain': { label: '💌 私域 SOP', perCallCny: 80, alt: 'CRM 顾问' },
  'ip-compliance': { label: '🛡️ IP 合规', perCallCny: 200, alt: '商标律师 quick check' },
  'ad-optimizer': { label: '📈 投流诊断', perCallCny: 250, alt: '投放代运营' },
  translate: { label: '🌐 多语翻译', perCallCny: 30, alt: '人工翻译每千字' },
  'ocr-translate': { label: '📷 图文翻译', perCallCny: 50, alt: '人工 OCR + 翻译' },
};

export async function GET(req: NextRequest) {
  const orgId = await resolveOrgId(req);
  const url = new URL(req.url);
  const days = Math.min(Math.max(parseInt(url.searchParams.get('days') || '7', 10), 1), 7);

  const details = await listCostDetailsRange(orgId, days);

  // 按 module 聚合调用次数 + 真实 wenai 花费
  const byModule: Record<string, {
    label: string;
    calls: number;
    wenaiCostCny: number;
    altCostCny: number;
    savedCny: number;
    alt: string;
  }> = {};

  for (const d of details) {
    // module 字段可能是 'openai-image' 或带前缀如 'chat:batch-launch' / 'batch-launch:overall'
    let baseModule = d.module;
    if (baseModule.startsWith('chat:')) baseModule = baseModule.slice(5);
    if (baseModule.includes(':')) baseModule = baseModule.split(':')[0];

    const meta = MODULE_SAVINGS[baseModule];
    if (!meta) continue; // 未配 benchmark 的模块跳过 (保守起见, 不瞎估)

    const cur = byModule[baseModule] ?? {
      label: meta.label,
      calls: 0,
      wenaiCostCny: 0,
      altCostCny: 0,
      savedCny: 0,
      alt: meta.alt,
    };
    cur.calls += 1;
    cur.wenaiCostCny += d.cents / 100;
    cur.altCostCny += meta.perCallCny;
    cur.savedCny += meta.perCallCny - d.cents / 100;
    byModule[baseModule] = cur;
  }

  const sortedModules = Object.entries(byModule)
    .map(([id, v]) => ({ id, ...v, savedCny: +v.savedCny.toFixed(2), wenaiCostCny: +v.wenaiCostCny.toFixed(2), altCostCny: +v.altCostCny.toFixed(2) }))
    .sort((a, b) => b.savedCny - a.savedCny);

  const totalCalls = sortedModules.reduce((s, m) => s + m.calls, 0);
  const totalWenaiCost = +sortedModules.reduce((s, m) => s + m.wenaiCostCny, 0).toFixed(2);
  const totalAltCost = +sortedModules.reduce((s, m) => s + m.altCostCny, 0).toFixed(2);
  const totalReplacementSaved = +sortedModules.reduce((s, m) => s + m.savedCny, 0).toFixed(2);

  // 缓存自身的省钱 · 加在替代成本节省外, 是双重红利
  let cacheSavedCny = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const snap = await getCacheStatSnapshot(orgId, dateStr);
    cacheSavedCny += snap.estimatedSavedCents / 100;
  }
  cacheSavedCny = +cacheSavedCny.toFixed(2);

  const grandTotal = +(totalReplacementSaved + cacheSavedCny).toFixed(2);

  return NextResponse.json({
    orgId,
    days,
    totalCalls,
    totalWenaiCostCny: totalWenaiCost,
    totalAltCostCny: totalAltCost,
    replacementSavedCny: totalReplacementSaved, // vs 真人/外包
    cacheSavedCny,                              // 缓存自身省的 wenai 自家成本
    grandTotalSavedCny: grandTotal,
    byModule: sortedModules,
  });
}
