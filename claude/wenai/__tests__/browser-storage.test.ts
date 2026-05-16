import { afterEach, describe, expect, it, vi } from 'vitest';
import { readBrowserStorage, readJsonStorage, writeBrowserStorage, writeJsonStorage } from '@/lib/browser-storage';
import { DataSourceManager } from '@/lib/datasources';

describe('browser storage adapter', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('falls back to memory when localStorage is unavailable', () => {
    vi.stubGlobal('window', {});

    expect(writeBrowserStorage('wenai_test_key', 'value')).toBe(false);
    expect(readBrowserStorage('wenai_test_key')).toBe('value');
  });

  it('falls back to memory when localStorage throws', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => {
          throw new Error('blocked');
        },
        setItem: () => {
          throw new Error('blocked');
        },
        removeItem: () => {
          throw new Error('blocked');
        },
      },
    });

    expect(writeJsonStorage('wenai_json_key', { csvImports: 3 })).toBe(false);
    expect(readJsonStorage('wenai_json_key', { csvImports: 0 })).toEqual({ csvImports: 3 });
  });

  it('returns fallback for invalid JSON instead of crashing', () => {
    vi.stubGlobal('window', {});

    writeBrowserStorage('wenai_bad_json', '{bad');
    expect(readJsonStorage('wenai_bad_json', { ok: true })).toEqual({ ok: true });
  });
});

describe('data source disabled messaging', () => {
  it('does not expose env setup details when external sources are disabled', async () => {
    const manager = new DataSourceManager({
      sourceWithoutKey: {
        name: 'Test Source',
        baseUrl: 'https://example.com',
        apiKey: '',
        enabled: false,
      },
    });

    const results = await manager.fetchProductData('wireless earbuds');
    const disabled = results.find((result) => result.source === 'Test Source');

    expect(disabled?.data).toContain('CSV');
    expect(String(disabled?.data)).not.toContain('API key');
    expect(String(disabled?.data)).not.toContain('.env.local');
  });
});
