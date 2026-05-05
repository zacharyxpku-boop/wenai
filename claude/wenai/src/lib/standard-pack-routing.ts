import type { WorkflowId } from './sop-workflows';

export interface StandardPackRouteInput {
  goal: string;
  brand: string;
  sku: string;
  links?: string;
  workflow?: WorkflowId;
}

export interface NewListingStandardPackRouteInput {
  categoryLabel: string;
  skuInput: string;
  mode: 'single' | 'batch';
  resultSummary?: string;
}

export interface InquiryStandardPackRouteInput {
  company: string;
  scale?: string;
  category: string;
  skuCount?: string;
  platforms?: string;
  assetsReady?: string;
  expectedDeliverables?: string;
  creativeNeeds?: string;
  benchmarkLinks?: string;
  painPoint: string;
}

export interface InquiryStandardPackPrefill {
  workflow: WorkflowId;
  goal: string;
  brand: string;
  sku: string;
  links?: string;
}

export interface DataInsightsStandardPackRouteInput {
  channelLabel: string;
  period: string;
  dataInput: string;
  context?: string;
  resultSummary?: string;
}

export interface AbTestStandardPackRouteInput {
  platformLabel: string;
  productHint: string;
  dailyBudget: number;
  primaryDimension: string;
  resultSummary?: string;
}

export interface PhotoshootStandardPackRouteInput {
  modeLabel: string;
  productHint?: string;
  prompt: string;
  quality: string;
  size: string;
  count: number;
  resultSummary?: string;
}

export interface ProductImageStandardPackRouteInput {
  categoryLabel: string;
  sceneLabel?: string;
  skuInput: string;
  outputs: string[];
  resultSummary?: string;
}

export interface CustomerServiceStandardPackRouteInput {
  intentLabel: string;
  customerMessage: string;
  languageLabel: string;
  shopContext?: string;
  orderContext?: string;
  resultSummary?: string;
}

export interface InfluencerOutboundStandardPackRouteInput {
  brand: string;
  productName: string;
  price?: string;
  usp?: string;
  budget?: string;
  cta?: string;
  influencerInput: string;
  resultSummary?: string;
}

export interface VideoTeardownStandardPackRouteInput {
  productHint?: string;
  templateLabel?: string;
  videoContext?: string;
  resultSummary?: string;
}

export interface AIVideoStandardPackRouteInput {
  scenarioLabel: string;
  productHint?: string;
  imageUrl?: string;
  prompt: string;
  duration: number;
  resolution: string;
  model: string;
  resultSummary?: string;
}

export interface BatchLaunchStandardPackRouteInput {
  platformLabel: string;
  brandContext?: string;
  skuInput: string;
  skuCount: number;
  stages: string[];
  resultSummary?: string;
}

export interface ProductDiscoveryStandardPackRouteInput {
  platformLabel: string;
  category: string;
  priceMin: number;
  priceMax: number;
  budget: number;
  riskLabel: string;
  extraNote?: string;
  skuContext?: string;
  resultSummary?: string;
}

export interface IntentMiningStandardPackRouteInput {
  product: string;
  knownSegments?: string;
  resultSummary?: string;
}

export interface PocReportRouteInput {
  skuPlanned: number;
  skuDelivered: number;
  finalReviewPassRate: number;
  benchmarkCoverage: number;
  riskCount: number;
  missingAssetCount: number;
  reworkCount: number;
  contentTestReady: boolean;
  ownerReady: boolean;
  contractIntent: boolean;
  source?: string;
  categoryLabel?: string;
  benchmarkPreset?: string;
}

export interface PocReportStandardPackRouteInput extends PocReportRouteInput {
  decisionLabel: string;
  nextStep: string;
}

