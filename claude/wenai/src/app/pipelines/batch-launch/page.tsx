'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMySkus } from '@/lib/use-my-skus';
import { useActiveSkuId } from '@/lib/use-active-sku';
import { ActiveSkuBadge } from '@/components/ActiveSkuBadge';
import { ShareButton } from '@/components/ShareButton';
import { IndustryHint } from '@/components/IndustryHint';
import { buildBatchLaunchStandardPackRoute } from '@/lib/standard-pack-routing';

/**
 * 多 SKU 批量上架 · 把 10 pipelines 串成一条流水线
 *
 * 路由:
 *   ≤ 8 SKU → 走 /api/ai 单次 (快路径, 一次拿全策略+全详情)
 *   > 8 SKU → 走 /api/batch-launch/chunk 分片并发
 *     - chunkType=overall 拿整体策略
 *     - chunkType=plans 每片 6 SKU, 并发 2
 *     - 100 SKU 上限 (从老版 20 上限解锁)
 *
 * 失败容忍: 单片失败不阻塞其他片, riskFlags 里标出来
 */

type Stage = 'discovery' | 'photoshoot' | 'video' | 'social' | 'abtest' | 'listing' | 'insights';
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
  social: { txt: '内容拆解包', icon: '📣', href: '/modules/content' },
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

function buildBatchLaunchResultSummary(result: BatchPlan) {
  const pocReport = buildPocReport(result);
  const skuPreview = result.skuPlans
    .slice(0, 5)
    .map(sku => `${sku.skuName} / ${sku.category} / ${sku.stages.length} stages`)
    .join('\n');

  return [
    `status: ${pocReport.status}`,
    `sku coverage: ${pocReport.skuCount}/10`,
    `stage coverage: ${pocReport.coverage}%`,
    `risk count: ${pocReport.riskCount}`,
    `checklist count: ${pocReport.checklistCount}`,
    `estimated cost: ${result.estimatedTotalCost}`,
    `estimated duration: ${result.estimatedDuration}`,
    `top blockers: ${pocReport.blockers.slice(0, 3).join(' | ')}`,
    skuPreview ? `sku preview:\n${skuPreview}` : '',
  ].filter(Boolean).join('\n');
}

function buildPocReport(result: BatchPlan) {
  const skuCount = result.skuPlans.length;
  const stageCount = result.skuPlans.reduce((sum, sku) => sum + sku.stages.length, 0);
  const riskCount = result.riskFlags?.length || 0;
  const checklistCount = result.globalChecklist?.length || 0;
  const expectedStages = Math.max(1, skuCount) * 3;
  const coverage = Math.min(100, Math.round((stageCount / expectedStages) * 100));
  const status = skuCount >= 10 && riskCount <= 3 ? '可进入正式 POC 复盘' : '需要补齐资料后复盘';
  const blockers: string[] = [];

  if (skuCount < 10) blockers.push(`当前 ${skuCount} 个 SKU, 正式 POC 建议补齐到 10 个真实 SKU`);
  if (riskCount > 3) blockers.push(`当前 ${riskCount} 条风险预警, 需要先确认高风险类目/平台规则/品牌词`);
  if (checklistCount < 3) blockers.push('全局 checklist 偏少, 建议补充合规、素材、投放复评口径');
  if (stageCount < expectedStages) blockers.push('部分 SKU 工序覆盖不足, 建议补齐主图方向、详情页文案、复评动作');
  if (blockers.length === 0) blockers.push('资料结构可用于复盘, 下一步重点看人工终审通过率和返工原因');

  return { skuCount, stageCount, riskCount, checklistCount, coverage, status, blockers };
}

const EXAMPLE_SKUS = `连衣裙 - 女装春季 - 法式茶歇风, 收腰显瘦 - ¥199-299
T 恤 - 女装基础款 - 莫代尔棉, oversize 版型 - ¥69-99
半身裙 - 女装下装 - 复古格纹 A 字裙 - ¥159-199
针织开衫 - 女装外套 - 山羊绒, 慵懒风 - ¥299-399
牛仔裤 - 女装下装 - 高腰直筒, 显腿长 - ¥149-249`;

