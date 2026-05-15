import { describe, expect, it } from 'vitest';
import { LISTING_FACTORY_QA_SAMPLES } from '@/lib/listing-factory-samples';
import {
  buildAssetManifestCsv,
  buildBatchProductionMarkdown,
  buildDeliveryPackage,
  buildEditDecisionListCsv,
  buildEditPack,
  buildProductionBatch,
  buildSubtitleSrt,
  buildVoiceoverScriptMarkdown,
  createListingProject,
  createRunFromProject,
  evaluateBatchQa,
  exportListingFactoryRun,
  importListingFactoryRun,
} from '@/lib/listing-factory-engine';

const forbiddenWords = ['保证', '100%', '根治', '治疗', '吊打', '全网最低', '立刻见效', '马上瘦'];

describe('listing factory batch production layer', () => {
  const project = createListingProject(LISTING_FACTORY_QA_SAMPLES[4], new Date('2026-05-12T09:00:00Z'));
  const run = createRunFromProject(project, new Date('2026-05-12T09:00:00Z'));

  it('builds a production batch with at least 6 batch items', () => {
    const batch = buildProductionBatch(run, {
      name: '首轮短视频批量生产',
      goal: '把高分 Brief 和变体排成剪辑批次',
      maxItems: 8,
      includeVariants: true,
    });

    expect(batch.projectId).toBe(project.id);
    expect(batch.batchItems.length).toBeGreaterThanOrEqual(6);
    expect(batch.deliveryStatus).toMatch(/draft|needs_assets|ready_for_edit|ready_for_delivery/);
  });

  it('filters batch by platform and content type', () => {
    const platform = run.project.targetPlatforms[0];
    const contentType = run.briefs[0].contentType;
    const batch = buildProductionBatch(run, {
      name: '平台筛选批次',
      platforms: [platform],
      contentTypes: [contentType],
      maxItems: 6,
      includeVariants: true,
    });

    expect(batch.batchItems.length).toBeGreaterThan(0);
    expect(batch.batchItems.every(item => item.platform === platform)).toBe(true);
    expect(batch.batchItems.every(item => item.contentType === contentType)).toBe(true);
  });

  it('adds qa status, asset coverage and missing assets to batch items', () => {
    const batch = buildProductionBatch(run, { name: 'QA 批次', maxItems: 6, includeVariants: true });
    const item = batch.batchItems[0];

    expect(item.qaStatus).toMatch(/draft|needs_assets|needs_review|ready_for_edit|ready_for_delivery/);
    expect(item.assetCoverageScore).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(item.missingAssets)).toBe(true);
    expect(item.productionNote.length).toBeGreaterThan(0);
  });

  it('builds edit pack with shot list, subtitles, voiceover and asset manifest', () => {
    const batch = buildProductionBatch(run, { name: '编辑包批次', maxItems: 6, includeVariants: true });
    const editPack = buildEditPack(run, batch.batchItems[0]);

    expect(editPack.shotList.length).toBeGreaterThan(0);
    expect(editPack.subtitles.length).toBeGreaterThan(0);
    expect(editPack.voiceoverScript).toContain(project.productName);
    expect(editPack.assetManifest.length).toBeGreaterThan(0);
    expect(editPack.exportNames.srt).toContain('.srt');
  });

  it('exports SRT, voiceover markdown, EDL csv and asset manifest csv', () => {
    const batch = buildProductionBatch(run, { name: '导出批次', maxItems: 6, includeVariants: true });
    const editPack = buildEditPack(run, batch.batchItems[0]);
    const srt = buildSubtitleSrt(editPack);
    const voiceover = buildVoiceoverScriptMarkdown(editPack);
    const edl = buildEditDecisionListCsv(editPack);
    const manifest = buildAssetManifestCsv(editPack);

    expect(srt).toContain('00:00:00,000');
    expect(voiceover).toContain('口播稿');
    expect(edl).toContain('order,startSecond,endSecond');
    expect(edl).toContain('voiceover');
    expect(manifest).toContain('fileName');
    expect(manifest).toContain('missing');
  });

  it('evaluates batch qa gate', () => {
    const batch = buildProductionBatch(run, { name: 'QA Gate 批次', maxItems: 6, includeVariants: true });
    const editPacks = batch.batchItems.map(item => buildEditPack(run, item));
    const qa = evaluateBatchQa(batch, editPacks, run);

    expect(qa.score).toBeGreaterThanOrEqual(40);
    expect(qa.readyCount + qa.needsAssetCount + qa.needsReviewCount).toBe(batch.batchItems.length);
    expect(Array.isArray(qa.warnings)).toBe(true);
    expect(qa.recommendedNextStep.length).toBeGreaterThan(0);
  });

  it('preserves production batches and edit packs through export/import', () => {
    const imported = importListingFactoryRun(exportListingFactoryRun(run));

    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.run.productionBatches.length).toBeGreaterThan(0);
      expect(imported.run.editPacks.length).toBeGreaterThan(0);
      expect(imported.run.batchQaSummary.score).toBeGreaterThanOrEqual(40);
    }
  });

  it('adds batch production exports to delivery package', () => {
    const deliveryPackage = buildDeliveryPackage(run);

    expect(deliveryPackage.batchProductionMarkdown).toContain('批量生产批次');
    expect(deliveryPackage.editPackMarkdown).toContain('Edit Pack');
    expect(deliveryPackage.subtitleSrtSample).toContain('00:00:00,000');
    expect(deliveryPackage.editDecisionListCsv).toContain('order,startSecond,endSecond');
    expect(deliveryPackage.assetManifestCsv).toContain('fileName');
    expect(deliveryPackage.batchQaSummaryMarkdown).toContain('Batch QA');
  });

  it('does not expose brand guardrail forbidden words in edit pack outputs', () => {
    const batch = buildProductionBatch(run, { name: '安全表达批次', maxItems: 6, includeVariants: true });
    const editPack = buildEditPack(run, batch.batchItems[0]);
    const combined = [
      editPack.title,
      editPack.shotList.map(shot => `${shot.subtitle} ${shot.voiceoverLine}`).join(' '),
      buildSubtitleSrt(editPack),
      buildVoiceoverScriptMarkdown(editPack),
    ].join(' ');

    expect(forbiddenWords.some(word => combined.includes(word))).toBe(false);
  });

  it('exports batch production markdown for editor handoff', () => {
    const batch = buildProductionBatch(run, { name: '交付批次', maxItems: 6, includeVariants: true });
    const editPacks = batch.batchItems.map(item => buildEditPack(run, item));
    const markdown = buildBatchProductionMarkdown(batch, editPacks);

    expect(markdown).toContain('批量生产批次');
    expect(markdown).toContain('Edit Pack');
    expect(markdown).toContain(batch.name);
  });
});
