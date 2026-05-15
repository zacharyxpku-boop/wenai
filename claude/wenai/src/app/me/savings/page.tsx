'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * /me/savings · 商家战利品页 · "wenai 帮你省了多少钱"
 *
 * 与 /me/skus 烧钱速度对仗:
 *   /me/skus 看你做了多少事 (生产力)
 *   /me/savings 看你省了多少 (vs 真人/外包) + 缓存红利
 *
 * 触发付费心理: 数字越大续费意愿越强
 */

interface ModuleRow {
  id: string;
  label: string;
  calls: number;
  wenaiCostCny: number;
  altCostCny: number;
  savedCny: number;
  alt: string;
}

interface SavingsResp {
  orgId: string;
  days: number;
  totalCalls: number;
  totalWenaiCostCny: number;
  totalAltCostCny: number;
  replacementSavedCny: number;
  cacheSavedCny: number;
  grandTotalSavedCny: number;
  byModule: ModuleRow[];
}

export default function SavingsPage() {
  const [data, setData] = useState<SavingsResp | null>(null);
  const [days, setDays] = useState<1 | 3 | 7>(7);
  const [loading, setLoading] = useState(true);

  const selectDays = (n: 1 | 3 | 7) => {
    setDays(n);
  };

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/user/savings-summary?days=${days}`)
      .then(response => response.json())
      .then(data => {
        if (cancelled) return;
        setData(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [days]);

  const ratio = data && data.totalAltCostCny > 0
    ? Math.round((1 - data.totalWenaiCostCny / data.totalAltCostCny) * 100)
    : 0;

  // 给 CFO / 财务对账的导出 · 商家把数字往他们 ERP 送
  const downloadCsv = () => {
    if (!data) return;
    const rows: string[][] = [];
    rows.push(['module', 'calls', 'wenai_cost_cny', 'replacement_cost_cny', 'saved_cny', 'replacement_strategy']);
    for (const m of data.byModule) {
      rows.push([
        m.id,
        String(m.calls),
        m.wenaiCostCny.toFixed(2),
        m.altCostCny.toFixed(2),
        m.savedCny.toFixed(2),
        m.alt,
      ]);
    }
    rows.push([]);
    rows.push(['summary']);
    rows.push(['windowDays', String(data.days)]);
    rows.push(['totalCalls', String(data.totalCalls)]);
    rows.push(['totalWenaiCostCny', data.totalWenaiCostCny.toFixed(2)]);
    rows.push(['totalAltCostCny', data.totalAltCostCny.toFixed(2)]);
    rows.push(['replacementSavedCny', data.replacementSavedCny.toFixed(2)]);
    rows.push(['cacheSavedCny', data.cacheSavedCny.toFixed(2)]);
    rows.push(['grandTotalSavedCny', data.grandTotalSavedCny.toFixed(2)]);
    const csv = rows.map(r => r.map(escapeCsv).join(',')).join('\n');
    // BOM 让 Excel 中文不乱码
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    triggerDownload(blob, `wenai-savings-${data.days}days-${todayStr()}.csv`);
  };

  const downloadMd = () => {
    if (!data) return;
    const lines: string[] = [];
    lines.push(`# wenai 省钱报告 · 近 ${data.days} 天`);
    lines.push('');
    lines.push(`**累计节省**: ¥${data.grandTotalSavedCny.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`);
    lines.push(`**替代真人/外包省**: ¥${data.replacementSavedCny.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`);
    lines.push(`**缓存红利**: ¥${data.cacheSavedCny.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`);
    lines.push(`**实际 wenai 花费**: ¥${data.totalWenaiCostCny.toLocaleString('zh-CN', { minimumFractionDigits: 2 })} (原本要 ¥${data.totalAltCostCny.toLocaleString('zh-CN')})`);
    lines.push(`**比真人/外包便宜**: ${ratio}%`);
    lines.push('');
    lines.push('## 按模块拆分');
    lines.push('');
    lines.push('| 模块 | 调用次数 | wenai 实际 | 替代成本 | 节省 ¥ | 替代方案 |');
    lines.push('|------|--------|-----------|--------|-------|--------|');
    for (const m of data.byModule) {
      lines.push(`| ${m.label} | ${m.calls} | ¥${m.wenaiCostCny.toFixed(2)} | ¥${m.altCostCny.toFixed(2)} | ¥${m.savedCny.toFixed(2)} | ${m.alt} |`);
    }
    lines.push('');
    lines.push(`*由 wenai 自动生成 · ${new Date().toLocaleString('zh-CN')}*`);
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    triggerDownload(blob, `wenai-savings-${data.days}days-${todayStr()}.md`);
  };

  return (
    <div className="min-h-screen bg-bg-root">
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        {/* 头 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/me/skus" className="text-[10px] font-mono text-text-tertiary hover:text-accent">← SKU 库</Link>
            <span className="text-[10px] font-mono text-text-tertiary">/</span>
            <span className="text-[10px] font-mono text-accent">省钱战利品</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-2 font-[family-name:var(--font-outfit)]">
            wenai 帮你省了多少钱
          </h1>
          <p className="text-[12px] text-text-secondary">
            过去 {days} 天用 wenai vs 真人/外包替代成本的差额。<span className="text-accent">数字保守, 取行业最低单价。</span>
          </p>
        </div>

        {/* 时段切换 */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] font-mono text-text-tertiary">时段</span>
          {([1, 3, 7] as const).map(n => (
            <button
              key={n}
              onClick={() => selectDays(n)}
              className={`text-[11px] font-mono px-3 py-1 rounded border ${
                days === n
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border-subtle text-text-secondary hover:border-accent/40'
              }`}
            >
              {n === 1 ? '今日' : `近 ${n} 天`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-text-tertiary font-mono text-[12px]">加载中...</div>
        ) : !data || data.totalCalls === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* 战利品大字号 */}
            <section className="border border-success/40 bg-gradient-to-br from-success/10 to-accent/5 rounded-lg p-6 mb-5">
              <div className="text-[10px] font-mono text-success uppercase tracking-[0.2em] mb-2">
                累计节省 (替代成本 + 缓存红利)
              </div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <div className="text-5xl lg:text-6xl font-bold text-success tabular-nums font-[family-name:var(--font-outfit)]">
                  ¥{data.grandTotalSavedCny.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                {ratio > 0 && (
                  <div className="text-[14px] font-mono text-success">
                    比真人/外包便宜 <span className="font-bold">{ratio}%</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 text-[12px]">
                <Stat
                  label="替代真人/外包省"
                  value={`¥${data.replacementSavedCny.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`}
                  sub={`${data.totalCalls} 次调用 × 行业单价`}
                />
                <Stat
                  label="缓存红利"
                  value={`¥${data.cacheSavedCny.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`}
                  sub="同 prompt 重复调省的 wenai 成本"
                />
                <Stat
                  label="实际 wenai 花费"
                  value={`¥${data.totalWenaiCostCny.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`}
                  sub={`原本要 ¥${data.totalAltCostCny.toLocaleString('zh-CN')}`}
                />
              </div>
            </section>

            {/* 按模块拆 */}
            <section className="border border-border-subtle rounded-lg p-4">
              <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
                按模块拆分 (节省金额降序)
              </div>
              <div className="space-y-2">
                {data.byModule.map(m => {
                  const pct = data.totalAltCostCny > 0
                    ? Math.round((m.savedCny / data.replacementSavedCny) * 100)
                    : 0;
                  return (
                    <div key={m.id} className="border border-border-subtle/50 rounded p-3 bg-bg-surface/30">
                      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-text-primary">{m.label}</span>
                          <span className="text-[10px] font-mono text-text-tertiary">{m.calls} 次</span>
                        </div>
                        <div className="text-[14px] font-bold text-success tabular-nums">
                          省 ¥{m.savedCny.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-text-tertiary mb-1.5">
                        替代方案: {m.alt} · 行业单价 ¥{(m.altCostCny / m.calls).toFixed(0)}/次 · wenai ¥{(m.wenaiCostCny / m.calls).toFixed(2)}/次
                      </div>
                      <div className="h-1 bg-bg-surface rounded overflow-hidden">
                        <div
                          className="h-full bg-success transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 给 CFO/财务的导出 */}
            <section className="mt-5 border border-cat-content/30 bg-cat-content/5 rounded-lg p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-[12px] font-bold text-text-primary">
                    📥 给财务/CFO 看
                  </div>
                  <div className="text-[10px] font-mono text-text-tertiary mt-0.5">
                    导出后塞进对账表 · 含每个模块的真实/替代成本
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadCsv}
                    className="text-[11px] font-mono text-cat-content border border-cat-content/40 hover:bg-cat-content/10 rounded px-3 py-1.5"
                  >
                    ⬇ CSV
                  </button>
                  <button
                    onClick={downloadMd}
                    className="text-[11px] font-mono text-cat-content border border-cat-content/40 hover:bg-cat-content/10 rounded px-3 py-1.5"
                  >
                    ⬇ Markdown
                  </button>
                </div>
              </div>
            </section>

            {/* 分享 / 推介 */}
            <section className="mt-5 border border-accent/30 bg-accent/5 rounded-lg p-4 text-center">
              <p className="text-[12px] text-text-primary mb-2">
                朋友也在烧人工拍摄/外包钱? 把这个数字截图发给他
              </p>
              <p className="text-[10px] font-mono text-text-tertiary mb-3">
                ¥{data.grandTotalSavedCny.toFixed(0)} / {data.days} 天 · 平均每天省 ¥{(data.grandTotalSavedCny / data.days).toFixed(0)}
              </p>
              <Link
                href="/inquire?from=savings"
                className="inline-block text-[11px] font-mono text-accent border border-accent/40 hover:bg-accent/10 rounded px-4 py-2"
              >
                推荐你朋友 → 拿 30% 返佣
              </Link>
            </section>
          </>
        )}

        <div className="mt-8 pt-5 border-t border-border-subtle text-[10px] font-mono text-text-tertiary leading-relaxed">
          替代成本基准是行业保守低价 (真人拍摄 ¥800/张 / AI 视频 vs 真人剪辑 ¥600/条 / 客服员工 5-10 分钟 ¥20)。
          <br />
          这是省钱视角, 不是绝对值. 你实际成本结构可能不同, 数字仅作沟通参考。
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-border-subtle/50 rounded p-3 bg-bg-root/40">
      <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider mb-1">{label}</div>
      <div className="text-[16px] font-bold text-text-primary tabular-nums leading-tight">{value}</div>
      <div className="text-[9px] font-mono text-text-tertiary mt-1">{sub}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-border-default rounded-lg p-10 text-center">
      <div className="text-4xl mb-2">💰</div>
      <h3 className="text-[15px] font-bold text-text-primary mb-2">还没有调用记录</h3>
      <p className="text-[11px] font-mono text-text-tertiary mb-5">
        跑过模块后回来看, 实战记录越多省的越明显
      </p>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Link href="/pipelines/ai-photoshoot" className="text-[11px] font-mono text-accent border border-accent/40 hover:bg-accent/10 rounded px-3 py-1.5">
          🎬 跑 AI 影棚 →
        </Link>
        <Link href="/pipelines/video-teardown" className="text-[11px] font-mono text-accent border border-accent/40 hover:bg-accent/10 rounded px-3 py-1.5">
          🔬 拆个爆款 →
        </Link>
      </div>
    </div>
  );
}

function escapeCsv(v: string): string {
  if (v == null) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
