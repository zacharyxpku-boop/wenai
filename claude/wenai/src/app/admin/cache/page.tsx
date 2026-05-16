'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminHeader from '@/components/AdminHeader';

interface OrgRow {
  orgId: string;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  savedCny: number;
}

interface TrendPoint {
  date: string;
  hits: number;
  misses: number;
  savedCny: number;
  hitRate: number;
}

interface TrendResp {
  days: number;
  points: TrendPoint[];
  totalHits: number;
  totalMisses: number;
  totalSavedCny: number;
  avgHitRate: number;
}

interface ListResp {
  date: string;
  count: number;
  totalSavedCny: number;
  orgs: OrgRow[];
}

interface OrgSnap {
  orgId: string;
  date: string;
  byKind: Record<'image' | 'video' | 'teardown', { hits: number; misses: number; hitRate: number }>;
  totalHits: number;
  totalMisses: number;
  estimatedSavedCents: number;
  estimatedSavedCny: number;
}

const KIND_META = {
  image: { label: '🎬 影棚生图', perCny: 0.5 },
  video: { label: '🎞️ 视频生成', perCny: 3.5 },
  teardown: { label: '🔬 视频拆解', perCny: 0.04 },
} as const;

export default function AdminCachePage() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [list, setList] = useState<ListResp | null>(null);
  const [snap, setSnap] = useState<OrgSnap | null>(null);
  const [activeOrg, setActiveOrg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<TrendResp | null>(null);
  const [trendDays, setTrendDays] = useState<7 | 14 | 30>(7);
  const [trendLoading, setTrendLoading] = useState(false);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/cache?list=1&date=${date}`);
      const d = await r.json();
      setList(d);
    } finally {
      setLoading(false);
    }
  }, [date]);

  const loadOrg = async (orgId: string) => {
    setActiveOrg(orgId);
    const r = await fetch(`/api/admin/cache?orgId=${encodeURIComponent(orgId)}&date=${date}`);
    const d = await r.json();
    setSnap(d);
  };

  const loadTrend = useCallback(async (n: number) => {
    setTrendLoading(true);
    try {
      const r = await fetch(`/api/admin/cache?trend=${n}`);
      const d = await r.json();
      setTrend(d);
    } finally {
      setTrendLoading(false);
    }
  }, []);

  useEffect(() => { void loadList(); }, [loadList]);
  useEffect(() => { void loadTrend(trendDays); }, [loadTrend, trendDays]);

  return (
    <div className="min-h-screen bg-bg-root">
      <AdminHeader subtitle="缓存命中统计" />
      <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-[11px] font-mono text-text-tertiary">日期</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="px-3 py-1.5 bg-bg-surface border border-border-default rounded text-[12px] font-mono"
          />
          <button
            onClick={loadList}
            className="text-[11px] font-mono px-3 py-1.5 border border-accent/40 text-accent rounded hover:bg-accent/10"
          >
            刷新
          </button>
        </div>

        {/* 7/14/30 天趋势 */}
        <section className="border border-accent/30 bg-accent/5 rounded-lg p-4">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div className="text-[10px] font-mono text-accent uppercase tracking-wider">
              全店缓存命中趋势
            </div>
            <div className="flex items-center gap-1">
              {([7, 14, 30] as const).map(n => (
                <button
                  key={n}
                  onClick={() => setTrendDays(n)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    trendDays === n
                      ? 'border-accent text-accent bg-accent/10'
                      : 'border-border-subtle text-text-secondary hover:border-accent/40'
                  }`}
                >
                  {n} 天
                </button>
              ))}
            </div>
          </div>
          {trendLoading ? (
            <div className="text-[11px] font-mono text-text-tertiary py-6 text-center">趋势加载中...</div>
          ) : !trend || trend.points.length === 0 ? (
            <div className="text-[11px] font-mono text-text-tertiary py-6 text-center">该时段无缓存活动</div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 mb-4 text-[12px]">
                <div>
                  <div className="text-[9px] font-mono text-text-tertiary uppercase">{trend.days} 天总命中</div>
                  <div className="text-success font-bold tabular-nums text-xl">{trend.totalHits}</div>
                </div>
                <div>
                  <div className="text-[9px] font-mono text-text-tertiary uppercase">平均命中率</div>
                  <div className="text-accent font-bold tabular-nums text-xl">{(trend.avgHitRate * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-[9px] font-mono text-text-tertiary uppercase">{trend.days} 天累计省</div>
                  <div className="text-success font-bold tabular-nums text-xl">¥{trend.totalSavedCny.toFixed(2)}</div>
                </div>
              </div>
              <TrendBars points={trend.points} />
            </>
          )}
        </section>

        {/* 总览 */}
        <section className="border border-success/30 bg-success/5 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-[13px]">
          <Stat label="该日活跃 org" value={list?.count ?? '—'} />
          <Stat label="总命中" value={list?.orgs.reduce((s, o) => s + o.totalHits, 0) ?? '—'} />
          <Stat
            label="该日节省 (估算)"
            value={list ? `¥${list.totalSavedCny.toFixed(2)}` : '—'}
            highlight
          />
        </section>

        {/* org 列表 */}
        <section className="border border-border-subtle rounded-lg p-4">
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
            按 org 排序 (节省金额降序)
          </div>
          {loading ? (
            <div className="text-[12px] font-mono text-text-tertiary py-8 text-center">加载中...</div>
          ) : !list || list.orgs.length === 0 ? (
            <div className="text-[12px] font-mono text-text-tertiary py-8 text-center">
              该日无缓存活动；本地试用模式下仅显示当前环境数据
            </div>
          ) : (
            <table className="w-full text-[12px]">
              <thead className="text-[10px] font-mono text-text-tertiary border-b border-border-subtle">
                <tr>
                  <th className="text-left py-1.5">orgId</th>
                  <th className="text-right py-1.5">命中</th>
                  <th className="text-right py-1.5">未命中</th>
                  <th className="text-right py-1.5">命中率</th>
                  <th className="text-right py-1.5">省 (¥)</th>
                  <th className="py-1.5"></th>
                </tr>
              </thead>
              <tbody>
                {list.orgs.map(o => (
                  <tr key={o.orgId} className="border-b border-border-subtle/50 hover:bg-bg-surface/30">
                    <td className="py-1.5 font-mono text-text-primary truncate max-w-[200px]">{o.orgId}</td>
                    <td className="py-1.5 text-right tabular-nums text-success">{o.totalHits}</td>
                    <td className="py-1.5 text-right tabular-nums text-text-tertiary">{o.totalMisses}</td>
                    <td className="py-1.5 text-right tabular-nums text-accent">{(o.hitRate * 100).toFixed(1)}%</td>
                    <td className="py-1.5 text-right tabular-nums text-success font-bold">¥{o.savedCny.toFixed(2)}</td>
                    <td className="py-1.5 text-right">
                      <button
                        onClick={() => loadOrg(o.orgId)}
                        className="text-[10px] font-mono text-accent hover:underline"
                      >
                        看 kind 拆分 →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* 单 org 拆分 */}
        {snap && activeOrg === snap.orgId && (
          <section className="border border-accent/30 bg-accent/5 rounded-lg p-4 space-y-3">
            <div className="text-[10px] font-mono text-accent uppercase tracking-wider">
              {snap.orgId} · {snap.date} · 按 kind 拆分
            </div>
            <table className="w-full text-[12px]">
              <thead className="text-[10px] font-mono text-text-tertiary border-b border-border-subtle">
                <tr>
                  <th className="text-left py-1.5">kind</th>
                  <th className="text-right py-1.5">命中</th>
                  <th className="text-right py-1.5">未命中</th>
                  <th className="text-right py-1.5">命中率</th>
                  <th className="text-right py-1.5">单次省 ¥</th>
                  <th className="text-right py-1.5">累计省 ¥</th>
                </tr>
              </thead>
              <tbody>
                {(['image', 'video', 'teardown'] as const).map(k => {
                  const m = snap.byKind[k];
                  const meta = KIND_META[k];
                  return (
                    <tr key={k} className="border-b border-border-subtle/50">
                      <td className="py-1.5 font-mono text-text-primary">{meta.label}</td>
                      <td className="py-1.5 text-right tabular-nums text-success">{m.hits}</td>
                      <td className="py-1.5 text-right tabular-nums text-text-tertiary">{m.misses}</td>
                      <td className="py-1.5 text-right tabular-nums text-accent">{(m.hitRate * 100).toFixed(1)}%</td>
                      <td className="py-1.5 text-right tabular-nums text-text-tertiary">¥{meta.perCny.toFixed(2)}</td>
                      <td className="py-1.5 text-right tabular-nums text-success font-bold">
                        ¥{(m.hits * meta.perCny).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-success/40">
                  <td colSpan={4} className="py-2 text-right text-[11px] font-mono text-text-tertiary">
                    总计节省
                  </td>
                  <td colSpan={2} className="py-2 text-right tabular-nums text-success font-bold text-[14px]">
                    ¥{snap.estimatedSavedCny.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">{label}</div>
      <div className={`tabular-nums ${highlight ? 'text-success font-bold text-2xl' : 'text-text-primary text-xl font-semibold'}`}>
        {value}
      </div>
    </div>
  );
}

function TrendBars({ points }: { points: TrendPoint[] }) {
  const maxSaved = Math.max(...points.map(p => p.savedCny), 1);
  const maxCalls = Math.max(...points.map(p => p.hits + p.misses), 1);
  return (
    <div className="space-y-3">
      {/* 日省钱柱状 */}
      <div>
        <div className="text-[9px] font-mono text-text-tertiary uppercase mb-1.5">日累计省 (¥)</div>
        <div className="flex items-end gap-1 h-20">
          {points.map(p => {
            const h = (p.savedCny / maxSaved) * 100;
            return (
              <div key={p.date} className="flex-1 flex flex-col items-center justify-end gap-0.5" title={`${p.date}: ¥${p.savedCny.toFixed(2)}`}>
                <span className="text-[8px] font-mono text-success tabular-nums">
                  {p.savedCny > 0 ? p.savedCny.toFixed(0) : ''}
                </span>
                <div
                  className="w-full bg-success/60 hover:bg-success rounded-t transition-colors"
                  style={{ height: `${h}%`, minHeight: p.savedCny > 0 ? '2px' : '0' }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex gap-1 mt-1">
          {points.map(p => (
            <div key={p.date} className="flex-1 text-center text-[8px] font-mono text-text-tertiary tabular-nums">
              {p.date.slice(5)}
            </div>
          ))}
        </div>
      </div>

      {/* 命中率折线 */}
      <div>
        <div className="text-[9px] font-mono text-text-tertiary uppercase mb-1.5">命中率 (%)</div>
        <div className="flex items-end gap-1 h-12">
          {points.map(p => {
            const total = p.hits + p.misses;
            const h = total > 0 ? p.hitRate * 100 : 0;
            return (
              <div key={p.date} className="flex-1 flex flex-col items-center justify-end" title={`${p.date}: ${(p.hitRate * 100).toFixed(1)}% (${p.hits}/${total})`}>
                <div
                  className={`w-full rounded-t transition-colors ${
                    h >= 30 ? 'bg-accent' : h >= 10 ? 'bg-cat-content' : 'bg-text-tertiary/40'
                  }`}
                  style={{ height: `${h}%`, minHeight: total > 0 ? '2px' : '0' }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 总调用量条 */}
      <div>
        <div className="text-[9px] font-mono text-text-tertiary uppercase mb-1.5">每日总调用 ({points.reduce((s, p) => s + p.hits + p.misses, 0)} 次)</div>
        <div className="flex items-end gap-1 h-8">
          {points.map(p => {
            const total = p.hits + p.misses;
            const h = (total / maxCalls) * 100;
            return (
              <div key={p.date} className="flex-1 flex" title={`${p.date}: ${total} 次`}>
                <div
                  className="flex-1 bg-text-tertiary/30 rounded-t"
                  style={{ height: `${h}%`, minHeight: total > 0 ? '1px' : '0' }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
