'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * /tools/hook-score · 跑前打分免费工具
 *
 * 0 LLM 调用 · 商家随便点 · 引流到 SKU 库做付费跑
 * 移植自 clico-clean MOAT-07, 数据源换成 wenai cross-org-benchmark
 */

type HookKind = 'pain' | 'number' | 'contrast' | 'question' | 'story';

interface HookScoreResult {
  score: number;
  tier: 'low' | 'mid' | 'high';
  textScore: number;
  baselineScore: number;
  confidence: number;
  matchedSamples: number;
  reasons: string[];
  predictedCtrFloor: number | null;
  predictedCtrCeiling: number | null;
  medianBenchmarkCtr: number | null;
}

const KIND_OPTIONS: Array<{ id: HookKind; label: string; example: string }> = [
  { id: 'pain',     label: '痛点开场', example: '你是不是也总买到不合适的尺码' },
  { id: 'number',   label: '数字开场', example: '我用 3 件衣服搞定一个月通勤' },
  { id: 'contrast', label: '反差开场', example: '别再买大牌了 · 这 ¥50 的更软' },
  { id: 'question', label: '提问开场', example: '小个子怎么穿出 170 的气场' },
  { id: 'story',    label: '故事开场', example: '上周老板看到我穿这件夸了 3 次' },
];

const TIER_STYLES = {
  high: { color: 'text-success', bg: 'bg-success/10 border-success/40', label: '高分 · 值得跑' },
  mid:  { color: 'text-warning', bg: 'bg-warning/10 border-warning/40', label: '中等 · 改改再跑' },
  low:  { color: 'text-error',   bg: 'bg-error/10 border-error/40',     label: '低分 · 重写' },
};

