/**
 * 给商家 webhook 发消息 · 按目标平台 (飞书/Slack/Discord/generic) 切 payload
 *
 * 调用方:
 *   import { sendDigestToWebhooks } from '@/lib/webhook-out'
 *   await sendDigestToWebhooks(orgId, digestPayload)
 *
 * 网络层用 fetch + 5s timeout, 失败不抛, 写 lastError 让商家在 settings 看到原因
 */

import { listWebhooks, recordWebhookResult, type WebhookEntry, type WebhookKind } from './webhook-config';

interface DigestSignal {
  kind: string;
  severity: 'critical' | 'warning' | 'info';
  headline: string;
}

interface DigestPayloadLike {
  date: string;
  critical: number;
  warning: number;
  info: number;
  signals: DigestSignal[];
  metrics: {
    skuCount: number;
    launchedCount: number;
    todayCny: number;
    cacheRate7d: number | null;
  };
  topAction: string | null;
}

const FETCH_TIMEOUT_MS = 5000;
const DASHBOARD_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://wenai-one.vercel.app';

function severityEmoji(sev: 'critical' | 'warning' | 'info'): string {
  return sev === 'critical' ? '🚨' : sev === 'warning' ? '⚠️' : '💡';
}

/**
 * 飞书 interactive 卡片 · 标题色按最高 severity 渲染
 */
function buildFeishuPayload(digest: DigestPayloadLike): unknown {
  const headerColor = digest.critical > 0 ? 'red' : digest.warning > 0 ? 'orange' : 'blue';
  const lines = digest.signals.slice(0, 8).map(s =>
    `${severityEmoji(s.severity)} **${s.kind}** · ${s.headline}`
  ).join('\n');
  const cacheStr = digest.metrics.cacheRate7d !== null
    ? ` · 缓存命中 ${(digest.metrics.cacheRate7d * 100).toFixed(1)}%`
    : '';
  const headline = digest.topAction
    ? `今日重点：${digest.topAction}`
    : `${digest.signals.length} 条信号待看`;
  return {
    msg_type: 'interactive',
    card: {
      header: {
        title: { tag: 'plain_text', content: `wenai 信号 · ${digest.date}` },
        template: headerColor,
      },
      elements: [
        { tag: 'div', text: { tag: 'lark_md', content: `**${headline}**` } },
        { tag: 'hr' },
        { tag: 'div', text: { tag: 'lark_md', content: lines || '_暂无信号_' } },
        { tag: 'hr' },
        { tag: 'div', text: { tag: 'lark_md', content:
          `SKU ${digest.metrics.skuCount} · 上架 ${digest.metrics.launchedCount} · 今日花费 ¥${digest.metrics.todayCny.toFixed(2)}${cacheStr}`
        } },
        {
          tag: 'action',
          actions: [{
            tag: 'button',
            text: { tag: 'plain_text', content: '看完整信号 →' },
            type: 'primary',
            url: `${DASHBOARD_URL}/me/alerts`,
          }],
        },
      ],
    },
  };
}

