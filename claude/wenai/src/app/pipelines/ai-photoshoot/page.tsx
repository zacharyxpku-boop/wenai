'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';

/**
 * AI 影棚 · gpt-image-1 旗舰模块 (5 模式闭环)
 *
 * 工作流参考: @冉胖子《赢麻了!电商模特AI换装新玩法》
 *   ① 模特生图   (model-generate) · 纯文字生成 AI 模特
 *   ② 模特换装   (outfit-swap)    · 模特图 + 服装图 → 上身效果
 *   ③ 模特换姿   (pose-change)    · 模特图 → 4 种平面拍照姿势
 *   ④ 模特换景   (scene-change)   · 模特图 → 居家/咖啡馆/影棚等场景
 *   ⑤ OOTD 拆解 (ootd-flatlay)   · 整体造型图 → 单品 ins 风平铺
 *
 * 替代真人模特拍摄 ¥3-8K/组 → AI ¥0.3-1.2/张
 * 配色: wenai dark + 金色 accent, 视觉参考 PhotoRoom + Pebblely + 即梦
 */

type Mode = 'model-generate' | 'outfit-swap' | 'pose-change' | 'scene-change' | 'ootd-flatlay';
type Quality = 'low' | 'medium' | 'high';
type Size = '1024x1024' | '1024x1536' | '1536x1024';

interface GenImage {
  index: number;
  url: string;
  revisedPrompt: string | null;
  provider: string;
  model: string;
}

interface CostInfo {
  perImageUsd: number;
  totalUsd: number;
}

interface ModeMeta {
  title: string;
  icon: string;
  desc: string;
  cost: string;
  refSlots: { label: string; required: boolean; hint: string }[];
  promptHint: string;
}

// ============================================================
// 5 模式元数据 + 文章实测 prompt 直采
// ============================================================
const MODES: Record<Mode, ModeMeta> = {
  'model-generate': {
    title: '模特生图',
    icon: '👩‍🎤',
    desc: '纯文字生成 AI 模特,免授权可商用',
    cost: '替代外模摄影 ¥1-3K/组',
    refSlots: [],
    promptHint: '描述模特特征、穿搭、姿势、场景。越具体越好。',
  },
  'outfit-swap': {
    title: '模特换装',
    icon: '👗',
    desc: '把服装图换到模特身上,一键上身',
    cost: '替代真人试装 ¥3-8K/组',
    refSlots: [
      { label: '模特图', required: true, hint: '已有的人物图(可用模式①生成)' },
      { label: '服装图', required: true, hint: '平铺/挂拍/官方图都行' },
    ],
    promptHint: '默认: 把图二的服装换到图一的模特身上。可加细节: 强调质感/光影/廓形。',
  },
  'pose-change': {
    title: '模特换姿',
    icon: '🤸',
    desc: '保人物不变,生成 4 种平面拍照姿势',
    cost: '替代多次拍摄 ¥2-5K/组',
    refSlots: [
      { label: '模特图', required: true, hint: '上传一张完整造型,生成多组动作' },
    ],
    promptHint: '默认: 保持人物不变,换 4 种平面模特拍照姿势。可指定: 走路/坐姿/侧身等。',
  },
  'scene-change': {
    title: '模特换景',
    icon: '🌆',
    desc: '一组造型 → 多场景批量出图',
    cost: '替代外景拍摄 ¥3-10K/组',
    refSlots: [
      { label: '模特图', required: true, hint: '一张造型图,自动适配场景动作' },
    ],
    promptHint: '默认: 保持人物不变,更换场景(居家/咖啡馆/商业摄影棚/街头),并匹配相应动作。',
  },
  'ootd-flatlay': {
    title: 'OOTD 拆解',
    icon: '🛍️',
    desc: '整体造型 → 单品 ins 风平铺图',
    cost: '替代单品拍摄 ¥500-2K/SKU',
    refSlots: [
      { label: '整体造型图', required: true, hint: '上身的整套穿搭' },
    ],
    promptHint: '默认: 拆成发饰/上衣/项链/裙子/鞋/袜,纯白底 ins 风,顶部花体 OOTD 标题。',
  },
};

