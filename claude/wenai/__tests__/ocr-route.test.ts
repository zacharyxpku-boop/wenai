import { describe, expect, it } from 'vitest';
import type { NextRequest } from 'next/server';
import { POST } from '@/app/api/ocr/route';

function imageRequest(file: File) {
  const form = new FormData();
  form.set('image', file);
  return new Request('http://localhost/api/ocr', {
    method: 'POST',
    body: form,
  });
}

describe('/api/ocr', () => {
  it('does not return fake OCR text when provider is not configured', async () => {
    const response = await POST(imageRequest(new File(['image-bytes'], 'sample.png', { type: 'image/png' })) as NextRequest);
    const body = await response.json() as { error?: string; code?: string; text?: string; demo?: boolean };

    expect(response.status).toBe(503);
    expect(body.code).toBe('OCR_PROVIDER_NOT_CONFIGURED');
    expect(body.error).toContain('图片识别服务尚未连接');
    expect(body.text).toBeUndefined();
    expect(body.demo).toBeUndefined();
  });

  it('rejects oversized uploads before provider work starts', async () => {
    const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' });
    const response = await POST(imageRequest(oversized) as NextRequest);
    const body = await response.json() as { error?: string; code?: string };

    expect(response.status).toBe(413);
    expect(body.code).toBe('IMAGE_TOO_LARGE');
    expect(body.error).toContain('建议压缩到 5MB 以内');
  });
});
