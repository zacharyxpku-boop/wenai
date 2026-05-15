'use client';

import { useEffect, useState } from 'react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latencyMs?: number;
  note?: string;
}

interface HealthResponse {
  overall: 'operational' | 'degraded' | 'down';
  services: ServiceStatus[];
  timestamp: string;
  uptime: number | null;
}

const STATUS_META = {
  operational: { label: '正常', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', dot: 'bg-success' },
  degraded: { label: '降级', color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/30', dot: 'bg-accent' },
  down: { label: '宕机', color: 'text-error', bg: 'bg-error/10', border: 'border-error/30', dot: 'bg-error' },
};

export default function StatusPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      const data = await res.json();
      setHealth(data);
      setLastFetch(new Date());
    } catch {
      setHealth({ overall: 'down', services: [], timestamp: new Date().toISOString(), uptime: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const t = setInterval(fetchHealth, 30000); // 每 30s 自动刷新
    return () => clearInterval(t);
  }, []);

  const overall = health?.overall || 'down';
  const meta = STATUS_META[overall];

  return (
    <div className="max-w-[900px] mx-auto py-10 px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="text-[10px] font-mono text-accent uppercase tracking-[0.2em] mb-3">
          STATUS · 实时
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-4 font-[family-name:var(--font-outfit)]">
          系统状态
        </h1>

        {loading ? (
          <div className="text-text-tertiary font-mono text-[12px]">加载中...</div>
        ) : (
          <div className={`inline-flex items-center gap-3 px-5 py-3 border rounded-md ${meta.border} ${meta.bg}`}>
            <div className="relative flex items-center justify-center">
              <div className={`w-2 h-2 rounded-full ${meta.dot} animate-pulse-dot`} />
              <div className={`absolute w-4 h-4 rounded-full ${meta.dot} opacity-20 animate-ping`} />
            </div>
            <span className={`text-[14px] font-semibold ${meta.color}`}>
              {overall === 'operational' ? '所有系统正常运行'
                : overall === 'degraded' ? '部分服务降级'
                : '核心服务宕机'}
            </span>
          </div>
        )}

        {lastFetch && (
          <div className="text-[10px] font-mono text-text-tertiary mt-3">
            最近检查 {lastFetch.toLocaleTimeString('zh-CN')} · 每 30 秒自动刷新
          </div>
        )}
      </div>

      {/* SLA 承诺 */}
      <div className="mb-6 p-5 border border-border-subtle rounded-md bg-bg-surface/50">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
          SLA 承诺
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-[13px] font-semibold text-text-primary mb-1">Free · 内测</div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              按 &ldquo;现状&rdquo; 提供，不保证可用性。AI 第三方波动时会返回明确错误。
            </p>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-text-primary mb-1">试跑接入</div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              演示环境 best effort，正式额度和响应窗口以接入订单为准。
            </p>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-text-primary mb-1">企业接入</div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              SLA、赔偿、响应等级和例外情况按双方合同约定。
            </p>
          </div>
        </div>
      </div>

      {/* Services */}
      {health && health.services.length > 0 && (
        <div className="space-y-2 mb-6">
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
            依赖服务 · 共 {health.services.length}
          </div>
          {health.services.map(s => {
            const m = STATUS_META[s.status];
            return (
              <div
                key={s.name}
                className={`flex items-center gap-3 px-4 py-3 border rounded-md ${m.border} ${m.bg}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${m.dot} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-text-primary">{s.name}</div>
                  {s.note && (
                    <div className="text-[10px] font-mono text-text-tertiary mt-0.5 truncate">
                      {s.note}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {typeof s.latencyMs === 'number' && (
                    <span className="text-[10px] font-mono text-text-tertiary tabular-nums">
                      {s.latencyMs}ms
                    </span>
                  )}
                  <span className={`text-[11px] font-mono font-semibold ${m.color}`}>
                    {m.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="text-center pt-6 border-t border-border-subtle/50">
        <p className="text-[10px] font-mono text-text-tertiary">
          发现问题？邮件 <span className="text-accent">zachary.x.pku@gmail.com</span> · 48h 内响应
        </p>
        {health?.uptime && (
          <p className="text-[9px] font-mono text-text-tertiary/70 mt-2">
            current serverless instance uptime {Math.floor(health.uptime / 60)}m
          </p>
        )}
      </div>
    </div>
  );
}
