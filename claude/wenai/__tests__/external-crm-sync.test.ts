import { afterEach, describe, expect, it, vi } from 'vitest';
import { syncExternalCrm, type ExternalCrmPayload } from '@/lib/external-crm-sync';

const payload: ExternalCrmPayload = {
  wenaiId: 'inq_1',
  account: { name: 'ACME', domain: 'acme.example' },
  contact: { name: 'Ann', email: 'ann@example.com', phone: '123', raw: 'Ann ann@example.com' },
  deal: { name: 'ACME / 10 SKU POC', amount: '9800', stage: 'proposal', nextAction: '发报价' },
  sync: {},
};

describe('external crm sync', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('returns not_configured when webhook is missing', async () => {
    const result = await syncExternalCrm(payload);

    expect(result.configured).toBe(false);
    expect(result.status).toBe('not_configured');
    expect(result.note).toContain('EXTERNAL_CRM_WEBHOOK_URL');
  });

  it('posts to configured webhook and marks synced', async () => {
    vi.stubEnv('EXTERNAL_CRM_WEBHOOK_URL', 'https://crm.example/webhook');
    vi.stubEnv('EXTERNAL_CRM_TOKEN', 'token');
    vi.stubEnv('EXTERNAL_CRM_PROVIDER', 'hubspot');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('ok'),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await syncExternalCrm(payload);

    expect(result.ok).toBe(true);
    expect(result.status).toBe('synced');
    expect(result.provider).toBe('hubspot');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://crm.example/webhook',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer token' }),
      }),
    );
  });

  it('marks failed when provider rejects the payload', async () => {
    vi.stubEnv('EXTERNAL_CRM_WEBHOOK_URL', 'https://crm.example/webhook');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('bad gateway'),
    }));

    const result = await syncExternalCrm(payload);

    expect(result.ok).toBe(false);
    expect(result.configured).toBe(true);
    expect(result.status).toBe('failed');
    expect(result.note).toContain('HTTP 500');
  });
});
