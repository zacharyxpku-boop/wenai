'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useActiveSkuId } from '@/lib/use-active-sku';
import { ActiveSkuBadge } from '@/components/ActiveSkuBadge';
import { useMySkus } from '@/lib/use-my-skus';
import { ShareButton } from '@/components/ShareButton';
import { IndustryHint } from '@/components/IndustryHint';
import { buildDataInsightsStandardPackRoute } from '@/lib/standard-pack-routing';

/**
 * 数据洞察 (痛点 #10) · STRATEGY_DEEP L4 列的核心钩子
 *
 * Phase-1 (本版): 用户粘贴销量/投放数据 → DeepSeek 解读
 *   不接真实平台 API (各平台数据格式不一, 鉴权复杂),先用文本驱动
 *   适合"测完款想知道下一步动作"场景
 *
 * Phase-2 (待做): 接 GA4 / 抖店 / 千牛 webhook → 自动汇总当日数据 → 推送
 *
 * 跟 ab-test 形成闭环: 测款 → 数据回流 → AI 诊断 → 下一轮策略
 */

type Period = 'day' | 'week' | 'month';
type Channel = 'amazon' | 'tmall' | 'pdd' | 'tiktok' | 'douyin' | 'xiaohongshu' | 'shopify' | 'mixed';

interface Insight {
  type: 'win' | 'loss' | 'risk' | 'opportunity';
  headline: string;        // 一句话总结
  evidence: string;        // 数据依据
  rootCause: string;       // 根因猜测
  action: string;          // 具体行动
  priority: 'P0' | 'P1' | 'P2';
}

interface DataInsightsResult {
  overallVerdict: string;        // 这一周整体判断
  trendSummary: string;          // 趋势对比 (vs 上一周/上月)
  insights: Insight[];           // 4-8 条洞察
  nextRoundPlaybook: string;     // 下一轮 SOP (选品 / 影棚 / ab-test 串起来)
  killList?: string[];           // 建议立即停掉的东西
}

const CHANNEL_LABELS: Record<Channel, string> = {
  amazon: '🟧 Amazon',
  tmall: '🟦 淘宝/天猫',
  pdd: '🟥 拼多多',
  tiktok: '⚡ TikTok Shop',
  douyin: '⚫ 抖音电商',
  xiaohongshu: '🟤 小红书',
  shopify: '⬛ 独立站 Shopify',
  mixed: '🌐 多渠道',
};

const PRIORITY_LABEL: Record<Insight['priority'], { txt: string; cls: string }> = {
  P0: { txt: 'P0 紧急', cls: 'border-error/40 text-error bg-error/5' },
  P1: { txt: 'P1 高优', cls: 'border-accent/40 text-accent bg-accent/5' },
  P2: { txt: 'P2 中', cls: 'border-border-subtle text-text-secondary' },
};

const TYPE_META: Record<Insight['type'], { icon: string; cls: string }> = {
  win: { icon: '🟢', cls: 'border-success/40 bg-success/5' },
  loss: { icon: '🔴', cls: 'border-error/40 bg-error/5' },
  risk: { icon: '⚠️', cls: 'border-accent/40 bg-accent/5' },
  opportunity: { icon: '🟡', cls: 'border-cat-content/40 bg-cat-content/5' },
};

function buildDataInsightsResultSummary(result: DataInsightsResult): string {
  const topInsights = result.insights.slice(0, 4).map((insight, index) =>
    `${index + 1}. [${insight.priority}] ${insight.type}: ${insight.headline} | evidence: ${insight.evidence} | action: ${insight.action}`,
  );

  const killListSummary = result.killList?.length
    ? `kill list: ${result.killList.slice(0, 4).join(' ; ')}`
    : '';

  return [
    `overall verdict: ${result.overallVerdict}`,
    `trend summary: ${result.trendSummary}`,
    topInsights.join('\n'),
    `next round playbook: ${result.nextRoundPlaybook}`,
    killListSummary,
  ]
    .filter(Boolean)
    .join('\n');
}

