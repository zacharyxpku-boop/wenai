'use client';

import { useEffect, useState } from 'react';
import AdminHeader from '@/components/AdminHeader';

interface OrgRow {
  orgId: string;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  savedCny: number;
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

  const loadList = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/cache?list=1&date=${date}`);
      const d = await r.json();
      setList(d);
    } finally {
      setLoading(false);
    }
  };

  const loadOrg = async (orgId: string) => {
    setActiveOrg(orgId);
    const r = await fetch(`/api/admin/cache?orgId=${encodeURIComponent(orgId)}&date=${date}`);
    const d = await r.json();
    setSnap(d);
  };

  useEffect(() => { loadList(); /* eslint-disable-next-line */ }, [date]);

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
              该日无缓存活动 (或 Redis 未配置)
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
