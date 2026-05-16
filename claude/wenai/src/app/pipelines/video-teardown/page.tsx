'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useActiveSkuId } from '@/lib/use-active-sku';
import { ActiveSkuBadge } from '@/components/ActiveSkuBadge';
import { useMySkus } from '@/lib/use-my-skus';
import { assessClientFile } from '@/lib/client-file-guard';
import { ShareButton } from '@/components/ShareButton';
import { buildVideoTeardownStandardPackRoute } from '@/lib/standard-pack-routing';

/**
 * 高转化视频结构拆解 · /pipelines/video-teardown
 * 借鉴 clico/worker/workers/analysis.worker.ts 的 storyboard schema 简化版
 *
 * 用户流程:
 *   1. 自己从 TikTok/抖音/小红书 下载视频 (或者用浏览器扩展)
 *   2. 上传 mp4 (≤8MB,≤30s)
 *   3. 输入"我的产品" hint
 *   4. Gemini 2.5 Flash 拆出 storyboard
 *   5. 每个 scene 的 prompt 可带到 AI 影棚生成候选图
 */

interface Scene {
  index: number;
  description: string;
  duration_seconds: number;
  caption_text: string;
  prompt: string;
}

interface Storyboard {
  hook_type: 'question' | 'statement' | 'demo' | 'story' | 'shock';
  scene_count: number;
  pacing: 'fast' | 'medium' | 'slow';
  cta_position: 'early' | 'middle' | 'end';
  emotional_arc: string[];
  scenes: Scene[];
}

interface TeardownResult {
  ok: boolean;
  storyboard: Storyboard;
  usage?: { promptTokenCount?: number; candidatesTokenCount?: number };
  costUsd: number | null;
  model: string;
  fromCache?: boolean;
  contentHash?: string;
}

// 行业高转化模板 · 让没有视频上传经验的商家也能跑起来
// 选一个模板会预填 productHint, 引导他们参考结构并生成差异化脚本
const INDUSTRY_TEMPLATES: { id: string; emoji: string; title: string; subtitle: string; hint: string }[] = [
  {
    id: 'beauty',
    emoji: '💄',
    title: '美妆护肤',
    subtitle: '使用前后对比 + 慢镜质感',
    hint: '我的产品是 [品类], 主打 [核心卖点]。请把原视频中的产品换成我的, 强化"使用前后"对比, 镜头语言保持原视频的特写+慢镜节奏。',
  },
  {
    id: 'home',
    emoji: '🏠',
    title: '家居生活',
    subtitle: '场景沉浸 + 痛点演示',
    hint: '我的产品是 [家居物件], 解决 [具体痛点]。参考原视频的家居场景节奏, 重新设计主体产品呈现, 保留"问题→产品出现→生活变好"的叙事结构。',
  },
  {
    id: 'food',
    emoji: '🥘',
    title: '食品零食',
    subtitle: 'ASMR 特写 + 满足感',
    hint: '我的产品是 [食品/零食], 主打 [口感/原料/场景]。参考原视频的近景特写和 ASMR 节奏, 为我的产品重新设计拆封/品尝镜头。',
  },
  {
    id: 'fashion',
    emoji: '👗',
    title: '服饰穿搭',
    subtitle: '一秒变装 + 多场景',
    hint: '我的产品是 [服饰品类], 风格 [都市/田园/学院/法式]。参考"快速换装/多场景"结构, 为我的服饰重新设计转场和场景。',
  },
  {
    id: '3c',
    emoji: '📱',
    title: '3C 数码',
    subtitle: '上手开箱 + 参数对比',
    hint: '我的产品是 [3C 品类], 卖点是 [参数/功能差异]。参考原视频的开箱流程, 重新设计我的产品参数特写和节奏。',
  },
  {
    id: 'pet',
    emoji: '🐶',
    title: '宠物用品',
    subtitle: '萌宠互动 + 治愈感',
    hint: '我的产品是 [宠物品类], 解决 [喂养/出行/健康] 痛点。参考萌宠互动场景, 为我的产品重新设计互动镜头。',
  },
];

