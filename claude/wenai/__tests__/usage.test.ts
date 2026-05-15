import { describe, it, expect } from 'vitest';
import { logUsageEntry, readUsage } from '@/lib/usage';

describe('usage tracking', () => {
  it('logs an entry with tenantId', async () => {
    await logUsageEntry('translate', 150, undefined, 'tenant-test', 'user1');
    const data = await readUsage();
    const entry = data.entries.find(
      e => e.moduleId === 'translate' && e.tenantId === 'tenant-test' && e.userId === 'user1'
    );
    expect(entry).toBeTruthy();
    expect(entry?.tokens).toBe(150);
  });

  it('logs entry with default tenantId when not specified', async () => {
    await logUsageEntry('reviews', 200);
    const data = await readUsage();
    const entry = data.entries.find(e => e.moduleId === 'reviews' && e.tenantId === 'default');
    expect(entry).toBeTruthy();
  });

  it('logs entry with rating', async () => {
    await logUsageEntry('copywriting', 100, 5, 'tenant-rate');
    const data = await readUsage();
    const entry = data.entries.find(e => e.moduleId === 'copywriting' && e.tenantId === 'tenant-rate');
    expect(entry?.rating).toBe(5);
  });

  it('stores timestamp close to now', async () => {
    const uniqueId = `test-time-${Date.now()}`;
    const before = Date.now();
    await logUsageEntry(uniqueId, 50, undefined, 'tenant-ts');
    const data = await readUsage();
    const entry = data.entries.find(e => e.moduleId === uniqueId);
    expect(entry?.timestamp).toBeGreaterThanOrEqual(before);
    expect(entry?.timestamp).toBeLessThanOrEqual(Date.now() + 100);
  });
});
