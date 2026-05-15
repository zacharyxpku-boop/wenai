'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMySkus } from '@/lib/use-my-skus';
import { useActiveSkuId } from '@/lib/use-active-sku';
import { ActiveSkuBadge } from '@/components/ActiveSkuBadge';
import { IndustryHint } from '@/components/IndustryHint';
import { buildProductDiscoveryStandardPackRoute } from '@/lib/standard-pack-routing';

/**
 * AI 选品发现 (痛点 #1) · STRATEGY_DEEP L4 列的最大缺口
 *
 * Phase-1 (本版): DeepSeek + 行业 prompt → 推 5-10 个候选 SKU
 *   不接真实数据源 (1688/Amazon BSR API 需授权),先用 LLM 推断
 *   适合 ToB 客户初轮选品 brainstorming
 *
 * Phase-2 (待做): 接 1688 / 蝉妈妈 / Amazon BSR / Helium 10 数据 → 真实 BSR + 销量曲线
 */

type Platform = 'amazon-us' | 'amazon-eu' | 'amazon-jp' | 'shopee' | 'tiktok-shop' | 'taobao-tmall' | 'pdd' | 'douyin' | 'xiaohongshu' | 'independent';
type RiskAppetite = 'low' | 'medium' | 'high';

interface SKUCandidate {
  name: string;            // 产品名
  category: string;        // 子品类
  estPriceCny: string;     // 售价区间
  estCostCny: string;      // 进货价区间
  estMargin: string;       // 估算毛利率
  competition: 'low' | 'medium' | 'high'; // 竞争度
  trendDirection: 'rising' | 'stable' | 'declining'; // 销量趋势
  whyNow: string;          // 为什么这个时机
  targetUser: string;      // 目标用户画像
  entryStrategy: string;   // 切入策略 (差异化 / 性价比 / 内容)
  risks: string[];         // 主要风险点
  searchKeywords: string[];// 这群用户的真实搜索词
}

interface DiscoveryResult {
  marketSummary: string;
  candidates: SKUCandidate[];
  rejectedTopics?: string[]; // 不推荐的方向 + 原因
}

const PLATFORM_LABELS: Record<Platform, string> = {
  'amazon-us': '🇺🇸 Amazon 美',
  'amazon-eu': '🇪🇺 Amazon 欧',
  'amazon-jp': '🇯🇵 Amazon 日',
  shopee: '🌴 Shopee',
  'tiktok-shop': '⚡ TikTok Shop',
  'taobao-tmall': '🟦 淘宝/天猫',
  pdd: '🟥 拼多多',
  douyin: '⚫ 抖音电商',
  xiaohongshu: '🟤 小红书电商',
  independent: '⬛ 独立站',
};

const RISK_LABELS: Record<RiskAppetite, { txt: string; sub: string }> = {
  low: { txt: '保守', sub: '稳定低毛利, 已验证赛道' },
  medium: { txt: '中等', sub: '兼顾增长与风险' },
  high: { txt: '激进', sub: '蓝海早期, 高潜力' },
};

const EXAMPLES = [
  { title: '🇺🇸 Amazon 家居小物', platform: 'amazon-us' as Platform, category: '家居收纳 / 厨房小工具', priceMin: 15, priceMax: 80, budget: 50000, risk: 'medium' as RiskAppetite },
  { title: '⚡ TikTok Shop 美妆', platform: 'tiktok-shop' as Platform, category: '护肤 / 唇部护理 / 面膜', priceMin: 25, priceMax: 150, budget: 100000, risk: 'high' as RiskAppetite },
  { title: '🟤 小红书 母婴', platform: 'xiaohongshu' as Platform, category: '辅食工具 / 婴儿玩具', priceMin: 50, priceMax: 300, budget: 80000, risk: 'low' as RiskAppetite },
];

function buildDiscoverySkuContext(mySkus: Array<{ name: string; category: string; status: string }>, useSkuContext: boolean): string {
  if (!useSkuContext || mySkus.length === 0) return '';
  return mySkus
    .slice(0, 10)
    .map(sku => `${sku.name} (${sku.category}, ${sku.status})`)
    .join('\n');
}

