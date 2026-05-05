'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  resolvePrompt,
  CATEGORY_LABELS,
  STYLE_LABELS,
  SOP_PRESETS,
  type EcomCategory,
  type EcomScenario,
  type EcomStyle,
  type SopPreset,
} from '@/lib/ecom-prompts';
import { useActiveSkuId } from '@/lib/use-active-sku';
import { ActiveSkuBadge } from '@/components/ActiveSkuBadge';
import { buildAIVideoStandardPackRoute } from '@/lib/standard-pack-routing';

/**
 * AI 视频 · wanx2.1 i2v · 一张图 → 5s 带货短视频
 *
 * 4 个场景预设 (prompt 模板抄冉胖子动态展示提示词):
 *   ① 模特动态展示  · 服装/穿搭转身展示 (走秀感)
 *   ② 产品旋转      · 360° 展示 (电商主图视频)
 *   ③ lifestyle 短片 · 使用场景动起来
 *   ④ 自定义        · 用户自己写 prompt
 *
 * 限制: wanx i2v 当前仅支持公网图片 URL (不能直接传 base64)
 *   解决: 先把图丢到 OSS/Cloudinary/picgo/imgur,拿到公网 URL 再用
 */

type Scenario = 'model-display' | 'product-rotate' | 'lifestyle-clip' | 'custom';
type Duration = 4 | 5;
type Resolution = '720P' | '1080P';
type Model = 'wanx2.1-i2v-turbo' | 'wanx2.1-i2v-plus';

interface ScenarioMeta {
  title: string;
  icon: string;
  desc: string;
  cost: string;
  promptTemplate: (extra: string) => string;
}

const SCENARIOS: Record<Scenario, ScenarioMeta> = {
  'model-display': {
    title: '模特动态展示',
    icon: '👗',
    desc: '服装上身 → 缓慢转身展示前后效果',
    cost: '替代走秀拍摄 ¥1-3K/件',
    promptTemplate: extra => [
      '亚洲年轻女性,完整保留造型细节,通过自然优雅的动态展示服装。',
      '缓慢完成转身展示服装背部效果,然后再转回正面,动作流畅且重点突出穿搭细节。',
      '采用固定镜头(镜头保持静止,全身构图,清晰呈现整体造型与动态细节)。',
      '风格是时尚穿搭展示短片,人物动作自然优雅,光线均匀柔和以突出服装质感,整体氛围清新。',
      extra ? `特别要求: ${extra}` : '',
    ].filter(Boolean).join(' '),
  },
  'product-rotate': {
    title: '产品 360° 旋转',
    icon: '🔄',
    desc: '产品图 → 360° 旋转展示 (电商主图视频)',
    cost: '替代摄影棚拍摄 ¥500-1500/SKU',
    promptTemplate: extra => [
      '产品在原地缓慢 360° 旋转一周,镜头静止固定,构图保持不变。',
      '光线柔和均匀,产品材质质感清晰可见,旋转过程中各角度细节都清晰展示。',
      '背景静止不变,产品本体特征严格保留,无任何形变或纹理偏移。',
      '风格: 电商主图视频规范,简洁专业。',
      extra ? `补充: ${extra}` : '',
    ].filter(Boolean).join(' '),
  },
  'lifestyle-clip': {
    title: 'Lifestyle 短片',
    icon: '🌿',
    desc: '使用场景动起来 (开盖/倒水/打开/触摸)',
    cost: '替代场景拍摄 ¥1-3K/条',
    promptTemplate: extra => [
      '产品在真实使用场景中,人手自然进入画面与产品发生互动(打开/使用/触摸/拿起)。',
      '环境光真实柔和,景深虚化,有 lifestyle 摄影的氛围感。',
      '动作自然流畅,2-3 秒内完成核心交互,镜头微推或保持静止。',
      '色调温暖通透,Pinterest 风格美学。',
      extra ? `场景细节: ${extra}` : '',
    ].filter(Boolean).join(' '),
  },
  'custom': {
    title: '自定义',
    icon: '✏️',
    desc: '完全用你写的 prompt',
    cost: '看你想做什么',
    promptTemplate: extra => extra || '保持图中元素自然呈现,5 秒内完成一个清晰的动作或镜头变化。',
  },
};

