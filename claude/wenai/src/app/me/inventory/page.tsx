'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * /me/inventory · SKU 库存监控面板
 *
 * 数据从 /api/v1/inventory POST 进来 (商家 ERP push)
 * 这页只读 + 阈值微调 (不能直接改 qty, 那是 ERP 的事)
 */

interface InvRecord {
  skuId: string;
  qty: number;
  threshold: number;
  updatedAt: string;
  status: 'healthy' | 'low' | 'out';
}

const STATUS: Record<InvRecord['status'], { label: string; color: string; emoji: string }> = {
  out:     { label: '断货',  color: 'text-error border-error/40 bg-error/10',     emoji: '🔴' },
  low:     { label: '低位',  color: 'text-warning border-warning/40 bg-warning/10', emoji: '🟡' },
  healthy: { label: '健康',  color: 'text-success border-success/40 bg-success/10', emoji: '🟢' },
};

export default function InventoryPage() {
  const [items, setItems] = useState<InvRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'out' | 'low' | 'healthy'>('all');
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const refresh = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch('/api/user/inventory');
      const data = await response.json();
      setItems(data.inventory || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/user/inventory')
      .then(response => response.json())
      .then(data => {
        if (cancelled) return;
        setItems(data.inventory || []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const visible = filter === 'all' ? items : items.filter(r => r.status === filter);
  const counts = {
    out: items.filter(r => r.status === 'out').length,
    low: items.filter(r => r.status === 'low').length,
    healthy: items.filter(r => r.status === 'healthy').length,
  };

  const saveThreshold = async (skuId: string) => {
    const n = parseInt(editValue, 10);
    if (isNaN(n) || n < 0) return;
    const item = items.find(r => r.skuId === skuId);
    if (!item) return;
    await fetch('/api/user/inventory', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skuId, threshold: n, qty: item.qty }),
    });
    setEditing(null);
    setEditValue('');
    refresh();
  };

  return (
    <div className="min-h-screen bg-bg-root">
      <div className="max-w-[900px] mx-auto px-6 py-8">
        <div className="mb-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/me" className="text-[10px] font-mono text-text-tertiary hover:text-accent">← 我的</Link>
            <span className="text-[10px] font-mono text-text-tertiary">/</span>
            <span className="text-[10px] font-mono text-accent">库存</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-1 font-[family-name:var(--font-outfit)]">
            📦 库存监控
          </h1>
          <p className="text-[12px] text-text-secondary">
            从你的 ERP / 抖店脚本 / 仓储系统 通过 <code className="text-accent">/api/v1/inventory</code> push 数据进来 · 这里只显示快照
          </p>
        </div>

        {/* 概况栏 */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <button
            onClick={() => setFilter(filter === 'out' ? 'all' : 'out')}
            className={`border rounded-lg p-3 text-left transition-colors ${
              filter === 'out' ? 'border-error bg-error/10' : 'border-border-subtle hover:border-error/40'
            }`}
          >
            <div className="text-[9px] font-mono text-text-tertiary uppercase mb-1">断货</div>
            <div className="text-2xl font-bold text-error tabular-nums">{counts.out}</div>
          </button>
          <button
            onClick={() => setFilter(filter === 'low' ? 'all' : 'low')}
            className={`border rounded-lg p-3 text-left transition-colors ${
              filter === 'low' ? 'border-warning bg-warning/10' : 'border-border-subtle hover:border-warning/40'
            }`}
          >
            <div className="text-[9px] font-mono text-text-tertiary uppercase mb-1">低位</div>
            <div className="text-2xl font-bold text-warning tabular-nums">{counts.low}</div>
          </button>
          <button
            onClick={() => setFilter(filter === 'healthy' ? 'all' : 'healthy')}
            className={`border rounded-lg p-3 text-left transition-colors ${
              filter === 'healthy' ? 'border-success bg-success/10' : 'border-border-subtle hover:border-success/40'
            }`}
          >
            <div className="text-[9px] font-mono text-text-tertiary uppercase mb-1">健康</div>
            <div className="text-2xl font-bold text-success tabular-nums">{counts.healthy}</div>
          </button>
        </div>

        {filter !== 'all' && (
          <button
            onClick={() => setFilter('all')}
            className="text-[10px] font-mono text-text-tertiary hover:text-accent mb-3"
          >
            ← 看全部 ({items.length})
          </button>
        )}

        {/* 列表 */}
        {loading ? (
          <div className="text-center py-12 text-text-tertiary font-mono text-[12px]">加载中...</div>
        ) : visible.length === 0 ? (
          <div className="border border-border-subtle rounded-lg p-12 text-center">
            <div className="text-3xl mb-3">📦</div>
            <div className="text-[14px] text-text-primary mb-2">
              {items.length === 0 ? '还没库存数据' : `当前筛选 ${filter} 没匹配项`}
            </div>
            {items.length === 0 && (
              <div className="text-[11px] font-mono text-text-tertiary leading-relaxed">
                <code className="text-accent">POST /api/v1/inventory</code><br />
                Body: <code className="text-text-secondary">{`{ "skuId": "...", "qty": 100, "threshold": 20 }`}</code><br />
                <Link href="/me/settings" className="text-accent hover:underline mt-2 inline-block">
                  → 先去设置签发 API key
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-border-subtle rounded-lg overflow-hidden">
            <table className="w-full text-[12px]">
              <thead className="bg-bg-surface/50 border-b border-border-subtle">
                <tr>
                  <th className="text-left px-3 py-2 font-mono text-[9px] uppercase text-text-tertiary">状态</th>
                  <th className="text-left px-3 py-2 font-mono text-[9px] uppercase text-text-tertiary">SKU</th>
                  <th className="text-right px-3 py-2 font-mono text-[9px] uppercase text-text-tertiary">库存</th>
                  <th className="text-right px-3 py-2 font-mono text-[9px] uppercase text-text-tertiary">阈值</th>
                  <th className="text-right px-3 py-2 font-mono text-[9px] uppercase text-text-tertiary">更新</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(r => {
                  const st = STATUS[r.status];
                  return (
                    <tr key={r.skuId} className="border-b border-border-subtle hover:bg-bg-surface/30">
                      <td className="px-3 py-2">
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${st.color}`}>
                          {st.emoji} {st.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-text-primary">{r.skuId}</td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-text-primary">{r.qty}</td>
                      <td className="px-3 py-2 text-right">
                        {editing === r.skuId ? (
                          <span className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              className="w-16 px-1.5 py-0.5 bg-bg-root border border-border-default rounded text-[11px] font-mono text-right"
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === 'Enter') saveThreshold(r.skuId);
                                if (e.key === 'Escape') { setEditing(null); setEditValue(''); }
                              }}
                            />
                            <button
                              onClick={() => saveThreshold(r.skuId)}
                              className="text-[10px] font-mono text-success hover:underline"
                            >✓</button>
                          </span>
                        ) : (
                          <button
                            onClick={() => { setEditing(r.skuId); setEditValue(String(r.threshold)); }}
                            className="font-mono tabular-nums text-text-secondary hover:text-accent border-b border-dashed border-border-default hover:border-accent"
                            title="点击改阈值"
                          >
                            {r.threshold}
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-[10px] text-text-tertiary">
                        {timeAgo(r.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 text-[10px] font-mono text-text-tertiary leading-relaxed border-t border-border-subtle pt-3">
          阈值默认: <code>max(qty × 20%, 10)</code> · 点击数字可手动覆盖
          <br />
          数据 90 天没更新会过期 (假设你 ERP 已经断了或 SKU 下架)
          <br />
          断货/低位会进 <Link href="/me/alerts" className="text-accent hover:underline">/me/alerts</Link> 和 09:00 daily digest
        </div>
      </div>
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m}分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}小时前`;
  const d = Math.floor(h / 24);
  return `${d}天前`;
}