function buildSlackPayload(digest: DigestPayloadLike): unknown {
  const headline = digest.topAction || `${digest.signals.length} 条信号待看`;
  const blocks: unknown[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `wenai 信号 · ${digest.date}`, emoji: true },
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*${headline}*` },
    },
    {
      type: 'context',
      elements: [
        { type: 'mrkdwn', text: `🚨 ${digest.critical} 紧急 · ⚠️ ${digest.warning} 警示 · 💡 ${digest.info} 提示` },
      ],
    },
  ];
  if (digest.signals.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: digest.signals.slice(0, 8).map(s =>
          `${severityEmoji(s.severity)} *${s.kind}* — ${s.headline}`
        ).join('\n'),
      },
    });
  }
  blocks.push({
    type: 'actions',
    elements: [{
      type: 'button',
      text: { type: 'plain_text', text: '看完整信号' },
      url: `${DASHBOARD_URL}/me/alerts`,
      style: 'primary',
    }],
  });
  return {
    text: `wenai 信号 · ${digest.date} · ${headline}`,  // fallback for 通知
    blocks,
  };
}

function buildDiscordPayload(digest: DigestPayloadLike): unknown {
  const color = digest.critical > 0 ? 0xdc2626 : digest.warning > 0 ? 0xd97706 : 0x7c3aed;
  const fields = digest.signals.slice(0, 8).map(s => ({
    name: `${severityEmoji(s.severity)} ${s.kind}`,
    value: s.headline,
    inline: false,
  }));
  return {
    embeds: [{
      title: `wenai 信号 · ${digest.date}`,
      description: digest.topAction || `${digest.signals.length} 条信号待看`,
      color,
      fields,
      footer: {
        text: `SKU ${digest.metrics.skuCount} · 今日 ¥${digest.metrics.todayCny.toFixed(2)} · ${DASHBOARD_URL}/me/alerts`,
      },
      timestamp: new Date().toISOString(),
    }],
  };
}

/**
 * Generic webhook · 直接发原始 digest JSON (商家自家 n8n/zapier flow 接)
 */
function buildGenericPayload(digest: DigestPayloadLike): unknown {
  return {
    source: 'wenai',
    type: 'daily-digest',
    digest,
    dashboardUrl: `${DASHBOARD_URL}/me/alerts`,
  };
}

function buildPayload(kind: WebhookKind, digest: DigestPayloadLike): unknown {
  switch (kind) {
    case 'feishu': return buildFeishuPayload(digest);
    case 'slack': return buildSlackPayload(digest);
    case 'discord': return buildDiscordPayload(digest);
    case 'generic': return buildGenericPayload(digest);
  }
}

async function postWithTimeout(url: string, payload: unknown): Promise<{ ok: boolean; status?: number; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return { ok: false, status: r.status, error: `HTTP ${r.status} ${text.slice(0, 100)}` };
    }
    return { ok: true, status: r.status };
  } catch (e) {
    clearTimeout(timer);
    if (e instanceof Error && e.name === 'AbortError') {
      return { ok: false, error: `timeout ${FETCH_TIMEOUT_MS}ms` };
    }
    return { ok: false, error: e instanceof Error ? e.message : 'fetch fail' };
  }
}

/**
 * 把 digest payload 推到该 org 配置的所有 webhook · 并发, 各自独立失败
 *
 * 返回 { sent, failed } 给 cron 汇总日志
 */
export async function sendDigestToWebhooks(
  orgId: string,
  digest: DigestPayloadLike,
): Promise<{ sent: number; failed: number; results: Array<{ id: string; kind: WebhookKind; ok: boolean; error?: string }> }> {
  const hooks = await listWebhooks(orgId);
  if (hooks.length === 0) return { sent: 0, failed: 0, results: [] };

  const results = await Promise.all(hooks.map(async (hook) => {
    const payload = buildPayload(hook.kind, digest);
    const r = await postWithTimeout(hook.url, payload);
    await recordWebhookResult(orgId, hook.id, r.ok, r.error).catch(() => {});
    return { id: hook.id, kind: hook.kind, ok: r.ok, error: r.error };
  }));

  return {
    sent: results.filter(r => r.ok).length,
    failed: results.filter(r => !r.ok).length,
    results,
  };
}

/**
 * 测试 ping · 发一条假 digest 给指定 webhook 验证它是否通
 */
export async function sendTestPing(orgId: string, webhookId: string): Promise<{ ok: boolean; error?: string; kind?: WebhookKind }> {
  const hooks = await listWebhooks(orgId);
  const hook: WebhookEntry | undefined = hooks.find(h => h.id === webhookId);
  if (!hook) return { ok: false, error: 'webhook 不存在' };

  const fakeDigest: DigestPayloadLike = {
    date: new Date().toISOString().slice(0, 10),
    critical: 0,
    warning: 1,
    info: 0,
    signals: [
      { kind: 'test-ping', severity: 'warning', headline: '这是一条 wenai 测试消息 · 收到说明 webhook 配通' },
    ],
    metrics: { skuCount: 0, launchedCount: 0, todayCny: 0, cacheRate7d: null },
    topAction: '测试 webhook · 配通后会每天 09:00 推真实信号',
  };
  const payload = buildPayload(hook.kind, fakeDigest);
  const r = await postWithTimeout(hook.url, payload);
  await recordWebhookResult(orgId, webhookId, r.ok, r.error).catch(() => {});
  return { ok: r.ok, error: r.error, kind: hook.kind };
}
