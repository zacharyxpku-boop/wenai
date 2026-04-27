/**
 * 商家级偏好设置 · 邮件 push / 阈值 / 行业
 *
 * Redis hash: wenai:settings:<orgId>
 * 字段:
 *   email                 接收 digest 邮件的地址
 *   digestEmailEnabled    'true' / 'false'
 *   digestSeverityMin     'critical' | 'warning' | 'info'  (低于此严重度的不发)
 *   industry              商家自报行业 (用于 prompt context)
 *   updatedAt             ISO
 */

import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const memStore = new Map<string, UserSettings>();
const TTL_SEC = 365 * 24 * 3600; // 一年, settings 是长期存的

export type Severity = 'critical' | 'warning' | 'info';

export interface UserSettings {
  email?: string;
  digestEmailEnabled?: boolean;
  digestSeverityMin?: Severity;
  industry?: string;
  updatedAt?: string;
}

const KEY = (orgId: string) => `wenai:settings:${orgId}`;

export async function getUserSettings(orgId: string): Promise<UserSettings> {
  if (redis) {
    try {
      const raw = await redis.hgetall(KEY(orgId));
      if (!raw || Object.keys(raw).length === 0) return {};
      const r = raw as Record<string, string>;
      return {
        email: r.email || undefined,
        digestEmailEnabled: r.digestEmailEnabled === 'true',
        digestSeverityMin: (['critical', 'warning', 'info'] as const).includes(r.digestSeverityMin as Severity)
          ? (r.digestSeverityMin as Severity)
          : undefined,
        industry: r.industry || undefined,
        updatedAt: r.updatedAt || undefined,
      };
    } catch {
      // fall through
    }
  }
  return memStore.get(orgId) ?? {};
}

export async function setUserSettings(orgId: string, patch: UserSettings): Promise<UserSettings> {
  const existing = await getUserSettings(orgId);
  const merged: UserSettings = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  if (redis) {
    try {
      const flat: Record<string, string> = { updatedAt: merged.updatedAt! };
      if (merged.email) flat.email = merged.email;
      if (typeof merged.digestEmailEnabled === 'boolean') flat.digestEmailEnabled = String(merged.digestEmailEnabled);
      if (merged.digestSeverityMin) flat.digestSeverityMin = merged.digestSeverityMin;
      if (merged.industry) flat.industry = merged.industry;
      await redis.hset(KEY(orgId), flat);
      await redis.expire(KEY(orgId), TTL_SEC);
      return merged;
    } catch {
      // fall through
    }
  }
  memStore.set(orgId, merged);
  return merged;
}

/** 简化的邮箱有效性校验 (不接 RFC 5322 完整规范, 只挡明显错误) */
export function isValidEmail(s: string): boolean {
  if (!s || s.length > 254) return false;
  const m = s.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  return !!m;
}
