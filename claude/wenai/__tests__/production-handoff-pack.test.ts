import { describe, expect, it } from 'vitest';
import { createListingProject, createRunFromProject, type ListingProjectInput } from '@/lib/listing-factory-engine';
import { buildProductionHandoffPack } from '@/lib/production-handoff-pack';

const baseProject: ListingProjectInput = {
  productName: 'Portable Pet Slow Feeder',
  category: 'Pet supplies',
  targetPlatforms: ['TikTok', 'Meta Ads', 'Google Ads', 'Amazon', 'Shopify'],
  priceBand: '$19-$29',
  sellingPoints: ['foldable travel bowl', 'slower feeding pace', 'easy to clean'],
  targetAudience: 'cross-border pet owners who travel with small dogs',
  contentGoal: 'validate first purchase intent',
  brandGuardrails: ['no medical claims', 'no guaranteed result', 'no competitor attack'],
  categoryRules: ['show pet size fit', 'show cleaning method', 'avoid veterinary advice'],
  competitorNotes: 'Use category patterns without naming competitors.',
};

describe('production handoff pack', () => {
  it('builds concrete specs for five commerce platforms', () => {
    const project = createListingProject(baseProject, new Date('2026-05-12T09:00:00Z'));
    const run = createRunFromProject(project, new Date('2026-05-12T09:00:00Z'));
    const pack = buildProductionHandoffPack(run);

    expect(pack.platformSpecs.map(spec => spec.platform)).toEqual([
      'TikTok',
      'Meta Ads',
      'Google Ads',
      'Amazon',
      'Shopify',
    ]);
    expect(pack.platformSpecs.every(spec => spec.dimensions.length > 0)).toBe(true);
    expect(pack.platformSpecs.every(spec => spec.exportFormat.length > 0)).toBe(true);
    expect(pack.markdown).toContain('生产交接包');
    expect(pack.markdown).toContain('平台交付规格');
    expect(pack.markdown).toContain('素材清单');
    expect(pack.markdown).toContain('审核门禁');
  });

  it('uses listing image requirements for Amazon instead of short video defaults', () => {
    const project = createListingProject({
      ...baseProject,
      targetPlatforms: ['Amazon', 'Shopify'],
    }, new Date('2026-05-12T09:00:00Z'));
    const run = createRunFromProject(project, new Date('2026-05-12T09:00:00Z'));
    const pack = buildProductionHandoffPack(run);
    const amazonSpec = pack.platformSpecs[0];

    expect(amazonSpec.platform).toBe('Amazon');
    expect(amazonSpec.deliverableType).toBe('listing_image');
    expect(amazonSpec.dimensions).toContain('2000x2000');
    expect(amazonSpec.exportFormat).toContain('JPG/PNG');
    expect(pack.assetManifest.some(item => item.id === 'source-layered-file')).toBe(true);
  });

  it('keeps the pack honest when external production is not configured', () => {
    const project = createListingProject(baseProject, new Date('2026-05-12T09:00:00Z'));
    const run = createRunFromProject(project, new Date('2026-05-12T09:00:00Z'));
    const pack = buildProductionHandoffPack(run);
    const text = JSON.stringify(pack);

    expect(pack.status).toMatch(/spec_ready|blocked_missing_assets|needs_brand_review/);
    expect(text).not.toMatch(/生成成功|正在生成|fake|mock|placeholder/i);
    expect(text).not.toMatch(/undefined|null|NaN/);
    expect(pack.nextActions.join(' ')).toContain('回收');
  });

  it('links production work back to measurable evidence and return metrics', () => {
    const project = createListingProject(baseProject, new Date('2026-05-12T09:00:00Z'));
    const run = createRunFromProject(project, new Date('2026-05-12T09:00:00Z'));
    const record = {
      ...run.performanceRecords[0],
      briefId: run.briefs[0].id,
      platform: 'TikTok',
      impressions: 1200,
      clicks: 72,
      cost: 120,
      revenue: 420,
    };
    const pack = buildProductionHandoffPack({
      ...run,
      performanceRecords: [record],
    });

    expect(pack.evidence.join(' ')).toContain('CTR');
    expect(pack.evidence.join(' ')).toContain('ROAS');
    expect(pack.markdown).toContain('impressions');
    expect(pack.markdown).toContain('clicks');
    expect(pack.markdown).toContain('spend');
    expect(pack.reviewGates.some(gate => gate.id === 'evidence-fit' && gate.mustPass)).toBe(true);
  });
});
