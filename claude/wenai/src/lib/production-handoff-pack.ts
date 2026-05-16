import type { GeneratedBrief, ListingFactoryRun } from './listing-factory-engine';
import { calculatePerformanceMetrics } from './listing-factory-engine';

export type ProductionHandoffStatus =
  | 'spec_ready'
  | 'ready_for_external_tool'
  | 'needs_brand_review'
  | 'blocked_missing_assets';

export interface PlatformProductionSpec {
  platform: string;
  deliverableType: 'short_video' | 'listing_image' | 'landing_asset';
  dimensions: string;
  durationOrCount: string;
  copyRules: string[];
  assetRules: string[];
  exportFormat: string;
  namingPattern: string;
  returnMetrics: string[];
}

export interface ProductionAssetRequirement {
  id: string;
  name: string;
  purpose: string;
  required: boolean;
  acceptanceCriteria: string;
}

export interface ProductionReviewGate {
  id: string;
  title: string;
  owner: 'operator' | 'designer' | 'editor' | 'media_buyer';
  mustPass: boolean;
  checks: string[];
}

export interface ProductionHandoffPack {
  status: ProductionHandoffStatus;
  statusLabel: string;
  selectedBrief: {
    id: string;
    platform: string;
    contentType: string;
    hook: string;
    cta: string;
  };
  evidence: string[];
  platformSpecs: PlatformProductionSpec[];
  assetManifest: ProductionAssetRequirement[];
  reviewGates: ProductionReviewGate[];
  nextActions: string[];
  markdown: string;
}

const PLATFORM_SPEC_LABELS: Record<string, string> = {
  tiktok: 'TikTok',
  meta: 'Meta Ads',
  instagram: 'Meta Ads',
  facebook: 'Meta Ads',
  google: 'Google Ads',
  youtube: 'Google Ads',
  amazon: 'Amazon',
  shopify: 'Shopify',
  xiaohongshu: 'Xiaohongshu',
};

function normalizePlatformName(platform: string) {
  const key = platform.trim().toLowerCase().replace(/[\s_-]+ads?$/, '');
  return PLATFORM_SPEC_LABELS[key] || platform.trim() || '主平台';
}

function slug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '-')
    .replace(/^-+|-+$/g, '') || 'project';
}

function percent(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) return '未追踪';
  return `${(value * 100).toFixed(1)}%`;
}

function money(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) return '未追踪';
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

function roas(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) return '未追踪';
  return value.toFixed(2);
}

function buildSpecForPlatform(platformInput: string, productName: string): PlatformProductionSpec {
  const platform = normalizePlatformName(platformInput);
  const productSlug = slug(productName);

  if (/amazon/i.test(platform)) {
    return {
      platform,
      deliverableType: 'listing_image',
      dimensions: '主图 2000x2000；A+ 图文建议 1464x600 / 970x600',
      durationOrCount: '主图 1 张，场景图 2 张，A+ 图文 3 张',
      copyRules: [
        '主图不放促销字样，不放未经验证的功效承诺',
        'A+ 图文每张只表达一个卖点',
        '尺寸、兼容性、材质等硬信息必须可核对',
      ],
      assetRules: [
        '产品边缘清晰，纯白背景主图产品占画面约 85%',
        '场景图必须能看出使用对象、使用场景和尺度',
        '保留原始分层文件或高清源文件，方便复用',
      ],
      exportFormat: 'JPG/PNG，sRGB，单图小于平台限制',
      namingPattern: `${productSlug}_{variant}_{date}_amazon.jpg`,
      returnMetrics: ['sessions', 'orders', 'sales', 'conversion_rate', 'acos'],
    };
  }

  if (/shopify/i.test(platform)) {
    return {
      platform,
      deliverableType: 'landing_asset',
      dimensions: '首屏 1440x900；移动端 750x1200；短视频 1080x1920',
      durationOrCount: '首屏图 1 张，商品场景图 3 张，短视频 1 条',
      copyRules: [
        '首屏说明使用场景和核心结果，不写空泛口号',
        'CTA 与落地页按钮文案保持一致',
        '价格、优惠、物流承诺必须与店铺当前配置一致',
      ],
      assetRules: [
        '图片必须覆盖桌面和移动端首屏裁切',
        '短视频前三秒展示问题场景和产品进入方式',
        '素材需能直接进入商品详情页或广告落地页',
      ],
      exportFormat: 'WebP/JPG/PNG；视频 MP4 H.264',
      namingPattern: `${productSlug}_{variant}_{date}_shopify`,
      returnMetrics: ['sessions', 'orders', 'total_sales', 'conversion_rate', 'aov'],
    };
  }

  const isGoogle = /google|youtube/i.test(platform);
  const isMeta = /meta|facebook|instagram/i.test(platform);
  return {
    platform,
    deliverableType: 'short_video',
    dimensions: isGoogle ? '1080x1920 竖屏；可补 1920x1080 横屏裁切' : '1080x1920 竖屏',
    durationOrCount: isGoogle ? '15 秒主版本，6 秒 bumper 裁切 1 条' : '15-30 秒，保留 3 秒 hook 裁切点',
    copyRules: [
      '前三秒必须出现具体问题、对象或结果',
      '字幕每行不超过 14 个字，核心数字必须与数据来源一致',
      isMeta ? '避免夸张前后对比和个人属性暗示' : '避免未经验证的绝对化承诺',
    ],
    assetRules: [
      '至少包含产品特写、真实使用场景、结果证明三个镜头',
      '保留无字幕母版，方便二次裁切',
      '音频、字幕、画面需分层导出或保留工程文件',
    ],
    exportFormat: 'MP4, H.264, 码率 >= 8Mbps；附无字幕母版',
    namingPattern: `${productSlug}_{variant}_{date}_${slug(platform)}.mp4`,
    returnMetrics: isGoogle
      ? ['impressions', 'clicks', 'cost', 'conversions', 'conversion_value']
      : ['impressions', 'clicks', 'spend', 'purchases', 'purchase_roas'],
  };
}

