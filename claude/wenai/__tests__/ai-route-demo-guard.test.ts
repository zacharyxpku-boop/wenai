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

    const { POST } = await import('@/app/api/ai/route');
    const response = await POST(aiRequest() as never);
    const body = await response.json() as { code?: string; demo?: boolean; content?: string };

    expect(response.status).toBe(503);
    expect(body.code).toBe('AI_API_KEY_MISSING');
    expect(body.demo).toBeUndefined();
    expect(body.content).toBeUndefined();
  });
});
