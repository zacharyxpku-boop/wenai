'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * /me/alerts · 商家信号面板 · MOAT-09 主动通道
 *
 * 把后端扫出来的死信号 (stale SKU / 没 perf / 接近 cost cap / 命中率低 / SKU 归因低)
 * 集中到一个 inbox 式列表, 商家偶尔看一眼就能发现盲点
 *
 * 与 /me/savings 战利品对仗:
 *   savings = "已经省了多少" (正向激励)
 *   alerts  = "你忽略了什么" (负向纠偏)
 */

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  kind: string;
  headline: string;
  body: string;
  action: { label: string; href: string };
}

interface AlertsResp {
  count: number;
  criticalCount: number;
  warningCount: number;
  alerts: Alert[];
}

interface DigestPoint {
  date: string;
  critical: number;
  warning: number;
  info: number;
  topAction: string | null;
}

interface DigestResp {
  digests: DigestPoint[];
  lastDate: string | null;
  count?: number;
}

const SEV_META: Record<Alert['severity'], { txt: string; cls: string; icon: string }> = {
  critical: { txt: 'CRITICAL', icon: '🚨', cls: 'border-error/50 bg-error/5 text-error' },
  warning: { txt: 'WARNING', icon: '⚠️', cls: 'border-warning/50 bg-warning/5 text-warning' },
  info: { txt: 'INFO', icon: '💡', cls: 'border-cat-content/40 bg-cat-content/5 text-cat-content' },
};

export default function AlertsPage() {
  const [data, setData] = useState<AlertsResp | null>(null);
  const [digest, setDigest] = useState<DigestResp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/alerts')
      .then(r => r.json())
      .then((d: AlertsResp) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    fetch('/api/user/digest?limit=7')
      .then(r => r.json())
      .then((d: DigestResp) => setDigest(d))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-bg-root">
      <div className="max-w-[900px] mx-auto px-6 py-8">
        <div className="mb-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/me/skus" className="text-[10px] font-mono text-text-tertiary hover:text-accent">
              ← SKU 库
            </Link>
            <span className="text-[10px] font-mono text-text-tertiary">/</span>
            <span className="text-[10px] font-mono text-accent">信号面板</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-2 font-[family-name:var(--font-outfit)]">
            🔔 你的盲点信号
          </h1>
          <p className="text-[12px] text-text-secondary">
            wenai 替你扫: 上架太久没动的 SKU · 没回填的实战数据 · 接近成本上限 · 缓存命中率低 · 归因黑账。
            <span className="text-accent">一周来一次, 别让东西默默死掉。</span>
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 font-mono text-[12px] text-text-tertiary">加载中...</div>
        ) : !data || data.count === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* 顶部三档计数 */}
            <div className="grid grid-cols-3 gap-3 mb-5 text-[12px]">
              <Stat label="紧急" value={data.criticalCount} cls="border-error/40 text-error" />
              <Stat label="警示" value={data.warningCount} cls="border-warning/40 text-warning" />
              <Stat label="提示" value={data.count - data.criticalCount - data.warningCount} cls="border-cat-content/40 text-cat-content" />
            </div>

            {/* 近 7 天 digest 走势 (cron 写入) */}
            {digest && digest.digests.length > 0 && (
              <section className="mb-5 border border-border-subtle bg-bg-surface/30 rounded-lg p-4">
                <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
                  近 {digest.digests.length} 天信号走势 · 最新生成 {digest.lastDate}
                </div>
                <div className="flex items-end gap-1 h-16 mb-2">
                  {digest.digests.slice().reverse().map(p => {
                    const total = p.critical + p.warning + p.info;
                    return (
                      <div key={p.date} className="flex-1 flex flex-col-reverse" title={`${p.date} · ${p.critical} 紧急 / ${p.warning} 警示 / ${p.info} 提示${p.topAction ? '\n→ ' + p.topAction : ''}`}>
                        {p.critical > 0 && (
                          <div className="bg-error/70 hover:bg-error transition-colors" style={{ height: `${(p.critical / Math.max(total, 1)) * 100}%`, minHeight: '2px' }} />
                        )}
                        {p.warning > 0 && (
                          <div className="bg-warning/70 hover:bg-warning transition-colors" style={{ height: `${(p.warning / Math.max(total, 1)) * 100}%`, minHeight: '2px' }} />
                        )}
                        {p.info > 0 && (
                          <div className="bg-cat-content/60 hover:bg-cat-content transition-colors" style={{ height: `${(p.info / Math.max(total, 1)) * 100}%`, minHeight: '2px' }} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-1 mb-2">
                  {digest.digests.slice().reverse().map(p => (
                    <div key={p.date} className="flex-1 text-center text-[8px] font-mono text-text-tertiary tabular-nums">
                      {p.date.slice(5)}
                    </div>
                  ))}
                </div>
                {digest.digests[0]?.topAction && (
                  <div className="text-[10px] font-mono text-text-tertiary mt-2">
                    最近一份的 top action: <span className="text-text-secondary">{digest.digests[0].topAction}</span>
                  </div>
                )}
              </section>
            )}

            <div className="space-y-3">
              {data.alerts.map(a => {
                const sev = SEV_META[a.severity];
                return (
                  <div key={a.id} className={`border rounded-lg p-4 ${sev.cls}`}>
                    <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
                      <span className="text-base">{sev.icon}</span>
                      <span className="text-[9px] font-mono uppercase tracking-wider opacity-80">
                        {sev.txt} · {a.kind}
                      </span>
                    </div>
                    <h3 className="text-[14px] font-bold text-text-primary mb-1.5">
                      {a.headline}
                    </h3>
                    <p className="text-[12px] text-text-secondary leading-relaxed mb-3">
                      {a.body}
                    </p>
                    <Link
                      href={a.action.href}
                      className="inline-block text-[11px] font-mono px-3 py-1.5 border border-current rounded hover:bg-current/10 transition-colors"
                    >
                      {a.action.label}
                    </Link>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, cls }: { label: string; value: number; cls: string }) {
  return (
    <div className={`border ${cls} bg-bg-surface/30 rounded p-3 text-center`}>
      <div className="text-[10px] font-mono uppercase tracking-wider opacity-70 mb-1">{label}</div>
      <div className="text-3xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-success/40 bg-success/5 rounded-lg p-10 text-center">
      <div className="text-4xl mb-3">✨</div>
      <h3 className="text-[15px] font-bold text-success mb-2">没有需要关注的信号</h3>
      <p className="text-[11px] text-text-secondary mb-5">
        SKU 状态健康, 缓存命中正常, 成本远未到上限。继续保持。
      </p>
      <Link href="/me/skus" className="text-[11px] font-mono text-accent hover:underline">
        回 SKU 库 →
      </Link>
    </div>
  );
}
