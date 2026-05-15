import { describe, expect, it } from 'vitest';
import { assessClientFile, formatFileSize } from '@/lib/client-file-guard';

function fileOf(size: number, type = 'image/png') {
  return new File([new Uint8Array(size)], 'sample.png', { type });
}

describe('client file guard', () => {
  it('shows an optimization message for large files before hard blocking', () => {
    const result = assessClientFile(fileOf(6 * 1024 * 1024), {
      kind: 'image',
      largeBytes: 5 * 1024 * 1024,
      hardBytes: 12 * 1024 * 1024,
      allowedTypes: ['image/png'],
    });

    expect(result.ok).toBe(true);
    expect(result.shouldOptimize).toBe(true);
    expect(result.message).toBe('文件较大，读取可能稍慢，请保持页面打开。');
  });

  it('blocks oversized files with a compression-oriented message', () => {
    const result = assessClientFile(fileOf(13 * 1024 * 1024), {
      kind: 'image',
      largeBytes: 5 * 1024 * 1024,
      hardBytes: 12 * 1024 * 1024,
      allowedTypes: ['image/png'],
    });

    expect(result.ok).toBe(false);
    expect(result.message).toContain('建议压缩后重新上传，保证识别速度');
  });

  it('formats megabytes consistently', () => {
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0MB');
  });
});
