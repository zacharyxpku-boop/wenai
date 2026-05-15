import { readBrowserStorage, writeBrowserStorage } from '@/lib/browser-storage';

export type LocalAnalyticsEventName =
  | 'page_view'
  | 'csv_import'
  | 'decision_generated'
  | 'report_exported'
  | 'template_copied'
  | 'paywall_shown'
  | 'paywall_upgrade_clicked'
  | 'paywall_dismissed'
  | 'kuaizi_error';

export interface LocalAnalyticsEvent {
  id: string;
  timestamp: string;
  event_name: LocalAnalyticsEventName;
  properties: Record<string, unknown>;
  session_id: string;
}

export interface LocalAnalyticsStats {
  events: LocalAnalyticsEvent[];
  totals: Record<LocalAnalyticsEventName, number>;
  last7Days: Array<{ date: string; count: number }>;
  last30Days: Array<{ date: string; count: number }>;
  metrics: {
    totalVisits: number;
    csvImports: number;
    decisionsGenerated: number;
    templatesCopied: number;
    paywallShown: number;
    paywallUpgradeClicked: number;
    paywallConversionRate: number;
  };
  funnel: Array<{ step: string; count: number; conversionRate: number }>;
}

const EVENTS_KEY = 'wenai_local_analytics_events_v1';
const SESSION_KEY = 'wenai_local_analytics_session_v1';
const MAX_EVENTS = 2000;

const EVENT_NAMES: LocalAnalyticsEventName[] = [
  'page_view',
  'csv_import',
  'decision_generated',
  'report_exported',
  'template_copied',
  'paywall_shown',
  'paywall_upgrade_clicked',
  'paywall_dismissed',
  'kuaizi_error',
];

function safeReadEvents(): LocalAnalyticsEvent[] {
  try {
    const parsed = JSON.parse(readBrowserStorage(EVENTS_KEY, '[]')) as LocalAnalyticsEvent[];
    return Array.isArray(parsed) ? parsed.filter(event => EVENT_NAMES.includes(event.event_name)) : [];
  } catch {
    return [];
  }
}

function safeWriteEvents(events: LocalAnalyticsEvent[]) {
  const ok = writeBrowserStorage(EVENTS_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  if (!ok) {
    writeBrowserStorage(EVENTS_KEY, JSON.stringify(events.slice(-300)));
  }
}

export function getSessionId() {
  const existing = readBrowserStorage(SESSION_KEY, '');
  if (existing) return existing;
  const next = `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  writeBrowserStorage(SESSION_KEY, next);
  return next;
}

export function track(eventName: LocalAnalyticsEventName, properties: Record<string, unknown> = {}) {
  const event: LocalAnalyticsEvent = {
    id: `event-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    event_name: eventName,
    properties,
    session_id: getSessionId(),
  };
  safeWriteEvents([...safeReadEvents(), event]);
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function emptyTrend(days: number) {
  const today = new Date();
  return Array.from({ length: days }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - index));
    return { date: dayKey(date), count: 0 };
  });
}

function trend(events: LocalAnalyticsEvent[], days: number) {
  const base = emptyTrend(days);
  const counts = new Map(base.map(item => [item.date, item.count]));
  for (const event of events) {
    const key = event.timestamp.slice(0, 10);
    if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1);
  }
  return base.map(item => ({ ...item, count: counts.get(item.date) || 0 }));
}

export function getStats(): LocalAnalyticsStats {
  const events = safeReadEvents().sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const totals = EVENT_NAMES.reduce<Record<LocalAnalyticsEventName, number>>((acc, name) => {
    acc[name] = events.filter(event => event.event_name === name).length;
    return acc;
  }, {} as Record<LocalAnalyticsEventName, number>);
  const paywallShown = totals.paywall_shown;
  const paywallUpgradeClicked = totals.paywall_upgrade_clicked;
  const funnelSteps: Array<{ step: string; eventName: LocalAnalyticsEventName }> = [
    { step: 'Landing', eventName: 'page_view' },
    { step: '创建项目', eventName: 'template_copied' },
    { step: '导入 CSV', eventName: 'csv_import' },
    { step: '生成决策', eventName: 'decision_generated' },
    { step: '导出报告', eventName: 'report_exported' },
    { step: '复制模板', eventName: 'template_copied' },
  ];
  const firstStepCount = Math.max(1, totals.page_view);
  return {
    events,
    totals,
    last7Days: trend(events, 7),
    last30Days: trend(events, 30),
    metrics: {
      totalVisits: totals.page_view,
      csvImports: totals.csv_import,
      decisionsGenerated: totals.decision_generated,
      templatesCopied: totals.template_copied,
      paywallShown,
      paywallUpgradeClicked,
      paywallConversionRate: paywallShown > 0 ? Math.round((paywallUpgradeClicked / paywallShown) * 1000) / 10 : 0,
    },
    funnel: funnelSteps.map(item => {
      const count = totals[item.eventName];
      return {
        step: item.step,
        count,
        conversionRate: Math.round((count / firstStepCount) * 1000) / 10,
      };
    }),
  };
}

export function exportEventsAsCsv(events = safeReadEvents()) {
  const header = ['timestamp', 'event_name', 'session_id', 'properties_json'];
  const rows = events.map(event => [
    event.timestamp,
    event.event_name,
    event.session_id,
    JSON.stringify(event.properties).replace(/"/g, '""'),
  ]);
  return [header.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
}

export function filterEventsByRange(events: LocalAnalyticsEvent[], range: '7d' | '30d' | 'all' = 'all') {
  if (range === 'all') return events;
  const days = range === '7d' ? 7 : 30;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return events.filter(event => new Date(event.timestamp).getTime() >= cutoff);
}

export function exportAnalytics(range: '7d' | '30d' | 'all' = 'all') {
  const events = filterEventsByRange(safeReadEvents(), range);
  return {
    json: JSON.stringify(events, null, 2),
    csv: exportEventsAsCsv(events),
    events,
  };
}
