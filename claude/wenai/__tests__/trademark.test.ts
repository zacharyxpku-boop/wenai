import { describe, it, expect } from 'vitest';
import { extractBrandKeywords, queryTrademark } from '@/app/api/trademark/route';

describe('extractBrandKeywords', () => {
  it('extracts capitalized brand-like words', () => {
    const result = extractBrandKeywords('This APPLE AirPods case is great');
    expect(result).toContain('APPLE');
    expect(result).toContain('AIRPODS');
  });

  it('filters common non-brand words', () => {
    const result = extractBrandKeywords('THE PRO MAX STYLE');
    expect(result).not.toContain('THE');
    expect(result).not.toContain('PRO');
    expect(result).not.toContain('MAX');
    expect(result).not.toContain('STYLE');
  });

  it('deduplicates case variants', () => {
    const result = extractBrandKeywords('Nike NIKE nike');
    const nikeCount = result.filter(w => w === 'NIKE').length;
    expect(nikeCount).toBe(1);
  });

  it('ignores words shorter than 3 chars', () => {
    const result = extractBrandKeywords('HP LG OK');
    expect(result).toHaveLength(0);
  });

  it('handles empty input', () => {
    expect(extractBrandKeywords('')).toHaveLength(0);
  });
});

describe('queryTrademark', () => {
  it('finds known trademarks from local DB', async () => {
    const result = await queryTrademark('APPLE');
    expect(result.found).toBe(true);
    expect(result.source).toBe('local');
    expect(result.data?.owner).toBe('Apple Inc.');
    expect(result.data?.status).toBe('REGISTERED');
  });

  it('is case-insensitive', async () => {
    const result = await queryTrademark('nike');
    expect(result.found).toBe(true);
    expect(result.data?.owner).toBe('Nike, Inc.');
  });

  it('returns not-found for unknown brands', async () => {
    const result = await queryTrademark('ZZZBRANDXXX');
    expect(result.found).toBe(false);
    expect(result.source).toBe('uspto');
  });

  it('includes search timestamp', async () => {
    const before = Date.now();
    const result = await queryTrademark('GUCCI');
    expect(result.searchedAt).toBeGreaterThanOrEqual(before);
  });
});
