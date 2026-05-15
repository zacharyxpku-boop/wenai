import { describe, expect, it } from 'vitest';
import { LISTING_FACTORY_QA_SAMPLES } from '@/lib/listing-factory-samples';
import {
  buildDeliveryPackage,
  buildEditPack,
  buildProductionBatch,
  buildProviderPayloadPreview,
  buildVideoAssemblyJob,
  buildVideoScenePrompt,
  createRunFromProject,
  createListingProject,
  evaluateVideoAssemblyQa,
  exportListingFactoryRun,
  importListingFactoryRun,
  localProductionSpecProvider,
} from '@/lib/listing-factory-engine';

const forbiddenWords = ['治疗', '100%', '全网最低', '最后一天', '见效', '爆单', '竞品', '虚假承诺'];

describe('listing factory video assembly layer', () => {
  const project = createListingProject(LISTING_FACTORY_QA_SAMPLES[4], new Date('2026-05-12T09:00:00Z'));
  const run = createRunFromProject(project, new Date('2026-05-12T09:00:00Z'));
  const batch = buildProductionBatch(run, { name: 'Video assembly batch', maxItems: 6, includeVariants: true });
  const editPack = buildEditPack(run, batch.batchItems[0]);

  it('builds a video assembly job from an edit pack', () => {
    const job = buildVideoAssemblyJob(run, editPack, {
      mode: 'asset_assembly',
      providerId: 'local-production-spec',
      fallbackToLocalSpec: true,
    });

    expect(job.projectId).toBe(project.id);
    expect(job.editPackId).toBe(editPack.id);
    expect(job.renderPlan.scenes.length).toBe(editPack.shotList.length);
    expect(job.renderPlan.subtitles.length).toBeGreaterThan(0);
    expect(job.renderPlan.voiceoverScript).toContain(project.productName);
    expect(job.renderPlan.assetManifest.length).toBeGreaterThan(0);
  });

  it('uses vertical aspect ratio for TikTok and Xiaohongshu style platforms', () => {
    const job = buildVideoAssemblyJob(run, { ...editPack, platform: 'TikTok' }, { targetPlatform: 'TikTok' });

    expect(job.renderPlan.aspectRatio).toBe('9:16');
  });

  it('marks jobs blocked when critical assets are missing', () => {
    const missingAssetPack = {
      ...editPack,
      assetManifest: editPack.assetManifest.map(item => ({ ...item, missing: true, assetId: '' })),
      shotList: editPack.shotList.map(shot => ({ ...shot, assetIds: [] })),
    };
    const job = buildVideoAssemblyJob({ ...run, assets: [] }, missingAssetPack, { mode: 'image_to_video' });

    expect(job.status).toBe('blocked_missing_assets');
    expect(job.missingRequirements.length).toBeGreaterThan(0);
  });

  it('falls back to local production spec when external provider is unavailable', () => {
    const job = buildVideoAssemblyJob(run, editPack, {
      providerId: 'external-video',
      fallbackToLocalSpec: true,
    });

    expect(job.providerId).toBe(localProductionSpecProvider.id);
    expect(job.status).toMatch(/spec_exported|blocked_missing_assets/);
    expect(job.providerAudit.usedFallback).toBe(true);
  });

  it('builds safe video scene prompts and structured provider payload previews', () => {
    const job = buildVideoAssemblyJob(run, editPack, { mode: 'storyboard_preview' });
    const prompt = buildVideoScenePrompt(project, job.renderPlan.scenes[0], job.platform);
    const payload = buildProviderPayloadPreview(job, localProductionSpecProvider);

    expect(prompt).toContain(project.productName);
    expect(prompt).toContain(job.platform);
    expect(forbiddenWords.some(word => prompt.includes(word))).toBe(false);
    expect(payload.providerId).toBe('local-production-spec');
    expect(payload.renderPlan.scenes.length).toBeGreaterThan(0);
    expect(JSON.stringify(payload)).not.toContain('blob:');
  });

  it('evaluates video assembly QA gate', () => {
    const job = buildVideoAssemblyJob(run, editPack, { mode: 'asset_assembly' });
    const qa = evaluateVideoAssemblyQa(job, run);

    expect(qa.score).toBeGreaterThanOrEqual(40);
    expect(Array.isArray(qa.blockers)).toBe(true);
    expect(Array.isArray(qa.warnings)).toBe(true);
    expect(qa.recommendedNextStep.length).toBeGreaterThan(0);
  });

  it('preserves video assembly jobs through export/import without real blobs', () => {
    const job = buildVideoAssemblyJob(run, editPack, { mode: 'asset_assembly' });
    const withVideo = {
      ...run,
      videoAssemblyJobs: [job],
      videoQaSummary: job.qaResult,
      videoProviderAudit: [job.providerAudit],
      deliveryPackage: buildDeliveryPackage({ ...run, videoAssemblyJobs: [job], videoQaSummary: job.qaResult, videoProviderAudit: [job.providerAudit] }),
    };
    const exported = exportListingFactoryRun(withVideo);
    const imported = importListingFactoryRun(exported);

    expect(exported).not.toContain('blob:');
    expect(exported).not.toContain('base64');
    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.run.videoAssemblyJobs.length).toBeGreaterThan(0);
      expect(imported.run.videoQaSummary.score).toBeGreaterThanOrEqual(40);
    }
  });

  it('adds video assembly exports to the delivery package', () => {
    const job = buildVideoAssemblyJob(run, editPack, { mode: 'asset_assembly' });
    const deliveryPackage = buildDeliveryPackage({
      ...run,
      videoAssemblyJobs: [job],
      videoQaSummary: job.qaResult,
      videoProviderAudit: [job.providerAudit],
    });

    expect(deliveryPackage.videoAssemblyMarkdown).toContain('\u89c6\u9891\u7ec4\u88c5\u4efb\u52a1');
    expect(deliveryPackage.renderPlanMarkdown).toContain('\u89c6\u9891\u6e32\u67d3\u8ba1\u5212');
    expect(deliveryPackage.providerPayloadJson).toContain('providerId');
    expect(deliveryPackage.videoQaMarkdown).toContain('视频 QA');
    expect(deliveryPackage.videoProductionSpecMarkdown).toContain('生产规格');
  });
});


