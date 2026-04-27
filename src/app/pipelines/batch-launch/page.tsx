'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * 多 SKU 批量上架 · 把 10 pipelines 串成一条流水线
 *
 * Phase-1 (本版): 批量计划生成器
 *   - 用户贴 N 个 SKU 行 + 选工序 + 选目标平台
 *   - DeepSeek 输出每个 SKU 在每个工序的: 推荐 prompt + 参数 + 检查清单
 *   - 商家拿这份 markdown SOP 去手动执行 (复制 prompt 到对应模块跑)
 *   - 效率提升 10× (50 SKU 不再 50 次手编 prompt)
 *
 * Phase-2 (待做): 真后端任务编排, 自动并行调 wenai 模块, 进度可视化
 */

type Stage = 'discovery' | 'photoshoot' | 'video' | 'abtest' | 'listing' | 'insights';
type Platform = 'amazon' | 'tmall' | 'pdd' | 'tiktok' | 'douyin' | 'xiaohongshu' | 'shopify' | 'mixed';

interface BatchPlan {
  overallStrategy: string;        // 这批 SKU 整体策略
  estimatedTotalCost: string;     // 估算总成本
  estimatedDuration: string;      // 估算总工时
  skuPlans: SkuPlan[];            // 每个 SKU 的详细 SOP
  globalChecklist: string[];      // 全局必做 checklist (合规 / 商标 / AIGC 标识)
  riskFlags: string[];            // 风险预警
}

interface SkuPlan {
  skuName: string;
  category: string;
  positioning: string;            // 定位判断
  stages: StagePlan[];
}

interface StagePlan {
  stage: Stage;
  prompt: string;                 // 推荐 prompt
  params: string;                 // 推荐参数
  expectedOutput: string;         // 预期产出
  estimatedTime: string;          // 单 SKU 在这步的耗时
  checkCriteria: string;          // 验收标准
}

const STAGE_LABELS: Record<Stage, { txt: string; icon: string; href: string }> = {
  discovery: { txt: '选品验证', icon: '🎯', href: '/pipelines/product-discovery' },
  photoshoot: { txt: 'AI 影棚', icon: '🎬', href: '/pipelines/ai-photoshoot' },
  video: { txt: 'AI 视频', icon: '🎞️', href: '/pipelines/ai-video' },
  abtest: { txt: '测款 A-B', icon: '⚗️', href: '/pipelines/ab-test' },
  listing: { txt: '上新流水线', icon: '📋', href: '/pipelines/new-listing' },
  insights: { txt: '数据洞察', icon: '📊', href: '/pipelines/data-insights' },
};

const PLATFORM_LABELS: Record<Platform, string> = {
  amazon: '🟧 Amazon',
  tmall: '🟦 淘宝/天猫',
  pdd: '🟥 拼多多',
  tiktok: '⚡ TikTok Shop',
  douyin: '⚫ 抖音电商',
  xiaohongshu: '🟤 小红书',
  shopify: '⬛ 独立站',
  mixed: '🌐 多渠道',
};

const EXAMPLE_SKUS = `连衣裙 - 女装春季 - 法式茶歇风, 收腰显瘦 - ¥199-299
T 恤 - 女装基础款 - 莫代尔棉, oversize 版型 - ¥69-99
半身裙 - 女装下装 - 复古格纹 A 字裙 - ¥159-199
针织开衫 - 女装外套 - 山羊绒, 慵懒风 - ¥299-399
牛仔裤 - 女装下装 - 高腰直筒, 显腿长 - ¥149-249`;