function buildProductDiscoveryResultSummary(result: DiscoveryResult): string {
  const candidateSummary = result.candidates
    .slice(0, 5)
    .map((candidate, index) => {
      const risks = candidate.risks.slice(0, 2).join(', ');
      return `${index + 1}. ${candidate.name} / ${candidate.category} / ${candidate.estMargin} / ${candidate.competition} / ${candidate.trendDirection} / ${candidate.entryStrategy} / risks: ${risks}`;
    })
    .join('\n');
  const rejectedSummary = result.rejectedTopics?.slice(0, 3).join(' | ');

  return [
    `market summary: ${result.marketSummary}`,
    `top candidates:\n${candidateSummary}`,
    rejectedSummary ? `rejected topics: ${rejectedSummary}` : '',
  ].filter(Boolean).join('\n\n');
}

export default function ProductDiscoveryPage() {
  const [platform, setPlatform] = useState<Platform>('amazon-us');
  const [category, setCategory] = useState('');
  const [priceMin, setPriceMin] = useState(20);
  const [priceMax, setPriceMax] = useState(100);
  const [budget, setBudget] = useState(50000);
  const [risk, setRisk] = useState<RiskAppetite>('medium');
  const [extraNote, setExtraNote] = useState('');

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [error, setError] = useState('');
  const [rawDebug, setRawDebug] = useState('');
  const [showRaw, setShowRaw] = useState(false);

  // 读 SKU 库 · 飞轮变双向: 已有 SKU 当 context, AI 推相邻互补品类
  const { skus: mySkus } = useMySkus(20);
  const [useSkuContext, setUseSkuContext] = useState(true);
  const activeSkuId = useActiveSkuId();

  const skuContextLine = useSkuContext && mySkus.length > 0
    ? `\n\n【商家已有 SKU(请避免重复推荐, 优先推互补/相邻品类)】\n${mySkus.slice(0, 10).map(s => `- ${s.name} (${s.category}, ${s.status})`).join('\n')}`
    : '';

  const standardPackBaseInput = {
    platformLabel: PLATFORM_LABELS[platform],
    category,
    priceMin,
    priceMax,
    budget,
    riskLabel: `${RISK_LABELS[risk].txt} / ${RISK_LABELS[risk].sub}`,
    extraNote,
    skuContext: buildDiscoverySkuContext(mySkus, useSkuContext),
  };
  const discoveryStandardPackHref = buildProductDiscoveryStandardPackRoute(standardPackBaseInput);
  const resultStandardPackHref = result
    ? buildProductDiscoveryStandardPackRoute({
        ...standardPackBaseInput,
        resultSummary: buildProductDiscoveryResultSummary(result),
      })
    : '';

  const loadExample = (idx: number) => {
    const e = EXAMPLES[idx];
    setPlatform(e.platform);
    setCategory(e.category);
    setPriceMin(e.priceMin);
    setPriceMax(e.priceMax);
    setBudget(e.budget);
    setRisk(e.risk);
  };

  const buildPrompt = () => `
你是一个跨境/本土电商 15 年实战经验的选品操盘手, 帮助商家从赛道 → 候选 SKU → 切入策略 端到端推荐。

【用户输入】
- 目标平台: ${PLATFORM_LABELS[platform]}
- 目标类目: ${category || '不指定'}
- 售价区间: ¥${priceMin} - ¥${priceMax}
- 启动预算: ¥${budget}
- 风险偏好: ${RISK_LABELS[risk].txt} (${RISK_LABELS[risk].sub})
- 用户备注: ${extraNote || '无'}${skuContextLine}

【任务】
推荐 5-8 个候选 SKU,每个含完整决策信息。同时列出 2-3 个"看似机会但不推荐"的方向 + 拒绝理由。

【硬要求】
1. 候选 SKU 必须真实存在的产品方向, 不能是凭空捏造
2. 每个 SKU 必须给出"为什么是现在切入" (季节性 / 政策 / 趋势 / 竞品空白)
3. 切入策略要具体 (差异化定位 / 价格带卡位 / 内容营销 / 平台专属玩法)
4. 风险至少列 2 条 (供应链 / 合规 / 平台规则 / 巨头入场 / 假货 / 物流)
5. 搜索词要真实电商用户会输入的口语化词

【输出严格 JSON】
{
  "marketSummary": "对该用户输入的整体市场判断,80-120 字",
  "candidates": [
    {
      "name": "<SKU 名称, 8-15 字, 具体到品类细分>",
      "category": "<子品类>",
      "estPriceCny": "<例: ¥39-79>",
      "estCostCny": "<例: ¥8-15>",
      "estMargin": "<例: 60-75%>",
      "competition": "<low | medium | high>",
      "trendDirection": "<rising | stable | declining>",
      "whyNow": "<为什么现在切入, 30-60 字>",
      "targetUser": "<目标用户画像, 25-40 字>",
      "entryStrategy": "<具体切入策略, 50-80 字>",
      "risks": ["<风险点 1>", "<风险点 2>"],
      "searchKeywords": ["<词 1>", "<词 2>", "<词 3>"]
    }
  ],
  "rejectedTopics": ["<不推荐方向 1: 拒绝理由>", "<方向 2: 理由>"]
}

直接输出 JSON,不要 markdown 代码块,不要解释。
`.trim();

  const handleDiscover = async () => {
    if (!category.trim()) {
      setError('类目方向必填(可粗略,例: "厨房小家电")');
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
          moduleId: 'product-discovery',
          prompt: buildPrompt(),
          input: `${PLATFORM_LABELS[platform]} · ${category}`,
          skuId: activeSkuId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      const raw = data.content || '';
      setRawDebug(raw);
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('结果格式暂时不可用，请重试或导出当前输入交给团队处理');
      const parsed = JSON.parse(m[0]) as DiscoveryResult;
      if (!parsed.candidates || parsed.candidates.length === 0) {
        throw new Error('AI 没返回候选 SKU,试试改类目描述');
      }
      setResult(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : '选品失败');
    } finally {
      setRunning(false);
    }
  };

  const exportMd = () => {
    if (!result) return;
    const lines = [
      `# AI 选品报告`,
      ``,
      `**平台**: ${PLATFORM_LABELS[platform]}`,
      `**类目**: ${category}`,
      `**售价**: ¥${priceMin}-${priceMax} · **预算**: ¥${budget} · **风险偏好**: ${RISK_LABELS[risk].txt}`,
      ``,
      `## 市场判断`,
      result.marketSummary,
      ``,
      `## ${result.candidates.length} 个候选 SKU`,
      ``,
      ...result.candidates.flatMap((c, i) => [
        `### ${i + 1}. ${c.name}`,
        ``,
        `- **子品类**: ${c.category}`,
        `- **售价/进货价/毛利**: ${c.estPriceCny} / ${c.estCostCny} / ${c.estMargin}`,
        `- **竞争度**: ${c.competition} · **趋势**: ${c.trendDirection}`,
        `- **为何现在**: ${c.whyNow}`,
        `- **目标用户**: ${c.targetUser}`,
        `- **切入策略**: ${c.entryStrategy}`,
        `- **风险**: ${c.risks.join(' · ')}`,
        `- **搜索词**: ${c.searchKeywords.map(k => `\`${k}\``).join(' · ')}`,
        ``,
      ]),
      ...(result.rejectedTopics?.length
        ? [
            `## 不推荐的方向`,
            ``,
            ...result.rejectedTopics.map(r => `- ${r}`),
          ]
        : []),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wenai-discovery-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-bg-root">
      {/* Hero */}
      <div className="border-b border-border-subtle bg-gradient-to-b from-bg-surface/50 to-transparent">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">
              PRODUCT DISCOVERY · 选品发现
            </span>
            <span className="text-[9px] font-mono text-accent/70 px-2 py-0.5 border border-accent/30 rounded-full">
              痛点 #1
            </span>
            <span className="text-[9px] font-mono text-text-tertiary px-2 py-0.5 border border-border-subtle rounded-full">
              Phase 1 · LLM 推断
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
            别拍脑袋选品 · AI 给你 5-8 个候选 SKU
            <ActiveSkuBadge skuId={activeSkuId} />
          </h1>
          <div className="mb-3"><IndustryHint /></div>
          <p className="text-[13px] lg:text-[14px] text-text-secondary leading-relaxed max-w-[800px]">
            告诉 wenai 你的<span className="text-accent">平台 + 类目 + 价格带 + 启动预算 + 风险偏好</span>,
            AI 反推真实需求 + 候选 SKU + 利润预测 + 切入策略 + 风险点 + 搜索词。
            一次输出 = 替你跑一周的市场调研。
          </p>

          <div className="flex flex-wrap gap-2 mt-5">
            <span className="text-[10px] font-mono text-text-tertiary self-center mr-1">案例:</span>
            {EXAMPLES.map((e, i) => (
              <button
                key={i}
                onClick={() => loadExample(i)}
                className="text-[11px] font-mono px-3 py-1.5 border border-border-subtle rounded text-text-secondary hover:border-accent/40 hover:text-accent"
              >
                {e.title}
              </button>
            ))}
          </div>

          {/* SKU 库读侧 · 飞轮双向化 */}
          {mySkus.length > 0 && (
            <div className="mt-4 border border-cat-content/30 bg-cat-content/5 rounded-lg p-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-cat-content uppercase tracking-wider">
                    📦 你的 SKU 库
                  </span>
                  <span className="text-[10px] font-mono text-text-tertiary tabular-nums">
                    {mySkus.length} 条
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {mySkus.slice(0, 6).map(s => (
                    <span key={s.id} className="text-[10px] font-mono text-text-secondary border border-border-subtle rounded px-1.5 py-0.5 bg-bg-root/30">
                      {s.name.length > 14 ? s.name.slice(0, 14) + '…' : s.name}
                    </span>
                  ))}
                  {mySkus.length > 6 && (
                    <span className="text-[10px] font-mono text-text-tertiary">+{mySkus.length - 6}</span>
                  )}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={useSkuContext}
                  onChange={e => setUseSkuContext(e.target.checked)}
                  className="accent-cat-content"
                />
                <span className="text-[11px] font-mono text-cat-content">
                  让 AI 避免重复 + 推互补品类
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* LEFT controls */}
        <aside className="lg:sticky lg:top-4 lg:self-start space-y-4">
          <section className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30 space-y-3">
            <Field label="① 目标平台">
              <select
                value={platform}
                onChange={e => setPlatform(e.target.value as Platform)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
              >
                {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>

            <Field label="② 类目方向 *">
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="例: 家居收纳 / 厨房小工具 / 户外露营"
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
              />
            </Field>

            <Field label="③ 售价区间 (¥)">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={priceMin}
                  onChange={e => setPriceMin(parseInt(e.target.value || '0', 10))}
                  className="flex-1 px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] tabular-nums"
                />
                <span className="text-text-tertiary">→</span>
                <input
                  type="number"
                  value={priceMax}
                  onChange={e => setPriceMax(parseInt(e.target.value || '0', 10))}
                  className="flex-1 px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] tabular-nums"
                />
              </div>
            </Field>

            <Field label="④ 启动预算 (¥)">
              <input
                type="number"
                value={budget}
                onChange={e => setBudget(parseInt(e.target.value || '0', 10))}
                step={5000}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] tabular-nums"
              />
            </Field>

            <Field label="⑤ 风险偏好">
              <div className="grid grid-cols-3 gap-1.5">
                {(['low', 'medium', 'high'] as RiskAppetite[]).map(r => (
                  <button
                    key={r}
                    onClick={() => setRisk(r)}
                    className={`text-[10px] font-mono py-2 rounded transition-colors ${
                      risk === r
                        ? 'bg-accent text-bg-root'
                        : 'border border-border-subtle text-text-secondary hover:border-accent/40'
                    }`}
                  >
                    <div>{RISK_LABELS[r].txt}</div>
                    <div className="text-[8px] opacity-70 mt-0.5">{RISK_LABELS[r].sub.split(',')[0]}</div>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="⑥ 备注 (可选)">
              <textarea
                value={extraNote}
                onChange={e => setExtraNote(e.target.value)}
                placeholder="例: 有自己的供应链 / 已有母婴店铺 / 想冲单品爆款"
                rows={2}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] resize-none"
              />
            </Field>
          </section>

          <button
            onClick={handleDiscover}
            disabled={running || !category.trim()}
            className="w-full py-3.5 bg-accent text-bg-root rounded-lg text-[14px] font-bold hover:bg-accent-hover disabled:opacity-40"
          >
            {running ? '选品中... (10-20 秒)' : '🎯 开始选品发现'}
          </button>

          <Link
            href={discoveryStandardPackHref}
            className="block w-full text-center py-2.5 border border-accent/35 text-accent rounded-lg text-[12px] font-mono hover:bg-accent/10"
          >
            生成选品 SOP 标品包 →
          </Link>

          {error && (
            <div className="p-3 border border-error/40 bg-error/5 rounded text-[11px] text-error">
              ✗ {error}
              {rawDebug && (
                <button onClick={() => setShowRaw(s => !s)} className="ml-2 underline">
                  {showRaw ? '隐藏' : '看'} AI 原文
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
            Phase 1 · LLM 推断版 · 适合赛道 brainstorming
            <br/>
            Phase 2 (待做) · 接 1688/蝉妈妈/Amazon BSR 真实数据 + 销量曲线
          </p>
        </aside>

        {/* RIGHT */}
        <main className="space-y-4 min-h-[600px]">
          {!running && !result && <EmptyState />}

          {running && (
            <div className="border border-accent/40 bg-accent/5 rounded-lg p-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
              <div>
                <div className="text-[13px] font-semibold text-text-primary">正在跑选品分析</div>
                <div className="text-[10px] font-mono text-text-tertiary mt-0.5">
                  调研平台趋势 · 反推用户需求 · 估算利润 · 评估风险
                </div>
              </div>
            </div>
          )}

          {!running && result && (
            <>
              <section className="border border-accent/30 bg-accent/5 rounded-lg p-4">
                <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-2">
                  市场判断
                </div>
                <p className="text-[13px] text-text-primary leading-relaxed">{result.marketSummary}</p>
              </section>

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-[14px] font-bold text-text-primary">
                  {result.candidates.length} 个候选 SKU · 按潜力排序
                </h2>
                {resultStandardPackHref && (
                  <Link
                    href={resultStandardPackHref}
                    className="text-[11px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded px-3 py-1.5"
                  >
                    生成选品验收标品包
                  </Link>
                )}
                <button
                  onClick={exportMd}
                  className="text-[11px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded px-3 py-1.5"
                >
                  ⬇ 导出 MD
                </button>
              </div>

              <div className="space-y-3">
                {result.candidates.map((c, i) => (
                  <SkuCard key={i} idx={i} sku={c} platform={PLATFORM_LABELS[platform]} />
                ))}
              </div>

              {result.rejectedTopics && result.rejectedTopics.length > 0 && (
                <div className="border border-text-tertiary/30 rounded-lg p-4 bg-bg-surface/30">
                  <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
                    🚫 看似机会但不推荐
                  </div>
                  <ul className="space-y-1.5">
                    {result.rejectedTopics.map((r, i) => (
                      <li key={i} className="text-[12px] text-text-secondary">· {r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border border-accent/30 bg-accent/5 rounded-lg p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-[12px] text-text-secondary">
                  <span className="text-accent font-semibold">下一步 →</span>
                  {' '}挑 1-2 个候选 SKU,去 AI 影棚出图、AI 视频出片、反向意图找客群
                </div>
                <div className="flex gap-2">
                  <Link href="/pipelines/ai-photoshoot" className="text-[11px] font-mono px-3 py-1.5 bg-accent text-bg-root rounded">
                    🎬 去影棚 →
                  </Link>
                  <Link href="/pipelines/intent-mining" className="text-[11px] font-mono px-3 py-1.5 border border-border-default text-text-primary rounded hover:border-accent/40">
                    🔍 反向意图 →
                  </Link>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-mono text-text-secondary mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-border-default rounded-lg p-8 text-center">
      <div className="text-4xl mb-2">🎯</div>
      <h3 className="text-[16px] font-bold text-text-primary mb-1">告诉系统你想做什么</h3>
      <p className="text-[12px] text-text-tertiary mb-5">点案例快捷填或自己输,15 秒拿到候选 SKU</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
        <Tip emoji="📊" title="平台审美" desc="同款产品在 Amazon / TikTok Shop / 拼多多 切法不同" />
        <Tip emoji="💰" title="价格带卡位" desc="给你你预算能切的价格档,不让你冲不切实际的高客单" />
        <Tip emoji="🎲" title="风险偏好" desc="保守 = 已验证赛道 · 激进 = 蓝海早期" />
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

function SkuCard({ idx, sku, platform }: { idx: number; sku: SKUCandidate; platform: string }) {
  const compColor = sku.competition === 'low' ? 'success' : sku.competition === 'medium' ? 'accent' : 'error';
  const trendIcon = sku.trendDirection === 'rising' ? '↗' : sku.trendDirection === 'stable' ? '→' : '↘';
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveToLibrary = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/sku-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sku.name,
          category: sku.category,
          platform,
          priceCny: sku.estPriceCny,
          status: 'discovery-done',
          notes: `${sku.entryStrategy}\n\n搜索词: ${sku.searchKeywords.join(', ')}`,
          modules: ['product-discovery'],
        }),
      });
      if (res.ok) setSaved(true);
    } catch {} finally {
      setSaving(false);
    }
  };

  return (
    <div className={`border border-border-subtle rounded-lg p-4 bg-bg-surface/30 hover:border-accent/40 transition-colors animate-fade-up stagger-${Math.min(idx + 1, 6)}`}>
      <div className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-mono text-accent">#{idx + 1}</span>
          <h3 className="text-[15px] font-bold text-text-primary">{sku.name}</h3>
          <span className="text-[10px] font-mono text-text-tertiary">{sku.category}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className={`px-1.5 py-0.5 border rounded border-${compColor}/40 text-${compColor} bg-${compColor}/5`}>
            竞争 {sku.competition}
          </span>
          <span className="text-text-secondary">{trendIcon} {sku.trendDirection}</span>
          <button
            onClick={saveToLibrary}
            disabled={saving || saved}
            className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
              saved
                ? 'border-success/40 bg-success/10 text-success'
                : 'border-accent/30 text-accent hover:bg-accent/10'
            }`}
            title="加进我的 SKU 库, 决策层模块后续基于历史给更精准建议"
          >
            {saved ? '✓ 已入库' : saving ? '保存中…' : '📦 入库'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3 text-[11px]">
        <Stat label="售价" value={sku.estPriceCny} />
        <Stat label="进货价" value={sku.estCostCny} />
        <Stat label="毛利" value={sku.estMargin} />
      </div>

      <div className="space-y-2 text-[12px]">
        <Row label="为何现在" value={sku.whyNow} />
        <Row label="目标用户" value={sku.targetUser} />
        <Row label="切入策略" value={sku.entryStrategy} accent />
        <div>
          <span className="text-[10px] font-mono text-text-tertiary uppercase">风险</span>
          <ul className="mt-0.5 space-y-0.5">
            {sku.risks.map((r, i) => (
              <li key={i} className="text-[11px] text-text-secondary">· {r}</li>
            ))}
          </ul>
        </div>
        <div>
          <span className="text-[10px] font-mono text-text-tertiary uppercase">搜索词</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {sku.searchKeywords.map((k, i) => (
              <code key={i} className="text-[10px] font-mono px-1.5 py-0.5 bg-bg-root border border-border-subtle rounded">
                {k}
              </code>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border-subtle rounded px-2 py-1.5 bg-bg-root/40">
      <div className="text-[9px] font-mono text-text-tertiary uppercase">{label}</div>
      <div className="text-[12px] font-bold text-text-primary mt-0.5 tabular-nums">{value}</div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <span className="text-[10px] font-mono text-text-tertiary uppercase">{label}</span>
      <p className={`mt-0.5 leading-relaxed ${accent ? 'text-accent font-medium' : 'text-text-secondary'}`}>
        {value}
      </p>
    </div>
  );
}
