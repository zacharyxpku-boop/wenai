'use client';

import { useEffect, useState } from 'react';
import AdminHeader from '@/components/AdminHeader';

interface CostItem {
  orgId: string;
  currentCents: number;
  currentCny: number;
}

interface CostDetail {
  module: string;
  cents: number;
  at: string;
  taskId?: string;
  meta?: Record<string, unknown>;
}

interface DrillDown {
  orgId: string;
  currentCny: number;
  details: CostDetail[];
  byModule: Record<string, { cents: number; count: number }>;
  skuCount: number;
  skus: { id: string; name: string; category: string; status: string; addedAt: string }[];
}

interface CostList {
  date: string;
  totalCents: number;
  totalCny: number;
  orgCount: number;
  items: CostItem[];
}

interface CostTrendPoint {
  date: string;
  totalCents: number;
  totalCny: number;
  orgCount: number;
}

interface CostTrendResp {
  days: number;
  points: CostTrendPoint[];
  totalCny: number;
  avgDailyCny: number;
}

export default function AdminCostPage() {
  const [data, setData] = useState<CostList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authed, setAuthed] = useState(false);
  const [key, setKey] = useState('');
  const [singleOrg, setSingleOrg] = useState('');
  const [singleResult, setSingleResult] = useState<CostItem | null>(null);
  const [drillDown, setDrillDown] = useState<DrillDown | null>(null);
  const [drillLoading, setDrillLoading] = useState(false);
  const [trend, setTrend] = useState<CostTrendResp | null>(null);
  const [trendDays, setTrendDays] = useState<7 | 14 | 30>(7);
  const [trendLoading, setTrendLoading] = useState(false);

  const loadTrend = async (n: number) => {
    setTrendLoading(true);
    try {
      const r = await fetch(`/api/admin/cost?trend=${n}`);
      const d = await r.json();
      setTrend(d as CostTrendResp);
    } finally {
      setTrendLoading(false);
    }
  };

  const openDrill = async (orgId: string) => {
    setDrillLoading(true);
    setDrillDown(null);
    try {
      const r = await fetch(`/api/admin/cost?orgId=${encodeURIComponent(orgId)}&detail=1`);
      const d = await r.json();
      setDrillDown(d as DrillDown);
    } catch {
      setDrillDown(null);
    } finally {
      setDrillLoading(false);
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('wenai_admin_key');
    if (saved && saved.length >= 6) setAuthed(true);
  }, []);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/cost?list=1')
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d as CostList);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  useEffect(() => {
    if (authed) loadTrend(trendDays);
  }, [authed, trendDays]);

  const queryOrg = async () => {
    if (!singleOrg.trim()) return;
    try {
      const r = await fetch(`/api/admin/cost?orgId=${encodeURIComponent(singleOrg.trim())}`);
      const d = await r.json();
      setSingleResult(d as CostItem);
    } catch (e) {
      setError(e instanceof Error ? e.message : '查询失败');
    }
  };

  const handleAuth = () => {
    if (key.length >= 6) {
      sessionStorage.setItem('wenai_admin_key', key);
      setAuthed(true);
    }
  };

  if (!authed) {
    return (
      <div className="max-w-md mx-auto py-20 px-6">
        <h1 className="text-lg font-semibold mb-6">后台 / 成本面板</h1>
        <input
          type="password"
          placeholder="输入 6 位以上后台口令"
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAuth()}
          className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-md text-[13px] mb-3"
        />
        <button
          onClick={handleAuth}
          disabled={key.length < 6}
          className="w-full py-2 bg-accent disabled:bg-border-subtle text-bg-root text-[13px] font-semibold rounded-md"
        >
          进入后台
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto py-8 px-6">
      <AdminHeader
        subtitle="今日各 org 成本与趋势（单位：人民币）"
        onLogout={() => { sessionStorage.removeItem('wenai_admin_key'); setAuthed(false); }}
      />

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="border border-accent/30 bg-accent/5 rounded-lg p-4">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">今日总花费</div>
            <div className="text-3xl font-bold text-accent tabular-nums">¥{data.totalCny.toFixed(2)}</div>
            <div className="text-[10px] font-mono text-text-tertiary mt-1">{data.date}</div>
          </div>
          <div className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">活跃 org</div>
            <div className="text-3xl font-bold text-text-primary tabular-nums">{data.orgCount}</div>
            <div className="text-[10px] font-mono text-text-tertiary mt-1">今日有调用的组织</div>
          </div>
          <div className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">平均花费</div>
            <div className="text-3xl font-bold text-text-primary tabular-nums">¥{data.orgCount > 0 ? (data.totalCny / data.orgCount).toFixed(2) : '0.00'}</div>
            <div className="text-[10px] font-mono text-text-tertiary mt-1">每个 org 今日均值</div>
          </div>
        </div>
      )}

      <section className="mb-6 border border-cat-content/30 bg-cat-content/5 rounded-lg p-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="text-[10px] font-mono text-cat-content uppercase tracking-wider">全站日花费趋势</div>
          <div className="flex items-center gap-1">
            {([7, 14, 30] as const).map(n => (
              <button
                key={n}
                onClick={() => setTrendDays(n)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  trendDays === n
                    ? 'border-cat-content text-cat-content bg-cat-content/10'
                    : 'border-border-subtle text-text-secondary hover:border-cat-content/40'
                }`}
              >
                {n} 天
              </button>
            ))}
          </div>
        </div>
        {trendLoading ? (
          <div className="text-[11px] font-mono text-text-tertiary py-6 text-center">加载中...</div>
        ) : !trend || trend.points.length === 0 ? (
          <div className="text-[11px] font-mono text-text-tertiary py-6 text-center">暂无数据</div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4 text-[12px]">
              <div>
                <div className="text-[9px] font-mono text-text-tertiary uppercase">{trend.days} 天总花费</div>
                <div className="text-cat-content font-bold tabular-nums text-xl">¥{trend.totalCny.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-text-tertiary uppercase">日均花费</div>
                <div className="text-text-primary font-bold tabular-nums text-xl">¥{trend.avgDailyCny.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-text-tertiary uppercase">峰值日花费</div>
                <div className="text-warning font-bold tabular-nums text-xl">¥{Math.max(...trend.points.map(p => p.totalCny)).toFixed(2)}</div>
              </div>
            </div>
            <CostTrendBars points={trend.points} />
          </>
        )}
      </section>

      <div className="mb-6 border border-border-subtle rounded-lg p-4 bg-bg-surface/30">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">查询单个 org 当日花费</div>
        <div className="flex gap-2">
          <input
            type="text"
            value={singleOrg}
            onChange={e => setSingleOrg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && queryOrg()}
            placeholder="输入 orgId（如用户标识 / IP）"
            className="flex-1 px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
          />
          <button
            onClick={queryOrg}
            className="px-4 py-2 bg-accent text-bg-root text-[12px] font-semibold rounded hover:bg-accent-hover"
          >
            查询
          </button>
        </div>
        {singleResult && (
          <div className="mt-3 text-[12px] text-text-primary">
            <span className="text-text-tertiary">{singleResult.orgId}</span>
            <span className="text-accent font-bold ml-2 tabular-nums">¥{singleResult.currentCny.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-bold text-text-primary">org 花费排行榜</h2>
        <button
          onClick={load}
          className="text-[11px] font-mono text-text-secondary hover:text-accent border border-border-subtle rounded px-2 py-1"
        >
          刷新
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-tertiary font-mono text-[12px]">加载中...</div>
      ) : error ? (
        <div className="p-3 border border-error/40 bg-error/5 rounded text-[11px] text-error">{error}</div>
      ) : data && data.items.length === 0 ? (
        <div className="text-center py-12 border border-border-subtle rounded-md">
          <p className="text-text-tertiary text-[13px] mb-1">今日还没有 org 产生花费。</p>
          <p className="text-[10px] font-mono text-text-tertiary">至少需要有人跑过影棚或视频接口，数据才会出现。</p>
        </div>
      ) : data && (
        <div className="border border-border-subtle rounded-lg overflow-hidden">
          <div className="bg-bg-surface px-4 py-2 border-b border-border-subtle grid grid-cols-[1fr_120px_80px] gap-3 text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
            <div>orgId</div>
            <div className="text-right">今日花费</div>
            <div className="text-right">占比</div>
          </div>
          <div className="divide-y divide-border-subtle">
            {data.items.map(item => {
              const pct = data.totalCents > 0 ? (item.currentCents / data.totalCents) * 100 : 0;
              const isHot = item.currentCny >= 30;
              return (
                <div
                  key={item.orgId}
                  className="px-4 py-2.5 grid grid-cols-[1fr_120px_80px] gap-3 items-center hover:bg-bg-surface/50"
                >
                  <button
                    onClick={() => openDrill(item.orgId)}
                    className="text-[11px] font-mono text-text-primary truncate hover:text-accent text-left"
                  >
                    {item.orgId}
                  </button>
                  <span className={`text-[13px] font-bold tabular-nums text-right ${isHot ? 'text-error' : 'text-accent'}`}>
                    ¥{item.currentCny.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-mono text-text-tertiary text-right tabular-nums">
                    {pct.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(drillLoading || drillDown) && (
        <div
          onClick={() => { if (!drillLoading) setDrillDown(null); }}
          className="fixed inset-0 bg-bg-root/80 backdrop-blur z-50 flex items-start justify-center pt-12 px-4 overflow-y-auto"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-bg-surface border border-accent/40 rounded-lg max-w-[900px] w-full p-5 mb-12 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-mono text-accent uppercase tracking-wider">org 钻取明细</div>
              <button
                onClick={() => setDrillDown(null)}
                className="text-[12px] font-mono text-text-tertiary hover:text-text-primary"
              >
                关闭
              </button>
            </div>

            {drillLoading || !drillDown ? (
              <div className="text-center py-8 text-text-tertiary text-[12px]">加载中...</div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-text-primary mb-2 font-[family-name:var(--font-outfit)]">
                  {drillDown.orgId}
                </h2>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="border border-accent/30 bg-accent/5 rounded p-2">
                    <div className="text-[9px] font-mono text-text-tertiary uppercase">今日花费</div>
                    <div className="text-lg font-bold text-accent tabular-nums">¥{drillDown.currentCny.toFixed(2)}</div>
                  </div>
                  <div className="border border-border-subtle rounded p-2">
                    <div className="text-[9px] font-mono text-text-tertiary uppercase">今日调用</div>
                    <div className="text-lg font-bold text-text-primary tabular-nums">{drillDown.details.length}</div>
                  </div>
                  <div className="border border-border-subtle rounded p-2">
                    <div className="text-[9px] font-mono text-text-tertiary uppercase">关联 SKU</div>
                    <div className="text-lg font-bold text-text-primary tabular-nums">{drillDown.skuCount}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">模块聚合</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {Object.entries(drillDown.byModule).map(([mod, agg]) => (
                      <div key={mod} className="rounded border border-border-subtle bg-bg-root/35 p-3">
                        <div className="text-[11px] font-mono text-text-primary">{mod}</div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-[9px] font-mono text-text-tertiary">{agg.count} 次</span>
                          <span className="text-[11px] font-mono text-accent">¥{(agg.cents / 100).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
                    调用明细（最近 {drillDown.details.length} 条）
                  </div>
                  <div className="rounded border border-border-subtle overflow-hidden">
                    {drillDown.details.length === 0 ? (
                      <div className="p-3 text-center text-[11px] text-text-tertiary font-mono">没有明细记录（老调用未追踪）</div>
                    ) : drillDown.details.map((d, i) => (
                      <div key={i} className="px-3 py-1.5 grid grid-cols-[1fr_100px_60px] gap-2 items-center text-[11px] border-b border-border-subtle/40 last:border-b-0">
                        <div>
                          <span className="font-mono text-text-primary">{d.module}</span>
                          {typeof d.meta?.scenario === 'string' && d.meta.scenario ? (
                            <span className="text-[9px] font-mono text-text-tertiary ml-1.5">/ {d.meta.scenario}</span>
                          ) : null}
                        </div>
                        <span className="font-mono text-text-tertiary text-right">{new Date(d.at).toLocaleString('zh-CN')}</span>
                        <span className="font-mono text-accent text-right">¥{(d.cents / 100).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">关联 SKU</div>
                  {drillDown.skus.length === 0 ? (
                    <div className="text-[11px] font-mono text-text-tertiary border border-dashed border-border-subtle rounded p-3 text-center">
                      暂无关联 SKU
                    </div>
                  ) : (
                    <div className="rounded border border-border-subtle overflow-hidden">
                      {drillDown.skus.map(s => (
                        <div key={s.id} className="px-3 py-1.5 grid grid-cols-[1fr_120px_80px] gap-2 items-center text-[11px] border-b border-border-subtle/40 last:border-b-0">
                          <span className="text-text-primary truncate">{s.name}</span>
                          <span className="font-mono text-text-tertiary truncate">{s.category}</span>
                          <span className="font-mono text-cat-content text-right">{s.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <p className="text-[10px] font-mono text-text-tertiary mt-6 leading-relaxed">
        成本基于 `cost-cap.ts` 估算：影棚单图 ¥0.30 / 高质量 ¥1.20，视频 720p ¥4 / 1080p ¥8，默认日上限 ¥50/org（环境变量 `COST_CAP_DAILY_CNY` 可调）。点 orgId 可继续钻取明细与 SKU 关联。
      </p>
    </div>
  );
}

function CostTrendBars({ points }: { points: CostTrendPoint[] }) {
  const maxCny = Math.max(...points.map(p => p.totalCny), 0.01);
  const maxOrgs = Math.max(...points.map(p => p.orgCount), 1);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[9px] font-mono text-text-tertiary uppercase mb-1.5">日花费（¥）</div>
        <div className="h-28 flex items-end gap-1">
          {points.map(p => {
            const h = (p.totalCny / maxCny) * 100;
            return (
              <div key={p.date} className="flex-1 flex flex-col items-center justify-end gap-0.5" title={`${p.date}: ¥${p.totalCny.toFixed(2)}`}>
                <span className="text-[8px] font-mono text-cat-content tabular-nums">{p.totalCny > 0 ? p.totalCny.toFixed(0) : ''}</span>
                <div className="w-full rounded-sm bg-cat-content/60" style={{ height: `${h}%`, minHeight: p.totalCny > 0 ? '2px' : '0' }} />
              </div>
            );
          })}
        </div>
        <div className="mt-1 flex gap-1">
          {points.map(p => (
            <div key={p.date} className="flex-1 text-center text-[8px] font-mono text-text-tertiary tabular-nums">{p.date.slice(5)}</div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[9px] font-mono text-text-tertiary uppercase mb-1.5">活跃 org 数</div>
        <div className="h-20 flex items-end gap-1">
          {points.map(p => {
            const h = (p.orgCount / maxOrgs) * 100;
            return (
              <div key={p.date} className="flex-1 flex flex-col items-center justify-end" title={`${p.date}: ${p.orgCount} 个 org`}>
                <div className="w-full rounded-sm bg-accent/60" style={{ height: `${h}%`, minHeight: p.orgCount > 0 ? '2px' : '0' }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