// 文章实测 prompt 模板 (来自冉胖子工作流) · 用户填的 extraPrompt 会拼到尾部
const PROMPT_TEMPLATES: Record<Mode, (extra: string) => string> = {
  'model-generate': extra => [
    '8K超清,真人感。全身照片,广角镜头,平视视角。',
    extra || '一位身材匀称、气质甜酷风格的时尚女模特,亚洲面孔,马尾发型,粉黑格纹短款衬衫配黑色百褶短裙,黑色厚底乐福鞋。',
    '光线均匀柔和,皮肤纹理真实,毛发清晰,杂志大片质感。背景为纯白色。',
  ].join(' '),

  'outfit-swap': extra => [
    '把图二的服装换到图一的模特身上。智能参考强度 100。',
    '完整保留模特面部、发型、体型、姿势,仅替换身上的服装为图二的款式。',
    '服装的版型、面料质感、颜色、印花、装饰细节(如纽扣/拉链/抽绳/印花)必须 1:1 还原图二。',
    '光影自然贴合模特身形,8K 超清电商大片质感。',
    extra ? `额外要求: ${extra}` : '',
  ].filter(Boolean).join(' '),

  'pose-change': extra => [
    '保持人物的面部、发型、服装、体型完全不变,生成 4 种不同的平面模特拍照姿势。',
    '姿势包括: 正面站姿、45° 侧身、行走中、半身回眸特写。',
    '动作自然优雅,符合时尚杂志大片审美,光线均匀柔和。',
    '每个姿势独立成图,背景统一,8K 超清。',
    extra ? `特别要求: ${extra}` : '',
  ].filter(Boolean).join(' '),

  'scene-change': extra => [
    '保持人物的面部、发型、服装、体型完全不变,更换不同场景,并匹配相应的动作。',
    '场景分别为: 居家(沙发/温暖灯光)、咖啡馆(自然光/木质桌椅)、商业摄影棚(白底/专业打光)、街头(都市建筑/日系街拍光)。',
    '每个场景的人物动作要自然贴合环境(居家放松、咖啡馆侧坐、影棚正面、街头行走)。',
    '8K 高清,光影真实,景深虚化突出人物。',
    extra ? `补充: ${extra}` : '',
  ].filter(Boolean).join(' '),

  'ootd-flatlay': extra => [
    '将图片人物的时尚穿搭拆解成各个单品,以 ins 风格摆放在一个纯白色背景上。',
    '拆解清单: 发饰、上衣、领带/项链(如有)、外套(如有)、裙子/裤子、鞋子、袜子、包包(如有)、其他配饰。',
    '每件单品独立摆放,间距均匀,排列美观,从上到下、从左到右有节奏感。',
    '顶部用英文手写花体写"OOTD",字号适中,居中。',
    '光线均匀柔和,产品质感真实,8K 超清电商平铺图。',
    extra ? `特殊要求: ${extra}` : '',
  ].filter(Boolean).join(' '),
};

