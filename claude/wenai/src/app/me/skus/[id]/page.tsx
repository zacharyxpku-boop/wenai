'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface StatusEvent {
  status: Sku['status'];
  at: string;
  fromModule?: string;
  reason?: string;
}

interface CostSummary {
  todayCny: number;
  todayCalls: number;
  skuCount: number;
  avgCostPerSkuCny: number;
  byModule: Record<string, { cents: number; count: number }>;
}

interface Sku {
  id: string;
  orgId: string;
  name: string;
  category: string;
  platform?: string;
  priceCny?: string;
  status: 'idea' | 'discovery-done' | 'photoshoot-done' | 'abtest-done' | 'launched' | 'paused' | 'killed';
  notes?: string;
  performance?: { ctr?: number; convRate?: number; roi?: number; sales7d?: number };
  addedAt: string;
  updatedAt: string;
  modules?: string[];
  statusHistory?: StatusEvent[];
}

const STATUS_FLOW = [
  { key: 'idea', label: '💡 想法', desc: '记下来,先不动' },
  { key: 'discovery-done', label: '🎯 已选品', desc: 'AI 分析了赛道, 候选锁定' },
  { key: 'photoshoot-done', label: '🎬 已出图', desc: '主图/详情/模特 跑完' },
  { key: 'abtest-done', label: '⚗️ 已测款', desc: '9 张 A-B 跑完, 拿到 first-3' },
  { key: 'launched', label: '🚀 已上架', desc: '正在卖, 数据健康' },
  { key: 'paused', label: '⏸ 暂停', desc: '指标走弱, 在优化' },
  { key: 'killed', label: '🛑 已 kill', desc: '止损, 不再投入' },
] as const;

const MODULE_META: Record<string, { txt: string; href: string; icon: string }> = {
  'product-discovery': { txt: 'AI 选品发现', href: '/pipelines/product-discovery', icon: '🎯' },
  'ai-photoshoot': { txt: 'AI 影棚', href: '/pipelines/ai-photoshoot', icon: '🎬' },
  'ai-video': { txt: 'AI 视频', href: '/pipelines/ai-video', icon: '🎞️' },
  'video-teardown': { txt: '爆款视频拆解', href: '/pipelines/video-teardown', icon: '🔬' },
  'intent-mining': { txt: '反向意图扩客', href: '/pipelines/intent-mining', icon: '🔍' },
  'ab-test': { txt: '测款 A-B', href: '/pipelines/ab-test', icon: '⚗️' },
  'data-insights': { txt: '数据洞察', href: '/pipelines/data-insights', icon: '📊' },
  'batch-launch': { txt: '批量上架', href: '/pipelines/batch-launch', icon: '🏭' },
  'new-listing': { txt: '上新流水线', href: '/pipelines/new-listing', icon: '📋' },
  'influencer-outbound': { txt: '达人外联', href: '/pipelines/influencer-outbound', icon: '📨' },
};

