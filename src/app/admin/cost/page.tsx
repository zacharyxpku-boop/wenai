'use client';

import { useEffect, useState } from 'react';
import AdminHeader from '@/components/AdminHeader';

interface CostItem {
  orgId: string;
  currentCents: number;
  currentCny: number;
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
                  <code className="text-[11px] font-mono text-text-primary truncate">
                    {item.orgId}
                  </code>
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

      <p className="text-[10px] font-mono text-text-tertiary mt-6 leading-relaxed">
        累计基于 cost-cap.ts 估算 · 影棚单图 ¥0.30 / 高 ¥1.20 · 视频 720p ¥4 / 1080p ¥8 · 默认日上限 ¥50/org (env COST_CAP_DAILY_CNY 可调)
      </p>
    </div>
  );
}