// 把 SKU 列表按 category 聚合, 返回每品类的 avg CTR + 样本数 · benchmark 用
function aggregateByCategory(skus: { name: string; category: string; ctr: number; cpc: number }[]): string {
  const groups = new Map<string, { ctr: number[]; cpc: number[] }>();
  for (const s of skus) {
    if (!groups.has(s.category)) groups.set(s.category, { ctr: [], cpc: [] });
    const g = groups.get(s.category)!;
    g.ctr.push(s.ctr);
    if (s.cpc > 0) g.cpc.push(s.cpc);
  }
  const lines: string[] = [];
  for (const [cat, g] of groups.entries()) {
    if (g.ctr.length === 0) continue;
    const avgCtr = g.ctr.reduce((s, x) => s + x, 0) / g.ctr.length;
    const avgCpc = g.cpc.length > 0 ? g.cpc.reduce((s, x) => s + x, 0) / g.cpc.length : 0;
    lines.push(`- ${cat} (${g.ctr.length} SKU): 均 CTR ${avgCtr.toFixed(2)}%${avgCpc > 0 ? ` · 均 CPC ¥${avgCpc.toFixed(2)}` : ''}`);
  }
  return lines.join('\n') || '(数据不足)';
}

const EXAMPLE_DATA = `产品: 红枣山药八珍糕 50g/盒 ¥39
渠道: 淘宝
周期: 本周 (vs 上周)

总销售额 ¥48,200 (vs 上周 ¥61,500, ↓21.6%)
订单数 1,235 (vs 1,580, ↓21.8%)
客单价 ¥39.0 (持平)
广告花费 ¥8,400 (vs 6,200, ↑35%)
ROI 5.74 (vs 9.92, ↓42%)
点击率 2.3% (vs 3.1%, ↓26%)
收藏加购率 8.5% (vs 11.2%, ↓24%)
退款率 4.2% (vs 2.1%, ↑100%)

主图换过一次 (周三换成新模特图)
退款理由 TOP 3:
- 包装漏包 (38%)
- 口感偏甜 (24%)
- 与图不符 (18%)`;