function pickBrief(run: ListingFactoryRun, platform: string): GeneratedBrief {
  return (
    run.briefs.find(brief => brief.platform.toLowerCase() === platform.toLowerCase()) ||
    run.briefs.find(brief => run.project.targetPlatforms.some(item => item.toLowerCase() === brief.platform.toLowerCase())) ||
    run.briefs[0]
  );
}

function buildStatus(run: ListingFactoryRun, brief: GeneratedBrief): ProductionHandoffStatus {
  const hasHighRisk = brief.riskLevel === 'high' || brief.riskNotes.length > 0;
  const hasAssets = Array.isArray(run.assets) && run.assets.length > 0;
  const hasAssetPlan = Boolean(
    run.assetPlan && (
      run.assetPlan.requiredImages.length > 0 ||
      run.assetPlan.requiredVideos.length > 0 ||
      run.assetPlan.requiredTextOverlays.length > 0
    ),
  );
  const hasExternalReadyJob = run.videoAssemblyJobs?.some(job => job.status === 'ready_for_provider');

  if (hasHighRisk) return 'needs_brand_review';
  if (!hasAssets && !hasAssetPlan) return 'blocked_missing_assets';
  if (hasExternalReadyJob) return 'ready_for_external_tool';
  return 'spec_ready';
}

function statusLabel(status: ProductionHandoffStatus) {
  const labels: Record<ProductionHandoffStatus, string> = {
    spec_ready: '生产规格已就绪，可交给团队执行',
    ready_for_external_tool: '外部生产工具输入已就绪，等待配置后提交',
    needs_brand_review: '需要先完成品牌安全复核',
    blocked_missing_assets: '缺少素材，先补齐拍摄/图片清单',
  };
  return labels[status];
}

function buildAssetManifest(run: ListingFactoryRun, spec: PlatformProductionSpec): ProductionAssetRequirement[] {
  const sellingPoint = run.project.sellingPoints[0] || '核心卖点';
  const base: ProductionAssetRequirement[] = [
    {
      id: 'product-proof',
      name: '产品证明素材',
      purpose: `证明「${sellingPoint}」不是口号`,
      required: true,
      acceptanceCriteria: '画面能看清产品、使用对象、使用前后关系或关键细节',
    },
    {
      id: 'scenario-shot',
      name: '真实使用场景',
      purpose: `让 ${run.project.targetAudience} 一眼判断是否适合自己`,
      required: true,
      acceptanceCriteria: '场景、人物动作、产品位置明确，不依赖旁白解释',
    },
    {
      id: 'brand-safe-copy',
      name: '品牌安全文案',
      purpose: '避免夸张承诺、敏感词和不可验证表达',
      required: true,
      acceptanceCriteria: '逐条对照品牌禁区，保留可追溯修改记录',
    },
  ];

  if (spec.deliverableType === 'short_video') {
    return [
      ...base,
      {
        id: 'subtitle-master',
        name: '字幕与无字幕母版',
        purpose: '支持多平台二次投放和复剪',
        required: true,
        acceptanceCriteria: '同时交付带字幕版本、无字幕母版、SRT 字幕文件',
      },
    ];
  }

  return [
    ...base,
    {
      id: 'source-layered-file',
      name: '设计源文件',
      purpose: '支持后续 A/B 测试复用同一版式',
      required: true,
      acceptanceCriteria: '交付 PSD/Figma/可编辑源文件，图层命名清晰',
    },
  ];
}

