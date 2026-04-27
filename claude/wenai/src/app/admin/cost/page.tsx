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

  const openDrill = async (orgId: string) => {
    setDrillLoading(true);
    setDrillDown(null);
    try {
      const r = await fetch(`/api/admin/cost?orgId=${encodeURIComponent(orgId)}&detail=1`);
      const d = await r.json();
      setDrillDown(d as DrillDown);
    } catch {} finally {
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
        if (d.error) {
          setError(d.error);
        } else {
          setData(d as CostList);
        }
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
        <h1 className="text-lg font-semibold mb-6">管理员 · 成本面板</h1>
        <input
          type="password"
          placeholder="6 位以上口令"
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
          进入
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto py-8 px-6">
      <AdminHeader
        subtitle="今日各 org 累计花费 · 单位人民币"
        onLogout={() => { sessionStorage.removeItem('wenai_admin_key'); setAuthed(false); }}
      />

      {/* 全局总计大数字 */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="border border-accent/30 bg-accent/5 rounded-lg p-4">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">
              今日总花费
            </div>
            <div className="text-3xl font-bold text-accent tabular-nums">
              ¥{data.totalCny.toFixed(2)}
            </div>
            <div className="text-[10px] font-mono text-text-tertiary mt-1">{data.date}</div>
          </div>
          <div className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">
              活跃 org
            </div>
            <div className="text-3xl font-bold text-text-primary tabular-nums">
              {data.orgCount}
            </div>
            <div className="text-[10px] font-mono text-text-tertiary mt-1">今日有调用的</div>
          </div>
          <div className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">
              人均
            </div>
            <div className="text-3xl font-bold text-text-primary tabular-nums">
              ¥{data.orgCount > 0 ? (data.totalCny / data.orgCount).toFixed(2) : '0.00'}
            </div>
            <div className="text-[10px] font-mono text-text-tertiary mt-1">每 org 今日均值</div>
          </div>
        </div>
      )}

      {/* 单 org 查询 */}
      <div className="mb-6 border border-border-subtle rounded-lg p-4 bg-bg-surface/30">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
          🔍 查单个 org 当日花费
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={singleOrg}
            onChange={e => setSingleOrg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && queryOrg()}
            placeholder="orgId (例: 用户名 / IP)"
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
            <span className="text-text-tertiary">{singleResult.orgId}</span> ·
            <span className="text-accent font-bold ml-2 tabular-nums">¥{singleResult.currentCny.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* 排行榜 */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-bold text-text-primary">org 花费排行榜</h2>
        <button
          onClick={load}
          className="text-[11px] font-mono text-text-secondary hover:text-accent border border-border-subtle rounded px-2 py-1"
        >
          ↻ 刷新
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-tertiary font-mono text-[12px]">加载中...</div>
      ) : error ? (
        <div className="p-3 border border-error/40 bg-error/5 rounded text-[11px] text-error">{error}</div>
      ) : data && data.items.length === 0 ? (
        <div className="text-center py-12 border border-border-subtle rounded-md">
          <p className="text-text-tertiary text-[13px] mb-1">今日还没有 org 产生花费</p>
          <p className="text-[10px] font-mono text-text-tertiary">需要至少有人跑过影棚 / 视频接口才会出现</p>
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
              const isHot = item.currentCny >= 30; // ≥¥30 高消耗用户
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

      {/* Drill-down · orgId 明细 + SKU 关联 */}
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
              <div className="text-[10px] font-mono text-accent uppercase tracking-wider">
                orgId 钻取
              </div>
              <button
                onClick={() => setDrillDown(null)}
                className="text-[12px] font-mono text-text-tertiary hover:text-text-primary"
              >
                ✗ 关闭
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
                    <div className="text-[9px] font-mono text-text-tertiary uppercase">SKU 库</div>
                    <div className="text-lg font-bold text-text-primary tabular-nums">{drillDown.skuCount}</div>
                  </div>
                </div>

                {/* 按模块聚合 */}
                <div className="mb-4">
                  <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
                    按模块聚合
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(drillDown.byModule).map(([mod, agg]) => (
                      <div key={mod} className="border border-border-subtle rounded p-2 bg-bg-root/40">
                        <div className="text-[11px] font-mono text-text-primary">{mod}</div>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-[12px] font-bold text-accent tabular-nums">¥{(agg.cents / 100).toFixed(2)}</span>
                          <span className="text-[9px] font-mono text-text-tertiary">{agg.count} 次</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 调用明细 */}
                <div className="mb-4">
                  <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
                    调用明细 (最近 {drillDown.details.length})
                  </div>
                  <div className="border border-border-subtle rounded max-h-[200px] overflow-y-auto divide-y divide-border-subtle">
                    {drillDown.details.length === 0 ? (
                      <div className="p-3 text-center text-[11px] text-text-tertiary font-mono">没有明细记录(老调用未追踪)</div>
                    ) : drillDown.details.map((d, i) => (
                      <div key={i} className="px-3 py-1.5 grid grid-cols-[1fr_100px_60px] gap-2 items-center text-[11px]">
                        <div>
                          <span className="font-mono text-text-primary">{d.module}</span>
                          {typeof d.meta?.scenario === 'string' && d.meta.scenario && (
                            <span className="text-[9px] font-mono text-text-tertiary ml-1.5">· {d.meta.scenario}</span>
                          )}
                        </div>
                        <span className="font-mono text-text-tertiary text-right">
                          {new Date(d.at).toLocaleTimeString('zh-CN')}
                        </span>
                        <span className="font-bold text-accent text-right tabular-nums">
                          ¥{(d.cents / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SKU 关联 */}
                <div>
                  <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
                    该用户 SKU 库 (跨表关联)
                  </div>
                  {drillDown.skus.length === 0 ? (
                    <div className="text-[11px] font-mono text-text-tertiary border border-dashed border-border-subtle rounded p-3 text-center">
                      没有 SKU 入库 (烧钱但没沉淀历史 = 高风险用户?)
                    </div>
                  ) : (
                    <div className="border border-border-subtle rounded max-h-[160px] overflow-y-auto divide-y divide-border-subtle">
                      {drillDown.skus.map(s => (
                        <div key={s.id} className="px-3 py-1.5 grid grid-cols-[1fr_120px_80px] gap-2 items-center text-[11px]">
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
        累计基于 cost-cap.ts 估算 · 影棚单图 ¥0.30 / 高 ¥1.20 · 视频 720p ¥4 / 1080p ¥8 · 默认日上限 ¥50/org (env COST_CAP_DAILY_CNY 可调) · 点 orgId 钻取明细 + SKU 关联
      </p>
    </div>
  );
}
