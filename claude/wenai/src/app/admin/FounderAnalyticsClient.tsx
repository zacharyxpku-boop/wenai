'use client';

import { useMemo, useState } from 'react';
import { exportEarlyBirdLeads, getEarlyBirdStats } from '@/lib/early-bird';
import { exportAnalytics, getStats, type LocalAnalyticsEventName } from '@/lib/local-analytics';

const FILTERS: Array<'all' | LocalAnalyticsEventName> = ['all', 'page_view', 'csv_import', 'decision_generated', 'report_exported', 'template_copied', 'paywall_shown', 'paywall_upgrade_clicked', 'paywall_dismissed', 'kuaizi_error'];

function downloadText(filename: string, body: string, type: string) {
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function TrendBars({ data }: { data: Array<{ date: string; count: number }> }) {
  const max = Math.max(1, ...data.map(item => item.count));
  return (
    <div className="flex h-36 items-end gap-1 rounded-md border border-border-subtle bg-bg-surface p-3">
      {data.map(item => (
        <div key={item.date} className="flex flex-1 flex-col items-center gap-2">
          <div className="w-full rounded-t bg-accent" style={{ height: `${Math.max(5, (item.count / max) * 100)}%` }} title={`${item.date}: ${item.count}`} />
          <div className="hidden rotate-45 font-mono text-[9px] text-text-tertiary md:block">{item.date.slice(5)}</div>
        </div>
      ))}
    </div>
  );
}

export default function FounderAnalyticsClient({ enabled }: { enabled: boolean }) {
  const [filter, setFilter] = useState<'all' | LocalAnalyticsEventName>('all');
  const [range, setRange] = useState<'7' | '30'>('7');
  const stats = useMemo(() => getStats(), []);
  const earlyBird = useMemo(() => getEarlyBirdStats(), []);
  const events = stats.events.filter(event => filter === 'all' || event.event_name === filter).slice(0, 50);
  const metricCards = [
    ['总访问', stats.metrics.totalVisits],
    ['CSV 导入次数', stats.metrics.csvImports],
    ['决策生成次数', stats.metrics.decisionsGenerated],
    ['模板复制次数', stats.metrics.templatesCopied],
    ['早鸟线索', earlyBird.total],
    ['付费墙曝光→点击转化率', `${stats.metrics.paywallConversionRate}%`],
  ];

  if (!enabled) {
    return (
      <main className="min-h-screen bg-bg-root px-5 py-8 text-text-primary">
        <div className="mx-auto max-w-xl rounded-md border border-border-subtle bg-bg-surface p-6">
          <div className="text-[12px] font-semibold text-text-primary">Admin 未开放</div>
          <p className="mt-2 text-[13px] leading-6 text-text-secondary">创始人看板只在开发环境或 ENABLE_ADMIN=true 时启用。</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-root px-5 py-8 text-text-primary">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col justify-between gap-4 border-b border-border-subtle pb-6 md:flex-row md:items-end">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-accent">Founder Analytics</div>
            <h1 className="mt-2 text-3xl font-semibold text-text-primary">本地使用数据看板</h1>
            <p className="mt-2 text-[13px] text-text-secondary">当前为本地数据，仅包含当前浏览器事件。导出后可手动汇总跨用户数据。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => downloadText('wenai-local-analytics.json', exportAnalytics(range === '7' ? '7d' : '30d').json, 'application/json;charset=utf-8')} className="rounded-md border border-border-subtle px-3 py-2 text-[12px] font-semibold text-text-primary hover:border-accent">
              导出 JSON
            </button>
            <button type="button" onClick={() => downloadText('wenai-local-analytics.csv', exportAnalytics(range === '7' ? '7d' : '30d').csv, 'text/csv;charset=utf-8')} className="rounded-md bg-accent px-3 py-2 text-[12px] font-semibold text-bg-root hover:bg-accent-hover">
              导出 CSV
            </button>
            <button type="button" onClick={() => downloadText('wenai-early-bird-leads.csv', exportEarlyBirdLeads(range === '7' ? '7d' : '30d').csv, 'text/csv;charset=utf-8')} className="rounded-md border border-border-subtle px-3 py-2 text-[12px] font-semibold text-text-primary hover:border-accent">
              导出早鸟线索
            </button>
          </div>
        </div>

        <section className="mt-6 grid gap-3 md:grid-cols-5">
          {metricCards.map(([label, value]) => (
            <div key={label} className="rounded-md border border-border-subtle bg-bg-surface p-4">
              <div className="text-[11px] text-text-tertiary">{label}</div>
              <div className="mt-2 text-2xl font-semibold text-text-primary">{value}</div>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-md border border-border-subtle bg-bg-surface p-5">
          <h2 className="text-lg font-semibold text-text-primary">本地转化漏斗</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-6">
            {stats.funnel.map(item => (
              <div key={item.step} className="rounded-md border border-border-subtle bg-bg-root/40 p-3">
                <div className="text-[11px] text-text-tertiary">{item.step}</div>
                <div className="mt-2 text-xl font-semibold text-text-primary">{item.count}</div>
                <div className="mt-1 text-[11px] text-text-secondary">{item.conversionRate}%</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-md border border-border-subtle bg-bg-surface p-5">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">早鸟商业化线索</h2>
              <p className="mt-1 text-[12px] text-text-secondary">当前为本地数据，仅包含当前浏览器收集到的邮箱意向。</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[12px]">
              <div className="rounded-md border border-border-subtle px-3 py-2">
                <div className="text-text-tertiary">总数</div>
                <div className="mt-1 text-lg font-semibold text-text-primary">{earlyBird.total}</div>
              </div>
              <div className="rounded-md border border-border-subtle px-3 py-2">
                <div className="text-text-tertiary">Starter</div>
                <div className="mt-1 text-lg font-semibold text-text-primary">{earlyBird.starter}</div>
              </div>
              <div className="rounded-md border border-border-subtle px-3 py-2">
                <div className="text-text-tertiary">Growth</div>
                <div className="mt-1 text-lg font-semibold text-text-primary">{earlyBird.growth}</div>
              </div>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-[12px]">
              <thead className="border-b border-border-subtle text-text-tertiary">
                <tr>
                  <th className="py-2 pr-3">邮箱</th>
                  <th className="py-2 pr-3">档位</th>
                  <th className="py-2 pr-3">来源</th>
                  <th className="py-2 pr-3">更新时间</th>
                </tr>
              </thead>
              <tbody>
                {earlyBird.leads.slice(0, 20).map(lead => (
                  <tr key={lead.id} className="border-b border-border-subtle">
                    <td className="py-2 pr-3 font-semibold text-text-primary">{lead.email}</td>
                    <td className="py-2 pr-3 text-text-secondary">{lead.tier}</td>
                    <td className="py-2 pr-3 text-text-secondary">{lead.source}</td>
                    <td className="py-2 pr-3 text-text-tertiary">{new Date(lead.updatedAt).toLocaleString('zh-CN')}</td>
                  </tr>
                ))}
                {earlyBird.leads.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-text-tertiary">还没有早鸟线索。定价页、Dashboard 或付费墙提交邮箱后会出现在这里。</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-md border border-border-subtle bg-bg-root/30 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-text-primary">{range === '7' ? '过去 7 天趋势' : '过去 30 天趋势'}</h2>
            <div className="flex gap-2">
              <button type="button" onClick={() => setRange('7')} className={range === '7' ? 'rounded-md bg-accent px-3 py-1.5 text-[12px] font-semibold text-bg-root' : 'rounded-md border border-border-subtle px-3 py-1.5 text-[12px] text-text-secondary'}>7 天</button>
              <button type="button" onClick={() => setRange('30')} className={range === '30' ? 'rounded-md bg-accent px-3 py-1.5 text-[12px] font-semibold text-bg-root' : 'rounded-md border border-border-subtle px-3 py-1.5 text-[12px] text-text-secondary'}>30 天</button>
            </div>
          </div>
          <TrendBars data={range === '7' ? stats.last7Days : stats.last30Days} />
        </section>

        <section className="mt-6 rounded-md border border-border-subtle bg-bg-surface p-5">
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <h2 className="text-lg font-semibold text-text-primary">最近 50 条事件</h2>
            <select value={filter} onChange={event => setFilter(event.target.value as 'all' | LocalAnalyticsEventName)} className="rounded-md border border-border-subtle bg-bg-raised px-3 py-2 text-[12px] text-text-primary">
              {FILTERS.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[12px]">
              <thead className="border-b border-border-subtle text-text-tertiary">
                <tr>
                  <th className="py-2 pr-3">时间</th>
                  <th className="py-2 pr-3">事件</th>
                  <th className="py-2 pr-3">Session</th>
                  <th className="py-2 pr-3">属性</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id} className="border-b border-border-subtle">
                    <td className="py-2 pr-3 text-text-secondary">{new Date(event.timestamp).toLocaleString('zh-CN')}</td>
                    <td className="py-2 pr-3 font-semibold text-text-primary">{event.event_name}</td>
                    <td className="py-2 pr-3 font-mono text-text-tertiary">{event.session_id}</td>
                    <td className="py-2 pr-3 font-mono text-text-secondary">{JSON.stringify(event.properties)}</td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-text-tertiary">还没有事件。打开首页、导入 CSV 或复制模板后会出现数据。</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