export default function DataInsightsPage() {
  const [channel, setChannel] = useState<Channel>('mixed');
  const [period, setPeriod] = useState<Period>('week');
  const [data, setData] = useState('');
  const [context, setContext] = useState('');

  const activeSkuId = useActiveSkuId();
  const { skus: mySkus } = useMySkus(100);
  const [running, setRunning] = useState(false);
  const [benchmarkLoaded, setBenchmarkLoaded] = useState(false);
  const [result, setResult] = useState<DataInsightsResult | null>(null);
  const [error, setError] = useState('');
  const [rawDebug, setRawDebug] = useState('');
  const [showRaw, setShowRaw] = useState(false);

  // 从 SKU 库构造 benchmark 文本 · ab-test 写的 performance 真兑现
  const loadSkuBenchmark = async () => {
    if (mySkus.length === 0) {
      setError('SKU 库还空, 先在 ab-test 投放回填一些数据');
      return;
    }
    const tested = mySkus.filter(s => s.performance?.testedAt);
    if (tested.length === 0) {
      setError('没找到任何已回填投放数据的 SKU. 先去 /pipelines/ab-test 跑一轮 + 回填实战数据');
      return;
    }

    const ctrs = tested.map(s => ({ name: s.name, category: s.category, ctr: s.performance?.bestCtr ?? s.performance?.ctr ?? 0, cpc: s.performance?.cpc ?? 0, conv: s.performance?.convRate ?? 0 }))
      .filter(x => x.ctr > 0);
    if (ctrs.length === 0) {
      setError('回填的 SKU 都没有 CTR 数据');
      return;
    }

    const avgCtr = ctrs.reduce((s, x) => s + x.ctr, 0) / ctrs.length;
    const validCpc = ctrs.filter(x => x.cpc > 0);
    const avgCpc = validCpc.length > 0 ? validCpc.reduce((s, x) => s + x.cpc, 0) / validCpc.length : 0;
    const sortedByCtr = [...ctrs].sort((a, b) => b.ctr - a.ctr);
    const top3 = sortedByCtr.slice(0, 3);
    const worst3 = sortedByCtr.slice(-3).reverse();

    // 当前 SKU 的位置
    let currentSkuLine = '';
    if (activeSkuId) {
      const cur = ctrs.find(x => mySkus.find(s => s.id === activeSkuId)?.name === x.name);
      if (cur) {
        const rank = sortedByCtr.findIndex(x => x.name === cur.name) + 1;
        const vsAvg = ((cur.ctr - avgCtr) / avgCtr) * 100;
        currentSkuLine = `\n【当前焦点 SKU】 ${cur.name}\n  CTR ${cur.ctr.toFixed(2)}% (排第 ${rank}/${ctrs.length}, ${vsAvg >= 0 ? '高于' : '低于'}均值 ${Math.abs(vsAvg).toFixed(0)}%)\n  CPC ¥${cur.cpc.toFixed(2)}${cur.conv > 0 ? ` · 转化率 ${cur.conv.toFixed(2)}%` : ''}\n`;
      }
    }

    let text = `
【全店 SKU 投放 benchmark · 来自 wenai SKU 性能库】
样本: ${ctrs.length} 个已投放 SKU (共 ${mySkus.length} 个 SKU 在库)

平均 CTR: ${avgCtr.toFixed(2)}%
平均 CPC: ${avgCpc > 0 ? '¥' + avgCpc.toFixed(2) : 'N/A'}
${currentSkuLine}
【表现 TOP 3 (CTR 高)】
${top3.map((x, i) => `${i + 1}. ${x.name} (${x.category}) · CTR ${x.ctr.toFixed(2)}%${x.cpc > 0 ? ' · CPC ¥' + x.cpc.toFixed(2) : ''}`).join('\n')}

【表现 BOTTOM 3 (CTR 低 → 候选 kill)】
${worst3.map((x, i) => `${i + 1}. ${x.name} (${x.category}) · CTR ${x.ctr.toFixed(2)}%${x.cpc > 0 ? ' · CPC ¥' + x.cpc.toFixed(2) : ''}`).join('\n')}

【按品类聚合】
${aggregateByCategory(ctrs)}
`.trim();

    // 跨 org 匿名 benchmark · 当前 SKU 焦点 + 该品类全 wenai 池子分位
    if (activeSkuId) {
      const focus = mySkus.find(s => s.id === activeSkuId);
      if (focus?.category && (focus.performance?.bestCtr || focus.performance?.ctr || focus.performance?.cpc)) {
        const ctrVal = focus.performance?.bestCtr ?? focus.performance?.ctr ?? 0;
        const cpcVal = focus.performance?.cpc ?? 0;
        try {
          const queries: Promise<Response>[] = [];
          if (ctrVal > 0) {
            queries.push(fetch(`/api/user/benchmark?metric=ctr&category=${encodeURIComponent(focus.category)}&value=${ctrVal}`));
          }
          if (cpcVal > 0) {
            queries.push(fetch(`/api/user/benchmark?metric=cpc&category=${encodeURIComponent(focus.category)}&value=${cpcVal}`));
          }
          const res = await Promise.all(queries);
          const snaps = await Promise.all(res.map(r => r.json()));
          const useful = snaps.filter(s => s.count >= 5);
          if (useful.length > 0) {
            const lines: string[] = ['', '【跨 wenai 商家匿名 benchmark · 该品类全池子】'];
            for (const s of useful) {
              const verdict = s.metric === 'ctr'
                ? (s.yourPercentile >= 75 ? '头部' : s.yourPercentile >= 50 ? '中上' : s.yourPercentile >= 25 ? '中位下' : '偏低')
                : (s.yourPercentile >= 75 ? '极优 (低)' : s.yourPercentile >= 50 ? '中等偏低' : s.yourPercentile >= 25 ? '中位偏高' : '偏高');
              const suffix = s.metric === 'ctr' ? '%' : ' ¥';
              lines.push(
                `${s.metric.toUpperCase()}: 你 ${s.yourValue.toFixed(2)}${suffix} · 同品类 ${s.count} 个 SKU 中 ${s.metric === 'ctr' ? '排前' : '低过'} ${100 - s.yourPercentile}% (${verdict})`,
                `  分位: p10=${s.p10}${suffix} · p25=${s.p25}${suffix} · p50=${s.p50}${suffix} · p75=${s.p75}${suffix} · p90=${s.p90}${suffix}`,
              );
            }
            text += '\n' + lines.join('\n');
          }
        } catch {
          // 跨 org benchmark 失败不阻塞主链路
        }
      }
    }

    setData(text);
    setBenchmarkLoaded(true);
    setError('');
  };

  const buildPrompt = () => `
你是一个跨境/本土电商 15 年实战的数据分析师 + 操盘手, 帮商家从一段销售数据中挖出洞察 + 下一步动作。
${benchmarkLoaded ? '\n注意: 本次数据来自 wenai 真实回填的投放数据, 含商家自己的 SKU 池 + 跨 wenai 全体商家在该品类的匿名 percentile 分位 (有时会附 p10-p90)。判断时要把单 SKU 的位置在两层池子里都说清楚, 并基于分位数给"加预算 / 改图 / 杀验"的具体阈值建议, 不要泛泛而谈。' : ''}

【商家信息】
- 渠道: ${CHANNEL_LABELS[channel]}
- 周期: ${period === 'day' ? '今日' : period === 'week' ? '本周' : '本月'}
- 上下文: ${context || '无'}

【数据】
${data}

【任务】
分析数据 → 输出 4-8 条洞察 + 整体判断 + 下一轮 SOP

【硬要求】
1. 洞察必须挂数据依据 (引用具体数字), 不能空话
2. 每条洞察分四类: win(已验证有效, 加大投入) / loss(失血点, 立刻止损) / risk(潜在风险) / opportunity(可挖空白)
3. 每条带 priority (P0 紧急 / P1 高优 / P2 中)
4. 行动必须具体 (改主图 / 调价到 ¥X / 加 ¥X 预算 / 换关键词 XX), 不能只说"优化一下"
5. nextRoundPlaybook 给"下一轮该做什么", 串联 wenai 现有模块 (影棚改图 / 测款 A-B / 反向意图换客群 / 选品发现下一个 SKU)
6. 如有明显该停的, 列 killList (例: "停掉 P3 关键词组" / "下架 X 颜色 SKU")

【输出严格 JSON】
{
  "overallVerdict": "30-60 字一句话整体判断",
  "trendSummary": "趋势对比, 60-100 字",
  "insights": [
    {
      "type": "win | loss | risk | opportunity",
      "headline": "<10-20 字一句话>",
      "evidence": "<数据依据, 含具体数字>",
      "rootCause": "<根因猜测, 30-60 字>",
      "action": "<具体行动, 含数字 / 替换方案>",
      "priority": "P0 | P1 | P2"
    }
  ],
  "nextRoundPlaybook": "<下一轮 4-6 步 SOP, 串联 wenai 模块>",
  "killList": ["<立刻停的事 1>", "<事 2>"]
}

直接输出 JSON, 不要 markdown 标签, 不要解释。
`.trim();

  const handleAnalyze = async () => {
    if (data.trim().length < 30) {
      setError('数据太短(至少 30 字, 含一些数字)');
      return;
    }
    setRunning(true);
    setError('');
    setResult(null);
    setRawDebug('');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: 'data-insights',
          prompt: buildPrompt(),
          input: data,
          skuId: activeSkuId,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || `HTTP ${res.status}`);
      const raw = d.content || '';
      setRawDebug(raw);
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('AI 输出非 JSON');
      const parsed = JSON.parse(m[0]) as DataInsightsResult;
      if (!parsed.insights || parsed.insights.length === 0) {
        throw new Error('AI 没返回 insights');
      }
      setResult(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败');
    } finally {
      setRunning(false);
    }
  };

  // 公开分享 markdown · 同 video-teardown / ab-test 走共享 hook
  const buildShareMarkdown = () => {
    if (!result) return '';
    return [
      `# 数据洞察报告 · ${CHANNEL_LABELS[channel]}`,
      ``,
      `**周期**: ${period === 'day' ? '今日' : period === 'week' ? '本周' : '本月'}`,
      ``,
      `## 整体判断`,
      ``,
      result.overallVerdict,
      ``,
      `## 趋势`,
      ``,
      result.trendSummary,
      ``,
      `## ${result.insights.length} 条洞察`,
      ``,
      ...result.insights.flatMap(i => [
        `### [${i.priority}] ${TYPE_META[i.type].icon} ${i.headline}`,
        ``,
        `- **依据**: ${i.evidence}`,
        `- **根因**: ${i.rootCause}`,
        `- **行动**: ${i.action}`,
        ``,
      ]),
      `## 下一轮 SOP`,
      ``,
      result.nextRoundPlaybook,
      ``,
      ...(result.killList?.length
        ? [`## ⛔ 立即停掉`, ``, ...result.killList.map(k => `- ${k}`), ``]
        : []),
      `---`,
      `*由 wenai 数据复盘演示流程生成 · 准备真实 SKU 时, 请通过 /inquire 提交 POC 需求。*`,
    ].join('\n');
  };

  const exportMd = () => {
    if (!result) return;
    const lines = [
      `# 数据洞察报告`,
      ``,
      `**渠道**: ${CHANNEL_LABELS[channel]} · **周期**: ${period}`,
      ``,
      `## 整体判断`,
      result.overallVerdict,
      ``,
      `## 趋势`,
      result.trendSummary,
      ``,
      `## ${result.insights.length} 条洞察`,
      ``,
      ...result.insights.flatMap(i => [
        `### [${i.priority}] ${TYPE_META[i.type].icon} ${i.headline}`,
        ``,
        `- 依据: ${i.evidence}`,
        `- 根因: ${i.rootCause}`,
        `- 行动: ${i.action}`,
        ``,
      ]),
      `## 下一轮 SOP`,
      result.nextRoundPlaybook,
      ``,
      ...(result.killList?.length
        ? [`## 立即停掉`, ``, ...result.killList.map(k => `- ${k}`)]
        : []),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wenai-insights-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const standardPackHref = buildDataInsightsStandardPackRoute({
    channelLabel: CHANNEL_LABELS[channel],
    period: period === 'day' ? 'day report' : period === 'week' ? 'week report' : 'month report',
    dataInput: data,
    context,
  });

  const reportStandardPackHref = result
    ? buildDataInsightsStandardPackRoute({
        channelLabel: CHANNEL_LABELS[channel],
        period: period === 'day' ? 'day report' : period === 'week' ? 'week report' : 'month report',
        dataInput: data,
        context,
        resultSummary: buildDataInsightsResultSummary(result),
      })
    : '';

  return (
    <div className="min-h-screen bg-bg-root">
      {/* Hero */}
      <div className="border-b border-border-subtle bg-gradient-to-b from-bg-surface/50 to-transparent">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">
              DATA INSIGHTS · 数据洞察
            </span>
            <span className="text-[9px] font-mono text-accent/70 px-2 py-0.5 border border-accent/30 rounded-full">
              痛点 #10
            </span>
            <span className="text-[9px] font-mono text-text-tertiary px-2 py-0.5 border border-border-subtle rounded-full">
              Phase 1 · 文本驱动
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
            数据贴进来 · AI 替你看懂为啥涨/跌
            <ActiveSkuBadge skuId={activeSkuId} />
          </h1>
          <div className="mb-3"><IndustryHint /></div>
          <p className="text-[13px] lg:text-[14px] text-text-secondary leading-relaxed max-w-[800px]">
            测完款投放完, 不知道为啥点击下滑 / 退货飙升 / ROI 崩。
            把后台导出的销售数据贴过来,
            <span className="text-accent">AI 给 4-8 条带 P0/P1 优先级的诊断 + 具体改图/调价/换词建议</span> + 下一轮 SOP,
            串联 wenai 选品/影棚/测款。
          </p>
          <div className="flex items-center gap-2 flex-wrap mt-4">
            <button
              onClick={() => { setData(EXAMPLE_DATA); setChannel('tmall'); setPeriod('week'); setContext('八珍糕赛道, 主打办公室白领养生场景'); setBenchmarkLoaded(false); }}
              className="text-[11px] font-mono text-accent border border-accent/40 hover:bg-accent/10 rounded px-3 py-1.5"
            >
              ⚡ 一键填案例 (淘宝八珍糕周报)
            </button>
            <button
              onClick={loadSkuBenchmark}
              className={`text-[11px] font-mono border rounded px-3 py-1.5 ${
                benchmarkLoaded
                  ? 'border-success/50 bg-success/10 text-success'
                  : 'border-cat-content/40 text-cat-content hover:bg-cat-content/10'
              }`}
              title="基于 ab-test 投放回填的真实 SKU 性能, 自动生成 benchmark 数据"
            >
              {benchmarkLoaded ? '✓ 已载入 SKU benchmark' : '📊 载入我的 SKU benchmark (从 ab-test 回填)'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
        {/* LEFT */}
        <aside className="lg:sticky lg:top-4 lg:self-start space-y-4">
          <section className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-text-secondary mb-1 block">① 渠道</label>
                <select
                  value={channel}
                  onChange={e => setChannel(e.target.value as Channel)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
                >
                  {Object.entries(CHANNEL_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono text-text-secondary mb-1 block">② 周期</label>
                <select
                  value={period}
                  onChange={e => setPeriod(e.target.value as Period)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
                >
                  <option value="day">日报</option>
                  <option value="week">周报</option>
                  <option value="month">月报</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-text-secondary mb-1 block">③ 销售/投放数据 *</label>
              <textarea
                value={data}
                onChange={e => setData(e.target.value)}
                placeholder="粘贴后台导出 / 手工记录的数据, 例:&#10;销售额 ¥48,200 (vs 上周 ¥61,500)&#10;订单 1,235 / 客单价 ¥39 / 退款 4.2%&#10;广告花费 ¥8,400 / ROI 5.74&#10;点击率 2.3% (vs 上周 3.1%)&#10;主图周三换过 / 退款理由 TOP3..."
                rows={10}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[11px] font-mono resize-none leading-relaxed"
              />
              <div className="text-[10px] font-mono text-text-tertiary mt-1">
                {data.length} 字 · 越细越准
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-text-secondary mb-1 block">④ 业务上下文 (可选)</label>
              <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder="例: 八珍糕赛道 · 主打办公室白领 · 上周加了一组小红书种草投放"
                rows={2}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] resize-none"
              />
            </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleAnalyze}
              disabled={running || data.length < 30}
              className="w-full py-3.5 bg-accent text-bg-root rounded-lg text-[14px] font-bold hover:bg-accent-hover disabled:opacity-40"
            >
              {running ? '诊断中... (10-20 秒)' : '🔬 诊断这组数据'}
            </button>
            <Link
              href={standardPackHref}
              className={`w-full py-3.5 rounded-lg text-[12px] font-bold text-center border transition-colors ${
                data.trim().length
                  ? 'border-cat-content/40 text-cat-content hover:bg-cat-content/10'
                  : 'border-border-subtle text-text-tertiary pointer-events-none opacity-50'
              }`}
            >
              生成复盘 SOP 标品包
            </Link>
          </div>

          {error && (
            <div className="p-3 border border-error/40 bg-error/5 rounded text-[11px] text-error">
              ✗ {error}
              {rawDebug && (
                <button onClick={() => setShowRaw(s => !s)} className="ml-2 underline">
                  {showRaw ? '隐藏' : '看'}原文
                </button>
              )}
              {showRaw && rawDebug && (
                <pre className="text-[10px] font-mono mt-2 bg-bg-root border border-border-subtle rounded p-2 max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                  {rawDebug}
                </pre>
              )}
            </div>
          )}

          <p className="text-[10px] font-mono text-text-tertiary leading-relaxed border-t border-border-subtle pt-3">
            Phase 1 · 文本驱动版 · 适合周报/复盘
            <br/>
            Phase 2 (待做) · 接 GA4 / 抖店 / 千牛 webhook 自动拉数据
          </p>
        </aside>

        {/* RIGHT */}
        <main className="space-y-4 min-h-[600px]">
          {!running && !result && <EmptyState />}

          {running && (
            <div className="border border-accent/40 bg-accent/5 rounded-lg p-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
              <div>
                <div className="text-[13px] font-semibold text-text-primary">分析师正在跑数据</div>
                <div className="text-[10px] font-mono text-text-tertiary mt-0.5">
                  趋势对比 · 异常诊断 · 根因推断 · 行动建议
                </div>
              </div>
            </div>
          )}

          {!running && result && <Report result={result} exportMd={exportMd} channel={CHANNEL_LABELS[channel]} context={context} buildShareMarkdown={buildShareMarkdown} period={period} standardPackHref={reportStandardPackHref} />}
        </main>
      </div>

      {/* Footer · 闭环 */}
      <div className="max-w-[1200px] mx-auto px-6 py-10 border-t border-border-subtle mt-10">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
          完整商业闭环
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/pipelines/product-discovery" className="px-3 py-1.5 border border-border-subtle rounded text-[11px] font-mono text-text-secondary hover:border-accent/40 hover:text-accent">
            🎯 选品发现 (上游)
          </Link>
          <span className="text-text-tertiary text-[14px]">→</span>
          <Link href="/pipelines/ai-photoshoot" className="px-3 py-1.5 border border-border-subtle rounded text-[11px] font-mono text-text-secondary hover:border-accent/40 hover:text-accent">
            🎬 AI 影棚出图
          </Link>
          <span className="text-text-tertiary text-[14px]">→</span>
          <Link href="/pipelines/ab-test" className="px-3 py-1.5 border border-border-subtle rounded text-[11px] font-mono text-text-secondary hover:border-accent/40 hover:text-accent">
            ⚗️ 测款 A-B
          </Link>
          <span className="text-text-tertiary text-[14px]">→</span>
          <span className="px-3 py-1.5 border border-accent/30 rounded text-[11px] font-mono text-accent bg-accent/5">
            🔬 数据洞察 (你在这)
          </span>
          <span className="text-text-tertiary text-[14px]">→ 回选品改 SKU 起新一轮</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-border-default rounded-lg p-8 text-center">
      <div className="text-4xl mb-2">🔬</div>
      <h3 className="text-[16px] font-bold text-text-primary mb-1">把数据贴进来</h3>
      <p className="text-[12px] text-text-tertiary mb-5">
        销售额 / 订单 / 点击率 / 退款率 / 投放花费 任何能说明白业务状态的都行
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
        <Tip emoji="🟢" title="win" desc="已验证有效, 加大投入" />
        <Tip emoji="🔴" title="loss" desc="失血点, 立刻止损" />
        <Tip emoji="⚠️" title="risk" desc="潜在风险, 提前防" />
      </div>
    </div>
  );
}

function Tip({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="border border-border-subtle rounded p-3 bg-bg-surface/30">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-[12px] font-semibold text-text-primary mb-1">{title}</div>
      <div className="text-[11px] text-text-tertiary leading-relaxed">{desc}</div>
    </div>
  );
}

function Report({ result, exportMd, channel, context, buildShareMarkdown, period, standardPackHref }: { result: DataInsightsResult; exportMd: () => void; channel: string; context: string; buildShareMarkdown: () => string; period: Period; standardPackHref: string }) {
  const [savingSku, setSavingSku] = useState(false);
  const [savedSku, setSavedSku] = useState(false);

  // 推断推荐状态: kill/launched/paused 取决于洞察类型
  const lossCount = result.insights.filter(i => i.type === 'loss' && i.priority === 'P0').length;
  const winCount = result.insights.filter(i => i.type === 'win').length;
  const recommendedStatus: 'launched' | 'paused' | 'killed' =
    lossCount >= 2 ? 'killed' : lossCount >= 1 ? 'paused' : winCount >= 2 ? 'launched' : 'paused';
  const statusLabel = recommendedStatus === 'launched' ? '🚀 已上架(健康)' : recommendedStatus === 'paused' ? '⏸ 暂停(优化中)' : '🛑 建议 kill';

  const saveToLibrary = async () => {
    setSavingSku(true);
    try {
      await fetch('/api/user/sku-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: context.slice(0, 80) || `${channel} 数据复盘`,
          category: '已复盘',
          platform: channel,
          status: recommendedStatus,
          notes: `整体: ${result.overallVerdict}\n\n趋势: ${result.trendSummary}\n\n下一轮: ${result.nextRoundPlaybook}`,
          modules: ['data-insights'],
        }),
      });
      setSavedSku(true);
    } catch {} finally {
      setSavingSku(false);
    }
  };

  // 按 priority 排序: P0 > P1 > P2
  const sorted = [...result.insights].sort((a, b) => {
    const order = { P0: 0, P1: 1, P2: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <>
      <section className="border border-accent/30 bg-accent/5 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-[10px] font-mono text-accent uppercase tracking-wider">整体判断</div>
          <div className="flex items-center gap-2 flex-wrap">
            <ShareButton
              buildPayload={() => ({
                moduleId: 'data-insights',
                title: `数据洞察 · ${channel} · ${period === 'day' ? '日' : period === 'week' ? '周' : '月'}报`,
                content: buildShareMarkdown(),
                source: 'module' as const,
              })}
            />
            <Link
              href={standardPackHref}
              className="text-[10px] font-mono px-2.5 py-1 rounded border border-cat-content/40 text-cat-content hover:bg-cat-content/10"
            >
              生成复盘验收标品包
            </Link>
            <button
              onClick={saveToLibrary}
              disabled={savingSku || savedSku}
              className={`text-[10px] font-mono px-2.5 py-1 rounded border transition-colors ${
                savedSku
                  ? 'border-success/40 bg-success/10 text-success'
                  : 'border-accent/40 text-accent hover:bg-accent/10'
              }`}
              title={`基于 ${result.insights.length} 条洞察推断状态: ${statusLabel} · 一键写入 SKU 库`}
            >
              {savedSku ? `✓ 已写入 ${statusLabel}` : savingSku ? '保存中…' : `📦 写入 SKU 库 (${statusLabel})`}
            </button>
          </div>
        </div>
        <p className="text-[13px] text-text-primary leading-relaxed">{result.overallVerdict}</p>
        <p className="text-[12px] text-text-secondary leading-relaxed">{result.trendSummary}</p>
      </section>

      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-text-primary">
          {result.insights.length} 条洞察 · 按优先级排序
        </h2>
        <button
          onClick={exportMd}
          className="text-[11px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded px-3 py-1.5"
        >
          ⬇ 导出 MD
        </button>
      </div>

      <div className="space-y-3">
        {sorted.map((ins, i) => (
          <div
            key={i}
            className={`border rounded-lg p-4 animate-fade-up stagger-${Math.min(i + 1, 6)} ${TYPE_META[ins.type].cls}`}
          >
            <div className="flex items-start gap-2 mb-2 flex-wrap">
              <span className="text-[14px]">{TYPE_META[ins.type].icon}</span>
              <h3 className="text-[14px] font-bold text-text-primary flex-1">{ins.headline}</h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 border rounded ${PRIORITY_LABEL[ins.priority].cls}`}>
                {PRIORITY_LABEL[ins.priority].txt}
              </span>
            </div>
            <div className="text-[12px] space-y-1.5">
              <div>
                <span className="text-[10px] font-mono text-text-tertiary uppercase mr-2">依据</span>
                <span className="text-text-secondary">{ins.evidence}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-text-tertiary uppercase mr-2">根因</span>
                <span className="text-text-secondary">{ins.rootCause}</span>
              </div>
              <div className="border-t border-border-subtle pt-1.5 mt-1.5">
                <span className="text-[10px] font-mono text-accent uppercase mr-2">行动</span>
                <span className="text-text-primary font-medium">{ins.action}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {result.killList && result.killList.length > 0 && (
        <section className="border border-error/40 bg-error/5 rounded-lg p-4">
          <div className="text-[10px] font-mono text-error uppercase tracking-wider mb-2">
            🛑 立即停掉
          </div>
          <ul className="space-y-1">
            {result.killList.map((k, i) => (
              <li key={i} className="text-[12px] text-text-primary">· {k}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="border border-cat-content/30 bg-cat-content/5 rounded-lg p-4">
        <div className="text-[10px] font-mono text-cat-content uppercase tracking-wider mb-2">
          📋 下一轮 SOP
        </div>
        <p className="text-[12px] text-text-primary leading-relaxed whitespace-pre-line">
          {result.nextRoundPlaybook}
        </p>
      </section>
    </>
  );
}
