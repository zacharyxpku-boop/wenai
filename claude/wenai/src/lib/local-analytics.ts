export type LocalAnalyticsEventName =
  | 'page_view'
  | 'csv_import'
  | 'decision_generated'
  | 'report_exported'
  | 'template_copied'
  | 'paywall_shown'
  | 'paywall_upgrade_clicked'
  | 'paywall_dismissed';

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
];

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function safeReadEvents(): LocalAnalyticsEvent[] {
  if (!canUseStorage()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(EVENTS_KEY) || '[]') as LocalAnalyticsEvent[];
    return Array.isArray(parsed) ? parsed.filter(event => EVENT_NAMES.includes(event.event_name)) : [];
  } catch {
    return [];
  }
}

function safeWriteEvents(events: LocalAnalyticsEvent[]) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    window.localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-300)));
  }
}

export function getSessionId() {
  if (!canUseStorage()) return 'memory-session';
  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const next = `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  window.localStorage.setItem(SESSION_KEY, next);
  return next;
}

export function track(eventName: LocalAnalyticsEventName, properties: Record<string, unknown> = {}) {
  if (!canUseStorage()) return;
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
  };
}

export function exportEventsAsCsv(events = safeReadEvents()) {
  const header = ['timestamp', 'event_name', 'session_id', 'properties'];
  const rows = events.map(event => [
    event.timestamp,
    event.event_name,
    event.session_id,
    JSON.stringify(event.properties).replace(/"/g, '""'),
  ]);
  return [header.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
}