export default function HookScorePage() {
  const [hookLine, setHookLine] = useState('');
  const [category, setCategory] = useState('');
  const [hookKind, setHookKind] = useState<HookKind | ''>('');
  const [result, setResult] = useState<HookScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!hookLine.trim()) { setErr('粘 hook 文案'); return; }
    setErr(''); setLoading(true); setResult(null);
    try {
      const r = await fetch('/api/user/hook-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hookLine: hookLine.trim(),
          category: category.trim() || undefined,
          hookKind: hookKind || undefined,
        }),
      });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || `HTTP ${r.status}`); return; }
      setResult(d);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-root">
      <div className="max-w-[800px] mx-auto px-6 py-8">
        <div className="mb-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/" className="text-[10px] font-mono text-text-tertiary hover:text-accent">← 首页</Link>
            <span className="text-[10px] font-mono text-text-tertiary">/</span>
            <span className="text-[10px] font-mono text-accent">工具 / Hook 打分</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-1 font-[family-name:var(--font-outfit)]">
            🎯 Hook 跑前打分
          </h1>
          <p className="text-[12px] text-text-secondary">
            粘 hook 文案 · 立即给分 · 跑大批主图 / 短视频前先看分, 低分的省下不浪费
          </p>
        </div>

        <div className="border border-border-subtle rounded-lg p-5 bg-bg-surface/30 space-y-4 mb-5">
          <label className="block">
            <div className="text-[11px] text-text-secondary mb-1.5">
              粘你的 hook 文案 (前 3 秒说的那句话)
            </div>
            <textarea
              value={hookLine}
              onChange={e => setHookLine(e.target.value)}
              placeholder="例: 你是不是也买过 3 件大码 · 穿一次就闲置在衣柜"
              rows={3}
              className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[13px] resize-none"
              maxLength={200}
            />
            <div className="text-[10px] font-mono text-text-tertiary mt-1 text-right">{hookLine.length}/200</div>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <div className="text-[11px] text-text-secondary mb-1.5">类目 (选填, 用于拉同行业基线)</div>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="例: 女装连衣裙 / 户外露营 / 美妆口红"
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[13px]"
                maxLength={40}
              />
            </label>
            <label className="block">
              <div className="text-[11px] text-text-secondary mb-1.5">开场类型 (选填)</div>
              <select
                value={hookKind}
                onChange={e => setHookKind(e.target.value as HookKind)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[13px]"
              >
                <option value="">— 不指定 —</option>
                {KIND_OPTIONS.map(o => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>

          {hookKind && (
            <div className="text-[10px] font-mono text-text-tertiary border border-border-subtle bg-bg-root/50 rounded p-2">
              示例: {KIND_OPTIONS.find(o => o.id === hookKind)?.example}
            </div>
          )}

          <button
            onClick={submit}
            disabled={loading || !hookLine.trim()}
            className="w-full px-4 py-2.5 bg-accent text-bg-root text-[13px] font-semibold rounded hover:bg-accent-hover disabled:opacity-40"
          >
            {loading ? '打分中...' : '🎯 算分 (免费, 不烧 quota)'}
          </button>
          {err && <div className="text-[11px] font-mono text-error">✗ {err}</div>}
        </div>

        {result && (
          <div className={`border rounded-lg p-5 mb-5 ${TIER_STYLES[result.tier].bg}`}>
            <div className="flex items-baseline gap-3 mb-3">
              <div className={`text-5xl font-bold tabular-nums font-[family-name:var(--font-outfit)] ${TIER_STYLES[result.tier].color}`}>
                {result.score}
              </div>
              <div className={`text-[12px] font-mono ${TIER_STYLES[result.tier].color}`}>
                / 100 · {TIER_STYLES[result.tier].label}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-[11px] font-mono">
              <div>
                <div className="text-[9px] text-text-tertiary uppercase mb-0.5">文本质量</div>
                <div className="text-text-primary tabular-nums">{(result.textScore * 100).toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-[9px] text-text-tertiary uppercase mb-0.5">类目基线</div>
                <div className="text-text-primary tabular-nums">{(result.baselineScore * 100).toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-[9px] text-text-tertiary uppercase mb-0.5">置信度</div>
                <div className="text-text-primary tabular-nums">{(result.confidence * 100).toFixed(0)}%</div>
              </div>
            </div>

            {result.predictedCtrFloor !== null && result.predictedCtrCeiling !== null && (
              <div className="border-t border-border-subtle pt-3 mb-3">
                <div className="text-[10px] font-mono text-text-tertiary uppercase mb-1">预估 CTR 区间</div>
                <div className="text-[16px] font-bold text-text-primary tabular-nums">
                  {result.predictedCtrFloor}% — {result.predictedCtrCeiling}%
                </div>
                <div className="text-[10px] font-mono text-text-tertiary mt-0.5">
                  基于 {result.matchedSamples} 个同类目样本 · 中位 {result.medianBenchmarkCtr?.toFixed(2) ?? '—'}%
                </div>
              </div>
            )}

            <div className="border-t border-border-subtle pt-3 space-y-1.5">
              <div className="text-[10px] font-mono text-text-tertiary uppercase mb-1">为什么是这个分</div>
              {result.reasons.map((r, i) => (
                <div key={i} className="text-[11px] text-text-secondary leading-relaxed">
                  · {r}
                </div>
              ))}
            </div>

            <div className="border-t border-border-subtle pt-3 mt-3 flex items-center gap-2 flex-wrap">
              <Link
                href={`/pipelines/product-image?hook=${encodeURIComponent(hookLine.trim())}`}
                className="text-[11px] font-mono px-3 py-1.5 bg-accent text-bg-root rounded hover:bg-accent-hover"
              >
                {result.tier === 'high' ? '高分 · 去跑主图 →' : '改完再来打分'}
              </Link>
              <button
                onClick={() => { setResult(null); setHookLine(''); }}
                className="text-[11px] font-mono px-3 py-1.5 border border-border-default text-text-secondary rounded hover:border-accent/40"
              >
                重新输入
              </button>
            </div>
          </div>
        )}

        <div className="border border-border-subtle rounded-lg p-4 bg-bg-surface/20">
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
            🔬 算法透明
          </div>
          <ul className="text-[11px] text-text-secondary space-y-1 leading-relaxed list-disc pl-5">
            <li>纯启发式规则 + 历史中位数, 不调 LLM, 不烧你 quota</li>
            <li>文本规则: 问句 / 数字 / 第二人称 / 长度 / 强动词 / 避 AI 空话词 各自加权</li>
            <li>类目基线来自 wenai 跨 org 匿名 CTR · 商家用得越多, 数据越准</li>
            <li>样本不足时给 null 不编数, 低置信度页上明确标</li>
            <li>同输入永远同输出 · 你可以反推算法</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
