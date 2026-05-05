'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMySkus } from '@/lib/use-my-skus';
import { useActiveSkuId } from '@/lib/use-active-sku';
import { ActiveSkuBadge } from '@/components/ActiveSkuBadge';
import { ShareButton } from '@/components/ShareButton';
import { IndustryHint } from '@/components/IndustryHint';
import { buildAbTestStandardPackRoute } from '@/lib/standard-pack-routing';

/**
 * 测款 A-B 实验室 (痛点 #11)
 *
 * 商家最痛: 投不出爆款 → 没数据 → 不敢加预算 → 死循环
 * wenai 解法: 一张产品图自动衍生 9 个 prompt 变体 (3 钩子 × 3 配色)
 *   + 推荐"先投哪 3 张"+ 投放后数据回填 SOP
 *
 * 不直接调 9 次影棚 (配额贵), 输出 prompt 后用户自己挑去影棚跑
 * Phase-2 (待做): 一键全跑 + 自动汇总点击率数据
 */

type Platform = 'amazon' | 'tmall' | 'pdd' | 'tiktok' | 'douyin' | 'xiaohongshu';
type Dimension = 'hook' | 'palette' | 'composition' | 'model';

interface PromptVariant {
  id: string;             // A1 / A2 / A3 / B1 ...
  hookType: string;       // 钩子 A: 痛点 / B: 数字 / C: 场景
  paletteType: string;    // 配色 1: 高饱和 / 2: 莫兰迪 / 3: 黑金
  prompt: string;         // 完整 prompt
  predictedCtr: 'high' | 'medium' | 'low'; // AI 预测点击率
  whyHook: string;        // 为什么这个钩子能戳人
}

interface AbTestResult {
  productSummary: string;
  testStrategy: string;          // 测款策略全文
  variants: PromptVariant[];     // 9 张 (3x3)
  recommendedFirst3: string[];   // 先投这 3 个 ID
  budgetAllocation: string;      // 预算分配建议
  killCriteria: string;          // 杀验/留验标准
  rollupSop: string;             // 数据回流 SOP
}

function buildAbTestResultSummary(result: AbTestResult): string {
  const variantSummary = result.variants.slice(0, 4).map(variant =>
    `${variant.id}: ${variant.hookType} / ${variant.paletteType} / CTR ${variant.predictedCtr} / ${variant.whyHook}`,
  );

  return [
    `product summary: ${result.productSummary}`,
    `test strategy: ${result.testStrategy}`,
    `recommended first 3: ${result.recommendedFirst3.join(' / ')}`,
    `budget allocation: ${result.budgetAllocation}`,
    `kill criteria: ${result.killCriteria}`,
    variantSummary.join('\n'),
    `rollup sop: ${result.rollupSop}`,
  ].join('\n');
}

const PLATFORM_LABELS: Record<Platform, string> = {
  amazon: '🟧 Amazon (主图点击率)',
  tmall: '🟦 淘宝/天猫 (展现点击率)',
  pdd: '🟥 拼多多 (商详停留)',
  tiktok: '⚡ TikTok Shop (素材 CTR)',
  douyin: '⚫ 抖音 (信息流 CTR)',
  xiaohongshu: '🟤 小红书 (笔记互动)',
};