const HOOK_LABEL: Record<Storyboard['hook_type'], { txt: string; tip: string }> = {
  question: { txt: '❓ 提问钩子', tip: '开头一句反问拉用户思考' },
  statement: { txt: '📢 陈述钩子', tip: '直接抛结论制造好奇' },
  demo: { txt: '🎬 展示钩子', tip: '上来就秀视觉冲击' },
  story: { txt: '📖 故事钩子', tip: '叙述带情绪代入' },
  shock: { txt: '⚡ 震惊钩子', tip: '反常识/反预期开局' },
};
const PACING_LABEL: Record<Storyboard['pacing'], string> = {
  fast: '⚡ 快节奏 (<3s/镜头)',
  medium: '🚶 中节奏 (3-6s)',
  slow: '🐢 慢节奏 (>6s)',
};
const CTA_LABEL: Record<Storyboard['cta_position'], string> = {
  early: '前置 CTA (3 秒内)',
  middle: '中段 CTA',
  end: '结尾 CTA',
};

function buildVideoTeardownResultSummary(result: TeardownResult): string {
  const sb = result.storyboard;
  const sceneLines = sb.scenes.slice(0, 5).map((scene, index) => {
    const caption = scene.caption_text ? ` / caption: ${scene.caption_text}` : '';
    return `scene ${index + 1}: ${scene.duration_seconds.toFixed(1)}s / ${scene.description}${caption} / prompt: ${scene.prompt}`;
  });

  return [
    `hook: ${HOOK_LABEL[sb.hook_type].txt}`,
    `pacing: ${PACING_LABEL[sb.pacing]}`,
    `CTA: ${CTA_LABEL[sb.cta_position]}`,
    `scene count: ${sb.scene_count}`,
    `emotional arc: ${sb.emotional_arc.join(' -> ')}`,
    result.fromCache ? 'cost: cache hit' : result.costUsd !== null ? `cost: $${result.costUsd.toFixed(4)} / model: ${result.model}` : `model: ${result.model}`,
    ...sceneLines,
  ].join('\n');
}

