/**
 * 商家 outbound webhook 配置 · 把 wenai 信号推到飞书/Slack/Discord 群
 *
 * 一个 org 最多挂 5 条 webhook (够大多数商家场景, 避免滥用 fan-out)
 *
 * Storage:
 *   wenai:webhook:org:<orgId>   list[json]   (每条 { id, url, kind, label, createdAt, lastFireAt? })
 *
 * kind 自动从 url 推断, 给 sender 选 payload 格式用
 */

import { Redis } from '@upstash/redis';
import { randomBytes } from 'crypto';

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export type WebhookKind = 'feishu' | 'slack' | 'discord' | 'generic';

export interface WebhookEntry {
  id: string;            // wh_<8 hex>
  url: string;           // 完整 webhook URL (带 token)
  kind: WebhookKind;
  label?: string;        // 用户给它起的名字 ("生产飞书运营群")
  createdAt: string;
  lastFireAt?: string;
  lastError?: string;    // 最近一次失败原因 (调试用)
}

const MAX_PER_ORG = 5;
const TTL_SEC = 365 * 24 * 3600;

export function detectWebhookKind(url: string): WebhookKind {
  const u = url.toLowerCase();
  if (u.includes('open.feishu.cn') || u.includes('open.larksuite.com')) return 'feishu';
  if (u.includes('hooks.slack.com')) return 'slack';
  if (u.includes('discord.com/api/webhooks') || u.includes('discordapp.com/api/webhooks')) return 'discord';
  return 'generic';
}

export function generateWebhookId(): string {
  return 'wh_' + randomBytes(4).toString('hex');
}

function key(orgId: string) {
  return `wenai:webhook:org:${orgId}`;
}

export async function listWebhooks(orgId: string): Promise<WebhookEntry[]> {
  if (!redis) return [];
  try {
    const raw = await redis.get(key(orgId));
    if (!raw) return [];
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addWebhook(orgId: string, url: string, label?: string): Promise<{ ok: boolean; entry?: WebhookEntry; error?: string }> {
  if (!redis) return { ok: false, error: '当前为本地试用模式，Webhook 配置不会跨环境持久化。' };
  if (!/^https:\/\//.test(url)) return { ok: false, error: 'webhook URL 必须 https://' };
  if (url.length > 500) return { ok: false, error: 'URL 过长' };

  const existing = await listWebhooks(orgId);
  if (existing.length >= MAX_PER_ORG) {
    return { ok: false, error: `每个组织最多 ${MAX_PER_ORG} 条 webhook, 先删旧的` };
  }
  if (existing.some(w => w.url === url)) {
    return { ok: false, error: '该 URL 已配置' };
  }

  const entry: WebhookEntry = {
    id: generateWebhookId(),
    url,
    kind: detectWebhookKind(url),
    label: label?.slice(0, 60),
    createdAt: new Date().toISOString(),
  };
  const next = [entry, ...existing];
  try {
    await redis.set(key(orgId), JSON.stringify(next), { ex: TTL_SEC });
    return { ok: true, entry };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'redis fail' };
  }
}

export async function removeWebhook(orgId: string, id: string): Promise<boolean> {
  if (!redis) return false;
  const existing = await listWebhooks(orgId);
  const next = existing.filter(w => w.id !== id);
  if (next.length === existing.length) return false;
  try {
    if (next.length === 0) {
      await redis.del(key(orgId));
    } else {
      await redis.set(key(orgId), JSON.stringify(next), { ex: TTL_SEC });
    }
    return true;
  } catch {
    return false;
  }
}

export async function recordWebhookResult(orgId: string, id: string, ok: boolean, error?: string): Promise<void> {
  if (!redis) return;
  const existing = await listWebhooks(orgId);
  const idx = existing.findIndex(w => w.id === id);
  if (idx < 0) return;
  existing[idx].lastFireAt = new Date().toISOString();
  if (ok) {
    delete existing[idx].lastError;
  } else if (error) {
    existing[idx].lastError = error.slice(0, 200);
  }
  try {
    await redis.set(key(orgId), JSON.stringify(existing), { ex: TTL_SEC });
  } catch { /* skip */ }
}

/**
 * 跨 org 列出所有有 webhook 的 org · 给 cron fan-out 用
 *
 * 用 SCAN 而不是单点查 (org 数量增长时分页)
 */
export async function discoverOrgsWithWebhooks(): Promise<string[]> {
  if (!redis) return [];
  const orgs: string[] = [];
  let cursor: string | number = 0;
  let iter = 0;
  try {
    do {
      const res: [string | number, string[]] = await redis.scan(cursor, { match: 'wenai:webhook:org:*', count: 200 });
      cursor = res[0];
      for (const k of res[1]) {
        const id = k.slice('wenai:webhook:org:'.length);
        if (id) orgs.push(id);
      }
      iter++;
      if (iter > 30) break;
    } while (cursor !== '0' && cursor !== 0);
  } catch {
    // skip
  }
  return orgs;
}
