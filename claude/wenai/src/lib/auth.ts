import { SignJWT, jwtVerify } from 'jose';

const DEFAULT_SECRET = 'wenai-default-secret-change-in-production';
const secretValue = process.env.JWT_SECRET || DEFAULT_SECRET;

if (secretValue === DEFAULT_SECRET && process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
  console.warn('[AUTH] ⚠️ 使用默认JWT密钥，请在环境变量中设置 JWT_SECRET');
}

const JWT_SECRET = new TextEncoder().encode(secretValue);

const COOKIE_NAME = 'wenai-session';
const TOKEN_EXPIRY = '7d';

export interface AuthUser {
  username: string;
  tenantId: string;
  role: string;
}

export interface AuthPayload extends AuthUser {
  iat: number;
  exp: number;
}

export async function createToken(user: AuthUser): Promise<string> {
  if (process.env.NODE_ENV === 'production' && secretValue === DEFAULT_SECRET) {
    throw new Error('JWT_SECRET 未设置，生产环境禁止使用默认密钥');
  }
  return new SignJWT({
    username: user.username,
    tenantId: user.tenantId,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}

export function getCookieName(): string {
  return COOKIE_NAME;
}

const DEFAULT_SALT = 'wenai-salt-2026';
const PASSWORD_SALT = process.env.PASSWORD_SALT || DEFAULT_SALT;

if (PASSWORD_SALT === DEFAULT_SALT && process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
  console.warn('[AUTH] ⚠️ 使用默认PASSWORD_SALT，请在环境变量中设置');
}

/**
 * Salted hash for password comparison.
 * Uses Web Crypto API (available in Edge Runtime and Node 18+).
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(PASSWORD_SALT + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Legacy hash (no salt) for backward compatibility during migration.
 */
export async function hashPasswordLegacy(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  // Try salted hash first, fall back to legacy
  const salted = await hashPassword(password);
  if (salted === hashedPassword) return true;
  const legacy = await hashPasswordLegacy(password);
  return legacy === hashedPassword;
}
