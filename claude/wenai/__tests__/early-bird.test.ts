import { afterEach, describe, expect, it, vi } from 'vitest';
import { exportEarlyBirdLeads, getEarlyBirdStats, isValidEarlyBirdEmail, loadEarlyBirdLeads, saveEarlyBirdLead } from '@/lib/early-bird';

function installLocalStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    },
  });
}

describe('early bird leads', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('validates business email shape before saving', () => {
    expect(isValidEarlyBirdEmail('ops@example.com')).toBe(true);
    expect(isValidEarlyBirdEmail('bad-email')).toBe(false);
  });

  it('stores and de-dupes leads by email and tier', () => {
    installLocalStorage();

    expect(saveEarlyBirdLead({ tier: 'Starter', email: 'OPS@Example.com ', source: 'pricing' }).ok).toBe(true);
    expect(saveEarlyBirdLead({ tier: 'Starter', email: 'ops@example.com', source: 'dashboard' }).ok).toBe(true);
    expect(saveEarlyBirdLead({ tier: 'Growth', email: 'ops@example.com', source: 'pricing' }).ok).toBe(true);

    const leads = loadEarlyBirdLeads();
    expect(leads).toHaveLength(2);
    expect(leads.find(lead => lead.tier === 'Starter')).toMatchObject({
      email: 'ops@example.com',
      source: 'dashboard',
    });
    expect(getEarlyBirdStats()).toMatchObject({ total: 2, starter: 1, growth: 1 });
  });

  it('exports leads as JSON and CSV for founder follow-up', () => {
    installLocalStorage();
    saveEarlyBirdLead({ tier: 'Growth', email: 'founder@example.com', source: 'paywall' });

    const exported = exportEarlyBirdLeads();
    expect(exported.json).toContain('founder@example.com');
    expect(exported.csv).toContain('email,tier,source,created_at,updated_at');
    expect(exported.csv).toContain('"founder@example.com","Growth","paywall"');
  });
});