function truncateText(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 3).trimEnd()}...`;
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function buildStandardPackRoute(input: StandardPackRouteInput): string {
  const params = new URLSearchParams({
    goal: input.goal,
    brand: input.brand,
    sku: input.sku,
    workflow: input.workflow || 'benchmark',
  });

  if (input.links?.trim()) {
    params.set('links', input.links.trim());
  }

  return `/modules/standard-pack?${params.toString()}`;
}

export function buildNewListingStandardPackRoute(input: NewListingStandardPackRouteInput): string {
  const categoryLabel = input.categoryLabel.trim() || '未指定品类';
  const sku = truncateText(input.skuInput, 1200);
  const resultSummary = input.resultSummary ? truncateText(input.resultSummary, 800) : '';

  return buildStandardPackRoute({
    workflow: 'benchmark',
    goal:
      input.mode === 'batch'
        ? `为这批 ${categoryLabel} SKU 生成上新 Launch Pack 与验收复盘标准交付包`
        : `为这个 ${categoryLabel} SKU 生成上新 Launch Pack 与验收复盘标准交付包`,
    brand: `新品上新流水线 / ${categoryLabel} / ${input.mode === 'batch' ? '批量模式' : '单 SKU 模式'}`,
    sku,
    links: resultSummary || undefined,
  });
}

const CREATIVE_WORKFLOW_MAP: Record<string, WorkflowId> = {
  'benchmark-only': 'benchmark',
  'podcast-ugc': 'podcast-ugc',
  'street-interview': 'street-interview',
  'slideshow-batch': 'slideshow-batch',
  'batch-ugc': 'batch-ugc',
  'animated-ads': 'animated-ads',
  'editing-only': 'editing-only',
};

export function buildInquiryStandardPackPrefill(input: InquiryStandardPackRouteInput): InquiryStandardPackPrefill {
  const workflow = CREATIVE_WORKFLOW_MAP[input.creativeNeeds || ''] || 'benchmark';
  const category = input.category.trim() || '未指定品类';
  const goal = input.expectedDeliverables?.trim() || input.painPoint.trim() || '为这个客户生成电商 SKU 增长 POC 标准交付包';
  const brand = [input.company, category, input.platforms, input.scale].filter(Boolean).join(' / ');
  const sku = [
    input.skuCount ? `${input.skuCount} 个 SKU` : 'SKU 数待确认',
    input.assetsReady ? `素材状态: ${input.assetsReady}` : '',
    input.painPoint,
    input.expectedDeliverables ? `验收目标: ${input.expectedDeliverables}` : '',
  ].filter(Boolean).join('\n');

  return {
    workflow,
    goal: truncateText(goal, 600),
    brand: truncateText(brand || '询盘客户 / 待补店铺上下文', 600),
    sku: truncateText(sku, 1200),
    links: input.benchmarkLinks ? truncateText(input.benchmarkLinks, 800) : undefined,
  };
}

export function buildInquiryStandardPackRoute(input: InquiryStandardPackRouteInput): string {
  return buildStandardPackRoute(buildInquiryStandardPackPrefill(input));
}

export function buildDataInsightsStandardPackRoute(input: DataInsightsStandardPackRouteInput): string {
  const channelLabel = input.channelLabel.trim() || 'data review channel';
  const period = input.period.trim() || 'review period';
  const context = input.context?.trim();
  const dataInput = truncateText(input.dataInput, 1200);
  const resultSummary = input.resultSummary ? truncateText(input.resultSummary, 800) : '';

  return buildStandardPackRoute({
    workflow: 'benchmark',
    goal: resultSummary
      ? `Turn this ${channelLabel} ${period} data review into an acceptance-ready POC recap pack`
      : `Generate a data review SOP pack for this ${channelLabel} ${period} ecommerce performance dataset`,
    brand: context
      ? `Data Insights / ${channelLabel} / ${period} / ${truncateText(context, 180)}`
      : `Data Insights / ${channelLabel} / ${period}`,
    sku: dataInput,
    links: resultSummary || undefined,
  });
}

export function buildAbTestStandardPackRoute(input: AbTestStandardPackRouteInput): string {
  const platformLabel = input.platformLabel.trim() || 'test channel';
  const productHint = truncateText(input.productHint, 1200);
  const primaryDimension = input.primaryDimension.trim() || 'hook';
  const resultSummary = input.resultSummary ? truncateText(input.resultSummary, 800) : '';

  return buildStandardPackRoute({
    workflow: 'benchmark',
    goal: resultSummary
      ? `Turn this ${platformLabel} AB test result into an acceptance-ready SKU growth recap pack`
      : `Generate an AB test SOP pack for this ${platformLabel} SKU image testing setup`,
    brand: `AB Test / ${platformLabel} / budget ${input.dailyBudget} / ${primaryDimension}`,
    sku: productHint,
    links: resultSummary || undefined,
  });
}

export function buildPhotoshootStandardPackRoute(input: PhotoshootStandardPackRouteInput): string {
  const modeLabel = input.modeLabel.trim() || 'AI photoshoot';
  const productHint = input.productHint?.trim();
  const prompt = truncateText(input.prompt, 1200);
  const resultSummary = input.resultSummary ? truncateText(input.resultSummary, 800) : '';

  return buildStandardPackRoute({
    workflow: 'benchmark',
    goal: resultSummary
      ? `Turn this ${modeLabel} image production run into an acceptance-ready ecommerce creative pack`
      : `Generate an AI photoshoot SOP pack for this ${modeLabel} ecommerce image production setup`,
    brand: [
      'AI Photoshoot',
      modeLabel,
      productHint ? truncateText(productHint, 180) : '',
      `${input.count} images`,
      input.quality,
      input.size,
    ].filter(Boolean).join(' / '),
    sku: prompt,
    links: resultSummary || undefined,
  });
}

export function buildProductImageStandardPackRoute(input: ProductImageStandardPackRouteInput): string {
  const categoryLabel = input.categoryLabel.trim() || '未指定品类';
  const sceneLabel = input.sceneLabel?.trim();
  const sku = truncateText(input.skuInput, 1200);
  const resultSummary = input.resultSummary ? truncateText(input.resultSummary, 800) : '';

  return buildStandardPackRoute({
    workflow: 'benchmark',
    goal: resultSummary
      ? `把这组 ${categoryLabel} 商品图产出转成可验收的电商图片交付包`
      : `为这个 ${categoryLabel} SKU 生成商品图生产 SOP 与验收标准包`,
    brand: [
      'Product Image',
      categoryLabel,
      sceneLabel || '',
      input.outputs.length ? `${input.outputs.join(' / ')}` : '',
    ].filter(Boolean).join(' / '),
    sku,
    links: resultSummary || undefined,
  });
}

export function buildCustomerServiceStandardPackRoute(input: CustomerServiceStandardPackRouteInput): string {
  const intentLabel = input.intentLabel.trim() || 'customer-service scenario';
  const languageLabel = input.languageLabel.trim() || 'target language';
  const customerMessage = truncateText(input.customerMessage, 1200);
  const shopContext = input.shopContext?.trim();
  const orderContext = input.orderContext?.trim();
  const resultSummary = input.resultSummary ? truncateText(input.resultSummary, 800) : '';

  return buildStandardPackRoute({
    workflow: 'benchmark',
    goal: resultSummary
      ? `Turn this ${intentLabel} customer-service result into an acceptance-ready conversion SOP recap pack`
      : `Generate a customer-service conversion SOP pack for this ${intentLabel} ecommerce scenario`,
    brand: [
      'Customer Service',
      intentLabel,
      languageLabel,
      orderContext ? `order ${orderContext}` : '',
      shopContext ? truncateText(shopContext, 180) : '',
    ].filter(Boolean).join(' / '),
    sku: customerMessage,
    links: resultSummary || undefined,
  });
}

export function buildInfluencerOutboundStandardPackRoute(input: InfluencerOutboundStandardPackRouteInput): string {
  const brandName = input.brand.trim() || 'creator outreach brand';
  const productName = input.productName.trim() || 'creator outreach product';
  const influencerInput = truncateText(input.influencerInput, 700);
  const resultSummary = input.resultSummary ? truncateText(input.resultSummary, 800) : '';
  const productContext = truncateText([
    `product: ${productName}`,
    input.price?.trim() ? `price: ${input.price.trim()}` : '',
    input.usp?.trim() ? `usp: ${input.usp.trim()}` : '',
    input.cta?.trim() ? `collaboration goal: ${input.cta.trim()}` : '',
  ].filter(Boolean).join('\n'), 420);
  const skuContext = [
    'creator list:',
    influencerInput,
    '',
    productContext,
  ].filter(Boolean).join('\n');

  return buildStandardPackRoute({
    workflow: 'benchmark',
    goal: resultSummary
      ? 'Turn this influencer outbound run into an acceptance-ready creator outreach recap pack'
      : 'Generate an influencer outbound SOP pack for this ecommerce creator outreach batch',
    brand: [
      'Influencer Outbound',
      brandName,
      productName,
      input.budget?.trim() ? `budget ${input.budget.trim()}` : '',
    ].filter(Boolean).join(' / '),
    sku: truncateText(skuContext, 1200),
    links: resultSummary || undefined,
  });
}

export function buildVideoTeardownStandardPackRoute(input: VideoTeardownStandardPackRouteInput): string {
  const templateLabel = input.templateLabel?.trim();
  const productHint = input.productHint?.trim();
  const videoContext = input.videoContext?.trim();
  const resultSummary = input.resultSummary ? truncateText(input.resultSummary, 800) : '';
  const skuContext = [
    videoContext ? `reference video:\n${videoContext}` : '',
    productHint ? `product hint:\n${truncateText(productHint, 1000)}` : 'product hint: not provided yet',
  ].filter(Boolean).join('\n\n');

  return buildStandardPackRoute({
    workflow: 'benchmark',
    goal: resultSummary
      ? 'Turn this video teardown into an acceptance-ready ecommerce content benchmark recap pack'
      : 'Generate a video teardown SOP pack for ecommerce benchmark-to-creative production',
    brand: [
      'Video Teardown',
      templateLabel || 'template pending',
      resultSummary ? 'acceptance recap' : 'pre-run setup',
    ].join(' / '),
    sku: truncateText(skuContext, 1200),
    links: resultSummary || undefined,
  });
}

export function buildAIVideoStandardPackRoute(input: AIVideoStandardPackRouteInput): string {
  const scenarioLabel = input.scenarioLabel.trim() || 'AI video scenario';
  const productHint = input.productHint?.trim();
  const imageUrl = input.imageUrl?.trim();
  const prompt = truncateText(input.prompt, 1200);
  const resultSummary = input.resultSummary ? truncateText(input.resultSummary, 800) : '';
  const skuContext = [
    imageUrl ? `source image: ${truncateText(imageUrl, 500)}` : '',
    productHint ? `product hint: ${truncateText(productHint, 280)}` : '',
    `prompt:\n${prompt}`,
  ].filter(Boolean).join('\n\n');

  return buildStandardPackRoute({
    workflow: 'animated-ads',
    goal: resultSummary
      ? `Turn this ${scenarioLabel} AI video run into an acceptance-ready ecommerce creative production recap pack`
      : `Generate an AI video SOP pack for this ${scenarioLabel} ecommerce creative production setup`,
    brand: [
      'AI Video',
      scenarioLabel,
      `${input.duration}s`,
      input.resolution,
      input.model,
    ].filter(Boolean).join(' / '),
    sku: truncateText(skuContext, 1200),
    links: resultSummary || undefined,
  });
}

export function buildBatchLaunchStandardPackRoute(input: BatchLaunchStandardPackRouteInput): string {
  const platformLabel = input.platformLabel.trim() || 'mixed ecommerce channels';
  const brandContext = input.brandContext?.trim();
  const hasContentWorkflow = input.stages.some(stage => /social|content|benchmark|slideshow|内容|拆解|短视频|视频/i.test(stage));
  const resultSummary = input.resultSummary ? truncateText(input.resultSummary, 800) : '';
  const skuContext = [
    `SKU count: ${input.skuCount || 10}`,
    input.stages.length ? `selected stages: ${input.stages.join(' -> ')}` : '',
    brandContext ? `brand context: ${truncateText(brandContext, 240)}` : '',
    `SKU preview:\n${truncateText(input.skuInput, 900)}`,
  ].filter(Boolean).join('\n\n');

  return buildStandardPackRoute({
    workflow: hasContentWorkflow ? 'slideshow-batch' : 'benchmark',
    goal: resultSummary
      ? `Turn this ${input.skuCount || 10} SKU batch-launch plan into an acceptance-ready POC recap pack`
      : `Generate a batch-launch SOP pack for ${input.skuCount || 10} ecommerce SKU POC delivery`,
    brand: [
      'Batch Launch',
      platformLabel,
      brandContext ? truncateText(brandContext, 180) : 'brand context pending',
    ].filter(Boolean).join(' / '),
    sku: truncateText(skuContext, 1200),
    links: resultSummary || (hasContentWorkflow ? 'pending benchmark links or competitor accounts' : undefined),
  });
}

export function buildProductDiscoveryStandardPackRoute(input: ProductDiscoveryStandardPackRouteInput): string {
  const platformLabel = input.platformLabel.trim() || 'ecommerce channel';
  const category = input.category.trim() || 'category pending';
  const riskLabel = input.riskLabel.trim() || 'medium risk';
  const extraNote = input.extraNote?.trim();
  const skuContext = input.skuContext?.trim();
  const resultSummary = input.resultSummary ? truncateText(input.resultSummary, 800) : '';
  const decisionContext = [
    `category: ${category}`,
    `price band: CNY ${input.priceMin}-${input.priceMax}`,
    `launch budget: CNY ${input.budget}`,
    `risk appetite: ${riskLabel}`,
    extraNote ? `operator note: ${truncateText(extraNote, 260)}` : '',
    skuContext ? `existing SKU context:\n${truncateText(skuContext, 520)}` : '',
  ].filter(Boolean).join('\n\n');

  return buildStandardPackRoute({
    workflow: 'benchmark',
    goal: resultSummary
      ? `Turn this ${platformLabel} product-discovery result into an acceptance-ready SKU decision recap pack`
      : `Generate a product-discovery SOP pack for choosing the next ecommerce SKU candidates on ${platformLabel}`,
    brand: [
      'Product Discovery',
      platformLabel,
      category,
      `budget ${input.budget}`,
      riskLabel,
    ].filter(Boolean).join(' / '),
    sku: truncateText(decisionContext, 1200),
    links: resultSummary || undefined,
  });
}

export function buildIntentMiningStandardPackRoute(input: IntentMiningStandardPackRouteInput): string {
  const product = truncateText(input.product, 760);
  const knownSegments = input.knownSegments?.trim();
  const resultSummary = input.resultSummary ? truncateText(input.resultSummary, 800) : '';
  const skuContext = [
    knownSegments ? `known/default audience segments to avoid:\n${truncateText(knownSegments, 360)}` : '',
    `product:\n${product}`,
  ].filter(Boolean).join('\n\n');

  return buildStandardPackRoute({
    workflow: resultSummary ? 'slideshow-batch' : 'benchmark',
    goal: resultSummary
      ? 'Turn this intent-mining result into an acceptance-ready TikTok/Instagram audience-to-content test pack'
      : 'Generate an intent-mining SOP pack for finding non-obvious ecommerce audiences and content angles',
    brand: [
      'Intent Mining',
      resultSummary ? 'audience validation recap' : 'pre-run audience discovery',
      knownSegments ? 'known segments provided' : 'known segments pending',
    ].join(' / '),
    sku: truncateText(skuContext, 1200),
    links: resultSummary || undefined,
  });
}

export function buildPocReportRoute(input: PocReportRouteInput): string {
  const params = new URLSearchParams({
    skuPlanned: String(clampNumber(input.skuPlanned, 0, 999)),
    skuDelivered: String(clampNumber(input.skuDelivered, 0, 999)),
    finalReviewPassRate: String(clampNumber(input.finalReviewPassRate, 0, 100)),
    benchmarkCoverage: String(clampNumber(input.benchmarkCoverage, 0, 100)),
    riskCount: String(clampNumber(input.riskCount, 0, 99)),
    missingAssetCount: String(clampNumber(input.missingAssetCount, 0, 99)),
    reworkCount: String(clampNumber(input.reworkCount, 0, 99)),
    contentTestReady: input.contentTestReady ? '1' : '0',
    ownerReady: input.ownerReady ? '1' : '0',
    contractIntent: input.contractIntent ? '1' : '0',
  });

  if (input.source?.trim()) {
    params.set('from', truncateText(input.source, 80));
  }

  if (input.categoryLabel?.trim()) {
    params.set('category', truncateText(input.categoryLabel, 80));
  }

  if (input.benchmarkPreset?.trim()) {
    params.set('benchmarkPreset', truncateText(input.benchmarkPreset, 80));
  }

  return `/poc/report?${params.toString()}`;
}

export function buildPocReportStandardPackRoute(input: PocReportStandardPackRouteInput): string {
  const sourceLabel = input.source?.trim() || 'poc-report';
  const categoryLabel = input.categoryLabel?.trim() || 'mixed categories';
  const summary = truncateText([
    `decision: ${input.decisionLabel}`,
    `next: ${input.nextStep}`,
    `delivery: ${clampNumber(input.skuDelivered, 0, 999)}/${clampNumber(input.skuPlanned, 0, 999)}`,
    `final review: ${clampNumber(input.finalReviewPassRate, 0, 100)}%`,
    `benchmark: ${clampNumber(input.benchmarkCoverage, 0, 100)}%`,
    `risk: ${clampNumber(input.riskCount, 0, 99)}`,
    `missing assets: ${clampNumber(input.missingAssetCount, 0, 99)}`,
    `rework: ${clampNumber(input.reworkCount, 0, 99)}`,
    `content test ready: ${input.contentTestReady ? 'yes' : 'no'}`,
    `owner ready: ${input.ownerReady ? 'yes' : 'no'}`,
    `contract intent: ${input.contractIntent ? 'yes' : 'no'}`,
  ].join('\n'), 800);

  return buildStandardPackRoute({
    workflow: 'benchmark',
    goal: 'Turn this ecommerce POC acceptance report into a contract-ready standard delivery recap pack',
    brand: truncateText(`POC Report / ${categoryLabel} / ${sourceLabel}`, 600),
    sku: truncateText([
      `category: ${categoryLabel}`,
      `source: ${sourceLabel}`,
      `sku planned: ${clampNumber(input.skuPlanned, 0, 999)}`,
      `sku delivered: ${clampNumber(input.skuDelivered, 0, 999)}`,
      `final review pass rate: ${clampNumber(input.finalReviewPassRate, 0, 100)}%`,
      `benchmark coverage: ${clampNumber(input.benchmarkCoverage, 0, 100)}%`,
      `risk count: ${clampNumber(input.riskCount, 0, 99)}`,
      `missing asset count: ${clampNumber(input.missingAssetCount, 0, 99)}`,
      `rework count: ${clampNumber(input.reworkCount, 0, 99)}`,
    ].join('\n'), 1200),
    links: summary,
  });
}

export const POC_STANDARD_PACK_ROUTE = buildStandardPackRoute({
  workflow: 'benchmark',
  goal: '为 10 个真实 SKU 生成电商增长 POC 标准交付包',
  brand: '电商团队 / 独立站 / Amazon / TikTok Shop / 多平台上新',
  sku: '10 个真实 SKU: SKU 名称、品类、价格带、核心卖点、目标平台、现有商品图或参考图',
  links: '待补充 TikTok / Instagram / Amazon / 独立站 benchmark 链接或竞品账号',
});

export const POC_REPORT_STANDARD_PACK_ROUTE = buildStandardPackRoute({
  workflow: 'benchmark',
  goal: '把 10 SKU POC 复盘转成可验收、可进入合同判断的标准报告',
  brand: '电商 SKU 增长 POC / 交付复盘 / 主站合同前评估',
  sku: '10 SKU 交付结果、风险项、待补资料、终审建议、下一轮 SKU 类目判断',
  links: 'POC 输入材料、benchmark 链接、内容测试结果、客户复盘记录',
});
