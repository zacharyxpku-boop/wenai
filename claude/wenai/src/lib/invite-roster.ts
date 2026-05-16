/**
 * 邀请名册 · 三级存储优先级
 *
 *   1. Upstash Redis (wenai:invites hash) — 作者通过 /admin/invites 可视化管理,热更新
 *   2. env var INVITE_ROSTER JSON — Vercel dashboard 静态配
 *   3. 内置 DEFAULT_INVITES — 硬编码 fallback
 *
 * 所有查询都会先尝试 Redis,未命中降级到 env/default 合并结果。
 * 写入只走 Redis (env 改不了 runtime)。
 */

import { Redis } from '@upstash/redis';

export interface Invite {
  name: string;
  expiresAt: string; // YYYY-MM-DD
  tenantId?: string;
  tier?: 'free' | 'team' | 'enterprise';
}

const DEFAULT_INVITES: Record<string, Invite> = {
  alice: { name: 'Alice', expiresAt: '2026-04-30', tenantId: 'default' },
  bob: { name: 'Bob', expiresAt: '2026-04-30', tenantId: 'default' },
  charlie: { name: 'Charlie', expiresAt: '2026-04-30', tenantId: 'default' },
  demo: { name: '体验用户', expiresAt: '2099-12-31', tenantId: 'default' },
  wzqfriend: { name: '跨境代运营朋友', expiresAt: '2026-05-15', tenantId: 'default' },
};

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const REDIS_KEY = 'wenai:invites';

function getEnvInvites(): Record<string, Invite> {
  const fromEnv = process.env.INVITE_ROSTER;
  if (!fromEnv) return {};
  try {
    return JSON.parse(fromEnv) as Record<string, Invite>;
  } catch (e) {
    console.warn('[INVITE] INVITE_ROSTER JSON 解析失败', e);
    return {};
  }
}

/**
 * 读取全部邀请 · Redis ∪ env ∪ default (后者优先级更高)
 */
export async function getInvitesAsync(): Promise<Record<string, Invite>> {
  const merged = { ...DEFAULT_INVITES, ...getEnvInvites() };
  if (redis) {
    try {
      const raw = await redis.hgetall(REDIS_KEY);
      if (raw && Object.keys(raw).length > 0) {
        for (const [code, val] of Object.entries(raw)) {
          try {
            merged[code] = typeof val === 'string' ? JSON.parse(val) : (val as Invite);
          } catch {}
        }
      }
    } catch (e) {
      console.warn('[INVITE] Redis read failed', e);
    }
  }
  return merged;
}

/**
 * 同步版本 (不读 Redis) · 用于初始化/场景时避免 await
 * env + default 合并,但不含 Redis 动态添加的
 */
export function getInvites(): Record<string, Invite> {
  return { ...DEFAULT_INVITES, ...getEnvInvites() };
}

/**
 * 从 username (beta_<code>) 反查
 */
export async function getInviteByUsername(username: string): Promise<Invite | null> {
  if (!username.startsWith('beta_')) return null;
  const code = username.slice(5);
  const invites = await getInvitesAsync();
  return invites[code] || null;
}

/**
 * 写入邀请 (Redis 必需) · /admin/invites 使用
 */
export async function setInvite(code: string, invite: Invite): Promise<{ ok: boolean; error?: string }> {
  if (!redis) return { ok: false, error: '当前为本地试用模式，动态邀请不会跨环境持久化。' };
  if (!/^[a-z0-9_-]{2,32}$/i.test(code)) return { ok: false, error: '邀请码格式: 2-32 位字母数字/-_' };
  try {
    await redis.hset(REDIS_KEY, { [code.toLowerCase()]: JSON.stringify(invite) });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '写入失败' };
  }
}

export async function deleteInvite(code: string): Promise<{ ok: boolean; error?: string }> {
  if (!redis) return { ok: false, error: '邀请名册暂未启用云端存储。' };
  if (DEFAULT_INVITES[code.toLowerCase()]) {
    return { ok: false, error: '内置邀请码不可删除,去 env INVITE_ROSTER 覆盖' };
  }
  try {
    await redis.hdel(REDIS_KEY, code.toLowerCase());
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '删除失败' };
  }
}

export function daysUntilExpiry(expiresAt: string): number {
  const end = new Date(expiresAt + 'T23:59:59');
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
