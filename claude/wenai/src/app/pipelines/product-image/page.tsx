'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import JSZip from 'jszip';
import { CATEGORIES, type CategoryId } from '@/lib/category-prompts';
import { getScenePresets } from '@/lib/scene-presets';
import { exportFilename } from '@/lib/export-filename';
import { buildProductImageStandardPackRoute } from '@/lib/standard-pack-routing';

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

function buildProductImageResultSummary(input: {
  images: GenImage[];
  selectedOutputs: Set<OutputType>;
  failedTypes: OutputType[];
  categoryLabel: string;
  sceneLabel: string;
}): string {
  const delivered = input.images.map(img =>
    `${img.label}: ${img.width}x${img.height} / ${img.provider} / ${img.prompt.slice(0, 120)}`,
  );

  return [
    `category: ${input.categoryLabel}`,
    `scene: ${input.sceneLabel || '(not specified)'}`,
    `requested outputs: ${Array.from(input.selectedOutputs).join(' / ')}`,
    `delivered images: ${input.images.length}`,
    input.failedTypes.length ? `failed outputs: ${input.failedTypes.join(' / ')}` : 'failed outputs: none',
    delivered.join('\n'),
    `acceptance checklist: platform size fit, product fidelity, prompt traceability, ZIP readiness, share link TTL risk`,
  ].join('\n');
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

function ProductImagePipelineInner() {
  const params = useSearchParams();
  const [category, setCategory] = useState<CategoryId | ''>('');
  const [scene, setScene] = useState('');
  const [sku, setSku] = useState('');
  const [handoffBanner, setHandoffBanner] = useState<string>('');

  // 从 Pipeline 01 带参数跳过来,或 ?demo=1 自动跑
  useEffect(() => {
    const fromListing = params.get('from') === 'listing';
    const qSku = params.get('sku');
    const qCat = params.get('category');
    const isDemo = params.get('demo') === '1';

    if (fromListing && qSku) {
      setSku(qSku);
      if (qCat && ['home', 'auto', 'digital', 'tool', 'living'].includes(qCat)) {
        setCategory(qCat as CategoryId);
      }
      setHandoffBanner('已从上新流程带入 SKU，选一个场景即可直接生图');
    } else if (isDemo) {
      // Demo: 家居厨房场景 + 只跑 main + scene 省 60% 成本 (2 图 vs 5 图)
      setCategory('home');
      setScene('home-kitchen');
      setSku('可叠加密封收纳盒套装（6件装）\nBPA-Free 食品级 PP，四侧卡扣密封\n3 种规格 (0.5L/1.2L/2.5L)，可叠放节省 40% 空间\nAmazon 4.8★ 2300+ 评论');
      setSelectedOutputs(new Set(['main', 'scene']));
      setHandoffBanner('演示模式 · HOMELODY 收纳盒 + 厨房台面场景 · 自动生 2 张图');
      setTimeout(() => { void runDemoGen('home', 'home-kitchen', '可叠加密封收纳盒套装（6件装）BPA-Free 食品级 PP，四侧卡扣密封'); }, 250);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runDemoGen = async (cat: string, sceneId: string, skuText: string) => {
    setRunning(true);
    setError('');
    setImages([]);
    setPreviewNotice('');
    try {
      const res = await fetch('/api/image-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: cat, skuInfo: skuText, scenePreset: sceneId, outputs: ['main', 'scene'], fromPipeline: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'HTTP ' + res.status);
      setImages(data.images || []);
      if (data.notice) setPreviewNotice(data.notice);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setRunning(false);
    }
  };
  const [selectedOutputs, setSelectedOutputs] = useState<Set<OutputType>>(
    new Set(['main', 'scene', 'detail', 'lifestyle', 'compare'])
  );
  const [running, setRunning] = useState(false);
  const [images, setImages] = useState<GenImage[]>([]);
  const [error, setError] = useState('');
  const [previewNotice, setPreviewNotice] = useState('');

  const scenePresets = category ? getScenePresets(category) : [];

  const toggleOutput = (t: OutputType) => {
    const next = new Set(selectedOutputs);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    setSelectedOutputs(next);
  };

  // 单张图重生 · 对 selectedOutputs 中未 return 的类型补生
  const [retrying, setRetrying] = useState<Set<OutputType>>(new Set());
  const retryOne = async (type: OutputType) => {
    if (!category || !scene) return;
    if (retrying.has(type)) return;
    setRetrying(prev => new Set(prev).add(type));
    try {
      const res = await fetch('/api/image-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, skuInfo: sku, scenePreset: scene, outputs: [type], fromPipeline: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'HTTP ' + res.status);
      const newImages = (data.images || []) as GenImage[];
      if (newImages.length > 0) {
        // 替换已有或追加
        setImages(prev => {
          const without = prev.filter(img => img.type !== type);
          return [...without, ...newImages];
        });
      }
    } catch (err) {
      alert('重试失败: ' + (err instanceof Error ? err.message : 'unknown'));
    } finally {
      setRetrying(prev => { const n = new Set(prev); n.delete(type); return n; });
    }
  };

  // 计算有哪些选中的输出类型没有在结果里 = 失败/待重生
  const failedTypes: OutputType[] = Array.from(selectedOutputs).filter(
    t => !images.some(img => img.type === t)
  );

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
        alert(`Pipeline 配额已达上限\n${d.resetAtText || ''}\n准备跑真实 SKU 请提交 10 SKU POC 需求`);
        return;
      }
    } catch {}

    setRunning(true);
    setError('');
    setImages([]);
    setPreviewNotice('');

    try {
      const res = await fetch('/api/image-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          skuInfo: sku,
          scenePreset: scene,
          outputs: Array.from(selectedOutputs),
          fromPipeline: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'HTTP ' + res.status);
      setImages(data.images || []);
      if (data.notice) setPreviewNotice(data.notice);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setRunning(false);
    }
  };

  // 一键打包 ZIP 下载所有图片 + 生成 README
  const [zipping, setZipping] = useState(false);
  const handleZipDownload = async () => {
    if (images.length === 0) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      const catLabel = CATEGORIES.find(c => c.id === category)?.label || category;

      // 并行下载所有图片到 ArrayBuffer
      const imageFiles = await Promise.all(
        images.map(async (img, i) => {
          try {
            const res = await fetch(img.url);
            if (!res.ok) return null;
            const blob = await res.blob();
            const ext = blob.type === 'image/png' ? 'png' : 'jpg';
            return {
              name: `${String(i + 1).padStart(2, '0')}-${img.type}.${ext}`,
              blob,
              meta: img,
            };
          } catch { return null; }
        })
      );

      const successful = imageFiles.filter(Boolean) as { name: string; blob: Blob; meta: typeof images[0] }[];
      successful.forEach(f => zip.file(f.name, f.blob));

      // README.md 含所有 prompt 和元数据
      const readme = `# wenai · AI 电商主图产出包

- 生成时间: ${new Date().toLocaleString('zh-CN')}
- 品类: ${catLabel}
- 场景: ${scene}
- Provider: ${successful[0]?.meta.provider || 'unknown'}
- 图片数: ${successful.length} / 请求 ${images.length}

## 商品信息
${sku}

## 图片清单

${successful.map((f, i) => `### ${i + 1}. ${f.meta.label} (${f.name})
- 尺寸: ${f.meta.width}×${f.meta.height}
- Prompt: ${f.meta.prompt}
`).join('\n')}

## 平台尺寸建议
- Amazon: 2000×2000 (主图需白底)
- Shopee: 800×800
- Lazada: 1080×1080
- Instagram: 1080×1080

---
*by wenai · Pipeline 03 · 通义万相*
`;
      zip.file('README.md', readme);

      const content = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      const skuFirstLine = (sku.split('\n')[0] || '').slice(0, 15);
      a.download = exportFilename('主图', `${catLabel}-${skuFirstLine}`, 'zip');
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('打包失败: ' + (err instanceof Error ? err.message : 'unknown'));
    } finally {
      setZipping(false);
    }
  };

  // 分享公开链接 (含图片 URL 列表 markdown)
  const [sharing, setSharing] = useState(false);
  const handleShare = async () => {
    if (images.length === 0) return;
    setSharing(true);
    try {
      const catLabel = CATEGORIES.find(c => c.id === category)?.label || '';
      const md = `## AI 电商主图产出 · ${catLabel}

**商品**: ${sku.split('\n')[0]}

${images.map((img, i) => `### ${i + 1}. ${img.label}

![${img.label}](${img.url})

- 尺寸: ${img.width}×${img.height}
- Prompt: ${img.prompt}
`).join('\n')}

---

平台尺寸建议: Amazon 2000² · Shopee 800² · Lazada 1080² · Instagram 1080²`;

      const title = `${catLabel} · ${sku.split('\n')[0].slice(0, 40)} · ${images.length} 张主图`;
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId: 'pipeline-03', source: 'pipeline-03', title, content: md }),
      });
      const data = await res.json();
      if (!res.ok || !data.id) throw new Error(data.error || '分享失败');
      const fullUrl = `${window.location.origin}/share/${data.id}`;
      const nav = navigator as Navigator & { share?: (data: { title: string; url: string }) => Promise<void> };
      if (typeof nav.share === 'function') {
        try { await nav.share({ title: 'wenai · AI 电商主图产出', url: fullUrl }); return; } catch {}
      }
      await nav.clipboard.writeText(fullUrl);
      alert('链接已复制到剪贴板\n' + fullUrl + '\n\n7 天有效 · 含所有图片 + prompt');
    } catch (err) {
      alert('分享失败: ' + (err instanceof Error ? err.message : 'unknown'));
    } finally {
      setSharing(false);
    }
  };

  const categoryLabel = CATEGORIES.find(c => c.id === category)?.label || '未指定品类';
  const sceneLabel = scenePresets.find(s => s.id === scene)?.label || scene;
  const selectedOutputLabels = ALL_OUTPUTS.filter(o => selectedOutputs.has(o.type)).map(o => o.label);
  const standardPackHref = buildProductImageStandardPackRoute({
    categoryLabel,
    sceneLabel,
    skuInput: sku,
    outputs: selectedOutputLabels,
  });
  const resultStandardPackHref = images.length > 0
    ? buildProductImageStandardPackRoute({
        categoryLabel,
        sceneLabel,
        skuInput: sku,
        outputs: selectedOutputLabels,
        resultSummary: buildProductImageResultSummary({
          images,
          selectedOutputs,
          failedTypes,
          categoryLabel,
          sceneLabel,
        }),
      })
    : '';

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
            <a href="/docs#pipeline-03" className="text-[10px] font-mono text-text-tertiary border border-border-subtle rounded-md px-3 py-1.5 hover:text-accent hover:border-accent/40">
              📚 手册
            </a>
            <a href="/enterprise" className="text-[10px] font-mono text-text-tertiary border border-dashed border-border-default rounded-md px-3 py-1.5 hover:text-accent hover:border-accent/40">
              支持企业级定制 →
            </a>
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

      {/* 联动 handoff banner */}
      {handoffBanner && (
        <div className="mb-4 p-3 border border-accent/40 bg-accent/10 rounded-md flex items-center gap-3">
          <span className="text-accent text-[14px]">↳</span>
          <div className="flex-1">
            <div className="text-[11px] font-semibold text-accent">{handoffBanner}</div>
            <div className="text-[10px] font-mono text-text-tertiary mt-0.5">从上新资料直接进入主图生成</div>
          </div>
          <button
            onClick={() => { setHandoffBanner(''); setSku(''); setCategory(''); setScene(''); }}
            className="text-[10px] font-mono text-text-tertiary hover:text-accent"
          >
            清空
          </button>
        </div>
      )}

      {/* Provider 状态条 */}
      <div className="mb-4 p-3 border border-success/30 bg-success/5 rounded-md">
        <div className="flex items-start gap-2">
          <span className="text-success text-[14px] flex-shrink-0">🎨</span>
          <div>
            <div className="text-[11px] font-semibold text-success mb-1">
              已接入阿里通义万相 · 真实 AI 生图
            </div>
            <p className="text-[10px] text-text-secondary leading-relaxed">
              默认使用 wanx2.1-t2i-turbo 模型，单图约 6 秒，中文 prompt 原生支持。
              如外部服务暂时不可用，页面会明确提示并保留生产规格，方便团队继续执行。
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
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && category && scene && sku.length >= 10 && !running) {
              e.preventDefault();
              handleGenerate();
            }
          }}
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
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <a
            href={standardPackHref}
            className={`px-4 py-2 border text-[11px] font-mono rounded-md transition-colors ${
              sku.trim().length
                ? 'border-cat-content/40 text-cat-content hover:bg-cat-content/10'
                : 'border-border-subtle text-text-tertiary pointer-events-none opacity-50'
            }`}
          >
            生成商品图 SOP 标品包
          </a>
          <button
            onClick={handleGenerate}
            disabled={!category || !scene || sku.length < 10 || running}
            className="px-5 py-2 bg-accent text-bg-root text-[12px] font-semibold rounded-md hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {running ? '生成中...' : '开始生成 →'}
          </button>
        </div>
      </div>

      {previewNotice && images.length > 0 && (
        <div className="mb-4 p-2.5 border border-border-subtle rounded text-[10px] font-mono text-text-tertiary bg-bg-surface/50">
          ⓘ {previewNotice}
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
          {/* 24h TTL 硬提示 · 避免分享后图 404 翻车 */}
          {images.some(i => i.provider === 'wanx') && (
            <div className="mb-3 px-3 py-2 border border-accent/40 bg-accent/5 rounded-md flex items-start gap-2">
              <span className="text-accent text-[13px] flex-shrink-0">⏳</span>
              <div className="flex-1">
                <div className="text-[11px] font-semibold text-accent">wanx 图片 URL 24 小时内有效</div>
                <div className="text-[10px] font-mono text-text-tertiary mt-0.5">
                  要交付/存档请立即点 <strong>⬇ ZIP</strong> 下载到本地。分享链接超过 24h 图会变 404,需要时重新生成即可。
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
              生成结果 · {images.length} 张
            </span>
            <div className="flex items-center gap-2">
              <a
                href={resultStandardPackHref}
                className="px-3 py-1.5 border border-cat-content/40 bg-cat-content/10 text-cat-content text-[10px] font-mono rounded hover:bg-cat-content/20"
                title="把本次商品图结果转成可验收的标准交付包"
              >
                生成商品图验收标品包
              </a>
              <button
                onClick={handleZipDownload}
                disabled={zipping}
                className="px-3 py-1.5 border border-accent/40 bg-accent/10 text-accent text-[10px] font-mono rounded hover:bg-accent/20 disabled:opacity-50"
                title="打包所有图片 + README.md 到一个 ZIP"
              >
                {zipping ? '打包中...' : '⬇ 一键打包 ZIP'}
              </button>
              <button
                onClick={handleShare}
                disabled={sharing}
                className="px-3 py-1.5 border border-accent/40 bg-accent/10 text-accent text-[10px] font-mono rounded hover:bg-accent/20 disabled:opacity-50"
                title="生成 7 天有效公开链接,发给主管看成图"
              >
                {sharing ? '生成中...' : '🔗 分享'}
              </button>
              <span className="text-[9px] font-mono text-text-tertiary hidden md:inline">平台尺寸:</span>
              {Object.entries(PLATFORM_SIZES).map(([k, v]) => (
                <span key={k} className="px-1.5 py-0.5 bg-bg-raised text-[9px] font-mono text-text-tertiary rounded hidden md:inline">
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
                  <span className={`absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-mono rounded ${
                    img.provider === 'wanx'
                      ? 'bg-success/20 text-success'
                      : img.provider === 'local-preview'
                      ? 'bg-accent/20 text-accent'
                      : 'bg-accent/20 text-accent'
                  }`}>
                    {img.provider === 'wanx' ? '通义万相' : img.provider === 'local-preview' ? '本地预览' : img.provider.toUpperCase()}
                  </span>
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
                      download={exportFilename('主图', `${img.label}`, 'jpg')}
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

          {/* 失败/未生成的类型 · 单张重试 */}
          {failedTypes.length > 0 && !running && (
            <div className="mt-4 p-3 border border-error/30 bg-error/5 rounded-md">
              <div className="text-[11px] font-semibold text-error mb-2">
                {failedTypes.length} 张图未成功 · 可单独重生
              </div>
              <div className="flex flex-wrap gap-2">
                {failedTypes.map(t => {
                  const label = ALL_OUTPUTS.find(o => o.type === t)?.label || t;
                  const isRetrying = retrying.has(t);
                  return (
                    <button
                      key={t}
                      onClick={() => retryOne(t)}
                      disabled={isRetrying}
                      className="px-3 py-1.5 text-[11px] font-mono text-error border border-error/40 rounded hover:bg-error/10 disabled:opacity-50"
                    >
                      {isRetrying ? `${label} 重生中...` : `↻ 重生 ${label}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 案例引导 */}
      <div className="mt-4 flex items-center justify-between px-3 py-2 text-[10px] font-mono text-text-tertiary border border-border-subtle/60 rounded-md bg-bg-surface/30">
        <span>N 代工 · ¥3500/SKU 摄影棚 → ¥0.7/SKU wanx · 5000× 成本压缩</span>
        <Link href="/cases/novahome-image" className="text-accent hover:underline">看 Before/After →</Link>
      </div>
    </div>
  );
}

export default function ProductImagePipelinePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-text-tertiary font-mono text-[12px]">加载中...</div>}>
      <ProductImagePipelineInner />
    </Suspense>
  );
}
