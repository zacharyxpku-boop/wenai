import { describe, expect, it } from 'vitest';
import { LISTING_FACTORY_QA_SAMPLES } from '@/lib/listing-factory-samples';
import {
  buildAssemblyManifestCsv,
  buildAssemblyManifestMarkdown,
  buildAssemblyPlan,
  buildDeliveryPackage,
  createListingProject,
  createLocalAssetFromFileMeta,
  createManualAsset,
  createRunFromProject,
  evaluateProductionReadiness,
  exportListingFactoryRun,
  importListingFactoryRun,
  inferAssetTags,
  matchAssetsToStoryboard,
  summarizeAssetLibrary,
  tagAsset,
  type ListingFactoryRun,
} from '@/lib/listing-factory-engine';

describe('listing factory asset layer', () => {
  const project = createListingProject(LISTING_FACTORY_QA_SAMPLES[2], new Date('2026-05-12T09:00:00Z'));
  const run = createRunFromProject(project, new Date('2026-05-12T09:00:00Z'));

  it('creates local file metadata assets without storing file blobs', () => {
    const asset = createLocalAssetFromFileMeta(project.id, {
      name: 'product-handheld-closeup.mp4',
      type: 'video/mp4',
      size: 3_200_000,
      durationLabel: '6s',
    }, project);

    expect(asset.projectId).toBe(project.id);
    expect(asset.source).toBe('local_upload');
    expect(asset.type).toBe('video');
    expect(asset.fileName).toBe('product-handheld-closeup.mp4');
    expect(asset.sizeLabel).toContain('MB');
    expect(asset.tags.map(tag => tag.label)).toContain('产品');
    expect(JSON.stringify(asset)).not.toContain('blob');
  });

  it('creates manual assets and tags them deterministically', () => {
    const manual = createManualAsset(project.id, {
      name: '包装图和用户评价截图',
      type: 'image',
      description: '已有包装图、用户评价截图，可用于 Amazon FAQ 解释',
      tags: ['包装', '证明'],
      platformFit: ['Amazon'],
    }, project);
    const tagged = tagAsset(manual, ['字幕', '参考']);
    const inferred = inferAssetTags(tagged, project);

    expect(manual.source).toBe('manual_entry');
    expect(tagged.tags.map(tag => tag.label)).toContain('字幕');
    expect(inferred.map(tag => tag.label)).toEqual(expect.arrayContaining(['包装', '证明']));
  });

  it('summarizes asset library by type and missing production uses', () => {
    const assets = [
      createLocalAssetFromFileMeta(project.id, { name: 'product-main.jpg', type: 'image/jpeg', size: 800_000 }, project),
      createManualAsset(project.id, { name: '口播文案', type: 'text', description: '主播口播逐字稿', tags: ['口播'] }, project),
    ];
    const summary = summarizeAssetLibrary(assets);

    expect(summary.total).toBe(2);
    expect(summary.byType.image).toBe(1);
    expect(summary.tagLabels).toContain('产品');
  });

  it('matches assets to storyboard shots and reports missing requirements', () => {
    const storyboard = run.storyboards[0];
    const assets = [
      createLocalAssetFromFileMeta(project.id, { name: 'product-closeup.jpg', type: 'image/jpeg', size: 900_000 }, project),
      createManualAsset(project.id, { name: '字幕文案', type: 'text', description: '短视频字幕', tags: ['字幕'] }, project),
    ];
    const matches = matchAssetsToStoryboard(project, storyboard, assets);

    expect(matches).toHaveLength(storyboard.shots.length);
    expect(matches[0].matchScore).toBeGreaterThanOrEqual(0);
    expect(matches.some(match => match.assetIds.length > 0)).toBe(true);
    expect(matches.some(match => match.missingRequirements.length > 0)).toBe(true);
    expect(matches[0].recommendation.length).toBeGreaterThan(0);
  });

  it('evaluates production readiness and creates assembly plan', () => {
    const readiness = evaluateProductionReadiness(run);
    const assemblyPlan = buildAssemblyPlan(run);

    expect(readiness.score).toBeGreaterThanOrEqual(40);
    expect(readiness.blockers.length + readiness.warnings.length).toBeGreaterThan(0);
    expect(readiness.missingAssets.length).toBeGreaterThan(0);
    expect(assemblyPlan.projectId).toBe(project.id);
    expect(assemblyPlan.items.length).toBeGreaterThan(0);
    expect(assemblyPlan.items.some(item => item.status === 'missing_assets' || item.status === 'ready_for_edit')).toBe(true);
  });

  it('exports assembly manifest markdown and csv', () => {
    const markdown = buildAssemblyManifestMarkdown(run);
    const csv = buildAssemblyManifestCsv(run);

    expect(markdown).toContain('Assembly Manifest');
    expect(markdown).toContain(project.productName);
    expect(csv).toContain('shotId');
    expect(csv).toContain('status');
  });

  it('preserves assets and assembly plan through run export/import', () => {
    const asset = createLocalAssetFromFileMeta(project.id, { name: 'lifestyle-scene.mp4', type: 'video/mp4', size: 4_000_000 }, project);
    const readiness = evaluateProductionReadiness({ ...run, assets: [asset] });
    const assemblyPlan = buildAssemblyPlan({ ...run, assets: [asset], productionReadiness: readiness });
    const enrichedRun = { ...run, assets: [asset], productionReadiness: readiness, assemblyPlan } satisfies ListingFactoryRun;

    const imported = importListingFactoryRun(exportListingFactoryRun(enrichedRun));

    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.run.assets).toHaveLength(1);
      expect(imported.run.assemblyPlan.items.length).toBeGreaterThan(0);
      expect(imported.run.productionReadiness.score).toBeGreaterThanOrEqual(40);
    }
  });

  it('adds asset layer exports to delivery package', () => {
    const deliveryPackage = buildDeliveryPackage(run);

    expect(deliveryPackage.assetLibraryMarkdown).toContain('素材库摘要');
    expect(deliveryPackage.productionReadinessMarkdown).toContain('生产就绪评分');
    expect(deliveryPackage.assemblyManifestMarkdown).toContain('Assembly Manifest');
    expect(deliveryPackage.assemblyManifestCsv).toContain('shotId');
    expect(deliveryPackage.missingAssetsChecklistMarkdown).toContain('缺失素材');
  });
});
