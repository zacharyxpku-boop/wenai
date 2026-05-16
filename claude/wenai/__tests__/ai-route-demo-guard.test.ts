import { afterEach, describe, expect, it, vi } from 'vitest';

function aiRequest() {
  return new Request('http://localhost/api/ai?demo=1', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-demo-mode': '1',
    },
    body: JSON.stringify({
      moduleId: 'copywriting',
      prompt: '请输出一段商品文案',
      input: '无线蓝牙耳机',
    }),
  });
}

describe('/api/ai demo guard', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('does not return demo content outside local development when AI key is missing', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('AI_API_KEY', '');
    const fetchSpy = vi.fn(async () => {
      throw new Error('AI guard test must not call provider fetch');
    });
    vi.stubGlobal('fetch', fetchSpy);

    const { POST } = await import('@/app/api/ai/route');
    const response = await POST(aiRequest() as never);
    const body = await response.json() as { code?: string; demo?: boolean; content?: string; error?: string };

    expect(response.status).toBe(503);
    expect(body.code).toBe('AI_SERVICE_DISABLED');
    expect(body.error).toContain('CSV 决策工作台');
    expect(body.demo).toBeUndefined();
    expect(body.content).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  }, 15000);
});

describe('disabled AI service responses', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('keeps batch launch missing-key response product-facing', async () => {
    vi.stubEnv('AI_API_KEY', '');
    const { POST } = await import('@/app/api/batch-launch/chunk/route');

    const response = await POST(new Request('http://localhost/api/batch-launch/chunk', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chunkType: 'overall',
        skus: ['wireless earbuds'],
        stages: ['listing'],
        platform: 'amazon',
        totalCount: 1,
      }),
    }) as never);
    const body = await response.json() as { code?: string; error?: string };

    expect(response.status).toBe(503);
    expect(body.code).toBe('AI_SERVICE_DISABLED');
    expect(body.error).toContain('CSV');
    expect(body.error).not.toContain('AI_API_KEY');
    expect(body.error).not.toContain('.env.local');
  });

  it('keeps video teardown missing-key response product-facing', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.doMock('@/lib/org-id', () => ({
      resolveOrgContext: vi.fn(async () => ({ orgId: 'test-org' })),
    }));
    vi.doMock('@/lib/cost-cap', () => ({
      checkCostCap: vi.fn(async () => ({ allowed: true, currentCents: 0, capCents: 1000 })),
      recordCostWithDetail: vi.fn(),
    }));
    vi.doMock('@/lib/cache-stats', () => ({
      recordCacheEvent: vi.fn(async () => {}),
    }));
    vi.doMock('@/lib/teardown-cache', () => ({
      hashVideoBase64: vi.fn(() => 'video-hash'),
      getTeardownCache: vi.fn(async () => null),
      setTeardownCache: vi.fn(async () => {}),
    }));

    const { POST } = await import('@/app/api/video-teardown/route');
    const response = await POST(new Request('http://localhost/api/video-teardown', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        fromPipeline: true,
        videoBase64: 'data:video/mp4;base64,AAAA',
      }),
    }) as never);
    const body = await response.json() as { code?: string; error?: string; notice?: string };

    expect(response.status).toBe(503);
    expect(body.code).toBe('VIDEO_TEARDOWN_DISABLED');
    expect(`${body.error} ${body.notice}`).toContain('CSV');
    expect(`${body.error} ${body.notice}`).not.toContain('GEMINI_API_KEY');
    expect(`${body.error} ${body.notice}`).not.toContain('.env.local');
  });
});
