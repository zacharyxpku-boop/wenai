/**
 * 一键退订 token 签发与校验 · 无需登录就能关掉邮件
 *
 * Token 格式: <orgIdEncoded>.<expiry>.<sig>
 *   orgIdEncoded = encodeURIComponent(orgId)
 *   expiry = unix timestamp (秒) · 30 天有效
 *   sig = HMAC-SHA256(secret, orgIdEncoded + '.' + expiry).slice(0, 24)
 *
 * 不存 Redis · 完全无状态, 退订时只需算 sig 比对
 *
 * 安全:
 *   - secret 来自 env UNSUBSCRIBE_SECRET (回退到 NEXTAUTH_SECRET 或硬编码)
 *   - 30 天后 token 过期需重发邮件才能退订 (防被永久持有)
 *   - 只能改 digestEmailEnabled · 不能改 email/industry 等其他字段
 */

import { createHmac, timingSafeEqual } from 'crypto';

const TTL_SEC = 30 * 24 * 3600;

function getSecret(): string {
  return process.env.UNSUBSCRIBE_SECRET
    || process.env.NEXTAUTH_SECRET
    || 'wenai-default-unsubscribe-secret-change-me-in-production';
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex').slice(0, 24);
}

export function makeUnsubscribeToken(orgId: string): string {
  const expiry = Math.floor(Date.now() / 1000) + TTL_SEC;
  const orgIdEncoded = encodeURIComponent(orgId);
  const payload = `${orgIdEncoded}.${expiry}`;
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export interface VerifyResult {
  ok: boolean;
  orgId?: string;
  reason?: string;
}

export function verifyUnsubscribeToken(token: string): VerifyResult {
  if (!token || typeof token !== 'string') {
    return { ok: false, reason: 'missing token' };
  }
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, reason: 'malformed token' };
  const [orgIdEncoded, expiryStr, providedSig] = parts;
  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry)) return { ok: false, reason: 'bad expiry' };
  if (expiry < Math.floor(Date.now() / 1000)) return { ok: false, reason: 'token expired' };

  const expectedSig = sign(`${orgIdEncoded}.${expiryStr}`);
  // timing-safe compare
  try {
    const a = Buffer.from(expectedSig, 'utf8');
    const b = Buffer.from(providedSig, 'utf8');
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, reason: 'bad signature' };
    }
  } catch {
    return { ok: false, reason: 'bad signature' };
  }

  let orgId: string;
  try {
    orgId = decodeURIComponent(orgIdEncoded);
  } catch {
    return { ok: false, reason: 'bad orgId encoding' };
  }
  return { ok: true, orgId };
}
