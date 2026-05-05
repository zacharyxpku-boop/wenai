import { describe, it, expect } from 'vitest';
import { checkRateLimit, getModuleLimit } from '@/lib/ratelimit';

describe('getModuleLimit', () => {
  it('returns specific limit for translate', () => {
    expect(getModuleLimit('translate')).toBe(100);
  });

  it('returns specific limit for reviews', () => {
    expect(getModuleLimit('reviews')).toBe(80);
  });

  it('returns default for unknown modules', () => {
    expect(getModuleLimit('unknown-module')).toBe(50);
  });

  it('returns plan-specific limits', () => {
    expect(getModuleLimit('openai-image', 'free')).toBe(3);
    expect(getModuleLimit('openai-image', 'team')).toBe(50);
    expect(getModuleLimit('openai-image', 'enterprise')).toBe(200);
  });
});

describe('checkRateLimit (in-memory fallback)', () => {
  it('allows requests under limit', async () => {
    const result = await checkRateLimit('test-module-a', 'test-tenant-1');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
  });

  it('tracks separate buckets per tenant', async () => {
    const r1 = await checkRateLimit('test-module-b', 'tenant-x');
    const r2 = await checkRateLimit('test-module-b', 'tenant-y');
    // Both should be allowed (separate buckets)
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
  });

  it('enforces limit after exceeding', async () => {
    const moduleId = 'test-exhaust-module';
    const tenantId = 'test-exhaust-tenant';
    // Exhaust the default limit of 50
    for (let i = 0; i < 50; i++) {
      await checkRateLimit(moduleId, tenantId);
    }
    const result = await checkRateLimit(moduleId, tenantId);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('returns resetAt timestamp in the future', async () => {
    const result = await checkRateLimit('test-module-c', 'test-tenant-2');
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });
});
