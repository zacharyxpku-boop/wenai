import { describe, expect, it } from 'vitest';
import { LISTING_FACTORY_GOLDEN_PROJECTS } from '@/lib/listing-factory-golden-projects';
import {
  buildAssetManifestCsv,
  buildEditDecisionListCsv,
  buildGoldenListingFactoryRun,
  buildSubtitleSrt,
  evaluateDeliveryPackageQuality,
  exportListingFactoryRun,
  importListingFactoryRun,
} from '@/lib/listing-factory-engine';

const forbiddenWords = ['保证', '100%', '根治', '治疗', '吊打', '全网最低', '立刻见效', '马上瘦'];
const badExportTokens = ['undefined', 'null', '[object Object]', 'placeholder', 'TODO'];

function exportTexts(run: ReturnType<typeof buildGoldenListingFactoryRun>) {
  const firstPack = run.editPacks[0];
  return [
    run.deliveryPackage.markdown,
    run.deliveryPackage.briefCsv,
    run.deliveryPackage.scriptsMarkdown,
    run.deliveryPackage.storyboardMarkdown,
    run.deliveryPackage.assetPlanMarkdown,
    run.deliveryPackage.variantMatrixCsv,
    run.deliveryPackage.productionChecklistMarkdown,
    run.deliveryPackage.assetLibraryMarkdown,
    run.deliveryPackage.productionReadinessMarkdown,
    run.deliveryPackage.assemblyManifestMarkdown,
    run.deliveryPackage.assemblyManifestCsv,
    run.deliveryPackage.missingAssetsChecklistMarkdown,
    run.deliveryPackage.batchProductionMarkdown,
    run.deliveryPackage.editPackMarkdown,
    run.deliveryPackage.subtitleSrtSample,
    run.deliveryPackage.editDecisionListCsv,
    run.deliveryPackage.assetManifestCsv,
    run.deliveryPackage.batchQaSummaryMarkdown,
    run.deliveryPackage.clientMessageDraft,
    firstPack ? buildSubtitleSrt(firstPack) : '',
    firstPack ? buildEditDecisionListCsv(firstPack) : '',
    firstPack ? buildAssetManifestCsv(firstPack) : '',
  ].join('\n');
}

describe('listing factory production rc', () => {
  const fixedDate = new Date('2026-05-12T09:00:00Z');
  const runs = LISTING_FACTORY_GOLDEN_PROJECTS.map(project => buildGoldenListingFactoryRun(project, fixedDate));

  it('builds golden runs for all 5 golden projects', () => {
    expect(LISTING_FACTORY_GOLDEN_PROJECTS).toHaveLength(5);
    expect(runs).toHaveLength(5);
    expect(runs.every(run => run.project.productName.length > 0)).toBe(true);
  });

  it('generates complete production assets for every golden run', () => {
    for (const run of runs) {
      expect(run.briefs.length).toBeGreaterThanOrEqual(6);
      expect(run.scripts.length).toBeGreaterThan(0);
      expect(run.storyboards.length).toBeGreaterThan(0);
      expect(run.assetPlan.requiredImages.length + run.assetPlan.requiredVideos.length).toBeGreaterThan(0);
      expect(run.variantMatrices.length).toBeGreaterThan(0);
      expect(run.productionBatches.length).toBeGreaterThan(0);
      expect(run.productionBatches[0].batchItems.length).toBeGreaterThanOrEqual(6);
      expect(run.editPacks.length).toBeGreaterThan(0);
      expect(run.deliveryPackage.clientMessageDraft).toContain(run.project.productName);
    }
  });

  it('passes delivery package quality or scores at least 80', () => {
    for (const run of runs) {
      const quality = evaluateDeliveryPackageQuality(run);
      expect(quality.passed || quality.score >= 80).toBe(true);
      expect(quality.missingSections).toEqual([]);
    }
  });

  it('keeps export text stable and free of unsafe client-facing risk words', () => {
    for (const run of runs) {
      const combined = exportTexts(run);
      expect(badExportTokens.some(token => combined.includes(token))).toBe(false);
      expect(forbiddenWords.some(word => combined.includes(word))).toBe(false);
    }
  });

  it('round trips JSON export/import while preserving production rc assets', () => {
    for (const run of runs) {
      const imported = importListingFactoryRun(exportListingFactoryRun(run));

      expect(imported.ok).toBe(true);
      if (imported.ok) {
        expect(imported.run.assets.length).toBeGreaterThan(0);
        expect(imported.run.shotAssetMatches.length).toBeGreaterThan(0);
        expect(imported.run.productionBatches.length).toBeGreaterThan(0);
        expect(imported.run.editPacks.length).toBeGreaterThan(0);
        expect(imported.run.deliveryPackage.batchProductionMarkdown).toContain('批量生产批次');
      }
    }
  });

  it('exports non-empty EDL, SRT and Asset Manifest for every golden run', () => {
    for (const run of runs) {
      const firstPack = run.editPacks[0];
      expect(buildSubtitleSrt(firstPack)).toContain('00:00:00,000');
      expect(buildEditDecisionListCsv(firstPack)).toContain('order,startSecond,endSecond');
      expect(buildAssetManifestCsv(firstPack)).toContain('fileName');
    }
  });

  it('does not repeat hooks across different golden projects', () => {
    const firstHooks = runs.map(run => run.briefs[0].hook);
    expect(new Set(firstHooks).size).toBe(firstHooks.length);
  });

  it('returns actionable next steps for readiness and batch QA', () => {
    for (const run of runs) {
      expect(run.productionReadiness.recommendedNextStep.length).toBeGreaterThan(8);
      expect(run.batchQaSummary.recommendedNextStep.length).toBeGreaterThan(8);
      expect(run.productionReadiness.score).toBeGreaterThanOrEqual(40);
      expect(run.batchQaSummary.score).toBeGreaterThanOrEqual(40);
    }
  });
});
