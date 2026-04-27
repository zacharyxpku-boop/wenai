'use client';

import { useEffect, useState } from 'react';
import AdminHeader from '@/components/AdminHeader';

/**
 * /admin/alerts · 跨 org 信号总览
 *
 * 让阁主看哪些客户该被销售/客服主动打电话:
 *   高 critical 数 = 流失风险
 *   高 cost 但 0 alert = 健康活跃 (理想客户)
 *   stale SKU 多 = 客户没在用了
 */

interface OrgRow {
  orgId: string;
  critical: number;
  warning: number;
  info: number;
  total: number;
  topReason: string;
  skuCount: number;
  todayCny: number;
}

interface Resp {
  totalOrgs: number;
  criticalOrgs: number;
  warningOrgs: number;
  healthyOrgs: number;
  orgs: OrgRow[];
}

export default function AdminAlertsPage() {
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'healthy'>('all');

  useEffect(() => {
    fetch('/api/admin/alerts')
      .then(r => r.json())
      .then((d: Resp) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = !data ? [] :
    filter === 'critical' ? data.orgs.filter(o => o.critical > 0) :
    filter === 'warning' ? data.orgs.filter(o => o.warning > 0 && o.critical === 0) :
    filter === 'healthy' ? data.orgs.filter(o => o.total === 0) :
    data.orgs;

  return (
    <div className="min-h-screen bg-bg-root">
      <AdminHeader subtitle="跨 org 信号总览 · 谁该被打电话" />
      <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-5">
        {/* 三档总览 */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Tile label="总 org 数" value={data.totalOrgs} cls="border-border-subtle" />
            <Tile label="🚨 含紧急" value={data.criticalOrgs} cls="border-error/40 text-error" />
            <Tile label="⚠️ 含警示" value={data.warningOrgs} cls="border-warning/40 text-warning" />
            <Tile label="✓ 健康" value={data.healthyOrgs} cls="border-success/40 text-success" />
          </div>
        )}

        {/* 过滤 */}
        <div className="flex flex-wrap gap-2 text-[11px] font-mono">
          <span className="text-text-tertiary self-center">过滤:</span>
          {([
            { v: 'all', label: '全部' },
            { v: 'critical', label: '🚨 紧急' },
            { v: 'warning', label: '⚠️ 警示' },
            { v: 'healthy', label: '✓ 健康' },
          ] as const).map(o => (
            <button
              key={o.v}
              onClick={() => setFilter(o.v)}
              className={`px-2.5 py-1 rounded border ${
                filter === o.v
                  ? 'border-accent text-accent bg-accent/10'
                  : 'border-border-subtle text-text-secondary hover:border-accent/40'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* 表 */}
        <section className="border border-border-subtle rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-[12px] font-mono text-text-tertiary py-12 text-center">加载中...</div>
          ) : filtered.length === 0 ? (
            <div className="text-[12px] font-mono text-text-tertiary py-12 text-center">
              {filter === 'all' ? '无 org 活动' : '该过滤下没有 org'}
            </div>
          ) : (
            <table className="w-full text-[12px]">
              <thead className="text-[10px] font-mono text-text-tertiary border-b border-border-subtle bg-bg-surface/30">
                <tr>
                  <th className="text-left py-2 px-3">orgId</th>
                  <th className="text-left py-2 px-3">最严重信号</th>
                  <th className="text-right py-2 px-3">🚨</th>
                  <th className="text-right py-2 px-3">⚠️</th>
                  <th className="text-right py-2 px-3">💡</th>
                  <th className="text-right py-2 px-3">SKU 数</th>
                  <th className="text-right py-2 px-3">今日花费</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.orgId} className="border-b border-border-subtle/40 hover:bg-bg-surface/30">
                    <td className="py-1.5 px-3 font-mono text-text-primary truncate max-w-[200px]" title={o.orgId}>
                      {o.orgId}
                    </td>
                    <td className="py-1.5 px-3 text-text-secondary">{o.topReason}</td>
                    <td className="py-1.5 px-3 text-right tabular-nums text-error">{o.critical || ''}</td>
                    <td className="py-1.5 px-3 text-right tabular-nums text-warning">{o.warning || ''}</td>
                    <td className="py-1.5 px-3 text-right tabular-nums text-cat-content">{o.info || ''}</td>
                    <td className="py-1.5 px-3 text-right tabular-nums text-text-tertiary">{o.skuCount}</td>
                    <td className="py-1.5 px-3 text-right tabular-nums text-accent">¥{o.todayCny.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <p className="text-[10px] font-mono text-text-tertiary leading-relaxed">
          扫所有 wenai:sku:list:* + wenai:cost:*:&lt;today&gt; 取并集 · 单 org 跑 6 类信号检测 · 排序按 critical 降序
          <br />
          理想 ToB 漏斗: 高 cost + 0 alert = 健康活跃; 低 cost + 高 critical = 流失风险须主动联系
        </p>
      </div>
    </div>
  );
}

function Tile({ label, value, cls }: { label: string; value: number; cls: string }) {
  return (
    <div className={`border ${cls} rounded-lg p-4 bg-bg-surface/30`}>
      <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">{label}</div>
      <div className="text-3xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
