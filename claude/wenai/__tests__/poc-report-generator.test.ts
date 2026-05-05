import { describe, expect, it } from 'vitest';
import { buildInitialPocReportInput } from '@/components/PocReportGenerator';
import { getPocDemoScenario } from '@/lib/poc-report-evaluator';

describe('poc report generator prefill', () => {
  it('reads bounded report metrics from URL params', () => {
    const input = buildInitialPocReportInput(new URLSearchParams({
      skuPlanned: '12',
      skuDelivered: '9',
      finalReviewPassRate: '88',
      benchmarkCoverage: '76',
      riskCount: '3',
      missingAssetCount: '2',
      reworkCount: '1',
      contentTestReady: '1',
      ownerReady: 'true',
      contractIntent: '0',
      benchmarkPreset: 'creative-test',
    }));

    expect(input).toEqual({
      category: '',
      benchmarkPreset: 'creative-test',
      skuPlanned: 12,
      skuDelivered: 9,
      finalReviewPassRate: 88,
      benchmarkCoverage: 76,
      riskCount: 3,
      missingAssetCount: 2,
      reworkCount: 1,
      contentTestReady: true,
      ownerReady: true,
      contractIntent: false,
    });
  });

  it('falls back and clamps malformed params', () => {
    const input = buildInitialPocReportInput(new URLSearchParams({
      category: 'auto',
      benchmarkPreset: 'feed-ops',
      skuPlanned: '10000',
      skuDelivered: '-4',
      finalReviewPassRate: 'abc',
      benchmarkCoverage: '180',
      riskCount: '1000',
      missingAssetCount: '-10',
      reworkCount: '7',
      contentTestReady: 'false',
      ownerReady: '0',
      contractIntent: 'true',
    }));

    expect(input.category).toBe('auto');
    expect(input.benchmarkPreset).toBe('feed-ops');
    expect(input.skuPlanned).toBe(999);
    expect(input.skuDelivered).toBe(0);
    expect(input.finalReviewPassRate).toBe(72);
    expect(input.benchmarkCoverage).toBe(100);
    expect(input.riskCount).toBe(99);
    expect(input.missingAssetCount).toBe(0);
    expect(input.reworkCount).toBe(7);
    expect(input.contentTestReady).toBe(false);
    expect(input.ownerReady).toBe(false);
    expect(input.contractIntent).toBe(true);
  });

  it('can preload a demo starter into the report workspace', () => {
    const demo = getPocDemoScenario('apparel-expansion');
    const params = new URLSearchParams();

    Object.entries(demo!.input).forEach(([key, value]) => {
      params.set(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
    });

    expect(buildInitialPocReportInput(params)).toEqual(demo!.input);
  });
});
