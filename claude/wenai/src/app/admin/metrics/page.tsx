'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import modulesConfig from '@/config/modules.json';

interface FeedbackSummary {
  total: number;
  goodRatio: number;
}

interface HealthService {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latencyMs?: number;
}

interface UsageStats {
  todayCount: number;
  weekCount: number;
  totalCount: number;
  weekTokens: number;
  avgRating: number;
  ratingCount: number;
  ranking: { moduleId: string; count: number }[];
}

export default function AdminMetricsPage() {
  const [authed, setAuthed] = useState(false);
  const [key, setKey] = useState('');
  const [feedbackSummary, setFeedbackSummary] = useState<Record<string, FeedbackSummary>>({});
  const [paymentPending, setPaymentPending] = useState(0);
  const [phase2Interest, setPhase2Interest] = useState(0);
  const [health, setHealth] = useState<{ overall: string; services: HealthService[] } | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('wenai_admin_key');
    if (saved && saved.length >= 6) setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    // Feedback summary (全部模块)
    fetch('/api/feedback?type=summary').then(r => r.json()).then(d => {
      if (d.summary) setFeedbackSummary(d.summary);
    }).catch(() => {});

    // Payment claims
    fetch('/api/feedback?type=feedback&moduleId=payment-claim').then(r => r.json()).then(d => {
      const total = (d.entries || []).length;
      const processed = JSON.parse(localStorage.getItem('wenai_payment_processed') || '[]') as string[];
      setPaymentPending(Math.max(0, total - processed.length));
    }).catch(() => {});

    // Phase 2 (AI 主图) 兴趣计数
    fetch('/api/feedback?type=feedback&moduleId=phase2-image-gen').then(r => r.json()).then(d => {
      setPhase2Interest((d.entries || []).length);
    }).catch(() => {});

    // Health
    fetch('/api/health', { cache: 'no-store' }).then(r => r.json()).then(setHealth).catch(() => {});

    // Usage stats
    fetch('/api/usage').then(r => r.json()).then(setUsage).catch(() => {});
  }, [authed]);

  const handleAuth = () => {
    if (key.length >= 6) {
      sessionStorage.setItem('wenai_admin_key', key);
      setAuthed(true);
    }
  };

  if (!authed) {
    return (
      <div className="max-w-md mx-auto py-20 px-6">
        <h1 className="text-lg font-semibold mb-6">管理员 · Metrics 总览</h1>
        <p className="text-[12px] text-text-secondary mb-4">
          跨模块 KPI 一屏看 · 共享 feedback / payment 面板口令
        </p>
        <input
          type="password"
          placeholder="输入口令 (6+ 位)"
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAuth()}
          className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-md text-[13px] mb-3"
        />
        <button
          onClick={handleAuth}
          disabled={key.length < 6}
          className="w-full py-2 bg-accent hover:bg-accent-hover disabled:bg-border-subtle text-bg-root text-[13px] font-semibold rounded-md"
        >
          进入
        </button>
      </div>
    );
  }

  const moduleNameMap: Record<string, string> = {};
  for (const m of modulesConfig.modules) moduleNameMap[m.id] = m.name;
  moduleNameMap['payment-claim'] = '付款声明';
  moduleNameMap['phase2-image-gen'] = 'Pipeline 03 兴趣';

  const feedbackTotal = Object.values(feedbackSummary).reduce((s, v) => s + v.total, 0);
  const feedbackGoodRatioOverall = feedbackTotal > 0
    ? Math.round(
        Object.values(feedbackSummary).reduce((s, v) => s + v.total * v.goodRatio, 0) / feedbackTotal
      )
    : 0;

  return (
    <div className="max-w-[1100px] mx-auto py-8 px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Metrics · 总览</h1>
          <p className="text-[11px] font-mono text-text-tertiary mt-1">
            feedback / payment / health / usage 四端聚合 · 不落库在此页汇总
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/feedback" className="text-[11px] font-mono text-text-tertiary hover:text-accent border border-border-subtle rounded px-3 py-1.5">
            反馈明细 →
          </Link>
          <Link href="/admin/payments" className="text-[11px] font-mono text-text-tertiary hover:text-accent border border-border-subtle rounded px-3 py-1.5">
            付款审核 →
          </Link>
          <button
            onClick={() => { sessionStorage.removeItem('wenai_admin_key'); setAuthed(false); }}
            className="text-[11px] text-text-tertiary hover:text-accent"
          >
            登出
          </button>
        </div>
      </div>

      {/* KPI 卡 · 4 格 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-bg-surface border border-border-subtle rounded-md p-4">
          <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider mb-2">总反馈</div>
          <div className="text-2xl font-bold text-text-primary tabular-nums">{feedbackTotal}</div>
          <div className="text-[10px] font-mono text-success mt-1">{feedbackGoodRatioOverall}% 好评</div>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-md p-4">
          <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider mb-2">付款待审</div>
          <div className={`text-2xl font-bold tabular-nums ${paymentPending > 0 ? 'text-accent' : 'text-text-primary'}`}>
            {paymentPending}
          </div>
          <div className="text-[10px] font-mono text-text-tertiary mt-1">
            {paymentPending > 0 ? '需尽快处理' : '全部已审'}
          </div>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-md p-4">
          <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider mb-2">Pipeline 03 需求</div>
          <div className="text-2xl font-bold text-accent tabular-nums">{phase2Interest}</div>
          <div className="text-[10px] font-mono text-text-tertiary mt-1">历史 "我想用" 点击</div>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-md p-4">
          <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider mb-2">今日调用</div>
          <div className="text-2xl font-bold text-text-primary tabular-nums">{usage?.todayCount ?? '—'}</div>
          <div className="text-[10px] font-mono text-text-tertiary mt-1">
            本周 {usage?.weekCount ?? 0} · 累计 {usage?.totalCount ?? 0}
          </div>
        </div>
      </div>

      {/* Health summary */}
      {health && (
        <div className="mb-6 p-4 border border-border-subtle rounded-md bg-bg-surface">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">系统健康</div>
            <Link href="/status" className="text-[10px] font-mono text-accent hover:underline">
              /status 详情 →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {health.services.map(s => {
              const color = s.status === 'operational' ? 'text-success'
                : s.status === 'degraded' ? 'text-accent' : 'text-error';
              return (
                <div key={s.name} className="flex items-center gap-2 text-[11px]">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    s.status === 'operational' ? 'bg-success'
                    : s.status === 'degraded' ? 'bg-accent' : 'bg-error'
                  }`} />
                  <span className="text-text-primary truncate flex-1">{s.name.replace(/^AI · /, '').replace(/^Auth · /, '')}</span>
                  <span className={`font-mono ${color}`}>
                    {s.latencyMs ? `${s.latencyMs}ms` : s.status === 'operational' ? 'ok' : s.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 反馈模块排名 */}
      {Object.keys(feedbackSummary).length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
              模块反馈排名 (按总条数)
            </div>
          </div>
          <div className="space-y-1.5">
            {Object.entries(feedbackSummary)
              .sort((a, b) => b[1].total - a[1].total)
              .map(([mid, s]) => (
                <Link
                  key={mid}
                  href={`/admin/feedback`}
                  className="flex items-center gap-3 px-3 py-2 border border-border-subtle rounded hover:border-accent/30 hover:bg-bg-surface transition-all"
                >
                  <span className="text-[12px] text-text-primary truncate min-w-0 flex-1">
                    {moduleNameMap[mid] || mid}
                  </span>
                  <div className="flex-shrink-0 w-32 h-1 bg-bg-raised rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success/60"
                      style={{ width: `${s.goodRatio}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-text-tertiary w-16 text-right tabular-nums">
                    {s.total} 条
                  </span>
                  <span className="text-[10px] font-mono text-success w-12 text-right tabular-nums">
                    {s.goodRatio}%
                  </span>
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* 使用排名 */}
      {usage && usage.ranking.length > 0 && (
        <div>
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
            模块使用排名 (7 日)
          </div>
          <div className="space-y-1.5">
            {usage.ranking.slice(0, 10).map((r, i) => {
              const maxCount = usage.ranking[0].count || 1;
              return (
                <div key={r.moduleId} className="flex items-center gap-3 px-3 py-2 border border-border-subtle rounded">
                  <span className="text-[10px] font-mono text-text-tertiary w-4 text-right">{i + 1}</span>
                  <span className="text-[12px] text-text-primary truncate min-w-0 flex-1">
                    {moduleNameMap[r.moduleId] || r.moduleId}
                  </span>
                  <div className="flex-shrink-0 w-48 h-1 bg-bg-raised rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent/60"
                      style={{ width: `${(r.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-accent w-12 text-right tabular-nums">
                    {r.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
