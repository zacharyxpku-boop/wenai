import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'wenai-default-secret-change-in-production'
);

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

/**
 * Simple hash for password comparison.
 * Uses Web Crypto API (available in Edge Runtime and Node 18+).
 */
export async function hashPassword(password: string): Promise<string> {
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
  const hashed = await hashPassword(password);
  return hashed === hashedPassword;
}