export default function BatchLaunchPage() {
  const [skuList, setSkuList] = useState('');
  const [platform, setPlatform] = useState<Platform>('mixed');
  const [selectedStages, setSelectedStages] = useState<Stage[]>(['discovery', 'photoshoot', 'abtest', 'listing']);
  const [brandContext, setBrandContext] = useState('');

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BatchPlan | null>(null);
  const [error, setError] = useState('');
  const [rawDebug, setRawDebug] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [openSku, setOpenSku] = useState<number | null>(null);

  const toggleStage = (s: Stage) => {
    setSelectedStages(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const skuCount = skuList.split('\n').filter(l => l.trim()).length;

  const buildPrompt = () => `
你是一个跨境/本土电商 15 年的品牌操盘手 + 项目经理, 帮商家做 ${skuCount} 个 SKU 的批量上架规划。

【商家信息】
- 目标平台: ${PLATFORM_LABELS[platform]}
- 选定工序: ${selectedStages.map(s => STAGE_LABELS[s].txt).join(' → ')}
- 品牌上下文: ${brandContext || '无'}

【SKU 列表 (每行一个)】
${skuList}

【任务】
1. 给整体批次策略 (overallStrategy, 80-150 字, 含品类节奏 / 上架时机 / 资源分配)
2. 估算总成本 + 总耗时 (含 wenai 模块开销)
3. 全局必做 checklist (合规 / 商标 / AIGC 标识 / 平台规则)
4. 风险预警 (供应链 / 平台规则 / 内卷)
5. 对每个 SKU, 在每个选定工序里给:
   - prompt: 该 SKU 在该工序的推荐 prompt (具体, 可直接拷)
   - params: 推荐参数 (尺寸 / 数量 / 比例 / 风格)
   - expectedOutput: 预期产出物
   - estimatedTime: 单 SKU 在这步的预计耗时
   - checkCriteria: 验收硬标准

【硬要求】
- 每个 SKU 的工序 prompt 不能千篇一律, 要根据该 SKU 的细分类目调整
- params 要具体 (1024x1536 / n=2 / quality=medium 这种)
- checkCriteria 要数字化 (CTR > X% / 转化 > Y% 这种)
- 整体策略要给"哪些 SKU 先上, 哪些等"的优先级判断

【输出严格 JSON】
{
  "overallStrategy": "<整体策略>",
  "estimatedTotalCost": "<总成本估算, 例: ¥80-150 (wenai) + 人工 4-6 小时>",
  "estimatedDuration": "<总耗时, 例: 1-2 天能全部上架>",
  "skuPlans": [
    {
      "skuName": "<SKU 名>",
      "category": "<细分类目>",
      "positioning": "<这个 SKU 在这批次中的定位, 30-60 字>",
      "stages": [
        {
          "stage": "discovery | photoshoot | video | abtest | listing | insights",
          "prompt": "<推荐 prompt>",
          "params": "<推荐参数>",
          "expectedOutput": "<预期产出>",
          "estimatedTime": "<耗时>",
          "checkCriteria": "<验收标准>"
        }
      ]
    }
  ],
  "globalChecklist": ["<必做 1>", "<必做 2>", "..."],
  "riskFlags": ["<风险 1>", "<风险 2>"]
}

直接输出 JSON, 不要 markdown 标签, 不要解释。
`.trim();

  const handleRun = async () => {
    if (skuCount < 2) {
      setError('至少 2 个 SKU 才有"批量"意义');
      return;
    }
    if (skuCount > 20) {
      setError('一次最多 20 个 SKU (避免 LLM 输出截断)');
      return;
    }
    if (selectedStages.length === 0) {
      setError('至少选 1 个工序');
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
          moduleId: 'batch-launch',
          prompt: buildPrompt(),
          input: skuList,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      const raw = data.content || '';
      setRawDebug(raw);
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('AI 输出非 JSON');
      const parsed = JSON.parse(m[0]) as BatchPlan;
      if (!parsed.skuPlans || parsed.skuPlans.length === 0) {
        throw new Error('AI 没返回 skuPlans');
      }
      setResult(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setRunning(false);
    }
  };

  const exportMd = () => {
    if (!result) return;
    const lines = [
      `# 多 SKU 批量上架计划`,
      ``,
      `**平台**: ${PLATFORM_LABELS[platform]} · **SKU 数**: ${result.skuPlans.length}`,
      `**预估总成本**: ${result.estimatedTotalCost}`,
      `**预估总耗时**: ${result.estimatedDuration}`,
      ``,
      `## 整体策略`,
      result.overallStrategy,
      ``,
      `## 全局 checklist`,
      ...result.globalChecklist.map(c => `- [ ] ${c}`),
      ``,
      ...(result.riskFlags?.length
        ? [`## ⚠️ 风险预警`, ``, ...result.riskFlags.map(r => `- ${r}`), ``]
        : []),
      `## 每个 SKU 的执行 SOP`,
      ``,
      ...result.skuPlans.flatMap((sku, i) => [
        `### ${i + 1}. ${sku.skuName}`,
        ``,
        `**类目**: ${sku.category}`,
        ``,
        `**定位**: ${sku.positioning}`,
        ``,
        ...sku.stages.flatMap(s => [
          `#### ${STAGE_LABELS[s.stage]?.icon || '·'} ${STAGE_LABELS[s.stage]?.txt || s.stage}`,
          ``,
          `- **prompt**: ${s.prompt}`,
          `- **参数**: ${s.params}`,
          `- **产出**: ${s.expectedOutput}`,
          `- **耗时**: ${s.estimatedTime}`,
          `- **验收**: ${s.checkCriteria}`,
          ``,
        ]),
        `---`,
        ``,
      ]),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wenai-batch-launch-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-bg-root">
      {/* Hero */}
      <div className="border-b border-border-subtle bg-gradient-to-b from-bg-surface/50 to-transparent">
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">
              BATCH LAUNCH · 多 SKU 批量上架
            </span>
            <span className="text-[9px] font-mono text-accent/70 px-2 py-0.5 border border-accent/30 rounded-full">
              工厂模式
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
            50 个 SKU 不再 50 次手动跑 · 一份计划全搞定
          </h1>
          <p className="text-[13px] lg:text-[14px] text-text-secondary leading-relaxed max-w-[820px]">
            把 wenai 现有 10 条 pipeline 串成一条流水线。
            贴你 SKU 列表(每行一个)+ 选工序 + 选平台,
            <span className="text-accent">AI 给每个 SKU 在每个工序的具体 prompt + 参数 + 验收标准</span>,
            导出 markdown SOP,直接拷去对应模块跑。
          </p>
          <button
            onClick={() => { setSkuList(EXAMPLE_SKUS); setPlatform('tmall'); setBrandContext('女装新锐品牌, 主打 25-32 岁都市白领'); }}
            className="text-[11px] font-mono text-accent border border-accent/40 hover:bg-accent/10 rounded px-3 py-1.5 mt-4"
          >
            ⚡ 一键填案例 (5 个女装春季 SKU)
          </button>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
        {/* LEFT */}
        <aside className="lg:sticky lg:top-4 lg:self-start space-y-4">
          <section className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30 space-y-3">
            <div>
              <label className="text-[10px] font-mono text-text-secondary mb-1 block">
                ① SKU 列表 * (每行一个, 推荐格式: 名 - 品类 - 卖点 - 价格)
              </label>
              <textarea
                value={skuList}
                onChange={e => setSkuList(e.target.value)}
                placeholder="连衣裙 - 女装春季 - 法式茶歇风 - ¥199-299&#10;T 恤 - 女装基础款 - 莫代尔棉 - ¥69-99&#10;..."
                rows={9}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[11px] font-mono resize-none leading-relaxed"
              />
              <div className="text-[10px] font-mono text-text-tertiary mt-1 tabular-nums">
                {skuCount} SKU · 上限 20
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-text-secondary mb-1 block">② 目标平台</label>
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
              <label className="text-[10px] font-mono text-text-secondary mb-1.5 block">
                ③ 选工序 (多选)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(STAGE_LABELS) as Stage[]).map(s => {
                  const active = selectedStages.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleStage(s)}
                      className={`text-[10px] font-mono py-2 px-2 rounded transition-colors flex items-center gap-1.5 ${
                        active
                          ? 'bg-accent/15 border border-accent/50 text-accent'
                          : 'border border-border-subtle text-text-secondary hover:border-accent/40'
                      }`}
                    >
                      <span>{STAGE_LABELS[s].icon}</span>
                      <span>{STAGE_LABELS[s].txt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-text-secondary mb-1 block">④ 品牌上下文 (可选)</label>
              <textarea
                value={brandContext}
                onChange={e => setBrandContext(e.target.value)}
                placeholder="例: 女装新锐品牌 / 主打 25-32 岁都市白领 / 客单 ¥150-300"
                rows={2}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] resize-none"
              />
            </div>
          </section>

          <button
            onClick={handleRun}
            disabled={running || skuCount < 2 || selectedStages.length === 0}
            className="w-full py-3.5 bg-accent text-bg-root rounded-lg text-[14px] font-bold hover:bg-accent-hover disabled:opacity-40"
          >
            {running ? '生成中... (15-30 秒)' : `🏭 生成批量计划 · ${skuCount} SKU × ${selectedStages.length} 工序`}
          </button>

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
            Phase 1 · 计划生成器 · 商家拷 prompt 手动跑各模块
            <br/>
            Phase 2 (待做) · 后端任务编排 + 自动并发跑 + 进度看板
          </p>
        </aside>

        {/* RIGHT */}
        <main className="space-y-4 min-h-[600px]">
          {!running && !result && <EmptyState />}

          {running && (
            <div className="border border-accent/40 bg-accent/5 rounded-lg p-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
              <div>
                <div className="text-[13px] font-semibold text-text-primary">在跑批量计划</div>
                <div className="text-[10px] font-mono text-text-tertiary mt-0.5">
                  整体策略 · {skuCount} SKU × {selectedStages.length} 工序 · 全局 checklist
                </div>
              </div>
            </div>
          )}

          {!running && result && (
            <Plan result={result} exportMd={exportMd} openSku={openSku} setOpenSku={setOpenSku} />
          )}
        </main>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-border-default rounded-lg p-8 text-center">
      <div className="text-4xl mb-2">🏭</div>
      <h3 className="text-[16px] font-bold text-text-primary mb-1">把 wenai 当工厂用, 不是单点工具</h3>
      <p className="text-[12px] text-text-tertiary mb-5">
        每个 SKU 在每个工序的 prompt 都不一样, AI 一次性给齐
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
        <Tip emoji="📋" title="一份 SOP 走全程" desc="不再每个 SKU 重新想 prompt" />
        <Tip emoji="✓" title="验收硬标准" desc="每步给 CTR/转化数字阈值" />
        <Tip emoji="⚠️" title="风险/合规预警" desc="批次启动前提醒商标/AIGC 必做项" />
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

function Plan({
  result, exportMd, openSku, setOpenSku,
}: {
  result: BatchPlan;
  exportMd: () => void;
  openSku: number | null;
  setOpenSku: (n: number | null) => void;
}) {
  return (
    <>
      {/* 摘要 */}
      <section className="border border-accent/30 bg-accent/5 rounded-lg p-4 space-y-2">
        <div className="text-[10px] font-mono text-accent uppercase tracking-wider">整体策略</div>
        <p className="text-[13px] text-text-primary leading-relaxed">{result.overallStrategy}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-[12px]">
          <div className="border border-border-subtle rounded p-2 bg-bg-root/30">
            <div className="text-[10px] font-mono text-text-tertiary uppercase">总成本</div>
            <div className="text-text-primary font-semibold mt-0.5">{result.estimatedTotalCost}</div>
          </div>
          <div className="border border-border-subtle rounded p-2 bg-bg-root/30">
            <div className="text-[10px] font-mono text-text-tertiary uppercase">总耗时</div>
            <div className="text-text-primary font-semibold mt-0.5">{result.estimatedDuration}</div>
          </div>
        </div>
      </section>

      {/* 全局 checklist + 风险 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <section className="border border-success/30 bg-success/5 rounded-lg p-4">
          <div className="text-[10px] font-mono text-success uppercase tracking-wider mb-2">
            ✅ 全局必做 checklist
          </div>
          <ul className="space-y-1 text-[12px]">
            {result.globalChecklist.map((c, i) => (
              <li key={i} className="text-text-primary flex items-start gap-1.5">
                <span className="text-success/70">·</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </section>
        {result.riskFlags && result.riskFlags.length > 0 && (
          <section className="border border-error/30 bg-error/5 rounded-lg p-4">
            <div className="text-[10px] font-mono text-error uppercase tracking-wider mb-2">
              ⚠️ 风险预警
            </div>
            <ul className="space-y-1 text-[12px]">
              {result.riskFlags.map((r, i) => (
                <li key={i} className="text-text-primary flex items-start gap-1.5">
                  <span className="text-error/70">·</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-text-primary">
          {result.skuPlans.length} 个 SKU 各自的执行 SOP
        </h2>
        <button
          onClick={exportMd}
          className="text-[11px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded px-3 py-1.5"
        >
          ⬇ 导出完整 SOP (markdown)
        </button>
      </div>

      <div className="space-y-2">
        {result.skuPlans.map((sku, i) => {
          const isOpen = openSku === i;
          return (
            <div key={i} className={`border rounded-lg bg-bg-surface/30 transition-all animate-fade-up stagger-${Math.min(i + 1, 6)} ${isOpen ? 'border-accent/50' : 'border-border-subtle hover:border-accent/30'}`}>
              <button
                onClick={() => setOpenSku(isOpen ? null : i)}
                className="w-full text-left p-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                  <span className="text-[10px] font-mono text-accent">#{i + 1}</span>
                  <h3 className="text-[14px] font-bold text-text-primary truncate">{sku.skuName}</h3>
                  <span className="text-[10px] font-mono text-text-tertiary">{sku.category}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] font-mono text-text-tertiary tabular-nums">
                    {sku.stages.length} 工序
                  </span>
                  <span className="text-text-tertiary text-[14px]">
                    {isOpen ? '−' : '+'}
                  </span>
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-border-subtle p-4 space-y-3">
                  <div className="text-[12px] text-text-secondary leading-relaxed border-l-2 border-accent/40 pl-3">
                    <span className="text-[10px] font-mono text-text-tertiary uppercase mr-2">定位</span>
                    {sku.positioning}
                  </div>
                  {sku.stages.map((s, si) => {
                    const meta = STAGE_LABELS[s.stage];
                    return (
                      <div key={si} className="border border-border-subtle rounded p-3 bg-bg-root/30 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-1.5">
                            <span>{meta?.icon}</span>
                            <span className="text-[12px] font-semibold text-accent">{meta?.txt || s.stage}</span>
                          </div>
                          <Link
                            href={meta?.href || '/'}
                            className="text-[10px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded px-2 py-0.5"
                          >
                            去这模块跑 →
                          </Link>
                        </div>
                        <div className="border-t border-border-subtle pt-1.5 space-y-1">
                          <div>
                            <span className="text-[9px] font-mono text-text-tertiary uppercase mr-2">PROMPT</span>
                            <code className="text-[11px] font-mono text-text-primary block bg-bg-root border border-border-subtle rounded p-2 mt-1 leading-relaxed">
                              {s.prompt}
                            </code>
                          </div>
                          <Row label="参数" value={s.params} />
                          <Row label="产出" value={s.expectedOutput} />
                          <Row label="耗时" value={s.estimatedTime} />
                          <Row label="验收" value={s.checkCriteria} accent />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-[11px]">
      <span className="text-[9px] font-mono text-text-tertiary uppercase mr-2">{label}</span>
      <span className={accent ? 'text-accent font-medium' : 'text-text-secondary'}>{value}</span>
    </div>
  );
}
