import { describe, expect, it } from 'vitest';
import {
  POC_REPORT_STANDARD_PACK_ROUTE,
  POC_STANDARD_PACK_ROUTE,
  buildAbTestStandardPackRoute,
  buildAIVideoStandardPackRoute,
  buildBatchLaunchStandardPackRoute,
  buildCustomerServiceStandardPackRoute,
  buildDataInsightsStandardPackRoute,
  buildIntentMiningStandardPackRoute,
  buildInfluencerOutboundStandardPackRoute,
  buildInquiryStandardPackRoute,
  buildInquiryStandardPackPrefill,
  buildNewListingStandardPackRoute,
  buildPocReportRoute,
  buildPocReportStandardPackRoute,
  buildPhotoshootStandardPackRoute,
  buildProductDiscoveryStandardPackRoute,
  buildProductImageStandardPackRoute,
  buildStandardPackRoute,
  buildVideoTeardownStandardPackRoute,
} from '@/lib/standard-pack-routing';

describe('standard pack routing', () => {
  it('builds a route with encoded standard-pack context', () => {
    const route = buildStandardPackRoute({
      workflow: 'slideshow-batch',
      goal: 'test goal',
      brand: 'brand / shop',
      sku: 'sku line',
      links: 'https://example.com/a',
    });

    expect(route).toMatch(/^\/modules\/standard-pack\?/);
    expect(route).toContain('workflow=slideshow-batch');
    expect(route).toContain('goal=test+goal');
    expect(route).toContain('links=https%3A%2F%2Fexample.com%2Fa');
  });

  it('keeps canonical POC entry routes pointed at the SOP module', () => {
    expect(POC_STANDARD_PACK_ROUTE).toContain('/modules/standard-pack?');
    expect(POC_STANDARD_PACK_ROUTE).toContain('workflow=benchmark');
    const pocParams = new URLSearchParams(POC_STANDARD_PACK_ROUTE.split('?')[1]);
    expect(pocParams.get('sku')).toContain('10 个真实 SKU');

    expect(POC_REPORT_STANDARD_PACK_ROUTE).toContain('/modules/standard-pack?');
    const reportParams = new URLSearchParams(POC_REPORT_STANDARD_PACK_ROUTE.split('?')[1]);
    expect(reportParams.get('goal')).toContain('合同判断');
  });

  it('builds new-listing standard pack routes with bounded URL payloads', () => {
    const longSku = `核心 SKU ${'长卖点 '.repeat(520)}`;
    const route = buildNewListingStandardPackRoute({
      categoryLabel: '家居用品',
      skuInput: longSku,
      mode: 'single',
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(route).toMatch(/^\/modules\/standard-pack\?/);
    expect(params.get('workflow')).toBe('benchmark');
    expect(params.get('goal')).toContain('家居用品 SKU');
    expect(params.get('sku')).toContain('核心 SKU');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('sku')).toMatch(/\.\.\.$/);
  });

  it('passes completed new-listing summaries as bounded context', () => {
    const route = buildNewListingStandardPackRoute({
      categoryLabel: '数码电子',
      skuInput: '蓝牙耳机 - ANC - $39',
      mode: 'batch',
      resultSummary: `翻译完成\n${'合规摘要 '.repeat(160)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(params.get('brand')).toContain('批量模式');
    expect(params.get('links')).toContain('翻译完成');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
    expect(params.get('links')).toMatch(/\.\.\.$/);
  });

  it('builds bounded poc-report routes from pipeline recap metrics', () => {
    const route = buildPocReportRoute({
      skuPlanned: 12.6,
      skuDelivered: 9.2,
      finalReviewPassRate: 104,
      benchmarkCoverage: -5,
      riskCount: 3,
      missingAssetCount: 2,
      reworkCount: 4,
      contentTestReady: true,
      ownerReady: true,
      contractIntent: false,
      source: 'new-listing-batch',
      categoryLabel: 'home storage accessories'.repeat(10),
      benchmarkPreset: 'creative-test',
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(route).toMatch(/^\/poc\/report\?/);
    expect(params.get('skuPlanned')).toBe('13');
    expect(params.get('skuDelivered')).toBe('9');
    expect(params.get('finalReviewPassRate')).toBe('100');
    expect(params.get('benchmarkCoverage')).toBe('0');
    expect(params.get('contentTestReady')).toBe('1');
    expect(params.get('ownerReady')).toBe('1');
    expect(params.get('contractIntent')).toBe('0');
    expect(params.get('from')).toBe('new-listing-batch');
    expect(params.get('category')!.length).toBeLessThanOrEqual(80);
    expect(params.get('benchmarkPreset')).toBe('creative-test');
  });

  it('builds dynamic standard packs from current poc-report metrics', () => {
    const route = buildPocReportStandardPackRoute({
      skuPlanned: 10,
      skuDelivered: 9,
      finalReviewPassRate: 84,
      benchmarkCoverage: 81,
      riskCount: 1,
      missingAssetCount: 0,
      reworkCount: 1,
      contentTestReady: true,
      ownerReady: true,
      contractIntent: true,
      decisionLabel: 'push contract',
      nextStep: 'book final review and move to paid contract',
      source: 'new-listing-batch',
      categoryLabel: 'home storage',
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(route).toMatch(/^\/modules\/standard-pack\?/);
    expect(params.get('workflow')).toBe('benchmark');
    expect(params.get('goal')).toContain('contract-ready');
    expect(params.get('brand')).toContain('POC Report');
    expect(params.get('brand')).toContain('home storage');
    expect(params.get('sku')).toContain('sku delivered: 9');
    expect(params.get('links')).toContain('decision: push contract');
    expect(params.get('links')).toContain('contract intent: yes');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds inquiry routes from submitted lead context', () => {
    const route = buildInquiryStandardPackRoute({
      company: 'ACME Commerce',
      scale: '50-200',
      category: 'home',
      skuCount: '10',
      platforms: 'Shopify + TikTok Shop',
      assetsReady: 'ready',
      expectedDeliverables: '主图方向 / benchmark / slideshow',
      creativeNeeds: 'slideshow-batch',
      benchmarkLinks: 'https://example.com/tiktok',
      painPoint: '想验证 10 个 SKU 的上新 SOP 和内容测试是否能减少返工',
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(params.get('workflow')).toBe('slideshow-batch');
    expect(params.get('goal')).toContain('主图方向');
    expect(params.get('brand')).toContain('ACME Commerce');
    expect(params.get('brand')).toContain('Shopify + TikTok Shop');
    expect(params.get('sku')).toContain('10 个 SKU');
    expect(params.get('links')).toContain('https://example.com/tiktok');
  });

  it('builds reusable inquiry prefill for admin scoring and routing', () => {
    const prefill = buildInquiryStandardPackPrefill({
      company: 'ACME Commerce',
      scale: '50-200',
      category: 'home',
      skuCount: '10',
      platforms: 'Shopify + TikTok Shop',
      assetsReady: 'ready',
      expectedDeliverables: '7 天验收复盘, 判断是否进入主站合同',
      creativeNeeds: 'slideshow-batch',
      benchmarkLinks: 'https://example.com/tiktok',
      painPoint: '想验证 10 个 SKU 的上新 SOP 和内容测试是否能减少返工',
    });

    expect(prefill.workflow).toBe('slideshow-batch');
    expect(prefill.goal).toContain('主站合同');
    expect(prefill.brand).toContain('ACME Commerce');
    expect(prefill.sku).toContain('10 个 SKU');
    expect(prefill.links).toContain('https://example.com/tiktok');
  });

  it('builds bounded data-insights review routes', () => {
    const route = buildDataInsightsStandardPackRoute({
      channelLabel: 'TikTok Shop',
      period: 'week',
      context: 'office wellness launch',
      dataInput: `核心数据 ${'CTR 2.3 ROI 5.7 refund 4.2 '.repeat(80)}`,
      resultSummary: `overall win\n${'P0 action '.repeat(120)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(params.get('workflow')).toBe('benchmark');
    expect(params.get('goal')).toContain('acceptance-ready POC recap');
    expect(params.get('brand')).toContain('TikTok Shop');
    expect(params.get('sku')).toContain('核心数据');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('overall win');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds bounded ab-test standard pack routes', () => {
    const route = buildAbTestStandardPackRoute({
      platformLabel: 'Amazon',
      productHint: `核心测款 SKU ${'痛点钩子 高饱和主图 '.repeat(120)}`,
      dailyBudget: 500,
      primaryDimension: 'hook',
      resultSummary: `recommended A1/B2/C3\n${'CTR threshold '.repeat(120)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(params.get('workflow')).toBe('benchmark');
    expect(params.get('goal')).toContain('AB test result');
    expect(params.get('brand')).toContain('Amazon');
    expect(params.get('brand')).toContain('budget 500');
    expect(params.get('sku')).toContain('核心测款 SKU');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('recommended A1/B2/C3');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds bounded photoshoot standard pack routes', () => {
    const route = buildPhotoshootStandardPackRoute({
      modeLabel: '模特换装',
      productHint: '粉色露肩上衣',
      prompt: `工业级 prompt ${'质感布光 电商模特 服装还原 '.repeat(100)}`,
      quality: 'high',
      size: '1024x1536',
      count: 4,
      resultSummary: `generated 4 images\n${'candidate accepted '.repeat(120)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(params.get('workflow')).toBe('benchmark');
    expect(params.get('goal')).toContain('image production run');
    expect(params.get('brand')).toContain('AI Photoshoot');
    expect(params.get('brand')).toContain('模特换装');
    expect(params.get('brand')).toContain('4 images');
    expect(params.get('sku')).toContain('工业级 prompt');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('generated 4 images');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds bounded product-image standard pack routes', () => {
    const route = buildProductImageStandardPackRoute({
      categoryLabel: '家居用品',
      sceneLabel: '厨房台面',
      skuInput: `核心商品信息 ${'收纳盒 密封 BPA-Free 四侧卡扣 '.repeat(100)}`,
      outputs: ['主图', '场景图', '细节图'],
      resultSummary: `generated 3 images\n${'prompt approved '.repeat(120)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(params.get('workflow')).toBe('benchmark');
    expect(params.get('goal')).toContain('电商图片交付包');
    expect(params.get('brand')).toContain('Product Image');
    expect(params.get('brand')).toContain('家居用品');
    expect(params.get('brand')).toContain('厨房台面');
    expect(params.get('sku')).toContain('核心商品信息');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('generated 3 images');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds bounded customer-service conversion routes', () => {
    const route = buildCustomerServiceStandardPackRoute({
      intentLabel: '价格异议',
      customerMessage: `客户原话 ${'太贵了 能不能便宜一点 同款竞品更便宜 '.repeat(100)}`,
      languageLabel: 'English',
      shopContext: `TikTok Shop US / beauty device / ${'membership discount active '.repeat(40)}`,
      orderContext: 'TTS-10086',
      resultSummary: `convert reply accepted\n${'next hook '.repeat(120)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(params.get('workflow')).toBe('benchmark');
    expect(params.get('goal')).toContain('customer-service result');
    expect(params.get('brand')).toContain('Customer Service');
    expect(params.get('brand')).toContain('价格异议');
    expect(params.get('brand')).toContain('English');
    expect(params.get('brand')).toContain('TTS-10086');
    expect(params.get('sku')).toContain('客户原话');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('convert reply accepted');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds bounded influencer-outbound routes', () => {
    const route = buildInfluencerOutboundStandardPackRoute({
      brand: 'HOMELODY',
      productName: 'Foldable Food Storage Set',
      price: '$32.99',
      usp: `BPA-Free / kitchen organization / ${'stackable airtight containers '.repeat(40)}`,
      budget: 'free sample + 15% commission',
      cta: '1 reel + 1 carousel',
      influencerInput: `creator batch\n${'@creator | Instagram | 50K | home organization '.repeat(80)}`,
      resultSummary: `5 emails generated\n${'subject approved '.repeat(120)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(params.get('workflow')).toBe('benchmark');
    expect(params.get('goal')).toContain('creator outreach');
    expect(params.get('brand')).toContain('Influencer Outbound');
    expect(params.get('brand')).toContain('HOMELODY');
    expect(params.get('brand')).toContain('Foldable Food Storage Set');
    expect(params.get('sku')).toContain('creator list:');
    expect(params.get('sku')).toContain('creator batch');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('5 emails generated');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds bounded video-teardown standard pack routes', () => {
    const route = buildVideoTeardownStandardPackRoute({
      templateLabel: 'Home Living',
      productHint: `core video SKU ${'pain demo before after kitchen storage '.repeat(120)}`,
      videoContext: 'uploaded 6.4MB competitor TikTok video',
      resultSummary: `hook demo / fast pacing / end CTA\n${'scene prompt accepted '.repeat(120)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(route).toMatch(/^\/modules\/standard-pack\?/);
    expect(params.get('workflow')).toBe('benchmark');
    expect(params.get('goal')).toContain('video teardown');
    expect(params.get('brand')).toContain('Video Teardown');
    expect(params.get('brand')).toContain('Home Living');
    expect(params.get('sku')).toContain('core video SKU');
    expect(params.get('sku')).toContain('reference video');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('hook demo');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds bounded ai-video standard pack routes', () => {
    const route = buildAIVideoStandardPackRoute({
      scenarioLabel: 'Model Display',
      productHint: `pink apparel SKU ${'runway turntable lifestyle fabric motion '.repeat(60)}`,
      imageUrl: 'https://cdn.example.com/source-image.png',
      prompt: `final motion prompt ${'camera hold soft light product focus '.repeat(100)}`,
      duration: 5,
      resolution: '1080P',
      model: 'wanx2.1-i2v-plus',
      resultSummary: `video accepted / cache miss / ¥7.0\n${'cta timing approved '.repeat(120)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(route).toMatch(/^\/modules\/standard-pack\?/);
    expect(params.get('workflow')).toBe('animated-ads');
    expect(params.get('goal')).toContain('AI video run');
    expect(params.get('brand')).toContain('AI Video');
    expect(params.get('brand')).toContain('Model Display');
    expect(params.get('brand')).toContain('1080P');
    expect(params.get('sku')).toContain('source image:');
    expect(params.get('sku')).toContain('final motion prompt');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('video accepted');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds bounded batch-launch standard pack routes', () => {
    const route = buildBatchLaunchStandardPackRoute({
      platformLabel: 'Shopify + TikTok Shop',
      brandContext: `home organization brand ${'premium BPA-free stackable airtight containers '.repeat(20)}`,
      skuInput: `SKU batch\n${'Foldable set - kitchen storage - airtight stackable '.repeat(80)}`,
      skuCount: 18,
      stages: ['选品验证', 'AI 影棚', '内容拆解包', 'A-B 测试'],
      resultSummary: `coverage 82 / risk 2 / checklist 5\n${'review owner assigned '.repeat(120)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(route).toMatch(/^\/modules\/standard-pack\?/);
    expect(params.get('workflow')).toBe('slideshow-batch');
    expect(params.get('goal')).toContain('acceptance-ready POC recap');
    expect(params.get('brand')).toContain('Batch Launch');
    expect(params.get('brand')).toContain('Shopify + TikTok Shop');
    expect(params.get('sku')).toContain('SKU count: 18');
    expect(params.get('sku')).toContain('selected stages:');
    expect(params.get('sku')).toContain('SKU preview:');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('coverage 82');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds bounded product-discovery standard pack routes', () => {
    const route = buildProductDiscoveryStandardPackRoute({
      platformLabel: 'TikTok Shop',
      category: 'beauty tools',
      priceMin: 39,
      priceMax: 129,
      budget: 120000,
      riskLabel: 'high risk / blue ocean',
      extraNote: `need fast content flywheel ${'ugc seeding creator angle '.repeat(40)}`,
      skuContext: `existing sku library\n${'lip oil / facial roller / ice globes '.repeat(60)}`,
      resultSummary: `winner: heated lash curler\n${'margin 68 competition medium rising demand '.repeat(80)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(route).toMatch(/^\/modules\/standard-pack\?/);
    expect(params.get('workflow')).toBe('benchmark');
    expect(params.get('goal')).toContain('product-discovery result');
    expect(params.get('brand')).toContain('Product Discovery');
    expect(params.get('brand')).toContain('TikTok Shop');
    expect(params.get('brand')).toContain('beauty tools');
    expect(params.get('sku')).toContain('category: beauty tools');
    expect(params.get('sku')).toContain('existing SKU context');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('winner: heated lash curler');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds intent-mining routes for audience-to-content packs', () => {
    const route = buildIntentMiningStandardPackRoute({
      product: `smart door lock ${'fingerprint remote unlock rental apartment NFC anti-theft '.repeat(80)}`,
      knownSegments: 'new homeowners, renters, renovation owners',
      resultSummary: `segments: nail artists, gym studios, pet owners\n${'TikTok hook carousel test podcast ugc '.repeat(120)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(route).toMatch(/^\/modules\/standard-pack\?/);
    expect(params.get('workflow')).toBe('slideshow-batch');
    expect(params.get('goal')).toContain('TikTok/Instagram audience-to-content test pack');
    expect(params.get('brand')).toContain('Intent Mining');
    expect(params.get('brand')).toContain('audience validation recap');
    expect(params.get('sku')).toContain('smart door lock');
    expect(params.get('sku')).toContain('known/default audience segments');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('segments: nail artists');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });
});
