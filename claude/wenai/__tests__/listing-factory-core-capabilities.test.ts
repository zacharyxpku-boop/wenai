import { describe, expect, it } from 'vitest';
import {
  applyMerchantContextToProjectInput,
  buildDeliveryPackage,
  buildFactoryOperatingReview,
  buildMerchantContextCard,
  createLocalAssetFromFileMeta,
  createListingProject,
  createRunFromProject,
  evaluateProductionReadiness,
  exportListingFactoryRun,
  inferAssetTags,
  type GeneratedBrief,
} from '@/lib/listing-factory-engine';
import {
  generateBriefsWithProvider,
  improveBriefWithProvider,
  normalizeGeneratedBrief,
  remoteLLMProvider,
  validateGeneratedBrief,
} from '@/lib/listing-factory-providers';

const project = createListingProject({
  productName: '磁吸快充充电宝',
  category: '3C 配件',
  targetPlatforms: ['TikTok', 'Amazon'],
  priceBand: '199-299 元',
  sellingPoints: '磁吸稳；轻薄便携；支持快充',
  targetAudience: '经常通勤和短途出差的手机重度用户',
  contentGoal: '上新转化',
  brandGuardrails: '不能绝对化承诺；不能虚假折扣；不能贬低竞品',
  categoryRules: '说明兼容机型；避免夸大续航；补充安全认证说明',
  competitorNotes: '可参考同类磁吸充电宝，但不点名对比。',

});

