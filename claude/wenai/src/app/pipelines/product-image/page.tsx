'use client';

import { useState } from 'react';
import { CATEGORIES, type CategoryId } from '@/lib/category-prompts';
import { getScenePresets } from '@/lib/scene-presets';

type OutputType = 'main' | 'scene' | 'detail' | 'lifestyle' | 'compare';

interface GenImage {
  type: OutputType;
  label: string;
  prompt: string;
  url: string;
  width: number;
  height: number;
  provider: string;
}

const ALL_OUTPUTS: { type: OutputType; label: string; desc: string }[] = [
  { type: 'main', label: '主图', desc: '白底 · 45° · Amazon 规范' },
  { type: 'scene', label: '场景图', desc: '真实使用环境' },
  { type: 'detail', label: '细节图', desc: '材质 / 工艺微距' },
  { type: 'lifestyle', label: '使用图', desc: '人手互动瞬间' },
  { type: 'compare', label: '对比图', desc: '旧 vs 新 / 竞品对比' },
];

const PLATFORM_SIZES: Record<string, { label: string; size: string }> = {
  amazon: { label: 'Amazon', size: '2000 × 2000' },
  shopee: { label: 'Shopee', size: '800 × 800' },
  lazada: { label: 'Lazada', size: '1080 × 1080' },
  instagram: { label: 'Instagram', size: '1080 × 1080' },
};

