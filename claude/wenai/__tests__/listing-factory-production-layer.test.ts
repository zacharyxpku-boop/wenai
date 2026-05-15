import { describe, expect, it } from 'vitest';
import { LISTING_FACTORY_QA_SAMPLES } from '@/lib/listing-factory-samples';
import {
  buildAssetPlan,
  buildDeliveryPackage,
  buildScriptFromBrief,
  buildStoryboardFromScript,
  buildVariantMatrix,
  createListingProject,
  createRunFromProject,
  deconstructReferenceCreative,
  exportListingFactoryRun,
  generateContentVariants,
  importListingFactoryRun,
  type ListingFactoryRun,
  type ReferenceCreative,
} from '@/lib/listing-factory-engine';

describe('listing factory production layer', () => {
  const project = createListingProject(LISTING_FACTORY_QA_SAMPLES[1], new Date('2026-05-12T09:00:00Z'));
  const run = createRunFromProject(project, new Date('2026-05-12T09:00:00Z'));
  const brief = run.briefs[0];

  it('deconstructs reference creative into reusable structure', () => {
    const reference: ReferenceCreative = {
      id: 'ref-pet-001',
      title: '宠物口腔护理参考文案',
      platform: '小红书',
      category: project.category,
      rawText: '猫咪嘴巴有味道，不一定是吃得不对。先看牙垢和喂食习惯，再用温和牙粉做日常护理，评论区说说你家猫的情况。',
      observedHook: '',
      observedStructure: '',
      audience: '',
      sellingPoint: '',
      riskNotes: [],
      sourceType: 'manual_input',
    };

    const result = deconstructReferenceCreative(reference, project);

    expect(result.referenceId).toBe(reference.id);
    expect(result.hookPattern.length).toBeGreaterThan(0);
    expect(result.ctaPattern.length).toBeGreaterThan(0);
    expect(result.reusableStructure).toContain('->');
    expect(result.suitableBriefTypes.length).toBeGreaterThan(0);
  });

  it('builds sanitized scripts from briefs with at least four scenes', () => {
    const script = buildScriptFromBrief(project, brief);
    const text = [script.openingHook, script.cta, script.voiceover, ...script.scenes.flatMap(scene => [scene.voiceoverLine, scene.onScreenText])].join(' ');

    expect(script.briefId).toBe(brief.id);
    expect(script.duration).toMatch(/15|20|25|30/);
    expect(script.scenes.length).toBeGreaterThanOrEqual(4);
    expect(script.scenes[0].assetNeed.length).toBeGreaterThan(0);
    expect(text).not.toContain('保证');
    expect(text).not.toContain('根治');
    expect(text).not.toContain('全网最低');
  });

  it('builds storyboard shots and category-specific required assets', () => {
    const script = buildScriptFromBrief(project, brief);
    const storyboard = buildStoryboardFromScript(project, script);

    expect(storyboard.scriptId).toBe(script.id);
    expect(storyboard.shots.length).toBeGreaterThanOrEqual(script.scenes.length);
    expect(storyboard.shots[0].requiredAssets.length).toBeGreaterThan(0);
    expect(storyboard.shots.map(shot => shot.productionNote).join(' ')).toMatch(/宠物|日常|反应|特写/);
  });

  it('builds an asset plan from scripts and storyboards', () => {
    const scripts = run.scripts.slice(0, 2);
    const storyboards = run.storyboards.slice(0, 2);
    const assetPlan = buildAssetPlan(project, scripts, storyboards);

    expect(assetPlan.projectId).toBe(project.id);
    expect(assetPlan.requiredImages.length + assetPlan.requiredVideos.length).toBeGreaterThan(0);
    expect(assetPlan.missingAssets.length).toBeGreaterThan(0);
    expect(assetPlan.productionPriority.length).toBeGreaterThan(0);
  });

  it('builds variant matrix and differentiated content variants', () => {
    const matrix = buildVariantMatrix(project, brief);
    const variants = generateContentVariants(project, brief, { count: 8 });

    expect(matrix.dimensions.length).toBeGreaterThanOrEqual(4);
    expect(matrix.variants.length).toBeGreaterThanOrEqual(6);
    expect(variants.length).toBeGreaterThanOrEqual(6);
    expect(new Set(variants.map(variant => variant.hook)).size).toBeGreaterThanOrEqual(6);
    expect(new Set(variants.map(variant => variant.angle)).size).toBeGreaterThanOrEqual(3);
    for (const variant of variants) {
      expect(variant.hook).not.toContain('保证');
      expect(variant.cta).not.toContain('全网最低');
      expect(variant.qualityScore.overallScore).toBeGreaterThanOrEqual(60);
    }
  });

  it('keeps production assets through run export/import and hydrates old runs', () => {
    const imported = importListingFactoryRun(exportListingFactoryRun(run));
    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.run.scripts.length).toBeGreaterThan(0);
      expect(imported.run.storyboards.length).toBeGreaterThan(0);
      expect(imported.run.assetPlan.missingAssets.length).toBeGreaterThan(0);
      expect(imported.run.variantMatrices.length).toBeGreaterThan(0);
    }

    const oldRun = { ...run } as Partial<ListingFactoryRun>;
    delete oldRun.references;
    delete oldRun.deconstructions;
    delete oldRun.scripts;
    delete oldRun.storyboards;
    delete oldRun.assetPlan;
    delete oldRun.variantMatrices;
    delete oldRun.productionAssetsStatus;

    const oldImported = importListingFactoryRun(JSON.stringify(oldRun));
    expect(oldImported.ok).toBe(true);
    if (oldImported.ok) {
      expect(oldImported.run.scripts.length).toBeGreaterThan(0);
      expect(oldImported.run.productionAssetsStatus.scripts).toBeGreaterThan(0);
    }
  });

  it('adds production assets to delivery package outputs', () => {
    const deliveryPackage = buildDeliveryPackage(run);

    expect(deliveryPackage.scriptsMarkdown).toContain('## 脚本样例');
    expect(deliveryPackage.storyboardMarkdown).toContain('## 分镜清单');
    expect(deliveryPackage.assetPlanMarkdown).toContain('## 素材需求清单');
    expect(deliveryPackage.variantMatrixCsv).toContain('hook');
    expect(deliveryPackage.productionChecklistMarkdown).toContain('生产检查清单');
  });
});
