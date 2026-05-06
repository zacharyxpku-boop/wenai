import { describe, expect, it } from 'vitest';
import { evaluatePocLaunchCheck } from '@/lib/poc-launch-check';

describe('poc launch check', () => {
  it('marks complete 10 SKU inputs as ready', () => {
    const result = evaluatePocLaunchCheck({
      skuCount: '10',
      platforms: 'Shopify + TikTok Shop',
      assetsReady: 'ready',
      benchmarkReady: true,
      acceptanceReady: true,
      ownerReady: true,
      timelineReady: true,
    });

    expect(result.decision).toBe('ready');
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.blockers).toHaveLength(0);
    expect(result.standardPackHref).toContain('/modules/standard-pack?');
    expect(result.checklistMarkdown).toContain('可以启动 10 SKU POC');
  });

  it('blocks weak POC inputs before production', () => {
    const result = evaluatePocLaunchCheck({
      skuCount: '3',
      platforms: '',
      assetsReady: 'none',
      benchmarkReady: false,
      acceptanceReady: false,
      ownerReady: false,
      timelineReady: false,
    });

    expect(result.decision).toBe('needs-input');
    expect(result.score).toBeLessThan(30);
    expect(result.blockers.join(' ')).toContain('SKU 数不足');
    expect(result.blockers.join(' ')).toContain('缺少目标平台');
    expect(result.blockers.join(' ')).toContain('缺少商品图');
  });

  it('separates evidence gaps from basic input gaps', () => {
    const result = evaluatePocLaunchCheck({
      skuCount: '10 SKU',
      platforms: 'Amazon US',
      assetsReady: 'partial',
      benchmarkReady: false,
      acceptanceReady: false,
      ownerReady: true,
      timelineReady: true,
    });

    expect(result.decision).toBe('needs-evidence');
    expect(result.nextStep).toContain('补 benchmark');
    expect(result.strengths.join(' ')).toContain('SKU 数达到');
    expect(result.checklistMarkdown).toContain('阻塞项');
  });
});
