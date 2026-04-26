'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

/**
 * 爆款视频拆解 · /pipelines/video-teardown
 * 借鉴 clico/worker/workers/analysis.worker.ts 的 storyboard schema 简化版
 *
 * 用户流程:
 *   1. 自己从 TikTok/抖音/小红书 下载视频 (或者用浏览器扩展)
 *   2. 上传 mp4 (≤8MB,≤30s)
 *   3. 输入"我的产品" hint
 *   4. Gemini 2.5 Flash 拆出 storyboard
 *   5. 每个 scene 的 prompt 带"复制去 AI 影棚生图"按钮
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
}

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

export default function VideoTeardownPage() {
  const [videoBase64, setVideoBase64] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoSize, setVideoSize] = useState<number>(0);
  const [productHint, setProductHint] = useState('');

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<TeardownResult | null>(null);
  const [error, setError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      setError(`视频 ${(file.size / 1024 / 1024).toFixed(1)}MB 太大,先压到 ≤8MB(推荐 30 秒以内)`);
      return;
    }
    if (!file.type.startsWith('video/')) {
      setError('必须是视频文件');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      setVideoBase64(result);
      setVideoPreview(result);
      setVideoSize(file.size);
      setError('');
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

    try {
      const res = await fetch('/api/video-teardown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoBase64, productHint: productHint.trim() || undefined }),
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
            爆款视频 → 结构化分镜
          </h1>
          <p className="text-[13px] lg:text-[14px] text-text-secondary leading-relaxed max-w-[760px]">
            扔一个 TikTok/抖音/小红书 爆款视频上来,Gemini 拆出钩子类型、节奏、情绪曲线、CTA 位置和每个镜头的图像 prompt。
            <span className="text-accent">每个镜头的 prompt 一键带去 AI 影棚生同款</span>,蹭爆款流量结构。
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
              ① 爆款视频 <span className="text-error">*</span>
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

          {/* Product hint */}
          <section className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30 space-y-2">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
              ② 你的产品 (可选)
            </div>
            <textarea
              value={productHint}
              onChange={e => setProductHint(e.target.value)}
              placeholder="例: 我的产品是一款带 LED 小夜灯的便携加湿器,适合宿舍/办公桌。请把原视频中的产品替换成这个,其他构图保持。"
              rows={4}
              className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] resize-none focus:border-accent/60 outline-none"
            />
            <p className="text-[10px] font-mono text-text-tertiary leading-relaxed">
              填了之后,scene 的 prompt 会自动把原视频产品换成你的货,直接能去影棚生图
            </p>
          </section>

          {/* CTA */}
          <button
            onClick={handleTeardown}
            disabled={running || !videoBase64}
            className="w-full py-3.5 bg-accent text-bg-root rounded-lg text-[14px] font-bold hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {running ? '拆解中... (15-30 秒)' : '🔬 开始拆解'}
          </button>

          {error && (
            <div className="p-3 border border-error/40 bg-error/5 rounded text-[11px] text-error">
              ✗ {error}
            </div>
          )}

          {/* Need Gemini key notice */}
          <div className="text-[10px] font-mono text-text-tertiary leading-relaxed border-t border-border-subtle pt-3">
            需要 GEMINI_API_KEY · 国内服务器走 GEMINI_BASE_URL Cloudflare 反代 (见 cloudflare-openai-proxy.js 同款方案,把 upstream 换成 generativelanguage.googleapis.com)
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
              <p className="text-[12px] text-text-tertiary mb-4">不是简单"分析",是可执行的复刻蓝图</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                <Tip
                  emoji="🎣"
                  title="钩子类型"
                  desc="提问/陈述/展示/故事/震惊 五选一,告诉你为什么前 3 秒留得住人"
                />
                <Tip
                  emoji="⚡"
                  title="节奏 + 情绪曲线"
                  desc="每秒切几个镜头、情绪怎么递进、什么节点上 CTA"
                />
                <Tip
                  emoji="🎬"
                  title="每个镜头的图像 prompt"
                  desc="80-150 字详细描述,直接拷去 AI 影棚就能生同款静态图"
                />
                <Tip
                  emoji="🔄"
                  title="自动换主体"
                  desc="填了'我的产品 hint',原视频里的货会被替换成你的"
                />
              </div>
            </div>
          )}

          {!running && result && <TeardownResultView result={result} copyPrompt={copyPrompt} copiedIdx={copiedIdx} exportJson={exportJson} />}
        </main>
      </div>

      {/* Footer */}
      <div className="max-w-[1100px] mx-auto px-6 py-10 border-t border-border-subtle mt-10">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
          配套工作流
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/pipelines/ai-photoshoot" className="px-3 py-1.5 border border-accent/30 rounded text-[11px] font-mono text-accent hover:bg-accent/10">
            🎬 用拆解 prompt 去 AI 影棚生图 →
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
}: {
  result: TeardownResult;
  copyPrompt: (idx: number, p: string) => void;
  copiedIdx: number | null;
  exportJson: () => void;
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
          <div className="text-[14px] font-bold text-text-primary">{sb.scene_count} 个镜头</div>
          {result.costUsd !== null && (
            <div className="text-[10px] font-mono text-text-tertiary mt-0.5 tabular-nums">
              拆解成本 ${result.costUsd.toFixed(4)} ≈ ¥{(result.costUsd * 7.2).toFixed(3)} · {result.model}
            </div>
          )}
        </div>
        <button
          onClick={exportJson}
          className="text-[11px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded px-3 py-1.5"
        >
          ⬇ 导出 JSON
        </button>
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
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                  图像 prompt (拷去 AI 影棚)
                </span>
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