describe('listing factory core capabilities', () => {
  it('falls back to local provider when remote is unavailable', async () => {
    expect(await remoteLLMProvider.available()).toBe(false);

    const result = await generateBriefsWithProvider(project, {
      providerId: 'remote-llm',
      fallbackToLocal: true,
    });

    expect(result.providerId).toBe('local-deterministic');
    expect(result.fallbackUsed).toBe(true);
    expect(result.briefs.length).toBeGreaterThanOrEqual(6);
  });

  it('sanitizes provider output before returning briefs', async () => {
    const result = await generateBriefsWithProvider(project, {
      providerId: 'local-deterministic',
      fallbackToLocal: true,
    });

    for (const brief of result.briefs) {
      expect(`${brief.hook} ${brief.cta}`).not.toContain('保证');
      expect(`${brief.hook} ${brief.cta}`).not.toContain('全网最低');
      expect(`${brief.hook} ${brief.cta}`).not.toContain('吊打');
      expect(brief.qualityScore.brandSafety).toBeGreaterThanOrEqual(70);
    }
  });

  it('validates generated brief raw output', () => {
    expect(validateGeneratedBrief({ hook: '只有 Hook' }).ok).toBe(false);
    expect(validateGeneratedBrief({
      platform: 'TikTok',
      contentType: '痛点转化',
      hook: '通勤没电前，先确认这块磁吸充电宝适不适合你的机型。',
      visualDirection: '手持特写展示磁吸、厚度和接口。',
      voiceoverDirection: '说明兼容机型和快充边界。',
      cta: '先保存机型核对清单。',
      riskNotes: ['避免绝对化续航承诺。'],
      reusableStructure: '痛点 -> 功能 -> 兼容边界 -> CTA',
    }).ok).toBe(true);
  });

  it('normalizes incomplete provider brief output with safe fallbacks', () => {
    const normalized = normalizeGeneratedBrief({
      hook: '保证 100% 解决手机没电，吊打所有竞品',
      cta: '全网最低，马上下单',
    }, project, 0);

    expect(normalized.platform).toBe(project.targetPlatforms[0]);
    expect(normalized.contentType.length).toBeGreaterThan(0);
    expect(normalized.visualDirection.length).toBeGreaterThan(0);
    expect(normalized.voiceoverDirection.length).toBeGreaterThan(0);
    expect(`${normalized.hook} ${normalized.cta}`).not.toContain('保证');
    expect(`${normalized.hook} ${normalized.cta}`).not.toContain('100%');
    expect(`${normalized.hook} ${normalized.cta}`).not.toContain('吊打');
    expect(normalized.qualityScore.overallScore).toBeGreaterThanOrEqual(60);
  });

  it('improves a brief and rescoring creates a new safe version', async () => {
    const source = createRunFromProject(project).briefs[0] as GeneratedBrief;
    const result = await improveBriefWithProvider(project, source, '让 Hook 更适合 Amazon FAQ，并补充兼容边界', {
      providerId: 'remote-llm',
      fallbackToLocal: true,
    });

    expect(result.providerId).toBe('local-deterministic');
    expect(result.brief.id).not.toBe(source.id);
    expect(result.brief.hook).not.toBe(source.hook);
    expect(result.brief.qualityScore.overallScore).toBeGreaterThanOrEqual(60);
  });

  it('creates local asset metadata from real file meta without storing the file body', () => {
    const asset = createLocalAssetFromFileMeta(project.id, {
      name: 'product-closeup-main-image.jpg',
      type: 'image/jpeg',
      size: 1_240_000,
      previewUrl: 'blob:http://localhost/session-only',
      hasSessionFile: true,
    }, project);

    expect(asset.type).toBe('image');
    expect(asset.previewUrl).toContain('blob:');
    expect(asset.hasSessionFile).toBe(true);
    expect(asset.sessionOnlyNote).toContain('当前浏览器会话');
    expect(JSON.stringify(asset)).not.toContain('base64');
  });

  it('infers asset tags from MIME type and filename', () => {
    const asset = createLocalAssetFromFileMeta(project.id, {
      name: 'voiceover-proof-scene.mp3',
      type: 'audio/mpeg',
      size: 560_000,
    }, project);

    const labels = inferAssetTags(asset, project).map(tag => tag.label);
    expect(labels).toContain('口播');
    expect(labels).toContain('证明');
  });

  it('exports run JSON without preview URL or file body', () => {
    const run = createRunFromProject(project);
    const asset = createLocalAssetFromFileMeta(project.id, {
      name: 'product-closeup-main-image.jpg',
      type: 'image/jpeg',
      size: 1_240_000,
      previewUrl: 'blob:http://localhost/session-only',
      hasSessionFile: true,
    }, project);
    const json = exportListingFactoryRun({ ...run, assets: [asset] });

    expect(json).not.toContain('previewUrl');
    expect(json).not.toContain('blob:http');
    expect(json).not.toContain('hasSessionFile');
    expect(json).toContain('product-closeup-main-image.jpg');
  });

  it('distinguishes metadata-only assets from current session files in readiness', () => {
    const run = createRunFromProject(project);
    const metadataOnly = createLocalAssetFromFileMeta(project.id, {
      name: 'product-main-image.jpg',
      type: 'image/jpeg',
      size: 1_240_000,
    }, project);
    const sessionFile = createLocalAssetFromFileMeta(project.id, {
      name: 'product-main-video.mp4',
      type: 'video/mp4',
      size: 8_240_000,
      previewUrl: 'blob:http://localhost/video',
      hasSessionFile: true,
    }, project);

    const metadataReadiness = evaluateProductionReadiness({ ...run, assets: [metadataOnly] });
    const sessionReadiness = evaluateProductionReadiness({ ...run, assets: [metadataOnly, sessionFile] });

    expect(metadataReadiness.warnings.some(item => item.includes('重新关联'))).toBe(true);
    expect(sessionReadiness.score).toBeGreaterThan(metadataReadiness.score);
    expect(sessionReadiness.warnings.some(item => item.includes('未匹配')) || sessionReadiness.recommendedNextStep.length > 0).toBe(true);
  });

  it('adds asset relink guide to delivery package', () => {
    const run = createRunFromProject(project);
    const deliveryPackage = buildDeliveryPackage(run);

    expect(deliveryPackage.assetRelinkGuideMarkdown).toContain('重新关联');
    expect(deliveryPackage.sessionAssetWarningMarkdown).toContain('不会上传云端');
    expect(deliveryPackage.assetMetadataJson).toContain('metadata');
    expect(deliveryPackage.experimentConfidenceMarkdown).toContain('实验置信度');
    expect(deliveryPackage.experimentMemoryMarkdown).toContain('实验记忆');
    expect(deliveryPackage.experimentPriorityQueueMarkdown).toContain('下一轮实验优先队列');
    expect(deliveryPackage.experimentLearningGapMapMarkdown).toContain('内容增长学习地图');
    expect(deliveryPackage.experimentSequencingPlanMarkdown).toContain('下一轮实验路线图');
    expect(deliveryPackage.experimentValidationPolicyMarkdown).toContain('实验验证策略');
    expect(deliveryPackage.experimentDecisionSummaryMarkdown).toContain('实验决策摘要');
    expect(deliveryPackage.experimentWorkbenchMarkdown).toContain('本地实验操作台');
    expect(deliveryPackage.crossRunComparisonMarkdown).toContain('跨运行学习对比');
    expect(deliveryPackage.merchantLearningArchiveMarkdown).toContain('商家增长学习档案');
    expect(deliveryPackage.contentExperimentTraceMarkdown).toContain('内容实验追踪链');
    expect(deliveryPackage.traceabilitySummaryMarkdown).toContain('可追溯证据链摘要');
    expect(deliveryPackage.platformDataContractMarkdown).toContain('平台数据契约');
    expect(deliveryPackage.platformImportTemplateCsv).toContain('channel');
    expect(deliveryPackage.platformImportQualityMarkdown).toContain('导入质量检查');
    expect(deliveryPackage.platformDataReadinessMarkdown).toContain('数据接入准备度');
  });

  it('builds an operating review for product state and next development priorities', () => {
    const run = createRunFromProject(project);
    const review = buildFactoryOperatingReview(run);
    const deliveryPackage = buildDeliveryPackage({ ...run, operatingReview: review });
    const exported = exportListingFactoryRun({ ...run, operatingReview: review, deliveryPackage });

    expect(review.productShape).toContain('本地优先');
    expect(review.maturityScore).toBeGreaterThanOrEqual(60);
    expect(review.capabilitySummary.some(item => item.id === 'experiment-orchestration')).toBe(true);
    expect(review.gaps.join(' ')).toContain('商家上下文层');
    expect(review.nextDevelopmentPlan[0].id).toBe('p0-context-cards');
    expect(deliveryPackage.operatingReviewMarkdown).toContain('工厂运营评估');
    expect(exported).toContain('operatingReview');
  });

  it('builds a merchant context card and reuses it as generation defaults', () => {
    const run = createRunFromProject(project);
    const merchantContextCard = buildMerchantContextCard(run);
    const reusedInput = applyMerchantContextToProjectInput(merchantContextCard, {
      productName: '升级款磁吸快充充电宝',
      sellingPoints: ['更轻', '更薄'],
    });
    const deliveryPackage = buildDeliveryPackage({ ...run, merchantContextCard });
    const exported = exportListingFactoryRun({ ...run, merchantContextCard, deliveryPackage });

    expect(merchantContextCard.reusableSellingPoints.length).toBeGreaterThan(0);
    expect(merchantContextCard.markdown).toContain('商家上下文记忆卡');
    expect(reusedInput.productName).toBe('升级款磁吸快充充电宝');
    expect(reusedInput.brandGuardrails).toEqual(project.brandGuardrails);
    expect(Array.isArray(reusedInput.sellingPoints) ? reusedInput.sellingPoints.join(' ') : reusedInput.sellingPoints).toContain('更轻');
    expect(deliveryPackage.merchantContextMarkdown).toContain('商家上下文记忆卡');
    expect(exported).toContain('merchantContextCard');
  });

  it('adds p4 execution exports to the delivery package', () => {
    const run = createRunFromProject(project);
    const deliveryPackage = buildDeliveryPackage(run);

    expect(deliveryPackage.experimentExecutionPlaybookMarkdown).toContain('实验执行手册');
    expect(deliveryPackage.experimentCadencePlanMarkdown).toContain('实验节奏安排');
    expect(deliveryPackage.experimentOperatorChecklistMarkdown).toContain('操作检查表');
    expect(deliveryPackage.experimentWorkbenchMarkdown).toContain('本地实验操作台');
    expect(deliveryPackage.crossRunComparisonMarkdown).toContain('跨运行学习对比');
    expect(deliveryPackage.merchantLearningArchiveMarkdown).toContain('商家增长学习档案');
    expect(deliveryPackage.contentExperimentTraceMarkdown).toContain('内容实验追踪链');
    expect(deliveryPackage.traceabilitySummaryMarkdown).toContain('可追溯证据链摘要');
    expect(deliveryPackage.platformDataContractMarkdown).toContain('平台数据契约');
    expect(deliveryPackage.platformImportTemplateCsv).toContain('channel');
    expect(deliveryPackage.platformImportQualityMarkdown).toContain('导入质量检查');
    expect(deliveryPackage.platformDataReadinessMarkdown).toContain('数据接入准备度');
  });

});