export default function BatchLaunchPage() {
  const [skuList, setSkuList] = useState('');
  const [demoMode, setDemoMode] = useState(false);

  // 读 SKU 库 · 让用户从已有 SKU 一键导入到批量列表
  const { skus: mySkus } = useMySkus(20);
  const activeSkuId = useActiveSkuId();
  const [pickedSkuIds, setPickedSkuIds] = useState<Set<string>>(new Set());

  const togglePickSku = (id: string) => {
    setPickedSkuIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const importPickedSkus = () => {
    const picked = mySkus.filter(s => pickedSkuIds.has(s.id));
    if (picked.length === 0) return;
    const lines = picked.map(s =>
      `${s.name} - ${s.category}${s.priceCny ? ' - ' + s.priceCny : ''}${s.notes ? ' - ' + s.notes.slice(0, 60) : ''}`
    );
    const merged = skuList ? skuList + '\n' + lines.join('\n') : lines.join('\n');
    setSkuList(merged);
    setPickedSkuIds(new Set());
  };
  const [platform, setPlatform] = useState<Platform>('mixed');
  const [selectedStages, setSelectedStages] = useState<Stage[]>(['discovery', 'photoshoot', 'listing', 'social', 'abtest']);
  const [brandContext, setBrandContext] = useState('');

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BatchPlan | null>(null);
  const [error, setError] = useState('');
  const [rawDebug, setRawDebug] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [openSku, setOpenSku] = useState<number | null>(null);
  // 分片进度 · 100 SKU 上限新逻辑
  const [progress, setProgress] = useState<{ done: number; total: number; phase: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') !== '1') return;

    setDemoMode(true);
    setSkuList(EXAMPLE_SKUS);
    setPlatform('shopify');
    setBrandContext('女装新锐品牌, 主打 25-32 岁都市白领, 计划先用 5 个 SKU 验证上新素材包与复评节奏');
  }, []);

  const toggleStage = (s: Stage) => {
    setSelectedStages(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const skuCount = skuList.split('\n').filter(l => l.trim()).length;
  const draftStandardPackHref = buildBatchLaunchStandardPackRoute({
    platformLabel: PLATFORM_LABELS[platform],
    brandContext,
    skuInput: skuList || EXAMPLE_SKUS,
    skuCount: skuCount || 10,
    stages: selectedStages.map(s => STAGE_LABELS[s].txt),
  });

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
- 如果 stage=social, 必须按 benchmark-to-campaign 结构输出: 产品读图、搜索地图、benchmark 方向、Audience/Product/Context/Hook/Timeline/CTA 拆解模板、产品改编脚本、素材 manifest、7 天测试排期和复盘指标
- 如果没有真实参考链接, social 的 checkCriteria 必须标注"待补 benchmark URL / 竞品账号 / 真实评论证据", 不能伪装成已调研

【输出严格 JSON】
{
  "overallStrategy": "<整体策略>",
  "estimatedTotalCost": "<总成本估算, 例: ¥80-150 (wenai) + 人工 4-6 小时>",
  "estimatedDuration": "<预计准备周期, 例: 1-2 天完成候选物料, 上架需人工确认>",
  "skuPlans": [
    {
      "skuName": "<SKU 名>",
      "category": "<细分类目>",
      "positioning": "<这个 SKU 在这批次中的定位, 30-60 字>",
      "stages": [
        {
          "stage": "discovery | photoshoot | video | social | abtest | listing | insights",
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
    if (skuCount > 100) {
      setError('一次最多 100 个 SKU (再多建议拆批次)');
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
    setProgress(null);

    const skuLines = skuList.split('\n').map(l => l.trim()).filter(Boolean);

    try {
      // ≤ 8 SKU 走快路径 (单次 LLM, 一次拿全)
      if (skuLines.length <= 8) {
        await runFastPath();
      } else {
        await runChunkedPath(skuLines);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setRunning(false);
      setProgress(null);
    }
  };

  // 快路径 · ≤8 SKU 一次性出全
  const runFastPath = async () => {
    setProgress({ done: 0, total: 1, phase: '生成完整计划...' });
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moduleId: 'batch-launch',
        prompt: buildPrompt(),
        input: skuList,
        skuId: activeSkuId,
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
    setProgress({ done: 1, total: 1, phase: '完成' });
    setResult(parsed);
  };

  // 分片路径 · >8 SKU 拆 chunk 并发
  const runChunkedPath = async (skuLines: string[]) => {
    const CHUNK_SIZE = 6;
    const CONCURRENCY = 2;

    const chunks: string[][] = [];
    for (let i = 0; i < skuLines.length; i += CHUNK_SIZE) {
      chunks.push(skuLines.slice(i, i + CHUNK_SIZE));
    }

    const totalSteps = 1 + chunks.length; // 1 个 overall + N 个 plan chunks
    let doneSteps = 0;
    const bumpProgress = (phase: string) => {
      doneSteps++;
      setProgress({ done: doneSteps, total: totalSteps, phase });
    };

    setProgress({ done: 0, total: totalSteps, phase: `准备分 ${chunks.length} 片处理 ${skuLines.length} SKU...` });

    // Step 1: overall
    const overallRes = await fetch('/api/batch-launch/chunk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chunkType: 'overall',
        skus: skuLines.slice(0, 3), // 给 LLM 一点 sample 但 totalCount 才是真总数
        stages: selectedStages,
        platform,
        brandContext,
        totalCount: skuLines.length,
        skuId: activeSkuId,
      }),
    });
    const overallData = await overallRes.json();
    if (!overallRes.ok) throw new Error(overallData.error || `Overall ${overallRes.status}`);
    const overall = overallData.result as {
      overallStrategy: string;
      estimatedTotalCost: string;
      estimatedDuration: string;
      globalChecklist: string[];
      riskFlags: string[];
    };
    bumpProgress(`整体策略 ✓ · 开始 ${chunks.length} 片 SKU 详情`);

    // Step 2: plans · 并发 CONCURRENCY
    const allPlans: SkuPlan[] = [];
    let cursor = 0;
    const errors: string[] = [];

    const runOne = async (chunkIdx: number) => {
      const chunk = chunks[chunkIdx];
      try {
        const res = await fetch('/api/batch-launch/chunk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chunkType: 'plans',
            skus: chunk,
            stages: selectedStages,
            platform,
            brandContext,
            totalCount: skuLines.length,
            skuId: activeSkuId,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          errors.push(`片 ${chunkIdx + 1}: ${data.error || res.status}`);
          return;
        }
        const plans = (data.result?.skuPlans || []) as SkuPlan[];
        allPlans.push(...plans);
      } catch (err) {
        errors.push(`片 ${chunkIdx + 1}: ${err instanceof Error ? err.message : 'fail'}`);
      } finally {
        bumpProgress(`SKU 详情 ${allPlans.length}/${skuLines.length}`);
      }
    };

    // worker pool
    const workers: Promise<void>[] = [];
    const next = async (): Promise<void> => {
      while (cursor < chunks.length) {
        const idx = cursor++;
        await runOne(idx);
      }
    };
    for (let i = 0; i < Math.min(CONCURRENCY, chunks.length); i++) {
      workers.push(next());
    }
    await Promise.all(workers);

    if (allPlans.length === 0) {
      throw new Error(`所有分片都失败: ${errors.join(' / ')}`);
    }

    // 合成完整 BatchPlan
    const merged: BatchPlan = {
      overallStrategy: overall.overallStrategy,
      estimatedTotalCost: overall.estimatedTotalCost,
      estimatedDuration: overall.estimatedDuration,
      globalChecklist: overall.globalChecklist,
      riskFlags: errors.length > 0
        ? [...(overall.riskFlags || []), `⚠️ ${errors.length} 个分片失败 (有部分 SKU 缺失): ${errors.slice(0, 2).join(' · ')}`]
        : overall.riskFlags,
      skuPlans: allPlans,
    };
    setResult(merged);
  };

  const exportMd = () => {
    if (!result) return;
    const pocReport = buildPocReport(result);
    const lines = [
      `# wenai 10 SKU POC 验收包`,
      ``,
      `**平台**: ${PLATFORM_LABELS[platform]} · **SKU 数**: ${result.skuPlans.length}`,
      `**预估总成本**: ${result.estimatedTotalCost}`,
      `**预估总耗时**: ${result.estimatedDuration}`,
      ``,
      `## 01 老板版结论`,
      ``,
      `**状态**: ${pocReport.status}`,
      ``,
      `| 指标 | 结果 | 验收口径 |`,
      `| --- | ---: | --- |`,
      `| SKU 覆盖 | ${pocReport.skuCount}/10 | 正式 POC 建议 10 个真实 SKU |`,
      `| 工序覆盖 | ${pocReport.coverage}% | 主图方向、详情页文案、合规提醒、客服话术、复评动作至少覆盖 3 项 |`,
      `| 风险项 | ${pocReport.riskCount} | 超过 3 项需要先补资料或人工终审 |`,
      `| Checklist | ${pocReport.checklistCount} | 少于 3 项说明交付包还不够可执行 |`,
      ``,
      `## 02 复盘结论 / 待补资料`,
      ``,
      ...pocReport.blockers.map(item => `- ${item}`),
      ``,
      `## 03 POC 交付包目录`,
      ``,
      `- 01_SKU简报.md`,
      `- 02_主图方向与场景Prompt.md`,
      `- 03_详情页文案与卖点.md`,
      `- 04_合规与商标风险.md`,
      `- 05_客服话术.md`,
      `- 06_30天复评Checklist.md`,
      `- 07_内容拆解与增长测试包.md`,
      ``,
      `## 04 人工终审边界`,
      ``,
      `- 商标、品牌词、平台规则、功效承诺必须人工确认。`,
      `- 食品、儿童、医疗、美妆功效等高风险类目必须保留法务/运营终审。`,
      `- AI 输出用于减少整理和返工, 不替代最终上架责任人。`,
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
    a.download = `wenai-poc-acceptance-pack-${new Date().toISOString().slice(0, 10)}.md`;
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
            10 个 SKU 不只上新 · 还要带内容拆解和复盘
            <ActiveSkuBadge skuId={activeSkuId} />
          </h1>
          <div className="mb-3"><IndustryHint /></div>
          {demoMode && (
            <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-[11px] font-mono text-accent">
              Demo 已预填 5 个样例 SKU · 直接点生成可查看完整上新 SOP
            </div>
          )}
          <p className="text-[13px] lg:text-[14px] text-text-secondary leading-relaxed max-w-[820px]">
            把 wenai 现有 10 条 pipeline 串成一条流水线。
            贴你 SKU 列表(每行一个)+ 选工序 + 选平台,
            <span className="text-accent">AI 给每个 SKU 在每个工序的具体 prompt + 参数 + 验收标准</span>,
            同时补上 benchmark-to-campaign 内容拆解包,导出 POC 验收材料。
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
          {/* SKU 库导入 · 飞轮读侧 */}
          {mySkus.length > 0 && (
            <section className="border border-cat-content/30 bg-cat-content/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-cat-content uppercase tracking-wider">
                    📦 从我的 SKU 库导入
                  </span>
                  <span className="text-[9px] font-mono text-text-tertiary tabular-nums">
                    {mySkus.length} 条
                  </span>
                </div>
                {pickedSkuIds.size > 0 && (
                  <button
                    onClick={importPickedSkus}
                    className="text-[10px] font-mono px-2 py-0.5 bg-cat-content text-bg-root rounded hover:opacity-90"
                  >
                    导入选中 {pickedSkuIds.size} 条 →
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1 max-h-[110px] overflow-y-auto">
                {mySkus.map(s => {
                  const picked = pickedSkuIds.has(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => togglePickSku(s.id)}
                      className={`text-[10px] font-mono rounded px-1.5 py-0.5 transition-colors ${
                        picked
                          ? 'bg-cat-content text-bg-root'
                          : 'border border-cat-content/30 text-cat-content hover:bg-cat-content/10'
                      }`}
                      title={`${s.category} · ${s.status}`}
                    >
                      {picked ? '✓ ' : ''}{s.name.length > 14 ? s.name.slice(0, 14) + '…' : s.name}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

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
              <div className="text-[10px] font-mono text-text-tertiary mt-1 tabular-nums flex items-center gap-2 flex-wrap">
                <span>{skuCount} SKU · 上限 100</span>
                {skuCount > 8 && (
                  <span className="text-accent">
                    · 分片模式 ({Math.ceil(skuCount / 6)} 片 × 6 SKU, 并发 2)
                  </span>
                )}
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

          <Link
            href={draftStandardPackHref}
            className="block w-full text-center py-2.5 border border-accent/35 text-accent rounded-lg text-[12px] font-mono hover:bg-accent/10"
          >
            先生成 SOP 标品包 →
          </Link>

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
            ≤ 8 SKU · 单次出全 (~15s)
            <br/>
            &gt; 8 SKU · 自动分片并发 · 100 SKU 上限 (~1min 全做完)
            <br/>
            <span className="text-accent">商家拷 prompt 手动跑各模块, 或点 SKU 卡片直跳到对应 wenai 模块</span>
          </p>
        </aside>

        {/* RIGHT */}
        <main className="space-y-4 min-h-[600px]">
          {!running && !result && <EmptyState />}

          {running && (
            <div className="border border-accent/40 bg-accent/5 rounded-lg p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-text-primary">
                    {progress?.phase || '在跑批量计划'}
                  </div>
                  <div className="text-[10px] font-mono text-text-tertiary mt-0.5">
                    {skuCount} SKU × {selectedStages.length} 工序 · {skuCount > 8 ? '分片并发模式' : '快路径单次模式'}
                  </div>
                </div>
                {progress && (
                  <div className="text-[11px] font-mono text-accent tabular-nums">
                    {progress.done}/{progress.total}
                  </div>
                )}
              </div>
              {progress && progress.total > 1 && (
                <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${(progress.done / progress.total) * 100}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {!running && result && (
            <Plan
              result={result}
              exportMd={exportMd}
              openSku={openSku}
              setOpenSku={setOpenSku}
              platform={platform}
              brandContext={brandContext}
            />
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
        <Tip emoji="📣" title="内容拆解包" desc="产品读图 / benchmark 拆解 / 脚本改编 / 素材 manifest / 7 天测试" />
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
  result, exportMd, openSku, setOpenSku, platform, brandContext,
}: {
  result: BatchPlan;
  exportMd: () => void;
  openSku: number | null;
  setOpenSku: (n: number | null) => void;
  platform: Platform;
  brandContext: string;
}) {
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [saveErr, setSaveErr] = useState('');
  const stageCount = result.skuPlans.reduce((sum, sku) => sum + sku.stages.length, 0);
  const pocReport = buildPocReport(result);
  const standardPackHref = buildBatchLaunchStandardPackRoute({
    platformLabel: PLATFORM_LABELS[platform],
    brandContext,
    skuInput: result.skuPlans.map(sku => `${sku.skuName} - ${sku.category} - ${sku.positioning}`).join('\n'),
    skuCount: result.skuPlans.length,
    stages: Array.from(new Set(result.skuPlans.flatMap(sku => sku.stages.map(stage => STAGE_LABELS[stage.stage]?.txt || stage.stage)))),
    resultSummary: buildBatchLaunchResultSummary(result),
  });

  const saveAllToLibrary = async () => {
    setSaving(true);
    setSaveErr('');
    let ok = 0;
    const errs: string[] = [];
    // 串行 (不要并发淹 Redis)
    for (const sku of result.skuPlans) {
      try {
        const res = await fetch('/api/user/sku-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: sku.skuName,
            category: sku.category,
            platform,
            status: 'idea',
            notes: sku.positioning,
            modules: ['batch-launch'],
          }),
        });
        if (res.ok) ok++;
        else errs.push(`${sku.skuName}: ${res.status}`);
      } catch (err) {
        errs.push(`${sku.skuName}: ${err instanceof Error ? err.message : 'fail'}`);
      }
    }
    setSavedCount(ok);
    setSaving(false);
    if (errs.length > 0) setSaveErr(`${errs.length} 失败 (前 2): ${errs.slice(0, 2).join(' / ')}`);
  };

  return (
    <>
      {/* 摘要 */}
      <section className="border border-accent/30 bg-accent/5 rounded-lg p-4 space-y-2">
        <div className="text-[10px] font-mono text-accent uppercase tracking-wider">整体策略</div>
        <p className="text-[13px] text-text-primary leading-relaxed">{result.overallStrategy}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-[12px]">
          <div className="border border-border-subtle rounded p-2 bg-bg-root/30">
            <div className="text-[10px] font-mono text-text-tertiary uppercase">SKU</div>
            <div className="text-text-primary font-semibold mt-0.5">{result.skuPlans.length} 个</div>
          </div>
          <div className="border border-border-subtle rounded p-2 bg-bg-root/30">
            <div className="text-[10px] font-mono text-text-tertiary uppercase">工序</div>
            <div className="text-text-primary font-semibold mt-0.5">{stageCount} 项</div>
          </div>
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

      <section className="border border-cat-strategy/40 rounded-lg bg-cat-strategy/5 p-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono text-cat-strategy uppercase tracking-wider mb-1">
              POC 验收报告
            </div>
            <h2 className="text-[18px] font-bold text-text-primary mb-2 font-[family-name:var(--font-outfit)]">
              {pocReport.status}
            </h2>
            <p className="text-[12px] text-text-secondary leading-relaxed max-w-[720px]">
              这不是最终上架承诺, 是给负责人判断是否进入主站合同/支付流程的复盘材料。
              重点看 SKU 输入是否完整、工序是否覆盖、风险是否可终审、30 天复评是否有负责人。
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:min-w-[420px]">
            {[
              ['SKU 覆盖', `${pocReport.skuCount}/10`],
              ['工序覆盖', `${pocReport.coverage}%`],
              ['风险项', `${pocReport.riskCount}`],
              ['Checklist', `${pocReport.checklistCount}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-border-subtle bg-bg-root/40 p-3">
                <div className="text-[10px] font-mono text-text-tertiary uppercase">{label}</div>
                <div className="mt-1 text-lg font-bold text-text-primary font-mono tabular-nums">{value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 border-t border-border-subtle pt-3">
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
            复盘结论 / 待补资料
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {pocReport.blockers.map((item) => (
              <li key={item} className="text-[12px] text-text-primary flex items-start gap-2 rounded border border-border-subtle bg-bg-root/30 p-2">
                <span className="text-cat-strategy mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border border-border-subtle rounded-lg p-4 bg-bg-surface/40">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
          POC 交付包摘要
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            ['上新 SOP', `${result.skuPlans.length} 个 SKU 各自的执行路径`],
            ['Prompt 包', `${stageCount} 条可复制 prompt / 参数`],
            ['验收标准', '每个工序都有人工终审口径'],
            ['复盘输入', '可导出给运营和负责人评估'],
          ].map(([title, body]) => (
            <div key={title} className="border border-border-subtle rounded p-3 bg-bg-root/30">
              <div className="text-[11px] font-semibold text-text-primary mb-1">{title}</div>
              <div className="text-[11px] text-text-secondary leading-relaxed">{body}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-accent/40 rounded-lg p-4 bg-accent/10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-1">
            下一步 · 跑真实 SKU
          </div>
          <p className="text-[13px] text-text-primary font-semibold mb-1">
            这份样例看懂后, 用 10 个真实 SKU 验证是否值得接入。
          </p>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            准备 SKU 名称、品类、卖点、价格带、目标平台和现有商品图。POC 会重点看返工减少、人工终审通过率和 30 天复评节奏。
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
          <Link
            href={`/inquire?from=batch-launch-result&skuCount=${result.skuPlans.length}&platform=${platform}`}
            className="px-4 py-2 bg-accent text-bg-root rounded-md text-[12px] font-semibold hover:bg-accent-hover"
          >
            提交 10 SKU POC →
          </Link>
          <Link
            href={standardPackHref}
            className="px-4 py-2 border border-accent/40 text-accent rounded-md text-[12px] font-mono hover:bg-accent/10"
          >
            生成复盘标品包
          </Link>
          <Link
            href="/pricing#poc"
            className="px-4 py-2 border border-accent/40 text-accent rounded-md text-[12px] font-mono hover:bg-accent/10"
          >
            看验收标准
          </Link>
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

      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-[14px] font-bold text-text-primary">
          {result.skuPlans.length} 个 SKU 各自的执行 SOP
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          {savedCount === 0 ? (
            <button
              onClick={saveAllToLibrary}
              disabled={saving}
              className="text-[11px] font-mono text-cat-content border border-cat-content/40 hover:bg-cat-content/10 rounded px-3 py-1.5 disabled:opacity-40"
              title="存入 SKU 库后每个 SKU 都能在选品/测款/数据洞察里被引用"
            >
              {saving ? `存入中 ${savedCount}/${result.skuPlans.length}...` : `📦 存入 SKU 库 (${result.skuPlans.length})`}
            </button>
          ) : (
            <span className="text-[11px] font-mono text-success">
              ✓ 已存入 {savedCount} 个 SKU · <Link href="/me/skus" className="underline hover:text-accent">查看 →</Link>
            </span>
          )}
          <button
            onClick={exportMd}
            className="text-[11px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded px-3 py-1.5"
          >
            ⬇ 导出 POC 验收包
          </button>
          <ShareButton
            buildPayload={() => ({
              moduleId: 'batch-launch',
              title: `批量上架 SOP · ${result.skuPlans.length} SKU × ${PLATFORM_LABELS[platform]}`,
              content: buildBatchShareMd(result, platform),
              source: 'module' as const,
            })}
          />
        </div>
      </div>
      {saveErr && (
        <div className="text-[10px] text-error">{saveErr}</div>
      )}

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

function buildBatchShareMd(result: BatchPlan, platform: Platform): string {
  const pocReport = buildPocReport(result);
  const lines: string[] = [];
  lines.push(`# ${result.skuPlans.length} SKU 批量上架 SOP · ${PLATFORM_LABELS[platform]}`);
  lines.push('');
  lines.push(`**预估总成本**: ${result.estimatedTotalCost} · **预估总耗时**: ${result.estimatedDuration}`);
  lines.push('');
  lines.push('## POC 验收报告');
  lines.push('');
  lines.push(`**状态**: ${pocReport.status}`);
  lines.push(`**SKU 覆盖**: ${pocReport.skuCount}/10 · **工序覆盖**: ${pocReport.coverage}% · **风险项**: ${pocReport.riskCount} · **Checklist**: ${pocReport.checklistCount}`);
  lines.push('');
  lines.push('### 复盘结论 / 待补资料');
  pocReport.blockers.forEach(item => lines.push(`- ${item}`));
  lines.push('');
  lines.push('## POC 交付包目录');
  lines.push('');
  lines.push('- 01_SKU简报.md');
  lines.push('- 02_主图方向与场景Prompt.md');
  lines.push('- 03_详情页文案与卖点.md');
  lines.push('- 04_合规与商标风险.md');
  lines.push('- 05_客服话术.md');
  lines.push('- 06_30天复评Checklist.md');
  lines.push('- 07_内容拆解与增长测试包.md');
  lines.push('');
  lines.push('## 人工终审边界');
  lines.push('');
  lines.push('- 商标、品牌词、平台规则、功效承诺必须人工确认。');
  lines.push('- 食品、儿童、医疗、美妆功效等高风险类目必须保留法务/运营终审。');
  lines.push('- AI 输出用于减少整理和返工, 不替代最终上架责任人。');
  lines.push('');
  lines.push('## 整体策略');
  lines.push('');
  lines.push(result.overallStrategy);
  lines.push('');
  lines.push('## 全局必做 checklist');
  result.globalChecklist.forEach(c => lines.push(`- [ ] ${c}`));
  lines.push('');
  if (result.riskFlags?.length) {
    lines.push('## ⚠️ 风险预警');
    result.riskFlags.forEach(r => lines.push(`- ${r}`));
    lines.push('');
  }
  lines.push(`## ${result.skuPlans.length} 个 SKU 各自的 SOP`);
  lines.push('');
  result.skuPlans.forEach((sku, i) => {
    lines.push(`### ${i + 1}. ${sku.skuName} (${sku.category})`);
    lines.push('');
    lines.push(`**定位**: ${sku.positioning}`);
    lines.push('');
    sku.stages.forEach(s => {
      lines.push(`#### ${STAGE_LABELS[s.stage]?.icon || ''} ${STAGE_LABELS[s.stage]?.txt || s.stage}`);
      lines.push(`- prompt: ${s.prompt}`);
      lines.push(`- 参数: ${s.params}`);
      lines.push(`- 产出: ${s.expectedOutput}`);
      lines.push(`- 耗时: ${s.estimatedTime}`);
      lines.push(`- 验收: ${s.checkCriteria}`);
      lines.push('');
    });
    lines.push('---');
    lines.push('');
  });
  lines.push('');
  lines.push('下一步: 准备 10 个真实 SKU, 通过 wenai 子站提交 POC 需求, 再进入主站合同/支付流程。');
  lines.push('');
  lines.push('*由 wenai SKU 上新物料包演示流程生成 · 演示入口: /demo*');
  return lines.join('\n');
}