export default function ProductImagePipelinePage() {
  const [category, setCategory] = useState<CategoryId | ''>('');
  const [scene, setScene] = useState('');
  const [sku, setSku] = useState('');
  const [selectedOutputs, setSelectedOutputs] = useState<Set<OutputType>>(
    new Set(['main', 'scene', 'detail', 'lifestyle', 'compare'])
  );
  const [running, setRunning] = useState(false);
  const [images, setImages] = useState<GenImage[]>([]);
  const [error, setError] = useState('');
  const [mockNotice, setMockNotice] = useState('');

  const scenePresets = category ? getScenePresets(category) : [];

  const toggleOutput = (t: OutputType) => {
    const next = new Set(selectedOutputs);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    setSelectedOutputs(next);
  };

  const handleGenerate = async () => {
    if (!category) return alert('选品类');
    if (sku.trim().length < 10) return alert('贴商品信息（至少 10 字）');
    if (selectedOutputs.size === 0) return alert('至少选 1 种输出图');

    // Pipeline 级配额预占
    try {
      const check = await fetch('/api/ratelimit/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'pipeline:product-image' }),
      });
      if (!check.ok) {
        const d = await check.json().catch(() => ({}));
        alert(`Pipeline 配额已达上限\n${d.resetAtText || ''}\n升级 Team 至 500/天`);
        return;
      }
    } catch {}

    setRunning(true);
    setError('');
    setImages([]);
    setMockNotice('');

    try {
      const res = await fetch('/api/image-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-from-pipeline': '1' },
        body: JSON.stringify({
          category,
          skuInfo: sku,
          scenePreset: scene,
          outputs: Array.from(selectedOutputs),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'HTTP ' + res.status);
      setImages(data.images || []);
      if (data.notice) setMockNotice(data.notice);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 lg:p-6">
      {/* 三段式顶部 */}
      <div className="mb-6 border border-border-subtle rounded-md overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-bg-surface to-bg-raised border-b border-border-subtle flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-accent uppercase tracking-[0.15em] mb-1">
              PIPELINE · 03
            </div>
            <h1 className="text-[20px] lg:text-[24px] font-bold text-text-primary font-[family-name:var(--font-outfit)]">
              AI 电商主图生成
            </h1>
            <p className="text-[12px] text-text-secondary mt-1">
              五品类场景预设 · 5 张图组合 · 合规前置扫描
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-accent/10 text-accent text-[9px] font-mono rounded">
              对标 HotClaw
            </span>
            <button className="text-[10px] font-mono text-text-tertiary border border-dashed border-border-default rounded-md px-3 py-1.5 hover:text-accent hover:border-accent/40">
              支持企业级定制 →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border-subtle">
          <div className="p-5 bg-error/5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px]">⚠️</span>
              <span className="text-[11px] font-mono text-error uppercase tracking-wider font-semibold">客户痛点</span>
            </div>
            <div className="space-y-2.5">
              <div className="border-l-2 border-error/50 pl-2.5">
                <div className="text-[12px] font-semibold text-text-primary">拍摄贵、棚贵、模特贵</div>
                <p className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">
                  一套新品主图 ¥3000-8000 · 周期 7-14 天
                </p>
              </div>
              <div className="border-l-2 border-error/50 pl-2.5">
                <div className="text-[12px] font-semibold text-text-primary">1688 拿图反复 PS 改</div>
                <p className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">
                  品牌风格不统一 · 反复退回 · 侵权风险
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px]">🧭</span>
              <span className="text-[11px] font-mono text-accent uppercase tracking-wider font-semibold">核心能力</span>
            </div>
            <div className="space-y-2 mb-3">
              <div className="flex items-start gap-2"><span className="text-accent text-[10px] mt-0.5">◆</span><span className="text-[11px] text-text-secondary">五品类 × 三场景 = 15 个预设（比 HotClaw 垂直）</span></div>
              <div className="flex items-start gap-2"><span className="text-accent text-[10px] mt-0.5">◆</span><span className="text-[11px] text-text-secondary">1 SKU → 5 图组合（主/场景/细节/使用/对比）</span></div>
              <div className="flex items-start gap-2"><span className="text-accent text-[10px] mt-0.5">◆</span><span className="text-[11px] text-text-secondary">商标词自动过滤（避免 AirPods Style 等风险）</span></div>
            </div>
            <div className="pt-2 border-t border-border-subtle space-y-1">
              <div className="text-[9px] font-mono text-success">✓ Amazon / Shopee / Lazada 尺寸适配</div>
              <div className="text-[9px] font-mono text-success">✓ 平均 45 秒出 5 张</div>
              <div className="text-[9px] font-mono text-success">✓ 不做 AI 人脸（版权安全）</div>
            </div>
          </div>

          <div className="p-5 bg-bg-raised/50">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px]">🔀</span>
              <span className="text-[11px] font-mono text-success uppercase tracking-wider font-semibold">TYPICAL WORKFLOW</span>
            </div>
            <div className="space-y-1.5">
              {['选品类 + 场景预设', '贴商品信息', '勾选要哪几种图', '并行生成 + 下载'].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-accent/40 flex items-center justify-center text-[9px] font-mono text-accent flex-shrink-0 tabular-nums">{i + 1}</div>
                  <span className="text-[11px] text-text-secondary">{s}</span>
                  {i < 3 && <span className="text-[10px] text-accent/40 ml-auto">↓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 占位提示条 */}
      <div className="mb-4 p-3 border border-accent/30 bg-accent/5 rounded-md">
        <div className="flex items-start gap-2">
          <span className="text-accent text-[14px] flex-shrink-0">🧪</span>
          <div>
            <div className="text-[11px] font-semibold text-accent mb-1">
              Alpha 阶段 · 当前图片为占位（Lorem Picsum），非真 AI 生成
            </div>
            <p className="text-[10px] text-text-secondary leading-relaxed">
              UI 和 prompt 编排链路已完备。待配置 <code className="bg-bg-raised px-1">FAL_KEY</code> 或
              <code className="bg-bg-raised px-1">REPLICATE_API_TOKEN</code> 即自动切换为真 Flux Schnell 生成。
              本次用于产品形态验证，朋友可按真实流程体验。
            </p>
          </div>
        </div>
      </div>

      {/* Step 1 · 品类 */}
      <div className="mb-4">
        <label className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2 block">
          Step 1 · 品类
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setCategory(cat.id); setScene(''); }}
              className={`flex flex-col items-center gap-1 py-2.5 border rounded-md transition-all ${
                category === cat.id ? 'border-accent bg-accent/10 text-accent' : 'border-border-subtle text-text-secondary hover:border-accent/30'
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span className="text-[9px] font-mono">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2 · 场景 */}
      {category && (
        <div className="mb-4">
          <label className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2 block">
            Step 2 · 场景预设（3 选 1 · 整套图共用）
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {scenePresets.map(s => (
              <button
                key={s.id}
                onClick={() => setScene(s.id)}
                className={`text-left p-3 border rounded-md transition-all ${
                  scene === s.id ? 'border-accent bg-accent/10' : 'border-border-subtle hover:border-accent/30'
                }`}
              >
                <div className={`text-[12px] font-semibold mb-0.5 ${scene === s.id ? 'text-accent' : 'text-text-primary'}`}>
                  {s.label}
                </div>
                <div className="text-[10px] text-text-secondary mb-1">{s.description}</div>
                <div className="text-[9px] font-mono text-text-tertiary">{s.mood}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 · 商品信息 */}
      <div className="mb-4">
        <label className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2 block">
          Step 3 · 商品信息（名称 + 卖点 + 材质）
        </label>
        <textarea
          value={sku}
          onChange={e => setSku(e.target.value)}
          placeholder="例：可叠加密封收纳盒套装，BPA-Free 食品级 PP，四侧卡扣密封，6 件装"
          rows={4}
          className="w-full px-3 py-2.5 bg-bg-surface border border-border-default rounded-md text-[12px] resize-none focus:outline-none focus:border-accent/60"
        />
      </div>

      {/* Step 4 · 勾选输出 */}
      <div className="mb-4">
        <label className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2 block">
          Step 4 · 勾选要哪几种图（默认 5 种全选）
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {ALL_OUTPUTS.map(o => (
            <button
              key={o.type}
              onClick={() => toggleOutput(o.type)}
              className={`p-2.5 border rounded-md text-center transition-all ${
                selectedOutputs.has(o.type)
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border-subtle text-text-tertiary hover:border-accent/30'
              }`}
            >
              <div className="text-[11px] font-semibold mb-0.5">{o.label}</div>
              <div className="text-[9px] font-mono opacity-70">{o.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 触发按钮 */}
      <div className="flex items-center justify-between mb-6 pb-5 border-b border-border-subtle">
        <div className="text-[11px] text-text-secondary">
          {!category && '① 选品类'}
          {category && !scene && '② 选场景'}
          {category && scene && sku.length < 10 && '③ 贴商品信息'}
          {category && scene && sku.length >= 10 && (
            <span className="text-accent">预计 {selectedOutputs.size * 9} 秒生成 {selectedOutputs.size} 张</span>
          )}
          {running && <span className="text-accent font-mono">生成中...</span>}
          {images.length > 0 && !running && <span className="text-success">✓ 生成完成</span>}
        </div>
        <button
          onClick={handleGenerate}
          disabled={!category || !scene || sku.length < 10 || running}
          className="px-5 py-2 bg-accent text-bg-root text-[12px] font-semibold rounded-md hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          {running ? '生成中...' : '开始生成 →'}
        </button>
      </div>

      {/* Mock notice */}
      {mockNotice && images.length > 0 && (
        <div className="mb-4 p-2.5 border border-border-subtle rounded text-[10px] font-mono text-text-tertiary bg-bg-surface/50">
          ⓘ {mockNotice}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 border border-error/40 bg-error/5 rounded text-[11px] text-error">
          ✗ {error}
        </div>
      )}

      {/* 图片展示 */}
      {images.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
              生成结果 · {images.length} 张
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-text-tertiary">平台尺寸适配：</span>
              {Object.entries(PLATFORM_SIZES).map(([k, v]) => (
                <span key={k} className="px-1.5 py-0.5 bg-bg-raised text-[9px] font-mono text-text-tertiary rounded">
                  {v.label} {v.size}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {images.map((img, i) => (
              <div key={i} className="border border-border-subtle rounded-md overflow-hidden bg-bg-surface">
                <div className="relative aspect-square bg-bg-raised overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-bg-root/80 backdrop-blur-sm text-[10px] font-mono text-accent rounded">
                    {img.label}
                  </span>
                  {img.provider === 'mock' && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-error/20 text-[9px] font-mono text-error rounded">
                      MOCK
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-[10px] font-mono text-text-tertiary mb-1 uppercase">
                    Prompt
                  </div>
                  <p className="text-[10px] text-text-secondary leading-relaxed line-clamp-3">
                    {img.prompt}
                  </p>
                  <div className="mt-2 pt-2 border-t border-border-subtle flex justify-between items-center">
                    <span className="text-[9px] font-mono text-text-tertiary">{img.width}×{img.height}</span>
                    <a
                      href={img.url}
                      download={`wenai-${img.type}-${Date.now()}.jpg`}
                      target="_blank"
                      rel="noopener"
                      className="text-[10px] font-mono text-accent hover:underline"
                    >
                      下载 ↓
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