// ============================================================
// Component
// ============================================================
export default function AIPhotoshootPage() {
  const [mode, setMode] = useState<Mode>('outfit-swap');

  // 多图垫图 (按 mode 决定槽位数)
  const [refImages, setRefImages] = useState<(string | null)[]>([null, null]);

  // 用户额外细节
  const [extraPrompt, setExtraPrompt] = useState('');

  // 输出参数
  const [quality, setQuality] = useState<Quality>('medium');
  const [size, setSize] = useState<Size>('1024x1536');
  const [n, setN] = useState(2);

  // 状态
  const [running, setRunning] = useState(false);
  const [images, setImages] = useState<GenImage[]>([]);
  const [error, setError] = useState('');
  const [cost, setCost] = useState<CostInfo | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showFinalPrompt, setShowFinalPrompt] = useState(false);

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const meta = MODES[mode];
  const requiredSlots = meta.refSlots.length;

  const handleFile = (file: File, slot: number) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('图片 > 10MB,先压缩再上传');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      setRefImages(prev => {
        const next = [...prev];
        next[slot] = result;
        return next;
      });
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const removeRef = (slot: number) => {
    setRefImages(prev => {
      const next = [...prev];
      next[slot] = null;
      return next;
    });
    const input = fileInputRefs.current[slot];
    if (input) input.value = '';
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setImages([]);
    setError('');
    setRefImages(MODES[m].refSlots.map(() => null));
  };

  const handleGenerate = async () => {
    // 校验必填垫图
    for (let i = 0; i < requiredSlots; i++) {
      if (meta.refSlots[i].required && !refImages[i]) {
        setError(`请上传 ${meta.refSlots[i].label}`);
        return;
      }
    }

    setRunning(true);
    setError('');
    setImages([]);
    setCost(null);

    try {
      const refList = refImages.slice(0, requiredSlots).filter((x): x is string => !!x);
      const finalMode: 'generate' | 'edit' = refList.length > 0 ? 'edit' : 'generate';
      const prompt = PROMPT_TEMPLATES[mode](extraPrompt.trim());

      const res = await fetch('/api/openai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: finalMode,
          scenario: mode,
          prompt,
          referenceImages: refList,
          size,
          quality,
          n,
          fromPipeline: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setImages(data.images || []);
      if (data.cost) setCost(data.cost);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setRunning(false);
    }
  };

  const downloadImage = (url: string, idx: number) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `wenai-${mode}-${Date.now()}-${idx}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllZip = async () => {
    if (images.length === 0) return;
    const zip = new JSZip();
    for (const img of images) {
      if (img.url.startsWith('data:image')) {
        const b64 = img.url.split(',')[1];
        zip.file(`wenai-${mode}-${img.index + 1}.png`, b64, { base64: true });
      }
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wenai-${mode}-${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const finalPrompt = PROMPT_TEMPLATES[mode](extraPrompt.trim());
  const estCostUsd = ({ low: 0.011, medium: 0.042, high: 0.167 }[quality] * n);

  return (
    <div className="min-h-screen bg-bg-root">
      {/* Hero */}
      <div className="border-b border-border-subtle bg-gradient-to-b from-bg-surface/50 to-transparent">
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">
              AI PHOTOSHOOT · gpt-image-1
            </span>
            <span className="text-[9px] font-mono text-accent/70 px-2 py-0.5 border border-accent/30 rounded-full">
              5 模式闭环
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
            AI 影棚 · 替你出 ¥5000 一组的电商图
          </h1>
          <p className="text-[13px] lg:text-[14px] text-text-secondary leading-relaxed max-w-[760px]">
            生成 AI 模特 → 模特换装 → 换姿 → 换景 → OOTD 拆解,完整闭环。
            <span className="text-accent">同一张模特图复用一整年</span>,告别真人拍摄 ¥3-8K/组成本。
          </p>

          {/* Mode tabs */}
          <div className="flex gap-2 mt-6 flex-wrap">
            {(Object.keys(MODES) as Mode[]).map(m => {
              const mm = MODES[m];
              const active = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-2 ${
                    active
                      ? 'bg-accent text-bg-root shadow-lg'
                      : 'border border-border-subtle text-text-secondary hover:border-accent/40 hover:text-text-primary'
                  }`}
                >
                  <span className="text-base">{mm.icon}</span>
                  <span>{mm.title}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] font-mono text-text-tertiary mt-3">
            {meta.icon} {meta.desc} · <span className="text-accent">{meta.cost}</span>
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-[1280px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* LEFT · Sticky control panel */}
        <aside className="lg:sticky lg:top-4 lg:self-start space-y-4">
          {/* Reference uploads */}
          {requiredSlots > 0 && (
            <section className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30 space-y-3">
              <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                ① 垫图 ({requiredSlots} 张)
              </div>
              {meta.refSlots.map((slot, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono text-text-secondary">
                      {slot.label} {slot.required && <span className="text-error">*</span>}
                    </span>
                    <span className="text-[9px] font-mono text-text-tertiary">{slot.hint}</span>
                  </div>
                  {refImages[i] ? (
                    <div className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={refImages[i] as string} alt={slot.label} className="w-full rounded-md border border-border-default max-h-[200px] object-contain bg-bg-root" />
                      <button
                        onClick={() => removeRef(i)}
                        className="absolute top-1.5 right-1.5 px-2 py-0.5 bg-bg-root/80 backdrop-blur text-[10px] font-mono text-text-primary rounded hover:bg-error/20 hover:text-error"
                      >
                        ✗
                      </button>
                    </div>
                  ) : (
                    <label
                      className="block border-2 border-dashed border-border-default hover:border-accent/60 rounded-md p-4 text-center cursor-pointer transition-colors"
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.preventDefault();
                        const f = e.dataTransfer.files?.[0];
                        if (f && f.type.startsWith('image/')) handleFile(f, i);
                      }}
                    >
                      <input
                        ref={el => { fileInputRefs.current[i] = el; }}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) handleFile(f, i);
                        }}
                      />
                      <div className="text-xl mb-1">📤</div>
                      <p className="text-[11px] text-text-primary font-semibold">点击或拖放</p>
                      <p className="text-[9px] font-mono text-text-tertiary">PNG/JPG/WebP ≤10MB</p>
                    </label>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* 额外 prompt */}
          <section className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30 space-y-2">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
              {requiredSlots > 0 ? '②' : '①'} 额外细节 (可选)
            </div>
            <textarea
              value={extraPrompt}
              onChange={e => setExtraPrompt(e.target.value)}
              placeholder={meta.promptHint}
              rows={3}
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
              输出参数
            </div>
            <Field label="质量">
              <Pills
                options={[
                  { id: 'low', cn: '低 $0.011' },
                  { id: 'medium', cn: '中 $0.042' },
                  { id: 'high', cn: '高 $0.167' },
                ]}
                value={quality}
                onChange={v => setQuality(v as Quality)}
              />
            </Field>
            <Field label="尺寸">
              <Pills
                options={[
                  { id: '1024x1024', cn: '方形' },
                  { id: '1024x1536', cn: '竖图(模特推荐)' },
                  { id: '1536x1024', cn: '横图' },
                ]}
                value={size}
                onChange={v => setSize(v as Size)}
              />
            </Field>
            <Field label="数量">
              <Pills
                options={[1, 2, 3, 4].map(x => ({ id: String(x), cn: `${x} 张` }))}
                value={String(n)}
                onChange={v => setN(parseInt(v, 10))}
              />
            </Field>
            <div className="text-[10px] font-mono text-text-tertiary tabular-nums pt-1 border-t border-border-subtle">
              预估成本: ${estCostUsd.toFixed(3)} ≈ ¥{(estCostUsd * 7.2).toFixed(2)}
            </div>
          </section>

          {/* CTA */}
          <button
            onClick={handleGenerate}
            disabled={running}
            className="w-full py-3.5 bg-accent text-bg-root rounded-lg text-[14px] font-bold hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {running ? '生成中... (15-40 秒)' : `🎬 开始生成 · ${n} 张`}
          </button>

          {error && (
            <div className="p-3 border border-error/40 bg-error/5 rounded text-[11px] text-error">
              ✗ {error}
            </div>
          )}
        </aside>

        {/* RIGHT · Result */}
        <main className="space-y-4 min-h-[600px]">
          {running && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: n }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-lg bg-bg-surface border border-border-subtle animate-pulse flex items-center justify-center"
                >
                  <div className="text-text-tertiary text-[11px] font-mono">
                    生成第 {i + 1}/{n} 张...
                  </div>
                </div>
              ))}
            </div>
          )}

          {!running && images.length === 0 && <EmptyState mode={mode} />}

          {!running && images.length > 0 && (
            <>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-[14px] font-bold text-text-primary">
                    生成完成 · {images.length} 张
                  </div>
                  {cost && (
                    <div className="text-[10px] font-mono text-text-tertiary mt-0.5 tabular-nums">
                      实际成本: ${cost.totalUsd} ≈ ¥{(cost.totalUsd * 7.2).toFixed(2)} · 真人拍摄需 ¥{({
                        'model-generate': '1000-3000',
                        'outfit-swap': '3000-8000',
                        'pose-change': '2000-5000',
                        'scene-change': '3000-10000',
                        'ootd-flatlay': '500-2000',
                      } as Record<Mode, string>)[mode]}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={downloadAllZip}
                    className="px-3 py-1.5 border border-accent/40 text-accent text-[11px] font-mono rounded hover:bg-accent/10"
                  >
                    📦 全部 ZIP
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="px-3 py-1.5 border border-border-default text-text-primary text-[11px] font-mono rounded hover:border-accent/40"
                  >
                    🔄 再生一组
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="group relative rounded-lg border border-border-subtle overflow-hidden hover:border-accent/40 transition-colors"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={`AI 生成 ${idx + 1}`}
                      className="w-full h-auto block cursor-zoom-in"
                      onClick={() => setPreviewImage(img.url)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-root/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end gap-2">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setPreviewImage(img.url)}
                          className="text-[10px] font-mono px-2 py-1 bg-bg-root/80 backdrop-blur text-text-primary rounded hover:bg-accent hover:text-bg-root"
                        >
                          🔍 放大
                        </button>
                        <button
                          onClick={() => downloadImage(img.url, idx)}
                          className="text-[10px] font-mono px-2 py-1 bg-bg-root/80 backdrop-blur text-text-primary rounded hover:bg-accent hover:text-bg-root"
                        >
                          ⬇ 下载
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Workflow next-step hint */}
              <NextStepHint mode={mode} onSwitch={switchMode} />

              {/* Cost compare */}
              <div className="border border-success/30 bg-success/5 rounded-lg p-4 mt-4">
                <div className="text-[11px] font-mono text-success uppercase tracking-wider mb-2">
                  💰 成本对比
                </div>
                <div className="grid grid-cols-2 gap-4 text-[12px]">
                  <div>
                    <div className="text-text-tertiary">真人摄影 + 后期</div>
                    <div className="text-text-primary font-bold text-lg">
                      ¥{({
                        'model-generate': '1000-3000',
                        'outfit-swap': '3000-8000',
                        'pose-change': '2000-5000',
                        'scene-change': '3000-10000',
                        'ootd-flatlay': '500-2000',
                      } as Record<Mode, string>)[mode]}
                    </div>
                    <div className="text-text-tertiary text-[10px] mt-0.5">需 1-3 天 · 拍完只能用一次</div>
                  </div>
                  <div>
                    <div className="text-success">AI 影棚 · 本次</div>
                    <div className="text-success font-bold text-lg">
                      ¥{((cost?.totalUsd || 0) * 7.2).toFixed(2)}
                    </div>
                    <div className="text-success/70 text-[10px] mt-0.5">
                      30 秒 · 不满意秒重生 · 可无限复用
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Lightbox */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-bg-root/95 backdrop-blur z-50 flex items-center justify-center p-4 cursor-zoom-out"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewImage} alt="preview" className="max-w-full max-h-full rounded-lg shadow-2xl" />
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 text-text-primary text-2xl hover:text-accent"
          >
            ✗
          </button>
        </div>
      )}

      {/* Footer / cross-link */}
      <div className="max-w-[1280px] mx-auto px-6 py-10 border-t border-border-subtle mt-10">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
          其他模块
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/pipelines/new-listing" className="px-3 py-1.5 border border-border-subtle rounded text-[11px] font-mono text-text-secondary hover:border-accent/40 hover:text-accent">
            新品上架 Pipeline →
          </Link>
          <Link href="/pipelines/influencer-outbound" className="px-3 py-1.5 border border-border-subtle rounded text-[11px] font-mono text-text-secondary hover:border-accent/40 hover:text-accent">
            达人外联 Pipeline →
          </Link>
          <Link href="/pipelines/product-image" className="px-3 py-1.5 border border-border-subtle rounded text-[11px] font-mono text-text-secondary hover:border-accent/40 hover:text-accent">
            产品图 (wanx · 中文 prompt) →
          </Link>
          <Link href="/inquire?from=ai-photoshoot" className="px-3 py-1.5 border border-accent/30 rounded text-[11px] font-mono text-accent hover:bg-accent/10">
            企业批量定制 →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Subcomponents
// ============================================================
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

function EmptyState({ mode }: { mode: Mode }) {
  const samples: Record<Mode, { emoji: string; title: string; desc: string }[]> = {
    'model-generate': [
      { emoji: '👩', title: '日系甜酷女模', desc: '亚洲面孔 · 马尾 · 格纹衬衫 · 百褶裙 · 厚底鞋' },
      { emoji: '🧑', title: '欧美街头男模', desc: '混血面孔 · 短发 · 工装外套 · 牛仔裤 · 马丁靴' },
      { emoji: '👵', title: '银发轻熟女模', desc: '50+ 优雅气质 · 大牌走秀风' },
    ],
    'outfit-swap': [
      { emoji: '👗', title: '连衣裙上身', desc: '模特图 + 平铺连衣裙 → 上身效果' },
      { emoji: '🧥', title: '外套换装', desc: '同一模特换不同外套对比' },
      { emoji: '👚', title: '衬衫多色', desc: '一件款式 5 个颜色,模特同姿势对比' },
    ],
    'pose-change': [
      { emoji: '🚶', title: '站坐走回眸', desc: '一张造型 → 4 种姿势' },
      { emoji: '📸', title: '杂志大片', desc: '正面 / 侧面 / 背面 / 特写' },
      { emoji: '🎭', title: '动作多变', desc: '保人物不变,只改动作' },
    ],
    'scene-change': [
      { emoji: '🏠', title: '居家场景', desc: '沙发 / 阳台 / 厨房' },
      { emoji: '☕', title: '咖啡馆', desc: '木质桌椅 / 自然光 / 文艺感' },
      { emoji: '🌃', title: '街拍', desc: '日系街头 / 巴黎 / 东京' },
    ],
    'ootd-flatlay': [
      { emoji: '🛍️', title: '完整造型拆解', desc: '上衣 + 裙子 + 鞋 + 配饰平铺' },
      { emoji: '💍', title: 'ins 风排版', desc: '纯白底 + OOTD 花体标题' },
      { emoji: '🎨', title: '电商单品图', desc: '每件单独立项,适合详情页' },
    ],
  };
  const meta = MODES[mode];
  return (
    <div className="border border-dashed border-border-default rounded-lg p-8">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{meta.icon}</div>
        <h3 className="text-[16px] font-bold text-text-primary mb-1">{meta.title} · 示例</h3>
        <p className="text-[12px] text-text-tertiary">左侧填好后右下角按钮开始生成</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {samples[mode].map((s, i) => (
          <div key={i} className="border border-border-subtle rounded-lg p-3 bg-bg-surface/30">
            <div className="text-2xl mb-2">{s.emoji}</div>
            <div className="text-[12px] font-semibold text-text-primary mb-1">{s.title}</div>
            <div className="text-[11px] text-text-tertiary leading-relaxed">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 闭环引导: 生成完一张图后建议下一步
function NextStepHint({ mode, onSwitch }: { mode: Mode; onSwitch: (m: Mode) => void }) {
  const next: Record<Mode, { mode: Mode; cta: string } | null> = {
    'model-generate': { mode: 'outfit-swap', cta: '下载这张模特图后,去模特换装给 ta 换衣服' },
    'outfit-swap': { mode: 'pose-change', cta: '换装完成 → 去模特换姿生成 4 个角度' },
    'pose-change': { mode: 'scene-change', cta: '姿势齐了 → 去模特换景把 ta 放进不同场景' },
    'scene-change': { mode: 'ootd-flatlay', cta: '场景拍完 → 去 OOTD 拆解一套出 8 张单品图' },
    'ootd-flatlay': null,
  };
  const n = next[mode];
  if (!n) return null;
  return (
    <div className="border border-accent/30 bg-accent/5 rounded-lg p-3 flex items-center justify-between gap-3 flex-wrap">
      <div className="text-[12px] text-text-secondary">
        <span className="text-accent font-semibold">闭环工作流 →</span> {n.cta}
      </div>
      <button
        onClick={() => onSwitch(n.mode)}
        className="text-[11px] font-mono px-3 py-1.5 bg-accent text-bg-root rounded hover:bg-accent-hover"
      >
        {MODES[n.mode].icon} {MODES[n.mode].title} →
      </button>
    </div>
  );
}
