/**
 * 邀请名册 · 共享给 /api/auth/invite 和 /api/auth/me
 *
 * 优先级:
 *   1. 读 env var INVITE_ROSTER (JSON 格式)
 *   2. 合并内置默认名册 (新加朋友改 env 一行,不用 push 代码)
 *
 * env 格式示例:
 *   INVITE_ROSTER={"alice":{"name":"Alice","expiresAt":"2026-04-30"}}
 */

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

export function getInvites(): Record<string, Invite> {
  const fromEnv = process.env.INVITE_ROSTER;
  if (!fromEnv) return DEFAULT_INVITES;
  try {
    const parsed = JSON.parse(fromEnv) as Record<string, Invite>;
    return { ...DEFAULT_INVITES, ...parsed };
  } catch (e) {
    console.warn('[INVITE] INVITE_ROSTER JSON 解析失败,使用默认名册', e);
    return DEFAULT_INVITES;
  }
}

/**
 * 从 username (beta_<code>) 反查邀请信息
 */
export function getInviteByUsername(username: string): Invite | null {
  if (!username.startsWith('beta_')) return null;
  const code = username.slice(5);
  const invites = getInvites();
  return invites[code] || null;
}

/**
 * 计算剩余天数 (负数表示已过期)
 */
export function daysUntilExpiry(expiresAt: string): number {
  const end = new Date(expiresAt + 'T23:59:59');
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