function buildReviewGates(run: ListingFactoryRun, spec: PlatformProductionSpec): ProductionReviewGate[] {
  return [
    {
      id: 'evidence-fit',
      title: '数据证据门禁',
      owner: 'operator',
      mustPass: true,
      checks: [
        'Brief 中的 hook、CTA、卖点能追溯到本轮代表记录或项目卖点',
        `回流指标包含 ${spec.returnMetrics.join(' / ')}`,
        '每个变体只改变一个变量，避免复盘时无法归因',
      ],
    },
    {
      id: 'brand-safety',
      title: '品牌安全门禁',
      owner: 'operator',
      mustPass: true,
      checks: [
        ...run.project.brandGuardrails.slice(0, 3).map(item => `不得出现：${item}`),
        '不使用绝对化、医疗化、无法证明的效果承诺',
      ],
    },
    {
      id: 'platform-fit',
      title: '平台规格门禁',
      owner: spec.deliverableType === 'short_video' ? 'editor' : 'designer',
      mustPass: true,
      checks: [
        `尺寸符合：${spec.dimensions}`,
        `交付格式符合：${spec.exportFormat}`,
        `文件命名符合：${spec.namingPattern}`,
      ],
    },
  ];
}

function buildEvidence(run: ListingFactoryRun, brief: GeneratedBrief) {
  const record = run.performanceRecords
    ?.map(calculatePerformanceMetrics)
    .find(item => item.briefId === brief.id || item.platform === brief.platform) || run.performanceRecords?.[0];
  const calculated = record ? calculatePerformanceMetrics(record) : undefined;
  return [
    `目标人群：${run.project.targetAudience}`,
    `内容目标：${run.project.contentGoal}`,
    `代表 Hook：${brief.hook}`,
    `CTR：${percent(calculated?.ctr)}；ROAS：${roas(calculated?.roas)}；花费：${money(calculated?.cost)}`,
    `决策摘要：${run.experimentDecisionSummary?.summary || run.report?.clientSummary || run.report?.summary || '本地试跑已生成交付包，等待导入更多表现数据回流验证。'}`,
  ];
}

export function buildProductionHandoffPack(run: ListingFactoryRun): ProductionHandoffPack {
  const primaryPlatform = run.project.targetPlatforms[0] || run.briefs[0]?.platform || 'TikTok';
  const brief = pickBrief(run, primaryPlatform);
  const specPlatforms = Array.from(new Set([primaryPlatform, ...run.project.targetPlatforms])).slice(0, 5);
  const platformSpecs = specPlatforms.map(platform => buildSpecForPlatform(platform, run.project.productName));
  const primarySpec = platformSpecs[0];
  const status = buildStatus(run, brief);
  const assetManifest = buildAssetManifest(run, primarySpec);
  const reviewGates = buildReviewGates(run, primarySpec);
  const evidence = buildEvidence(run, brief);
  const nextActions = [
    status === 'needs_brand_review' ? '先完成品牌安全复核，再进入外部生产' : '按交接包补齐素材并进入制作',
    `按 ${primarySpec.namingPattern} 命名成片或图片`,
    `上线后回收 ${primarySpec.returnMetrics.join(' / ')}，再生成下一轮复盘`,
  ];

  const markdown = [
    '## 生产交接包（Production Handoff Pack）',
    `- 当前状态：${statusLabel(status)}`,
    `- 主执行平台：${primarySpec.platform}`,
    `- 主交付类型：${primarySpec.deliverableType}`,
    '',
    '### 数据证据',
    ...evidence.map(item => `- ${item}`),
    '',
    '### 平台交付规格',
    ...platformSpecs.flatMap(spec => [
      `#### ${spec.platform}`,
      `- 交付类型：${spec.deliverableType}`,
      `- 尺寸：${spec.dimensions}`,
      `- 数量/时长：${spec.durationOrCount}`,
      `- 导出格式：${spec.exportFormat}`,
      `- 文件命名：${spec.namingPattern}`,
      `- 回流指标：${spec.returnMetrics.join(' / ')}`,
      `- 文案规则：${spec.copyRules.join('；')}`,
      `- 素材规则：${spec.assetRules.join('；')}`,
    ]),
    '',
    '### 素材清单',
    ...assetManifest.map(item => `- ${item.required ? '必需' : '可选'}｜${item.name}：${item.purpose}。验收：${item.acceptanceCriteria}`),
    '',
    '### 审核门禁',
    ...reviewGates.flatMap(gate => [
      `#### ${gate.title}（${gate.mustPass ? '必须通过' : '建议通过'}）`,
      ...gate.checks.map(check => `- ${check}`),
    ]),
    '',
    '### 下一步动作',
    ...nextActions.map(item => `- ${item}`),
  ].join('\n');

  return {
    status,
    statusLabel: statusLabel(status),
    selectedBrief: {
      id: brief.id,
      platform: brief.platform,
      contentType: brief.contentType,
      hook: brief.hook,
      cta: brief.cta,
    },
    evidence,
    platformSpecs,
    assetManifest,
    reviewGates,
    nextActions,
    markdown,
  };
}