export default function SkuDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [sku, setSku] = useState<Sku | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [skuCost, setSkuCost] = useState<{ totalCny: number; callCount: number; byModule: Record<string, { cents: number; count: number }> } | null>(null);

  useEffect(() => {
    fetch('/api/user/cost-summary')
      .then(r => r.json())
      .then(d => setCostSummary(d as CostSummary))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/user/sku-cost?skuId=${params.id}`)
      .then(r => r.json())
      .then(d => setSkuCost(d))
      .catch(() => {});
  }, [params.id]);

  useEffect(() => {
    if (!params.id) return;
    fetch('/api/user/sku-history?limit=200')
      .then(r => r.json())
      .then(d => {
        const found = (d.skus || []).find((s: Sku) => s.id === params.id);
        if (!found) {
          setError('找不到这个 SKU (可能已删或换 org 了)');
        } else {
          setSku(found);
          setNotesDraft(found.notes || '');
        }
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [params.id]);

  const updateField = async (patch: Partial<Sku>) => {
    if (!sku) return;
    try {
      const res = await fetch(`/api/user/sku-history?id=${sku.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (data.sku) setSku(data.sku);
    } catch {}
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    await updateField({ notes: notesDraft });
    setSavingNotes(false);
    setEditingNotes(false);
  };

  const deleteSku = async () => {
    if (!sku) return;
    if (!confirm(`确认删除 ${sku.name}?`)) return;
    await fetch(`/api/user/sku-history?id=${sku.id}`, { method: 'DELETE' });
    router.push('/me/skus');
  };

  if (loading) {
    return <div className="text-center py-20 text-text-tertiary font-mono text-[12px]">加载中...</div>;
  }

  if (error || !sku) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-center">
        <div className="text-3xl mb-2">🤷</div>
        <p className="text-text-secondary text-[13px] mb-4">{error || 'SKU 不存在'}</p>
        <Link href="/me/skus" className="text-[12px] font-mono text-accent border border-accent/30 rounded px-3 py-1.5 hover:bg-accent/10">
          ← 回 SKU 库
        </Link>
      </div>
    );
  }

  const currentStatusIdx = STATUS_FLOW.findIndex(s => s.key === sku.status);
  const ranModules = sku.modules || [];

  return (
    <div className="max-w-[1000px] mx-auto py-8 px-6">
      {/* 面包屑 + 删除 */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/me/skus" className="text-[11px] font-mono text-text-tertiary hover:text-accent">
          ← 我的 SKU 库
        </Link>
        <button
          onClick={deleteSku}
          className="text-[10px] font-mono text-text-tertiary hover:text-error border border-border-subtle hover:border-error/40 rounded px-2 py-1"
        >
          删除 SKU
        </button>
      </div>

      {/* 主信息卡 */}
      <section className="border border-accent/30 bg-bg-surface/40 rounded-lg p-5 mb-6">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-text-primary mb-1 font-[family-name:var(--font-outfit)]">
              {sku.name}
            </h1>
            <div className="flex items-center gap-3 text-[11px] font-mono text-text-tertiary flex-wrap">
              <span>{sku.category}</span>
              {sku.platform && <span>· {sku.platform}</span>}
              {sku.priceCny && <span className="text-accent">· {sku.priceCny}</span>}
            </div>
          </div>
          <select
            value={sku.status}
            onChange={e => updateField({ status: e.target.value as Sku['status'] })}
            className="text-[12px] font-mono px-3 py-2 bg-bg-surface border border-border-default rounded"
          >
            {STATUS_FLOW.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] mt-4">
          <Stat label="入库" value={new Date(sku.addedAt).toLocaleDateString('zh-CN')} />
          <Stat label="最近更新" value={new Date(sku.updatedAt).toLocaleDateString('zh-CN')} />
          <Stat label="跑过模块" value={`${ranModules.length} 个`} />
          {sku.performance?.ctr !== undefined ? (
            <Stat label="CTR" value={`${(sku.performance.ctr * 100).toFixed(1)}%`} />
          ) : sku.performance?.roi !== undefined ? (
            <Stat label="ROI" value={sku.performance.roi.toFixed(2)} />
          ) : (
            <Stat label="" value="" />
          )}
        </div>
      </section>

      {/* 状态轨迹 */}
      <section className="mb-6">
        <h2 className="text-[12px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
          🛤️ 状态生命周期
        </h2>
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_FLOW.map((s, i) => {
            const reached = i <= currentStatusIdx;
            const isCurrent = i === currentStatusIdx;
            return (
              <div key={s.key} className="flex items-center gap-1">
                <button
                  onClick={() => updateField({ status: s.key as Sku['status'] })}
                  className={`flex flex-col items-start gap-0.5 px-2 py-1.5 rounded border transition-colors text-left ${
                    isCurrent
                      ? 'border-accent bg-accent/10 text-accent'
                      : reached
                      ? 'border-success/30 bg-success/5 text-success'
                      : 'border-border-subtle text-text-tertiary hover:border-accent/30'
                  }`}
                  title={s.desc}
                >
                  <span className="text-[11px] font-mono whitespace-nowrap">{s.label}</span>
                  <span className="text-[9px] hidden md:inline">{s.desc}</span>
                </button>
                {i < STATUS_FLOW.length - 1 && (
                  <span className={`text-[12px] ${reached ? 'text-success/50' : 'text-text-tertiary/40'}`}>
                    {i < currentStatusIdx ? '→' : '·'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 本 SKU 累计成本 · phase-2 真打通 */}
      {skuCost && skuCost.callCount > 0 && (
        <section className="mb-6 border border-cat-content/40 bg-cat-content/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="text-[12px] font-mono text-cat-content uppercase tracking-wider">
              🎯 这个 SKU 在 wenai 累计花费
            </h2>
            <span className="text-[9px] font-mono text-text-tertiary">仅当日 · 跨模块带 ?skuId 才进此账</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[12px]">
            <div className="border border-cat-content/30 bg-bg-root/30 rounded p-2">
              <div className="text-[9px] font-mono text-text-tertiary uppercase">SKU 累计</div>
              <div className="text-2xl font-bold text-cat-content tabular-nums">¥{skuCost.totalCny.toFixed(2)}</div>
            </div>
            <div className="border border-border-subtle rounded p-2 bg-bg-root/30">
              <div className="text-[9px] font-mono text-text-tertiary uppercase">调用次数</div>
              <div className="text-2xl font-bold text-text-primary tabular-nums">{skuCost.callCount}</div>
            </div>
            <div className="border border-border-subtle rounded p-2 bg-bg-root/30">
              <div className="text-[9px] font-mono text-text-tertiary uppercase">真人对照</div>
              <div className="text-[12px] font-bold text-success tabular-nums leading-tight">省 ¥{(3000 - skuCost.totalCny).toFixed(0)}+</div>
              <div className="text-[9px] font-mono text-text-tertiary">vs 真人摄影 ¥3K</div>
            </div>
          </div>
          {Object.keys(skuCost.byModule).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(skuCost.byModule).map(([m, agg]) => (
                <span key={m} className="text-[10px] font-mono px-2 py-0.5 border border-cat-content/30 rounded text-cat-content">
                  {m} ¥{(agg.cents / 100).toFixed(2)} <span className="opacity-70">×{agg.count}</span>
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 成本概况 · 用户自己看烧钱速度 (全用户视角) */}
      {costSummary && (
        <section className="mb-6 border border-border-subtle rounded-lg p-4 bg-bg-surface/30">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="text-[12px] font-mono text-text-tertiary uppercase tracking-wider">
              💸 我在 wenai 的成本概况
            </h2>
            <span className="text-[9px] font-mono text-text-tertiary">全用户视角 · 上面是单 SKU 视角</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[12px]">
            <div className="border border-accent/30 bg-accent/5 rounded p-2">
              <div className="text-[9px] font-mono text-text-tertiary uppercase">今日总花费</div>
              <div className="text-lg font-bold text-accent tabular-nums">¥{costSummary.todayCny.toFixed(2)}</div>
            </div>
            <div className="border border-border-subtle rounded p-2 bg-bg-root/30">
              <div className="text-[9px] font-mono text-text-tertiary uppercase">今日调用</div>
              <div className="text-lg font-bold text-text-primary tabular-nums">{costSummary.todayCalls}</div>
            </div>
            <div className="border border-border-subtle rounded p-2 bg-bg-root/30">
              <div className="text-[9px] font-mono text-text-tertiary uppercase">SKU 库总数</div>
              <div className="text-lg font-bold text-text-primary tabular-nums">{costSummary.skuCount}</div>
            </div>
            <div className="border border-cat-content/30 bg-cat-content/5 rounded p-2">
              <div className="text-[9px] font-mono text-text-tertiary uppercase">每 SKU 均成本</div>
              <div className="text-lg font-bold text-cat-content tabular-nums">¥{costSummary.avgCostPerSkuCny.toFixed(2)}</div>
            </div>
          </div>
          {Object.keys(costSummary.byModule).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Object.entries(costSummary.byModule).map(([m, agg]) => (
                <span key={m} className="text-[10px] font-mono px-2 py-0.5 border border-border-subtle rounded text-text-secondary">
                  {m} ¥{(agg.cents / 100).toFixed(2)} <span className="text-text-tertiary">×{agg.count}</span>
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 状态变更历史 · MOAT-05 真深度 */}
      {sku.statusHistory && sku.statusHistory.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[12px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
            📜 状态变更历史
          </h2>
          <div className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30">
            <div className="space-y-2">
              {sku.statusHistory.slice().reverse().map((ev, i) => {
                const flow = STATUS_FLOW.find(s => s.key === ev.status);
                const isLatest = i === 0;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className={`w-2 h-2 rounded-full ${isLatest ? 'bg-accent shadow-[0_0_6px_currentColor]' : 'bg-border-default'}`} />
                      {i < (sku.statusHistory!.length - 1) && (
                        <div className="w-px h-8 bg-border-subtle mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className={`text-[12px] font-semibold ${isLatest ? 'text-accent' : 'text-text-primary'}`}>
                          {flow?.label || ev.status}
                        </span>
                        <span className="text-[10px] font-mono text-text-tertiary tabular-nums">
                          {new Date(ev.at).toLocaleString('zh-CN')}
                        </span>
                        {isLatest && (
                          <span className="text-[9px] font-mono text-accent border border-accent/40 rounded px-1 py-0.5">
                            当前
                          </span>
                        )}
                      </div>
                      {(ev.reason || ev.fromModule) && (
                        <div className="text-[10px] font-mono text-text-secondary mt-0.5">
                          {ev.fromModule && (
                            <span className="text-cat-content mr-2">[{ev.fromModule}]</span>
                          )}
                          {ev.reason}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 跑过的模块 */}
      <section className="mb-6">
        <h2 className="text-[12px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
          🛠️ 跑过的模块
        </h2>
        {ranModules.length === 0 ? (
          <div className="border border-dashed border-border-subtle rounded p-4 text-center text-[11px] text-text-tertiary">
            还没跑过任何模块。下面挑一个继续跑 ↓
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {ranModules.map(m => {
              const meta = MODULE_META[m];
              if (!meta) return null;
              return (
                <Link
                  key={m}
                  href={`${meta.href}?skuId=${sku.id}`}
                  className="border border-success/30 bg-success/5 rounded p-2.5 hover:border-success/60 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{meta.icon}</span>
                    <span className="text-[12px] font-semibold text-text-primary group-hover:text-success">
                      {meta.txt}
                    </span>
                  </div>
                  <div className="text-[9px] font-mono text-success/70 mt-0.5">✓ 已跑过 · 带本 SKU 再跑 →</div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* notes 编辑 */}
      <section className="mb-6 border border-border-subtle rounded-lg p-4 bg-bg-surface/30">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[12px] font-mono text-text-tertiary uppercase tracking-wider">
            📝 备注 / 上下文
          </h2>
          {!editingNotes ? (
            <button
              onClick={() => setEditingNotes(true)}
              className="text-[10px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded px-2 py-0.5"
            >
              编辑
            </button>
          ) : (
            <div className="flex gap-1.5">
              <button
                onClick={() => { setEditingNotes(false); setNotesDraft(sku.notes || ''); }}
                className="text-[10px] font-mono text-text-tertiary border border-border-subtle hover:border-text-secondary/40 rounded px-2 py-0.5"
              >
                取消
              </button>
              <button
                onClick={saveNotes}
                disabled={savingNotes}
                className="text-[10px] font-mono text-bg-root bg-accent hover:bg-accent-hover rounded px-2 py-0.5 disabled:opacity-40"
              >
                {savingNotes ? '保存中…' : '保存'}
              </button>
            </div>
          )}
        </div>
        {editingNotes ? (
          <textarea
            value={notesDraft}
            onChange={e => setNotesDraft(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] resize-none leading-relaxed"
          />
        ) : sku.notes ? (
          <p className="text-[12px] text-text-secondary whitespace-pre-wrap leading-relaxed">{sku.notes}</p>
        ) : (
          <p className="text-[11px] font-mono text-text-tertiary">还没写备注. 点编辑加.</p>
        )}
      </section>

      {/* 下一步动作建议 */}
      <section className="mb-6 border border-cat-content/30 bg-cat-content/5 rounded-lg p-4">
        <div className="text-[10px] font-mono text-cat-content uppercase tracking-wider mb-2">
          🎬 下一步动作
        </div>
        <p className="text-[12px] text-text-secondary mb-3 leading-relaxed">
          {nextStepHint(sku.status)}
        </p>
        <div className="flex flex-wrap gap-2">
          {nextModuleSuggestions(sku.status).map(m => {
            const meta = MODULE_META[m];
            if (!meta) return null;
            return (
              <Link
                key={m}
                href={`${meta.href}?skuId=${sku.id}`}
                className="text-[11px] font-mono px-3 py-1.5 bg-cat-content text-bg-root rounded hover:opacity-90"
              >
                {meta.icon} {meta.txt} →
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  if (!label && !value) return <div />;
  return (
    <div className="border border-border-subtle rounded px-2 py-1.5 bg-bg-root/30">
      <div className="text-[9px] font-mono text-text-tertiary uppercase">{label}</div>
      <div className="text-[12px] font-bold text-text-primary mt-0.5 tabular-nums">{value}</div>
    </div>
  );
}

function nextStepHint(status: Sku['status']): string {
  switch (status) {
    case 'idea': return '想法阶段 · 跑选品发现验证赛道, 或反向意图先看看客群';
    case 'discovery-done': return '已选品 · 接下来生主图 + 测款变体, 别急着上架';
    case 'photoshoot-done': return '图齐了 · 跑测款 A-B 9 张变体测点击率, 别盲投';
    case 'abtest-done': return '测款数据有了 · 走上新流水线生 listing, 准备真上架';
    case 'launched': return '上架健康 · 数据洞察周报跑起来, 持续优化';
    case 'paused': return '指标走弱 · 跑数据洞察找根因, 再决定改图/调价/换词';
    case 'killed': return 'kill 也是数据 · 复盘后回选品发现挖下一个';
  }
}

function nextModuleSuggestions(status: Sku['status']): string[] {
  switch (status) {
    case 'idea': return ['product-discovery', 'intent-mining'];
    case 'discovery-done': return ['ai-photoshoot', 'video-teardown'];
    case 'photoshoot-done': return ['ab-test', 'ai-video'];
    case 'abtest-done': return ['new-listing', 'batch-launch'];
    case 'launched': return ['data-insights'];
    case 'paused': return ['data-insights', 'ab-test'];
    case 'killed': return ['product-discovery'];
  }
}
