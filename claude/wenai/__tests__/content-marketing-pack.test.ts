import { describe, expect, it } from 'vitest';
import { buildContentMarketingPack } from '@/lib/content-marketing-pack';

describe('content marketing pack', () => {
  it('turns TikTok and Instagram benchmark context into a hook matrix and publishing report', () => {
    const pack = buildContentMarketingPack({
      category: 'home',
      sku: 'drawer organizer launch batch',
      platform: 'both',
      benchmarkLinks: 'https://tiktok.com/@demo/video/1\nhttps://instagram.com/demo',
      brandVoice: 'clean and credible',
      campaignGoal: 'validate first-frame hooks',
    });

    expect(pack.platformLabel).toBe('TikTok + Instagram');
    expect(pack.hookMatrix).toHaveLength(4);
    expect(pack.hookMatrix.map(item => item.angle)).toContain('Problem-first');
    expect(pack.publishingReport.join(' ')).toContain('ready for teardown');
    expect(pack.standardPackHref).toContain('/modules/standard-pack?');
    expect(pack.standardPackHref).toContain('workflow=slideshow-batch');
  });

  it('marks packs without benchmark as hypothesis-only', () => {
    const pack = buildContentMarketingPack({
      category: 'supplement',
      sku: 'wellness powder',
      platform: 'tiktok',
      benchmarkLinks: '',
    });

    expect(pack.publishingReport.join(' ')).toContain('hypothesis only');
    expect(pack.redlines).toContain('治疗');
    expect(pack.markdown).toContain('Benchmark state: missing / hypothesis-only');
  });
});