interface VideoResult {
  ok: boolean;
  videoUrl: string;
  taskId: string;
  duration: number;
  resolution: string;
  model: string;
  cost?: { perSecondCny: number; totalCny: number };
  fromCache?: boolean;
  cacheHash?: string;
}

function buildAIVideoResultSummary(input: {
  result: VideoResult;
  scenarioLabel: string;
  productHint: string;
  imageUrl: string;
  prompt: string;
}): string {
  return [
    `scenario: ${input.scenarioLabel}`,
    `duration: ${input.result.duration}s`,
    `resolution: ${input.result.resolution}`,
    `model: ${input.result.model}`,
    input.result.fromCache ? 'cost: cache hit' : `cost: ¥${input.result.cost?.totalCny || '?'}`,
    `source image: ${input.imageUrl.trim() || 'not provided'}`,
    input.productHint.trim() ? `product hint: ${input.productHint.trim()}` : '',
    `video url: ${input.result.videoUrl}`,
    `prompt: ${input.prompt}`,
  ].filter(Boolean).join('\n');
}

export default function AIVideoPage() {
  const activeSkuId = useActiveSkuId();
  const [scenario, setScenario] = useState<Scenario>('model-display');
  const [imageUrl, setImageUrl] = useState('');
  const [extraPrompt, setExtraPrompt] = useState('');
  const [duration, setDuration] = useState<Duration>(5);
  const [resolution, setResolution] = useState<Resolution>('720P');
  const [model, setModel] = useState<Model>('wanx2.1-i2v-turbo');

  // 行业模板状态
  const [showEcomPanel, setShowEcomPanel] = useState(false);
  const [ecomCategory, setEcomCategory] = useState<EcomCategory>('apparel');
  const [ecomVideoScenario, setEcomVideoScenario] = useState<EcomScenario>('video-display');
  const [ecomStyle, setEcomStyle] = useState<EcomStyle>('taobao');
  const [productHint, setProductHint] = useState('');

  // 视频 SOP 一键预设 · 选完自动 set 品类 + 默认场景
  const applySop = (sop: SopPreset) => {
    setEcomCategory(sop.category);
    setEcomStyle(sop.defaultStyle);
    const videoScenario = sop.scenarios.find(s => s.startsWith('video-')) as EcomScenario | undefined;
    if (videoScenario) setEcomVideoScenario(videoScenario);
    setShowEcomPanel(true);
  };

  // 只展示含视频场景的 SOP
  const VIDEO_SOPS = SOP_PRESETS.filter(s => s.scenarios.some(sc => sc.startsWith('video-')));

  const applyEcomTemplate = () => {
    const resolved = resolvePrompt({
      category: ecomCategory,
      scenario: ecomVideoScenario,
      style: ecomStyle,
      productHint,
      extraDetails: extraPrompt,
    });
    setExtraPrompt(resolved.prompt);
    // 视频场景映射到现有的 4 模式
    if (ecomVideoScenario === 'video-display') setScenario('model-display');
    else if (ecomVideoScenario === 'video-usage') setScenario('lifestyle-clip');
    else setScenario('lifestyle-clip');
  };

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<VideoResult | null>(null);
  const [error, setError] = useState('');
  const [showFinalPrompt, setShowFinalPrompt] = useState(false);

  const meta = SCENARIOS[scenario];
  const finalPrompt = meta.promptTemplate(extraPrompt.trim());
  const estCny = (model.includes('plus') ? 1.4 : 0.7) * duration;
  const standardPackHref = buildAIVideoStandardPackRoute({
    scenarioLabel: meta.title,
    productHint,
    imageUrl,
    prompt: finalPrompt,
    duration,
    resolution,
    model,
  });
  const resultStandardPackHref = result
    ? buildAIVideoStandardPackRoute({
        scenarioLabel: meta.title,
        productHint,
        imageUrl,
        prompt: finalPrompt,
        duration: result.duration,
        resolution: result.resolution,
        model: result.model,
        resultSummary: buildAIVideoResultSummary({
          result,
          scenarioLabel: meta.title,
          productHint,
          imageUrl,
          prompt: finalPrompt,
        }),
      })
    : undefined;

  const handleGenerate = async () => {
    if (!imageUrl.trim() || !/^https?:\/\//.test(imageUrl)) {
      setError('图片 URL 必填且必须是 http(s):// 公网链接');
      return;
    }
    setRunning(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/video-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          prompt: finalPrompt,
          imageUrl: imageUrl.trim(),
          duration,
          resolution,
          model,
          skuId: activeSkuId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setResult(data as VideoResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setRunning(false);
    }
  };

  const downloadVideo = async () => {
    if (!result) return;
    try {
      const r = await fetch(result.videoUrl);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wenai-video-${scenario}-${Date.now()}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // CORS 失败时直接打开新标签
      window.open(result.videoUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-bg-root">
      {/* Hero */}
      <div className="border-b border-border-subtle bg-gradient-to-b from-bg-surface/50 to-transparent">
        <div className="max-w-[1100px] mx-auto px-6 py-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">
              AI VIDEO · wanx2.1 i2v
            </span>
            <span className="text-[9px] font-mono text-accent/70 px-2 py-0.5 border border-accent/30 rounded-full">
              i2v · 4 场景
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
            一张图 → 5 秒带货短视频
            <ActiveSkuBadge skuId={activeSkuId} />
          </h1>
          <p className="text-[13px] lg:text-[14px] text-text-secondary leading-relaxed max-w-[760px]">
            模特动态展示 / 产品 360° 旋转 / lifestyle 使用场景。
            <span className="text-accent">真人拍摄+剪辑 ¥500-3K/条 → AI 一条 ¥3-7</span>。
            视频号/抖音/小红书/Reels 直接传。
          </p>

          {/* SOP 一键卡 (含视频场景的预设) */}
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[10px] font-mono text-accent uppercase tracking-wider">
                🎯 一键带货视频预设
              </span>
              <div className="flex-1 h-px bg-accent/20" />
              <span className="text-[10px] font-mono text-text-tertiary">
                {VIDEO_SOPS.length} 套行业模板
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {VIDEO_SOPS.map(sop => (
                <button
                  key={sop.id}
                  onClick={() => applySop(sop)}
                  className="group text-left border border-border-subtle hover:border-accent/60 bg-bg-surface/40 hover:bg-bg-surface rounded-lg p-3 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(200,151,90,0.12)]"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] font-mono text-accent">
                      {CATEGORY_LABELS[sop.category].split(' ')[0]}
                    </span>
                  </div>
                  <div className="text-[12px] font-semibold text-text-primary group-hover:text-accent transition-colors mb-1 leading-tight">
                    {sop.title}
                  </div>
                  <div className="text-[10px] text-text-tertiary leading-relaxed line-clamp-2">
                    {sop.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 行业模板 */}
          <div className="mt-5 border border-accent/30 bg-accent/5 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowEcomPanel(s => !s)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-accent/10"
            >
              <span className="text-[12px] font-mono text-accent uppercase tracking-wider">
                ⚡ 行业模板 · 不会写视频 prompt 直接选
              </span>
              <span className="text-[14px] text-accent">{showEcomPanel ? '−' : '+'}</span>
            </button>
            {showEcomPanel && (
              <div className="border-t border-accent/30 p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-text-tertiary uppercase mb-1 block">① 品类</label>
                    <select
                      value={ecomCategory}
                      onChange={e => setEcomCategory(e.target.value as EcomCategory)}
                      className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-text-tertiary uppercase mb-1 block">② 视频类型</label>
                    <select
                      value={ecomVideoScenario}
                      onChange={e => setEcomVideoScenario(e.target.value as EcomScenario)}
                      className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
                    >
                      <option value="video-display">展示 (转身/360°)</option>
                      <option value="video-usage">使用瞬间 (开盖/穿戴/操作)</option>
                      <option value="video-lifestyle">lifestyle 短片</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-text-tertiary uppercase mb-1 block">③ 投哪平台</label>
                    <select
                      value={ecomStyle}
                      onChange={e => setEcomStyle(e.target.value as EcomStyle)}
                      className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
                    >
                      {Object.entries(STYLE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <input
                  type="text"
                  value={productHint}
                  onChange={e => setProductHint(e.target.value)}
                  placeholder="一句话产品描述 · 例: 粉色露肩 T 恤 / 智能蓝牙耳机"
                  className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
                />
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-[10px] font-mono text-text-tertiary">
                    应用后,系统自动拼专业视频 prompt + 切对应模式
                  </p>
                  <button
                    onClick={applyEcomTemplate}
                    className="px-4 py-2 bg-accent text-bg-root text-[12px] font-semibold rounded hover:bg-accent-hover"
                  >
                    应用模板 →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Scenario tabs */}
          <div className="flex gap-2 mt-6 flex-wrap">
            {(Object.keys(SCENARIOS) as Scenario[]).map(s => {
              const m = SCENARIOS[s];
              const active = scenario === s;
              return (
                <button
                  key={s}
                  onClick={() => {
                    setScenario(s);
                    setResult(null);
                    setError('');
                  }}
                  className={`px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-2 ${
                    active
                      ? 'bg-accent text-bg-root shadow-lg'
                      : 'border border-border-subtle text-text-secondary hover:border-accent/40 hover:text-text-primary'
                  }`}
                >
                  <span className="text-base">{m.icon}</span>
                  <span>{m.title}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] font-mono text-text-tertiary mt-3">
            {meta.icon} {meta.desc} · <span className="text-accent">{meta.cost}</span>
          </p>
        </div>
      </div>

      {/* Two-column */}
      <div className="max-w-[1100px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
        {/* LEFT controls */}
        <aside className="lg:sticky lg:top-4 lg:self-start space-y-4">
          {/* Image URL */}
          <section className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30 space-y-2">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
              ① 起始图 URL <span className="text-error">*</span>
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://i.imgur.com/xxx.jpg"
              className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] focus:border-accent/60 outline-none"
            />
            <p className="text-[10px] font-mono text-text-tertiary leading-relaxed">
              wanx i2v 仅吃公网 URL。先丢到{' '}
              <a href="https://imgur.com/upload" target="_blank" rel="noreferrer" className="text-accent underline">
                imgur
              </a>{' '}
              /{' '}
              <a href="https://www.picgo.net/" target="_blank" rel="noreferrer" className="text-accent underline">
                picgo
              </a>{' '}
              拿直链。AI 影棚生成的图也可以右键复制图片地址。
            </p>
            {imageUrl && /^https?:\/\//.test(imageUrl) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="preview"
                className="w-full rounded border border-border-default max-h-[200px] object-contain bg-bg-root mt-2"
                onError={() => {/* silent */}}
              />
            )}
          </section>

          {/* Prompt */}
          <section className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30 space-y-2">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
              ② 额外细节 (可选)
            </div>
            <textarea
              value={extraPrompt}
              onChange={e => setExtraPrompt(e.target.value)}
              placeholder={
                scenario === 'custom'
                  ? '完全用你的 prompt,描述你想要的镜头/动作/氛围'
                  : '补充你想要的细节,比如"加一阵风吹起头发"'
              }
              rows={4}
              className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] resize-none focus:border-accent/60 outline-none"
            />
            <button
              onClick={() => setShowFinalPrompt(s => !s)}
              className="text-[10px] font-mono text-text-tertiary hover:text-accent"
            >
              {showFinalPrompt ? '▼ 隐藏完整 prompt' : '▶ 查看完整 prompt'}
            </button>
            {showFinalPrompt && (
              <pre className="text-[10px] font-mono text-text-secondary bg-bg-root border border-border-subtle rounded p-2 max-h-[140px] overflow-y-auto whitespace-pre-wrap">
                {finalPrompt}
              </pre>
            )}
          </section>

          {/* 输出参数 */}
          <section className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30 space-y-3">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
              ③ 输出参数
            </div>
            <Field label="模型">
              <Pills
                options={[
                  { id: 'wanx2.1-i2v-turbo', cn: 'Turbo (¥0.7/s)' },
                  { id: 'wanx2.1-i2v-plus', cn: 'Plus (¥1.4/s · 1080p)' },
                ]}
                value={model}
                onChange={v => setModel(v as Model)}
              />
            </Field>
            <Field label="时长">
              <Pills
                options={[
                  { id: '4', cn: '4 秒' },
                  { id: '5', cn: '5 秒' },
                ]}
                value={String(duration)}
                onChange={v => setDuration(parseInt(v, 10) as Duration)}
              />
            </Field>
            <Field label="分辨率">
              <Pills
                options={[
                  { id: '720P', cn: '720P' },
                  { id: '1080P', cn: '1080P' },
                ]}
                value={resolution}
                onChange={v => setResolution(v as Resolution)}
              />
            </Field>
            <div className="text-[10px] font-mono text-text-tertiary tabular-nums pt-1 border-t border-border-subtle">
              预估成本: ¥{estCny.toFixed(2)} · 真人拍摄需 ¥{meta.cost.match(/¥([\d.\-K]+)/)?.[1] || '?'}
            </div>
          </section>

          {/* CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleGenerate}
              disabled={running || !imageUrl.trim()}
              className="w-full py-3.5 bg-accent text-bg-root rounded-lg text-[14px] font-bold hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {running ? '生成中... (60-120 秒)' : '🎬 生成视频'}
            </button>
            <Link
              href={standardPackHref}
              className="w-full py-3.5 rounded-lg text-[12px] font-bold text-center border border-cat-content/40 text-cat-content hover:bg-cat-content/10 transition-colors"
            >
              生成视频 SOP 标品包
            </Link>
          </div>

          {error && (
            <div className="p-3 border border-error/40 bg-error/5 rounded text-[11px] text-error">
              ✗ {error}
            </div>
          )}
        </aside>

        {/* RIGHT result */}
        <main className="space-y-4 min-h-[500px]">
          {running && (
            <div className="aspect-video rounded-lg bg-bg-surface border border-border-subtle animate-pulse flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-2">⏳</div>
                <div className="text-text-secondary text-[13px] font-semibold">视频生成中</div>
                <div className="text-text-tertiary text-[11px] font-mono mt-1">wanx 异步任务 · 通常 60-120 秒</div>
              </div>
            </div>
          )}

          {!running && !result && (
            <div className="border border-dashed border-border-default rounded-lg p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">{meta.icon}</div>
                <h3 className="text-[16px] font-bold text-text-primary mb-1">{meta.title}</h3>
                <p className="text-[12px] text-text-tertiary">{meta.desc}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                <Tip emoji="📤" title="先有图片 URL" desc="上传到 imgur/picgo/OSS,拿到 https:// 直链" />
                <Tip emoji="✏️" title="选场景模板" desc="模板带专业 prompt,通常不用改也能出片" />
                <Tip emoji="🎬" title="60-120 秒出片" desc="wanx 后台跑,前端轮询自动等结果" />
              </div>
            </div>
          )}

          {!running && result && (
            <>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-[14px] font-bold text-text-primary flex items-center gap-2 flex-wrap">
                    视频生成完成
                    {result.fromCache && (
                      <span className="text-[9px] font-mono text-success border border-success/40 bg-success/10 rounded px-1.5 py-0.5">
                        ⚡ 缓存命中 · ¥0
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-text-tertiary mt-0.5 tabular-nums">
                    {result.duration}s · {result.resolution} · {result.model.replace('wanx2.1-i2v-', '')} ·
                    {result.fromCache
                      ? <span className="text-success"> 同 prompt+图 7 天内已生过 · ¥0 复用</span>
                      : <> 成本 ¥{result.cost?.totalCny || '?'}</>
                    }
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {resultStandardPackHref && (
                    <Link
                      href={resultStandardPackHref}
                      className="px-3 py-1.5 border border-cat-content/40 text-cat-content text-[11px] font-mono rounded hover:bg-cat-content/10"
                    >
                      生成视频验收标品包
                    </Link>
                  )}
                  <button
                    onClick={downloadVideo}
                    className="px-3 py-1.5 bg-accent text-bg-root text-[11px] font-mono rounded hover:bg-accent-hover"
                  >
                    ⬇ 下载 MP4
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="px-3 py-1.5 border border-border-default text-text-primary text-[11px] font-mono rounded hover:border-accent/40"
                  >
                    🔄 再生一条
                  </button>
                </div>
              </div>

              <div className="rounded-lg overflow-hidden border border-border-subtle bg-bg-root">
                <video
                  src={result.videoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-auto block"
                />
              </div>

              <div className="border border-success/30 bg-success/5 rounded-lg p-4">
                <div className="text-[11px] font-mono text-success uppercase tracking-wider mb-2">
                  💰 成本对比
                </div>
                <div className="grid grid-cols-2 gap-4 text-[12px]">
                  <div>
                    <div className="text-text-tertiary">真人拍摄 + 剪辑</div>
                    <div className="text-text-primary font-bold text-lg">¥500 - ¥3000</div>
                    <div className="text-text-tertiary text-[10px] mt-0.5">需 1-3 天 · 改一处全重拍</div>
                  </div>
                  <div>
                    <div className="text-success">AI 视频 · 本次</div>
                    <div className="text-success font-bold text-lg">¥{result.cost?.totalCny || '?'}</div>
                    <div className="text-success/70 text-[10px] mt-0.5">90 秒 · 不满意秒重生</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <div className="max-w-[1100px] mx-auto px-6 py-10 border-t border-border-subtle mt-10">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
          完整工作流
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/pipelines/ai-photoshoot" className="px-3 py-1.5 border border-accent/30 rounded text-[11px] font-mono text-accent hover:bg-accent/10">
            🎬 先用 AI 影棚生图 →
          </Link>
          <Link href="/pipelines/intent-mining" className="px-3 py-1.5 border border-border-subtle rounded text-[11px] font-mono text-text-secondary hover:border-accent/40 hover:text-accent">
            🔍 反向意图扩客 →
          </Link>
          <Link href="/pipelines/new-listing" className="px-3 py-1.5 border border-border-subtle rounded text-[11px] font-mono text-text-secondary hover:border-accent/40 hover:text-accent">
            📋 新品上新 →
          </Link>
          <Link href="/inquire?from=ai-video" className="px-3 py-1.5 border border-accent/30 rounded text-[11px] font-mono text-accent hover:bg-accent/10">
            企业批量定制 →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-mono text-text-secondary mb-1">{label}</div>
      {children}
    </div>
  );
}

function Pills({
  options,
  value,
  onChange,
}: {
  options: { id: string; cn: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
              active
                ? 'bg-accent text-bg-root'
                : 'border border-border-subtle text-text-secondary hover:border-accent/40 hover:text-text-primary'
            }`}
          >
            {o.cn}
          </button>
        );
      })}
    </div>
  );
}

function Tip({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="border border-border-subtle rounded-lg p-3 bg-bg-surface/30">
      <div className="text-2xl mb-2">{emoji}</div>
      <div className="text-[12px] font-semibold text-text-primary mb-1">{title}</div>
      <div className="text-[11px] text-text-tertiary leading-relaxed">{desc}</div>
    </div>
  );
}