export default function AbTestPage() {
  const [platform, setPlatform] = useState<Platform>('amazon');
  const [productHint, setProductHint] = useState('');

  // 读 SKU 库 · 让用户从已有 SKU 一键填测款
  const { skus: mySkus } = useMySkus(15);
  const activeSkuId = useActiveSkuId();
  const [dailyBudget, setDailyBudget] = useState(500);
  const [primaryDimension, setPrimaryDimension] = useState<Dimension>('hook');

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AbTestResult | null>(null);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [rawDebug, setRawDebug] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const dimensionLabel = primaryDimension === 'hook' ? '钩子文字' : primaryDimension === 'palette' ? '配色风格' : primaryDimension === 'composition' ? '构图视角' : '模特/无模特';
  const standardPackHref = buildAbTestStandardPackRoute({
    platformLabel: PLATFORM_LABELS[platform],
    productHint,
    dailyBudget,
    primaryDimension: dimensionLabel,
  });
  const resultStandardPackHref = result
    ? buildAbTestStandardPackRoute({
        platformLabel: PLATFORM_LABELS[platform],
        productHint,
        dailyBudget,
        primaryDimension: dimensionLabel,
        resultSummary: buildAbTestResultSummary(result),
      })
    : '';

  const buildPrompt = () => `
你是一个跨境/本土电商 10 年实战的投放操盘手, 帮助商家做 A-B 测款主图变体规划。

【用户输入】
- 平台: ${PLATFORM_LABELS[platform]}
- 产品: ${productHint}
- 日预算: ¥${dailyBudget}
- 主测维度: ${dimensionLabel}

【任务】
为该产品生成 9 个主图 prompt 变体 (3 钩子方向 × 3 配色方向 = 3x3 矩阵), 并给完整测款 SOP。

【硬要求】
1. 9 个 variants 的 hookType + paletteType 必须有差异 (3 钩子: 痛点/数字承诺/场景代入; 3 配色: 高饱和/莫兰迪轻奢/黑金高级)
2. 每个 prompt 必须 80-120 字, 含: 产品定位 + 钩子文字 (写死内容) + 配色 + 构图 + 平台规范
3. predictedCtr 三档分布合理 (大约 3 个 high / 4 个 medium / 2 个 low)
4. recommendedFirst3 选最有把握的 3 个 ID (建议跨钩子+跨配色, 不要全押一种)
5. budgetAllocation 给出每张图测试预算建议 (例: 先投 ¥150/张 测 24h)
6. killCriteria 给出"24h 内 CTR < X% 直接杀, > Y% 立刻加预算"硬数字
7. rollupSop 给数据回流操作步骤

【输出严格 JSON】
{
  "productSummary": "对该产品的核心定位判断",
  "testStrategy": "本轮 A-B 测款总策略, 80-120 字",
  "variants": [
    {
      "id": "A1",
      "hookType": "痛点钩子",
      "paletteType": "高饱和电商风",
      "prompt": "<完整 80-120 字图像 prompt>",
      "predictedCtr": "high",
      "whyHook": "<为何这个钩子戳人, 30-50 字>"
    }
  ],
  "recommendedFirst3": ["A1", "B2", "C3"],
  "budgetAllocation": "<具体预算分配方案>",
  "killCriteria": "<具体 CTR 阈值>",
  "rollupSop": "<数据回流的 4-6 步操作>"
}

直接输出 JSON,不要 markdown 标签,不要解释。
`.trim();

  const handleRun = async () => {
    if (!productHint.trim() || productHint.length < 10) {
      setError('产品描述太短(至少 10 字)');
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
          moduleId: 'ab-test',
          prompt: buildPrompt(),
          input: productHint,
          skuId: activeSkuId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      const raw = data.content || '';
      setRawDebug(raw);
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('AI 输出非 JSON');
      const parsed = JSON.parse(m[0]) as AbTestResult;
      if (!parsed.variants || parsed.variants.length === 0) {
        throw new Error('AI 没返回 variants');
      }
      setResult(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setRunning(false);
    }
  };

  const copyPrompt = async (id: string, prompt: string) => {
    await navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-bg-root">
      {/* Hero */}
      <div className="border-b border-border-subtle bg-gradient-to-b from-bg-surface/50 to-transparent">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">
              AB-TEST · 测款实验室
            </span>
            <span className="text-[9px] font-mono text-accent/70 px-2 py-0.5 border border-accent/30 rounded-full">
              痛点 #11
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
            一张图变 9 张测款变体 · 不再瞎投
            <ActiveSkuBadge skuId={activeSkuId} />
          </h1>
          <div className="mb-3"><IndustryHint /></div>
          <p className="text-[13px] lg:text-[14px] text-text-secondary leading-relaxed max-w-[800px]">
            投不出爆款 = 没测款数据 → 不敢加预算 → 死循环。
            wenai 一次给 <span className="text-accent">3 钩子 × 3 配色 = 9 个变体 prompt + 推荐先投哪 3 张 + 杀/留硬指标</span>,
            把&quot;看图直觉&quot;换成&quot;数据驱动&quot;。
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* LEFT */}
        <aside className="lg:sticky lg:top-4 lg:self-start space-y-4">
          <section className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30 space-y-3">
            <div>
              <label className="text-[10px] font-mono text-text-secondary mb-1.5 block">① 投放平台</label>
              <select
                value={platform}
                onChange={e => setPlatform(e.target.value as Platform)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
              >
                {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-text-secondary mb-1.5 block">② 产品描述 *</label>
              <textarea
                value={productHint}
                onChange={e => setProductHint(e.target.value)}
                placeholder="例: 红枣山药八珍糕 50g/盒 ¥39 / 智能蓝牙耳机带 LED 显示电量 / 北欧风厨房收纳挂钩 ¥29"
                rows={3}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] resize-none"
              />
              {/* SKU 库快选 · 一键填 */}
              {mySkus.length > 0 && (
                <div className="mt-1.5">
                  <div className="text-[9px] font-mono text-text-tertiary mb-1">📦 一键从 SKU 库填:</div>
                  <div className="flex flex-wrap gap-1">
                    {mySkus.slice(0, 8).map(s => (
                      <button
                        key={s.id}
                        onClick={() => setProductHint(s.name + (s.priceCny ? ` ${s.priceCny}` : '') + (s.notes ? ` · ${s.notes.slice(0, 50)}` : ''))}
                        className="text-[10px] font-mono text-cat-content border border-cat-content/30 hover:bg-cat-content/10 rounded px-1.5 py-0.5"
                        title={`${s.category} · ${s.status}`}
                      >
                        {s.name.length > 14 ? s.name.slice(0, 14) + '…' : s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-mono text-text-secondary mb-1.5 block">③ 日测试预算 (¥)</label>
              <input
                type="number"
                value={dailyBudget}
                onChange={e => setDailyBudget(parseInt(e.target.value || '0', 10))}
                step={100}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] tabular-nums"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-text-secondary mb-1.5 block">④ 主测维度</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['hook', 'palette', 'composition', 'model'] as Dimension[]).map(d => (
                  <button
                    key={d}
                    onClick={() => setPrimaryDimension(d)}
                    className={`text-[10px] font-mono py-1.5 rounded transition-colors ${
                      primaryDimension === d
                        ? 'bg-accent text-bg-root'
                        : 'border border-border-subtle text-text-secondary hover:border-accent/40'
                    }`}
                  >
                    {d === 'hook' ? '钩子文字' : d === 'palette' ? '配色风格' : d === 'composition' ? '构图视角' : '模特/无'}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleRun}
              disabled={running || productHint.length < 10}
              className="w-full py-3.5 bg-accent text-bg-root rounded-lg text-[14px] font-bold hover:bg-accent-hover disabled:opacity-40"
            >
              {running ? '生成中... (8-15 秒)' : '⚗️ 生 9 个测款变体 + SOP'}
            </button>
            <Link
              href={standardPackHref}
              className={`w-full py-3.5 rounded-lg text-[12px] font-bold text-center border transition-colors ${
                productHint.trim().length
                  ? 'border-cat-content/40 text-cat-content hover:bg-cat-content/10'
                  : 'border-border-subtle text-text-tertiary pointer-events-none opacity-50'
              }`}
            >
              生成测款假设标品包
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
        </aside>

        {/* RIGHT */}
        <main className="space-y-4 min-h-[600px]">
          {!running && !result && (
            <div className="border border-dashed border-border-default rounded-lg p-8 text-center">
              <div className="text-4xl mb-2">⚗️</div>
              <h3 className="text-[16px] font-bold text-text-primary mb-1">为啥要 A-B 测款</h3>
              <p className="text-[12px] text-text-tertiary mb-5">
                数据决策 · 不靠&quot;我觉得这张图好看&quot;那种自欺
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                <Tip emoji="🎯" title="3x3 矩阵" desc="3 钩子方向 × 3 配色, 覆盖所有点击诱因" />
                <Tip emoji="📊" title="先投 3 张" desc="不是全跑, 推荐最稳的 3 张验证" />
                <Tip emoji="⚖️" title="杀/留硬指标" desc="24h CTR < X% 杀, > Y% 加预算" />
              </div>
            </div>
          )}

          {running && (
            <div className="border border-accent/40 bg-accent/5 rounded-lg p-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
              <div>
                <div className="text-[13px] font-semibold text-text-primary">在跑投放操盘手脑回路</div>
                <div className="text-[10px] font-mono text-text-tertiary mt-0.5">
                  钩子规划 · 配色矩阵 · 预算分配 · 杀验阈值
                </div>
              </div>
            </div>
          )}

          {!running && result && (
            <>
              <ResultView
                result={result}
                copyPrompt={copyPrompt}
                copiedId={copiedId}
                productHint={productHint}
                platformLabel={PLATFORM_LABELS[platform]}
                standardPackHref={resultStandardPackHref}
              />
              {activeSkuId && (
                <PerformanceWriteback
                  variants={result.variants}
                  recommended={result.recommendedFirst3}
                  skuId={activeSkuId}
                />
              )}
            </>
          )}
        </main>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10 border-t border-border-subtle mt-10">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">配套工作流</div>
        <div className="flex flex-wrap gap-2">
          <Link href="/pipelines/ai-photoshoot" className="px-3 py-1.5 border border-accent/30 rounded text-[11px] font-mono text-accent hover:bg-accent/10">
            🎬 拷 prompt 去影棚生图 →
          </Link>
          <Link href="/pipelines/product-discovery" className="px-3 py-1.5 border border-border-subtle rounded text-[11px] font-mono text-text-secondary hover:border-accent/40 hover:text-accent">
            🎯 选品发现 →
          </Link>
          <Link href="/pipelines/intent-mining" className="px-3 py-1.5 border border-border-subtle rounded text-[11px] font-mono text-text-secondary hover:border-accent/40 hover:text-accent">
            🔍 反向意图扩客 →
          </Link>
        </div>
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

function ResultView({
  result,
  copyPrompt,
  copiedId,
  productHint,
  platformLabel,
  standardPackHref,
}: {
  result: AbTestResult;
  copyPrompt: (id: string, p: string) => void;
  copiedId: string | null;
  productHint: string;
  platformLabel: string;
  standardPackHref: string;
}) {
  const [savingSku, setSavingSku] = useState(false);
  const [savedSku, setSavedSku] = useState(false);

  const saveToLibrary = async () => {
    setSavingSku(true);
    try {
      const res = await fetch('/api/user/sku-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productHint.slice(0, 80),
          category: '已测款',
          platform: platformLabel,
          status: 'abtest-done',
          notes: `测款策略: ${result.testStrategy}\n\n推荐先投: ${result.recommendedFirst3.join(' / ')}\n\n${result.budgetAllocation}\n\n杀/留: ${result.killCriteria}`,
          modules: ['ab-test'],
        }),
      });
      if (res.ok) setSavedSku(true);
    } catch {} finally {
      setSavingSku(false);
    }
  };

  // 公开分享 markdown 构造 · 复用 useShare/ShareButton
  const buildSharePayload = () => ({
    moduleId: 'ab-test',
    title: `测款 9 变体 · ${productHint.slice(0, 40)} (${platformLabel})`,
    content: [
      `# 测款 A-B 变体规划 · ${platformLabel}`,
      ``,
      `**产品**: ${productHint}`,
      ``,
      `## 核心策略`,
      ``,
      `${result.productSummary}`,
      ``,
      `${result.testStrategy}`,
      ``,
      `## 推荐先投`,
      `**先投 3 个 ID**: ${result.recommendedFirst3.join(' / ')}`,
      ``,
      `**预算分配**: ${result.budgetAllocation}`,
      ``,
      `**杀/留硬指标**: ${result.killCriteria}`,
      ``,
      `## 9 个变体`,
      ``,
      ...result.variants.flatMap(v => [
        `### ${v.id} · ${v.hookType} × ${v.paletteType} (预测 CTR: ${v.predictedCtr})`,
        ``,
        `**为何戳人**: ${v.whyHook}`,
        ``,
        '```',
        v.prompt,
        '```',
        ``,
      ]),
      `## 数据回流 SOP`,
      ``,
      result.rollupSop,
      ``,
      `---`,
      `*由 wenai SKU 增长演示流程生成 · 准备真实 SKU 时, 请通过 /inquire 提交 POC 需求。*`,
    ].join('\n'),
    source: 'module' as const,
  });

  return (
    <>
      <section className="border border-accent/30 bg-accent/5 rounded-lg p-4 space-y-2 relative">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="text-[10px] font-mono text-accent uppercase tracking-wider">核心策略</div>
          <div className="flex items-center gap-2 flex-wrap">
            <ShareButton buildPayload={buildSharePayload} />
            <Link
              href={standardPackHref}
              className="text-[10px] font-mono px-2.5 py-1 rounded border border-cat-content/40 text-cat-content hover:bg-cat-content/10"
            >
              生成测款验收标品包
            </Link>
            <button
              onClick={saveToLibrary}
              disabled={savingSku || savedSku}
              className={`text-[10px] font-mono px-2.5 py-1 rounded border transition-colors ${
                savedSku
                  ? 'border-success/40 bg-success/10 text-success'
                  : 'border-accent/40 text-accent hover:bg-accent/10'
              }`}
              title="保存到我的 SKU 库, 数据洞察会基于此分析"
            >
              {savedSku ? '✓ 已入库 SKU 历史' : savingSku ? '保存中…' : '📦 保存到 SKU 库'}
            </button>
          </div>
        </div>
        <p className="text-[13px] text-text-primary leading-relaxed">{result.productSummary}</p>
        <p className="text-[12px] text-text-secondary leading-relaxed">{result.testStrategy}</p>
      </section>

      <section className="border border-success/30 bg-success/5 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-[12px]">
        <div>
          <div className="text-[10px] font-mono text-success uppercase mb-1">先投这 3 张</div>
          <div className="flex gap-1.5">
            {result.recommendedFirst3.map(id => (
              <span key={id} className="text-[12px] font-bold text-bg-root bg-success px-2 py-0.5 rounded font-mono tabular-nums">{id}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono text-success uppercase mb-1">预算分配</div>
          <p className="text-text-primary leading-relaxed">{result.budgetAllocation}</p>
        </div>
        <div>
          <div className="text-[10px] font-mono text-success uppercase mb-1">杀/留硬指标</div>
          <p className="text-text-primary leading-relaxed">{result.killCriteria}</p>
        </div>
      </section>

      <h2 className="text-[14px] font-bold text-text-primary">9 个变体 prompt · 拷去影棚跑</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {result.variants.map((v, i) => {
          const isRec = result.recommendedFirst3.includes(v.id);
          const ctrColor = v.predictedCtr === 'high' ? 'success' : v.predictedCtr === 'medium' ? 'accent' : 'text-tertiary';
          return (
            <div
              key={v.id}
              className={`border rounded-lg p-3 bg-bg-surface/30 transition-all animate-fade-up stagger-${Math.min(i + 1, 6)} ${
                isRec ? 'border-success/50 shadow-[0_4px_16px_rgba(74,222,128,0.12)]' : 'border-border-subtle hover:border-accent/40'
              }`}
            >
              <div className="flex items-baseline justify-between mb-1.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[14px] font-bold text-accent font-mono tabular-nums">{v.id}</span>
                  {isRec && (
                    <span className="text-[9px] font-mono text-success px-1.5 py-0.5 border border-success/40 rounded">推荐</span>
                  )}
                </div>
                <span className={`text-[9px] font-mono uppercase text-${ctrColor}`}>
                  CTR {v.predictedCtr}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-1.5">
                <span className="text-[9px] font-mono text-text-tertiary px-1.5 py-0.5 border border-border-subtle rounded">
                  {v.hookType}
                </span>
                <span className="text-[9px] font-mono text-text-tertiary px-1.5 py-0.5 border border-border-subtle rounded">
                  {v.paletteType}
                </span>
              </div>

              <p className="text-[10px] text-text-secondary leading-relaxed mb-2 line-clamp-3">
                <span className="text-text-tertiary">为何戳人:</span> {v.whyHook}
              </p>

              <div className="border-t border-border-subtle pt-2">
                <button
                  onClick={() => copyPrompt(v.id, v.prompt)}
                  className={`w-full text-[10px] font-mono py-1.5 rounded transition-colors ${
                    copiedId === v.id
                      ? 'bg-success/20 text-success'
                      : 'border border-accent/30 text-accent hover:bg-accent/10'
                  }`}
                >
                  {copiedId === v.id ? '✓ 已复制' : '📋 拷 prompt 去影棚'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <section className="border border-accent/20 rounded-lg p-4 bg-bg-surface/30">
        <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-2">数据回流 SOP</div>
        <p className="text-[12px] text-text-secondary leading-relaxed whitespace-pre-line">{result.rollupSop}</p>
      </section>
    </>
  );
}

/**
 * 性能数据回填 · 把投放后真实 CTR/CPC 写到 SKU.performance
 *
 * 这是 wenai 真正变成"商家性能档案库"的关键钩子:
 * - 跑完 24-72h 投放后, 商家来这里贴实际数据
 * - 写到 SKU.performance.ctr / .cpc / .winningVariant
 * - /me/skus/[id] 实时显示, /pipelines/data-insights 反向 benchmark
 * - 数据越多, wenai 越懂这个 SKU, 越锁
 */
function PerformanceWriteback({
  variants,
  recommended,
  skuId,
}: {
  variants: PromptVariant[];
  recommended: string[];
  skuId: string;
}) {
  // 默认只填 recommendedFirst3 三个变体
  const recVariants = variants.filter(v => recommended.includes(v.id));
  const [data, setData] = useState<Record<string, { ctr: string; cpc: string; conv: string }>>(
    Object.fromEntries(recVariants.map(v => [v.id, { ctr: '', cpc: '', conv: '' }]))
  );
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState('');

  const update = (id: string, field: 'ctr' | 'cpc' | 'conv', val: string) => {
    setData(prev => ({ ...prev, [id]: { ...prev[id], [field]: val } }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      // 找最高 CTR 作为 winningVariant
      const entries = Object.entries(data).filter(([, v]) => v.ctr.trim());
      if (entries.length === 0) {
        setError('至少填一个变体的 CTR');
        return;
      }
      const ctrs = entries.map(([id, v]) => ({ id, ctr: parseFloat(v.ctr), cpc: parseFloat(v.cpc) || 0, conv: parseFloat(v.conv) || 0 }));
      const winner = ctrs.reduce((a, b) => a.ctr > b.ctr ? a : b);
      const avgCtr = ctrs.reduce((s, x) => s + x.ctr, 0) / ctrs.length;
      const minCpc = ctrs.reduce((m, x) => x.cpc > 0 && (m === 0 || x.cpc < m) ? x.cpc : m, 0);

      const performance = {
        ctr: +avgCtr.toFixed(2),
        bestCtr: +winner.ctr.toFixed(2),
        cpc: minCpc > 0 ? +minCpc.toFixed(2) : undefined,
        convRate: winner.conv > 0 ? +winner.conv.toFixed(2) : undefined,
        winningVariant: winner.id,
        testedAt: new Date().toISOString(),
        variantsCount: ctrs.length,
      };

      const res = await fetch(`/api/user/sku-history?id=${skuId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          performance,
          status: 'abtest-done',
          modules: ['ab-test'],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      setSavedAt(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="border border-success/40 bg-success/5 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-[12px] font-bold text-success">📊 投放后回填实战数据</div>
          <div className="text-[10px] font-mono text-text-tertiary mt-0.5">
            跑完 24-72h 来填 · 写到 SKU performance · /me/skus 自动看
          </div>
        </div>
        {savedAt && (
          <span className="text-[10px] font-mono text-success">
            ✓ {new Date(savedAt).toLocaleString('zh-CN')} 已写入
          </span>
        )}
      </div>

      <div className="space-y-2">
        {recVariants.map(v => (
          <div key={v.id} className="grid grid-cols-[60px_1fr_1fr_1fr] gap-2 items-center">
            <span className="text-[12px] font-bold text-accent font-mono tabular-nums">{v.id}</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="CTR %"
              value={data[v.id]?.ctr || ''}
              onChange={e => update(v.id, 'ctr', e.target.value)}
              className="px-2 py-1 bg-bg-surface border border-border-default rounded text-[11px] font-mono"
            />
            <input
              type="text"
              inputMode="decimal"
              placeholder="CPC ¥"
              value={data[v.id]?.cpc || ''}
              onChange={e => update(v.id, 'cpc', e.target.value)}
              className="px-2 py-1 bg-bg-surface border border-border-default rounded text-[11px] font-mono"
            />
            <input
              type="text"
              inputMode="decimal"
              placeholder="转化率 %"
              value={data[v.id]?.conv || ''}
              onChange={e => update(v.id, 'conv', e.target.value)}
              className="px-2 py-1 bg-bg-surface border border-border-default rounded text-[11px] font-mono"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-[11px] font-mono px-3 py-1.5 rounded bg-success text-bg-root hover:opacity-90 disabled:opacity-40"
        >
          {saving ? '保存中...' : '💾 写入 SKU performance'}
        </button>
        <Link
          href={`/me/skus/${skuId}`}
          className="text-[11px] font-mono text-accent hover:underline"
        >
          → 看 SKU 档案
        </Link>
      </div>

      {error && (
        <div className="text-[10px] text-error font-mono">✗ {error}</div>
      )}
    </section>
  );
}
