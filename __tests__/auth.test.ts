import { describe, it, expect } from 'vitest';
import { hashPassword, hashPasswordLegacy, verifyPassword, createToken, verifyToken } from '@/lib/auth';

describe('hashPassword', () => {
  it('produces consistent hashes for same input', async () => {
    const h1 = await hashPassword('test123');
    const h2 = await hashPassword('test123');
    expect(h1).toBe(h2);
  });

  it('produces different hashes for different inputs', async () => {
    const h1 = await hashPassword('password1');
    const h2 = await hashPassword('password2');
    expect(h1).not.toBe(h2);
  });

  it('salted hash differs from legacy unsalted hash', async () => {
    const salted = await hashPassword('admin123');
    const legacy = await hashPasswordLegacy('admin123');
    expect(salted).not.toBe(legacy);
  });

  it('produces 64-char hex string', async () => {
    const hash = await hashPassword('test');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('verifyPassword', () => {
  it('verifies salted password', async () => {
    const hash = await hashPassword('mypassword');
    const ok = await verifyPassword('mypassword', hash);
    expect(ok).toBe(true);
  });

  it('verifies legacy unsalted password (migration)', async () => {
    const legacyHash = await hashPasswordLegacy('oldpassword');
    const ok = await verifyPassword('oldpassword', legacyHash);
    expect(ok).toBe(true);
  });

  it('rejects wrong password', async () => {
    const hash = await hashPassword('correct');
    const ok = await verifyPassword('wrong', hash);
    expect(ok).toBe(false);
  });
});

describe('JWT token lifecycle', () => {
  it('creates and verifies a valid token', async () => {
    const token = await createToken({
      username: 'testuser',
      tenantId: 'test-tenant',
      role: 'admin',
    });
    expect(token).toBeTruthy();

    const payload = await verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.username).toBe('testuser');
    expect(payload?.tenantId).toBe('test-tenant');
    expect(payload?.role).toBe('admin');
  });

  it('rejects tampered token', async () => {
    const token = await createToken({
      username: 'test',
      tenantId: 'test',
      role: 'admin',
    });
    const tampered = token.slice(0, -5) + 'xxxxx';
    const payload = await verifyToken(tampered);
    expect(payload).toBeNull();
  });

  it('rejects garbage string', async () => {
    const payload = await verifyToken('not-a-valid-token');
    expect(payload).toBeNull();
  });
});