export default function VideoTeardownPage() {
  const activeSkuId = useActiveSkuId();
  const { skus: mySkus } = useMySkus(20);

  const [videoBase64, setVideoBase64] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoSize, setVideoSize] = useState<number>(0);
  const [productHint, setProductHint] = useState('');
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<TeardownResult | null>(null);
  const [error, setError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [savedSkuId, setSavedSkuId] = useState<string | null>(null);
  const [savingToSku, setSavingToSku] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const activeTemplateLabel = activeTemplate ? INDUSTRY_TEMPLATES.find(t => t.id === activeTemplate)?.title : undefined;
  const preRunStandardPackHref = buildVideoTeardownStandardPackRoute({
    productHint,
    templateLabel: activeTemplateLabel,
    videoContext: videoBase64
      ? `uploaded reference video ${(videoSize / 1024 / 1024).toFixed(2)}MB`
      : 'reference video not uploaded yet',
  });
  const resultStandardPackHref = result
    ? buildVideoTeardownStandardPackRoute({
        productHint,
        templateLabel: activeTemplateLabel,
        videoContext: videoSize ? `uploaded reference video ${(videoSize / 1024 / 1024).toFixed(2)}MB` : undefined,
        resultSummary: buildVideoTeardownResultSummary(result),
      })
    : undefined;

  const pickTemplate = (id: string) => {
    const t = INDUSTRY_TEMPLATES.find(x => x.id === id);
    if (!t) return;
    setActiveTemplate(id);
    if (!productHint.trim()) {
      setProductHint(t.hint);
    }
  };

  const pickFromSku = (skuId: string) => {
    const sku = mySkus.find(s => s.id === skuId);
    if (!sku) return;
    const hint = `我的产品是 "${sku.name}" (品类: ${sku.category}${sku.priceCny ? ', 价位 ' + sku.priceCny : ''})${sku.notes ? '。卖点: ' + sku.notes.slice(0, 100) : ''}。请参考原视频的节奏和钩子, 为我的产品生成差异化脚本。`;
    setProductHint(hint);
  };

  const handleFile = (file: File) => {
    const guard = assessClientFile(file, {
      kind: 'video',
      largeBytes: 5 * 1024 * 1024,
      hardBytes: 8 * 1024 * 1024,
      allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    });
    if (guard.message) setError(guard.message);
    if (!guard.ok) {
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      setVideoBase64(result);
      setVideoPreview(result);
      setVideoSize(file.size);
      if (!guard.shouldOptimize) setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleTeardown = async () => {
    if (!videoBase64) {
      setError('先上传视频');
      return;
    }
    setRunning(true);
    setError('');
    setResult(null);
    setSavedSkuId(null);

    try {
      const res = await fetch('/api/video-teardown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoBase64,
          productHint: productHint.trim() || undefined,
          skuId: activeSkuId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setResult(data as TeardownResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : '拆解失败');
    } finally {
      setRunning(false);
    }
  };

  const saveToSkuLibrary = async () => {
    if (!result) return;
    setSavingToSku(true);
    try {
      const sb = result.storyboard;
      const name = activeTemplate
        ? `${INDUSTRY_TEMPLATES.find(t => t.id === activeTemplate)?.title} 视频结构蓝图 ${new Date().toLocaleDateString('zh-CN')}`
        : `视频拆解 ${new Date().toLocaleDateString('zh-CN')}`;
      const notes = `钩子: ${HOOK_LABEL[sb.hook_type].txt} · 节奏: ${PACING_LABEL[sb.pacing]} · CTA: ${CTA_LABEL[sb.cta_position]} · ${sb.scenes.length} 镜头\n\n${productHint.slice(0, 200)}`;
      const res = await fetch('/api/user/sku-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category: activeTemplate ? INDUSTRY_TEMPLATES.find(t => t.id === activeTemplate)?.title : '视频蓝图',
          status: 'idea',
          notes,
          modules: ['video-teardown'],
        }),
      });
      const data = await res.json();
      if (data.ok && data.sku?.id) {
        setSavedSkuId(data.sku.id);
      }
    } catch (err) {
      console.error('save sku failed', err);
    } finally {
      setSavingToSku(false);
    }
  };

  const copyPrompt = async (idx: number, prompt: string) => {
    await navigator.clipboard.writeText(prompt);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const exportJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result.storyboard, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wenai-teardown-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 公开分享 markdown 构造 · 共享 ShareButton 组件统一 UI
  const buildShareMarkdown = (): string => {
    if (!result) return '';
    const sb = result.storyboard;
    const lines: string[] = [];
    lines.push(`# 高转化视频结构拆解 · ${sb.scene_count} 个镜头`);
    lines.push('');
    lines.push(`**钩子**: ${HOOK_LABEL[sb.hook_type].txt} · ${HOOK_LABEL[sb.hook_type].tip}`);
    lines.push(`**节奏**: ${PACING_LABEL[sb.pacing]}`);
    lines.push(`**CTA 位置**: ${CTA_LABEL[sb.cta_position]}`);
    lines.push(`**情绪曲线**: ${sb.emotional_arc.join(' → ')}`);
    lines.push('');
    lines.push('---');
    lines.push('');
    sb.scenes.forEach((s, i) => {
      lines.push(`## 镜头 ${i + 1} · ${s.duration_seconds.toFixed(1)}s${sb.emotional_arc[i] ? ` · ${sb.emotional_arc[i]}` : ''}`);
      lines.push('');
      lines.push(s.description);
      lines.push('');
      if (s.caption_text) {
        lines.push(`> 字幕/口播: ${s.caption_text}`);
        lines.push('');
      }
      lines.push('**图像 prompt**:');
      lines.push('');
      lines.push('```');
      lines.push(s.prompt);
      lines.push('```');
      lines.push('');
    });
    lines.push('---');
    lines.push('');
    lines.push('*由 wenai 视频拆解演示流程生成 · 准备真实 SKU 时, 请通过 /inquire 提交 POC 需求。*');
    return lines.join('\n');
  };

  const buildShareTitle = (): string => {
    if (!result) return 'wenai 视频拆解';
    const sb = result.storyboard;
    const tplName = activeTemplate ? INDUSTRY_TEMPLATES.find(t => t.id === activeTemplate)?.title : null;
    return `${tplName ? tplName + ' · ' : ''}${sb.scene_count} 镜头结构拆解 (${HOOK_LABEL[sb.hook_type].txt})`;
  };


  return (
    <div className="min-h-screen bg-bg-root">
      {/* Hero */}
      <div className="border-b border-border-subtle bg-gradient-to-b from-bg-surface/50 to-transparent">
        <div className="max-w-[1100px] mx-auto px-6 py-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">
              VIDEO TEARDOWN · Gemini 2.5 Vision
            </span>
            <span className="text-[9px] font-mono text-accent/70 px-2 py-0.5 border border-accent/30 rounded-full">
              MOAT-01
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
            高转化视频 → 结构化分镜
            <ActiveSkuBadge skuId={activeSkuId} />
          </h1>
          <p className="text-[13px] lg:text-[14px] text-text-secondary leading-relaxed max-w-[760px]">
            扔一个 TikTok/抖音/小红书 视频上来,Gemini 拆出钩子类型、节奏、情绪曲线、CTA 位置和每个镜头的图像 prompt。
            <span className="text-accent">每个镜头的 prompt 可带去 AI 影棚生成候选图</span>,再由运营做差异化终审。
          </p>

          {/* 工作流提示 */}
          <div className="flex flex-wrap gap-2 mt-5">
            <span className="text-[10px] font-mono text-text-tertiary px-2 py-1 border border-border-subtle rounded">
              ① 自己从 TikTok 下视频 (用浏览器扩展或 4K Video Downloader)
            </span>
            <span className="text-[10px] font-mono text-text-tertiary px-2 py-1 border border-border-subtle rounded">
              ② ≤8MB · ≤30 秒
            </span>
            <span className="text-[10px] font-mono text-text-tertiary px-2 py-1 border border-border-subtle rounded">
              ③ 上传 + 写产品 hint
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* LEFT */}
        <aside className="lg:sticky lg:top-4 lg:self-start space-y-4">
          {/* Upload */}
          <section className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30 space-y-2">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
              ① 参考视频 <span className="text-error">*</span>
            </div>
            {videoPreview ? (
              <div className="relative">
                <video
                  src={videoPreview}
                  controls
                  className="w-full rounded border border-border-default max-h-[280px] bg-bg-root"
                />
                <button
                  onClick={() => {
                    setVideoBase64(null);
                    setVideoPreview(null);
                    setVideoSize(0);
                    if (fileRef.current) fileRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 px-2 py-0.5 bg-bg-root/80 backdrop-blur text-[10px] font-mono text-text-primary rounded hover:bg-error/20 hover:text-error"
                >
                  ✗ 重选
                </button>
                <div className="text-[10px] font-mono text-text-tertiary mt-1.5">
                  {(videoSize / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            ) : (
              <label
                className="block border-2 border-dashed border-border-default hover:border-accent/60 rounded-md p-6 text-center cursor-pointer transition-colors"
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFile(f);
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
                <div className="text-3xl mb-2">📹</div>
                <p className="text-[12px] text-text-primary font-semibold mb-1">点击或拖放视频</p>
                <p className="text-[10px] font-mono text-text-tertiary">MP4 / MOV / WebM · ≤8MB</p>
              </label>
            )}
          </section>

          {/* 行业高转化模板 · 6 选 1 一键填 */}
          <section className="border border-cat-content/30 bg-cat-content/5 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-mono text-cat-content uppercase tracking-wider">
                🎬 行业结构模板 (一键填)
              </div>
              {activeTemplate && (
                <button
                  onClick={() => { setActiveTemplate(null); setProductHint(''); }}
                  className="text-[9px] font-mono text-text-tertiary hover:text-error"
                >
                  清除
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {INDUSTRY_TEMPLATES.map(t => {
                const active = activeTemplate === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => pickTemplate(t.id)}
                    className={`text-left rounded p-2 transition-colors ${
                      active
                        ? 'bg-cat-content/20 border border-cat-content text-text-primary'
                        : 'border border-cat-content/20 text-text-secondary hover:border-cat-content/50 hover:bg-cat-content/10'
                    }`}
                  >
                    <div className="text-base mb-0.5">{t.emoji}</div>
                    <div className="text-[10px] font-semibold">{t.title}</div>
                    <div className="text-[9px] font-mono text-text-tertiary leading-tight mt-0.5">
                      {t.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SKU 库 · 一键带产品上下文 */}
          {mySkus.length > 0 && (
            <section className="border border-border-subtle rounded-lg p-3 space-y-2 bg-bg-surface/30">
              <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                📦 从 SKU 库带产品
              </div>
              <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto">
                {mySkus.map(s => (
                  <button
                    key={s.id}
                    onClick={() => pickFromSku(s.id)}
                    className="text-[10px] font-mono border border-border-subtle rounded px-1.5 py-0.5 text-text-secondary hover:border-accent/40 hover:text-accent"
                    title={`${s.category} · ${s.status}`}
                  >
                    {s.name.length > 14 ? s.name.slice(0, 14) + '…' : s.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Product hint */}
          <section className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30 space-y-2">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
              ② 你的产品 (可选)
            </div>
            <textarea
              value={productHint}
              onChange={e => setProductHint(e.target.value)}
              placeholder="选个上方模板, 或写: 我的产品是一款 [品类], 主打 [卖点]。请把原视频中的产品替换成这个, 其他构图保持。"
              rows={4}
              className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] resize-none focus:border-accent/60 outline-none"
            />
            <p className="text-[10px] font-mono text-text-tertiary leading-relaxed">
              填了之后, scene 的 prompt 会参考原视频结构, 为你的产品生成候选图方向
            </p>
          </section>

          {/* CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleTeardown}
              disabled={running || !videoBase64}
              className="w-full py-3.5 bg-accent text-bg-root rounded-lg text-[14px] font-bold hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {running ? '拆解中... (15-30 秒)' : '🔬 开始拆解'}
            </button>
            {productHint.trim() || videoBase64 ? (
              <Link
                href={preRunStandardPackHref}
                className="w-full py-3.5 border border-accent/40 text-accent rounded-lg text-center text-[12px] font-bold hover:bg-accent/10"
              >
                生成视频拆解 SOP 标品包
              </Link>
            ) : (
              <button
                disabled
                className="w-full py-3.5 border border-border-subtle text-text-tertiary rounded-lg text-[12px] font-bold opacity-50 cursor-not-allowed"
              >
                生成视频拆解 SOP 标品包
              </button>
            )}
          </div>

          {error && (
            <div className="p-3 border border-error/40 bg-error/5 rounded text-[11px] text-error">
              ✗ {error}
            </div>
          )}

          {/* Need Gemini key notice */}
          <div className="text-[10px] font-mono text-text-tertiary leading-relaxed border-t border-border-subtle pt-3">
            视频拆解服务启用后可自动输出脚本蓝图；未启用时请导出生产规格交给团队执行。
          </div>
        </aside>

        {/* RIGHT */}
        <main className="space-y-4 min-h-[500px]">
          {running && (
            <div className="border border-border-subtle rounded-lg p-8 bg-bg-surface/30 animate-pulse">
              <div className="text-center">
                <div className="text-3xl mb-2">🔬</div>
                <div className="text-text-secondary text-[13px] font-semibold">Gemini 正在拆视频</div>
                <div className="text-text-tertiary text-[11px] font-mono mt-1">
                  Vision 分析 + 结构化输出 · 通常 15-30 秒
                </div>
              </div>
            </div>
          )}

          {!running && !result && (
            <div className="border border-dashed border-border-default rounded-lg p-8 text-center">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="text-[15px] font-bold text-text-primary mb-1">拆解后你会拿到</h3>
              <p className="text-[12px] text-text-tertiary mb-4">不是简单分析，而是可执行的差异化脚本蓝图</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                <Tip
                  emoji="🎣"
                  title="钩子类型"
                  desc="提问/陈述/展示/故事/震惊 五选一,告诉你为什么前 3 秒留得住人"
                />
                <Tip
                  emoji="⚡"
                  title="节奏 + 情绪曲线"
                  desc={'每秒切几个镜头、情绪怎么递进、什么节点上 CTA'}
                />
                <Tip
                  emoji="🎬"
                  title="每个镜头的图像 prompt"
                  desc="80-150 字详细描述,可带到 AI 影棚生成候选静态图"
                />
                <Tip
                  emoji="🔄"
                  title="自动换主体"
                  desc="填了'我的产品 hint',原视频里的货会被替换成你的"
                />
              </div>
            </div>
          )}

          {!running && result && (
            <TeardownResultView
              result={result}
              copyPrompt={copyPrompt}
              copiedIdx={copiedIdx}
              exportJson={exportJson}
              activeSkuId={activeSkuId}
              saveToSkuLibrary={saveToSkuLibrary}
              savingToSku={savingToSku}
              savedSkuId={savedSkuId}
              buildShareMarkdown={buildShareMarkdown}
              buildShareTitle={buildShareTitle}
              resultStandardPackHref={resultStandardPackHref}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <div className="max-w-[1100px] mx-auto px-6 py-10 border-t border-border-subtle mt-10">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
          配套工作流
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/pipelines/ai-photoshoot" className="px-3 py-1.5 border border-accent/30 rounded text-[11px] font-mono text-accent hover:bg-accent/10">
            🎬 用拆解 prompt 去 AI 影棚生成候选图 →
          </Link>
          <Link href="/pipelines/ai-video" className="px-3 py-1.5 border border-border-subtle rounded text-[11px] font-mono text-text-secondary hover:border-accent/40 hover:text-accent">
            🎞️ 静态图 → AI 视频 →
          </Link>
          <Link href="/pipelines/intent-mining" className="px-3 py-1.5 border border-border-subtle rounded text-[11px] font-mono text-text-secondary hover:border-accent/40 hover:text-accent">
            🔍 反向意图扩客 →
          </Link>
          <Link href="/inquire?from=video-teardown" className="px-3 py-1.5 border border-accent/30 rounded text-[11px] font-mono text-accent hover:bg-accent/10">
            企业批量拆解 →
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

function TeardownResultView({
  result,
  copyPrompt,
  copiedIdx,
  exportJson,
  activeSkuId,
  saveToSkuLibrary,
  savingToSku,
  savedSkuId,
  buildShareMarkdown,
  buildShareTitle,
  resultStandardPackHref,
}: {
  result: TeardownResult;
  copyPrompt: (idx: number, p: string) => void;
  copiedIdx: number | null;
  exportJson: () => void;
  activeSkuId: string | null;
  saveToSkuLibrary: () => Promise<void>;
  savingToSku: boolean;
  savedSkuId: string | null;
  buildShareMarkdown: () => string;
  buildShareTitle: () => string;
  resultStandardPackHref?: string;
}) {
  const sb = result.storyboard;
  const totalDuration = sb.scenes.reduce((sum, s) => sum + s.duration_seconds, 0);

  return (
    <>
      {/* 顶部摘要 */}
      <section className="border border-accent/30 bg-accent/5 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="钩子类型" value={HOOK_LABEL[sb.hook_type].txt} sub={HOOK_LABEL[sb.hook_type].tip} />
        <Stat label="节奏" value={PACING_LABEL[sb.pacing]} sub={`${sb.scene_count} 个镜头 · ${totalDuration.toFixed(1)}s`} />
        <Stat label="CTA 位置" value={CTA_LABEL[sb.cta_position]} sub="转化引导出现的时机" />
        <Stat
          label="情绪曲线"
          value={sb.emotional_arc.slice(0, 3).join(' → ')}
          sub={sb.emotional_arc.length > 3 ? `+${sb.emotional_arc.length - 3} 个` : '完整曲线'}
        />
      </section>

      {/* 操作 */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-[14px] font-bold text-text-primary flex items-center gap-2">
            {sb.scene_count} 个镜头
            {result.fromCache && (
              <span className="text-[9px] font-mono text-success border border-success/40 bg-success/10 rounded px-1.5 py-0.5">
                ⚡ 缓存命中 · 未消耗 quota
              </span>
            )}
          </div>
          {result.fromCache ? (
            <div className="text-[10px] font-mono text-success mt-0.5 tabular-nums">
              同视频 14 天内已拆过 · ¥0 复用 · 想强刷加 ?fresh=1
            </div>
          ) : result.costUsd !== null && (
            <div className="text-[10px] font-mono text-text-tertiary mt-0.5 tabular-nums">
              拆解成本 ${result.costUsd.toFixed(4)} ≈ ¥{(result.costUsd * 7.2).toFixed(3)} · {result.model}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!activeSkuId && (
            savedSkuId ? (
              <Link
                href={`/me/skus/${savedSkuId}`}
                className="text-[11px] font-mono text-success border border-success/40 rounded px-3 py-1.5 hover:bg-success/10"
              >
                ✓ 已存为 SKU · 查看 →
              </Link>
            ) : (
              <button
                onClick={saveToSkuLibrary}
                disabled={savingToSku}
                className="text-[11px] font-mono text-cat-content border border-cat-content/40 hover:bg-cat-content/10 rounded px-3 py-1.5 disabled:opacity-40"
                title="把这次拆解作为蓝图存进 SKU 库, 下次能复用"
              >
                {savingToSku ? '存入中...' : '📦 存为 SKU 蓝图'}
              </button>
            )
          )}
          <button
            onClick={exportJson}
            className="text-[11px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded px-3 py-1.5"
          >
            ⬇ 导出 JSON
          </button>
          {resultStandardPackHref && (
            <Link
              href={resultStandardPackHref}
              className="text-[11px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded px-3 py-1.5"
            >
              生成视频拆解验收标品包
            </Link>
          )}
          <ShareButton
            buildPayload={() => ({
              moduleId: 'video-teardown',
              title: buildShareTitle(),
              content: buildShareMarkdown(),
              source: 'module' as const,
            })}
          />
        </div>
      </div>

      {/* Scene 卡片 */}
      <div className="space-y-3">
        {sb.scenes.map((scene, i) => (
          <div key={i} className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30 space-y-2.5">
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-accent font-bold">镜头 #{scene.index + 1}</span>
                <span className="text-[10px] font-mono text-text-tertiary">
                  {scene.duration_seconds.toFixed(1)}s
                </span>
                {sb.emotional_arc[i] && (
                  <span className="text-[10px] font-mono text-text-secondary border border-border-subtle px-1.5 py-0.5 rounded">
                    {sb.emotional_arc[i]}
                  </span>
                )}
              </div>
            </div>

            <p className="text-[13px] text-text-primary leading-relaxed">{scene.description}</p>

            {scene.caption_text && (
              <div className="border-l-2 border-accent/40 pl-3 text-[12px] text-text-secondary italic">
                字幕/口播: {scene.caption_text}
              </div>
            )}

            <div className="bg-bg-root border border-border-subtle rounded p-2.5">
              <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                  图像 prompt (拷去 AI 影棚)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => copyPrompt(i, scene.prompt)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                      copiedIdx === i
                        ? 'bg-success/20 text-success'
                        : 'border border-accent/30 text-accent hover:bg-accent/10'
                    }`}
                  >
                    {copiedIdx === i ? '✓ 已复制' : '📋 复制'}
                  </button>
                  <Link
                    href={`/pipelines/ai-photoshoot?prompt=${encodeURIComponent(scene.prompt)}${activeSkuId ? `&skuId=${activeSkuId}` : ''}`}
                    className="text-[10px] font-mono px-2 py-0.5 rounded border border-cat-execution/40 text-cat-execution hover:bg-cat-execution/10"
                    title="带 prompt 跳到 AI 影棚生成候选图"
                  >
                    🎬 去影棚生成候选图 →
                  </Link>
                </div>
              </div>
              <p className="text-[12px] text-text-secondary leading-relaxed font-mono">{scene.prompt}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-[13px] font-bold text-text-primary leading-tight">{value}</div>
      <div className="text-[10px] font-mono text-text-tertiary mt-0.5">{sub}</div>
    </div>
  );
}
