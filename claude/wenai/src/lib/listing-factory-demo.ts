export type RiskLevel = '低' | '中' | '高';

export interface ListingFactoryOverview {
  skuCount: number;
  categoryRuleCount: number;
  brandRedlineCount: number;
  briefCount: number;
  pocStage: string;
  inquiryCount: number;
  nextAction: string;
  operatorSummary: string;
}

export interface ListingFactorySku {
  name: string;
  category: string;
  targetPlatforms: string[];
  priceBand: string;
  valueProps: string[];
  audience: string;
  assetStatus: string;
}

export interface ListingFactoryRules {
  platformLimits: string[];
  categoryRisks: string[];
  requiredInfo: string[];
  discouragedExpressions: string[];
  ruleImpactOnBrief: string;
  brandSafetySystem: {
    blockedClaims: string[];
    competitorBoundary: string[];
    blockedWords: string[];
    toneBoundary: string;
  };
}

export interface ListingFactoryStep {
  id: string;
  title: string;
  status: string;
  body: string;
  outputs: string[];
}

export interface ListingFactoryBrief {
  id: string;
  platform: string;
  contentType: string;
  hook: string;
  visualDirection: string;
  talkTrack: string;
  cta: string;
  stage: string;
  riskNote: string;
  status: string;
  riskLevel: RiskLevel;
  sku: string;
  category: string;
  reusableStructure: string;
  assetActions: string[];
}

export interface ListingFactoryInsight {
  id: string;
  category: string;
  platform: string;
  contentType: string;
  viralStructure: string;
  hook: string;
  audience: string;
  reusableReason: string;
  skuFit: string;
  riskReminder: string;
  recommendedBriefType: string;
}

export interface ListingFactoryConfig {
  skuOptions: string[];
  platformOptions: string[];
  contentGoals: string[];
  riskPreferences: string[];
  outputScope: string[];
  demoBoundary: string;
}

export interface ListingFactoryReport {
  title: string;
  conclusion: string;
  skuSummary: string;
  categoryRuleJudgement: string;
  brandRedlineSummary: string;
  contentOpportunity: string;
  consultantSummary: string;
  priorities: Array<{ level: 'P0' | 'P1' | 'P2'; action: string; reason: string }>;
  auditAdvice: string[];
  nextCommercialStep: string;
}

export interface ListingFactoryTier {
  name: string;
  subtitle: string;
  bestFor: string;
  productionCapacity: string;
  unlocks: string[];
  cta: string;
  href: string;
}

export interface ListingFactoryCase {
  category: string;
  skuBackground: string;
  categoryRisk: string;
  contentOpportunity: string;
  briefCount: number;
  pocConclusion: string;
  nextStep: string;
}

export interface ListingFactoryKpi {
  label: string;
  value: string;
  note: string;
}

export interface ListingFactoryPipelineCard {
  skuName: string;
  category: string;
  targetPlatform: string;
  stage: '规则识别中' | '品牌安全审核' | 'Brief 生成中' | 'POC 报告完成' | '商务跟进中';
  briefCount: number;
  riskLevel: RiskLevel;
  nextAction: string;
}

export interface ListingFactoryTask {
  id: string;
  briefName: string;
  platform: string;
  contentType: string;
  ownerRole: string;
  status: '待生成' | '待品牌审核' | '可交付' | '已进入报告' | '已归档';
  riskTag: string;
  action: string;
}

export interface ListingFactoryDeliveryPackage {
  customerName: string;
  projectName: string;
  briefCount: number;
  reportStatus: string;
  pendingItems: string[];
  recommendedTier: 'Starter' | 'Growth' | 'Enterprise';
  nextCommercialAction: string;
}

export interface ListingFactoryFactoryOverview {
  kpis: ListingFactoryKpi[];
  todayActions: string[];
}

export interface ListingFactoryBriefFilters {
  platforms: string[];
  contentTypes: string[];
  riskLevels: RiskLevel[];
  statuses: string[];
}

export interface ListingFactoryAdminInquiry {
  company: string;
  sourcePath: string;
  relatedSku: string;
  category: string;
  pocStage: string;
  briefCount: number;
  riskLevel: RiskLevel;
  recommendedTier: 'Starter' | 'Growth' | 'Enterprise';
  expectedMonthlyVolume: string;
  nextCommercialAction: string;
  customerSummary: string;
  trialConclusion: string;
  customerConcerns: string[];
  salesTalkTrack: string;
  quoteDirection: string;
  tierFit: string;
}

export interface ListingFactoryActivity {
  time: string;
  source: string;
  action: string;
  object: string;
}

export interface ListingFactoryGeneratedBriefDraft {
  id: string;
  hook: string;
  platform: string;
  contentType: string;
  sku: string;
  riskLevel: RiskLevel;
  status: '草稿' | '待审核';
}

export interface ListingFactoryPricingRecommendation {
  currentSku: string;
  briefCount: number;
  riskLevel: RiskLevel;
  expectedMonthlyVolume: string;
  recommendedTier: 'Growth';
  reasons: string[];
}

export interface ListingFactoryReviewDashboard {
  sku: string;
  category: string;
  targetPlatforms: string[];
  briefCount: number;
  reportBriefCount: number;
  archivedPackageCount: number;
  recommendedTier: 'Starter' | 'Growth' | 'Enterprise';
  opportunityStage: string;
}

export interface ListingFactoryBriefQualityScore {
  briefId: string;
  title: string;
  contentType: string;
  hookCompleteness: number;
  platformFit: number;
  brandSafety: number;
  ctaClarity: number;
  reusePotential: number;
  overallScore: number;
}

export interface ListingFactoryRiskReviewItem {
  highRiskExpression: string;
  manualReviewPoint: string;
  suggestedReplacement: string;
  productionImpact: string;
}

export interface ListingFactoryClientProject {
  id: string;
  customerName: string;
  projectName: string;
  category: string;
  skuCount: number;
  briefCount: number;
  reportStatus: string;
  deliveryPackageStatus: string;
  recommendedTier: 'Starter' | 'Growth' | 'Enterprise';
  opportunityStage: string;
  nextAction: string;
  projectSummary: string;
  generatedBriefs: string[];
  archivedPackages: string[];
  riskNotes: string[];
  customerReportSummary: string;
  salesTalkTrack: string;
}

export interface ListingFactoryDeliveryPackagePreview {
  pocSummary: string;
  categoryRules: string[];
  brandRedlines: string[];
  briefSamples: string[];
  riskNotes: string[];
  nextSuggestions: string[];
  recommendedTier: 'Starter' | 'Growth' | 'Enterprise';
  customerSummary: string;
}

export interface ListingFactoryCalendarItem {
  day: string;
  platform: string;
  skuOrCategory: string;
  contentType: string;
  hook: string;
  status: '待制作' | '待审核' | '待发布' | '已进入报告';
  riskLevel: RiskLevel;
}

export interface ListingFactoryTeamRole {
  role: string;
  responsibility: string;
  permissions: string[];
}

export interface ListingFactoryWeeklyProductionStats {
  kpis: ListingFactoryKpi[];
  contentTypeDistribution: Array<{ label: string; value: number }>;
  platformDistribution: Array<{ label: string; value: number }>;
  riskDistribution: Array<{ label: string; value: number }>;
}

export interface ListingFactoryAdminReviewLink {
  company: string;
  reviewConclusion: string;
  briefOverallScore: number;
  riskLevel: RiskLevel;
  expectedMonthlyVolume: string;
  quoteDirection: string;
  deliveryPackageSent: boolean;
  nextCommercialAction: string;
}

export interface ListingFactoryNavItem {
  label: string;
  href: string;
}

export interface ListingFactoryNavGroup {
  title: '生产' | '交付' | '商务' | '开始';
  items: ListingFactoryNavItem[];
}

export interface ListingFactoryDemoStep {
  title: string;
  href: string;
  body: string;
}

export interface ListingFactoryFlowNav {
  page: string;
  previousLabel: string;
  previousHref: string;
  nextLabel: string;
  nextHref: string;
}

export const LISTING_FACTORY_SKU: ListingFactorySku = {
  name: '透明抽屉收纳盒 3 件套',
  category: '家居生活 / 收纳整理',
  targetPlatforms: ['TikTok', 'Instagram', '小红书', 'Amazon Listing', 'Shopify'],
  priceBand: '19-29 美元',
  valueProps: ['透明可视', '模块化分区', '适合厨房 / 浴室 / 桌面多场景'],
  audience: '租房、小户型、轻改造家庭和刚开始做居家整理的人群',
  assetStatus: '已有白底图和尺寸图，缺少真实使用场景、对比镜头和 FAQ 素材。',
};

export const LISTING_FACTORY_OVERVIEW: ListingFactoryOverview = {
  skuCount: 12,
  categoryRuleCount: 5,
  brandRedlineCount: 3,
  briefCount: 8,
  pocStage: '类目规则识别完成，等待内容试跑',
  inquiryCount: 2,
  nextAction: '进入 POC 报告，优先试跑痛点转化与对比测评两类内容。',
  operatorSummary:
    '当前 SKU 已完成类目规则识别，发现 3 条品牌禁区，已生成 8 条内容 Brief。建议下一步先试跑痛点转化型内容，并将结果归档到 POC 报告。',
};

export const LISTING_FACTORY_RULES: ListingFactoryRules = {
  platformLimits: [
    'TikTok / Instagram 侧重真实使用场景，避免夸张前后对比。',
    'Amazon Listing 需要规格、材质、尺寸、清洁方式和适用场景完整。',
    '小红书内容要减少硬广语气，优先做购买前自查和场景清单。',
  ],
  categoryRisks: [
    '收纳类容易出现“立刻扩大空间”等绝对化效果承诺。',
    '透明材质需要说明承重、清洁和划痕边界，避免误导预期。',
    '对比竞品时不能直接贬低具体品牌或暗示全场景适用。',
  ],
  requiredInfo: ['外部尺寸和内部可用尺寸', '材质和清洁方式', '适配物品示例', '不适用场景'],
  discouragedExpressions: ['空间翻倍', '所有户型都适合', '行业第一', '永久不变形'],
  ruleImpactOnBrief:
    '这些规则会直接约束 Brief：每条 Hook 必须绑定具体场景，口播要补充尺寸与不适用边界，CTA 优先引导用户先核对空间，而不是立刻下单。',
  brandSafetySystem: {
    blockedClaims: ['保证空间翻倍', '承重无限制', '永久不发黄'],
    competitorBoundary: ['不点名攻击竞品', '只做材质 / 尺寸 / 场景对比', '避免“吊打”“碾压”等表达'],
    blockedWords: ['最强', '第一', '神器', '闭眼买'],
    toneBoundary: '品牌语气保持理性、清楚、可验证，像一个会做上新审核的电商团队，而不是夸张带货号。',
  },
};

export const LISTING_FACTORY_STEPS: ListingFactoryStep[] = [
  {
    id: 'sku',
    title: 'SKU 基础信息',
    status: '已完成',
    body: '商品名、类目、目标平台、价格带、核心卖点和目标人群先进入同一张输入卡。',
    outputs: ['SKU 摘要', '平台目标', '素材缺口'],
  },
  {
    id: 'rules',
    title: '类目规则',
    status: '已完成',
    body: '把平台内容限制、类目常见风险、必须补充信息和不建议表述提前列清楚。',
    outputs: ['内容限制', '风险词', '补充资料'],
  },
  {
    id: 'redlines',
    title: '品牌禁区',
    status: '已完成',
    body: '把不能承诺的效果、不能碰的竞品对比、不能使用的词和品牌语气边界拆开。',
    outputs: ['禁用词', '功效边界', '语气边界'],
  },
  {
    id: 'insights',
    title: '类目灵感',
    status: '可复用',
    body: '从类目洞察里挑选可复用结构，再转成适合当前 SKU 的内容任务。',
    outputs: ['爆款结构', 'Hook', '风险提醒'],
  },
  {
    id: 'briefs',
    title: '批量 Brief',
    status: '已生成',
    body: '把内容策略翻成运营能执行的 Brief，包含画面、口播、CTA、阶段和风险提示。',
    outputs: ['8 条 Brief', '画面建议', 'CTA'],
  },
  {
    id: 'report',
    title: 'POC 与商务推进',
    status: '建议下一步',
    body: '把 Brief 试跑结果沉淀为报告，再进入询盘、套餐判断和正式生产配额解锁。',
    outputs: ['POC 报告', '询盘摘要', '套餐建议'],
  },
];

const commonAssetActions = ['加入 POC 报告', '归档到客户交付包'];

export const LISTING_FACTORY_BRIEFS: ListingFactoryBrief[] = [
  {
    id: 'pain-hook-tiktok',
    platform: 'TikTok',
    contentType: '痛点转化',
    hook: '收纳盒不是越多越好，真正浪费空间的是这 3 个角落。',
    visualDirection: '先拍杂乱抽屉，再用 3 个分区镜头展示改造前后。',
    talkTrack: '围绕厨房小物、浴室备品、桌面线材三个具体场景讲整理逻辑。',
    cta: '保存这套分区清单，先从一个抽屉试起。',
    stage: '上新前 7 天',
    riskNote: '避免承诺“立刻扩大空间”或暗示所有户型都适用。',
    status: '待审核',
    riskLevel: '中',
    sku: LISTING_FACTORY_SKU.name,
    category: LISTING_FACTORY_SKU.category,
    reusableStructure: '痛点场景 -> 三个错误角落 -> 分区示范 -> 尺寸核对提醒',
    assetActions: commonAssetActions,
  },
  {
    id: 'comparison-reel',
    platform: 'Instagram',
    contentType: '对比测评',
    hook: '同样是收纳，为什么透明款更适合高频拿取？',
    visualDirection: '透明款、布艺款、封闭盒三栏对比，突出查找速度和清洁难度。',
    talkTrack: '用真实使用动作解释材质、容量和适用空间，不做贬低竞品表达。',
    cta: '评论你的空间尺寸，领取适配建议。',
    stage: '内容测试第 1 批',
    riskNote: '避免直接点名竞品或使用“最强、第一”等绝对化措辞。',
    status: '可交付',
    riskLevel: '中',
    sku: LISTING_FACTORY_SKU.name,
    category: LISTING_FACTORY_SKU.category,
    reusableStructure: '三栏横评 -> 适合谁 -> 不适合谁 -> 购买前核对',
    assetActions: commonAssetActions,
  },
  {
    id: 'faq-xhs',
    platform: '小红书',
    contentType: 'FAQ 回应',
    hook: '收纳盒买回家闲置，通常不是产品问题，而是尺寸没算对。',
    visualDirection: '用 4 张图拆解测量、分类、预留空间和标签位置。',
    talkTrack: '把常见退货原因变成购买前自查表。',
    cta: '截图这张尺寸表，下单前核对一次。',
    stage: '详情页补充内容',
    riskNote: '避免承诺降低退货率，只表达“减少尺寸误判”。',
    status: '可交付',
    riskLevel: '低',
    sku: LISTING_FACTORY_SKU.name,
    category: LISTING_FACTORY_SKU.category,
    reusableStructure: '购买前疑问 -> 自查步骤 -> 不适用提醒 -> 保存清单',
    assetActions: commonAssetActions,
  },
  {
    id: 'amazon-listing',
    platform: 'Amazon',
    contentType: 'FAQ 回应',
    hook: 'One organizer, three daily zones.',
    visualDirection: '横向展示 kitchen / bathroom / desk 三个使用区。',
    talkTrack: '用规格、材质、清洁方式和适配物品支撑卖点。',
    cta: 'Check size before purchase.',
    stage: 'Listing 上架',
    riskNote: '避免医疗、儿童安全、环保认证等未提供证明的宣称。',
    status: '已归档',
    riskLevel: '低',
    sku: LISTING_FACTORY_SKU.name,
    category: LISTING_FACTORY_SKU.category,
    reusableStructure: '场景标题 -> 规格信息 -> 使用区 -> 尺寸核对',
    assetActions: commonAssetActions,
  },
  {
    id: 'shopify-bundle',
    platform: 'Shopify',
    contentType: '痛点转化',
    hook: '先整理最常用的 20% 物品，家里会先安静下来。',
    visualDirection: '展示 3 件套从拆箱到上墙 / 入柜的连续过程。',
    talkTrack: '强调使用顺序和组合逻辑，减少客户不知道怎么买的问题。',
    cta: '从入门套装开始，不需要一次买全。',
    stage: '首批转化页',
    riskNote: '避免使用心理疗愈、治愈焦虑等不可证明表述。',
    status: '待审核',
    riskLevel: '中',
    sku: LISTING_FACTORY_SKU.name,
    category: LISTING_FACTORY_SKU.category,
    reusableStructure: '轻负担整理 -> 入门套装 -> 组合逻辑 -> 下一步购买',
    assetActions: commonAssetActions,
  },
  {
    id: 'creator-script',
    platform: 'TikTok',
    contentType: '达人种草',
    hook: '我以为家里乱是东西太多，后来发现是拿取路径错了。',
    visualDirection: '达人第一人称开箱，展示 30 秒内完成一个区域整理。',
    talkTrack: '口播围绕真实困扰、试用过程、适合谁、不适合谁。',
    cta: '看评论区的尺寸建议，不确定先别买大套装。',
    stage: '达人合作试跑',
    riskNote: '避免伪造使用前后效果，必须标注演示场景。',
    status: '草稿',
    riskLevel: '高',
    sku: LISTING_FACTORY_SKU.name,
    category: LISTING_FACTORY_SKU.category,
    reusableStructure: '达人困扰 -> 试用动作 -> 适合边界 -> 谨慎 CTA',
    assetActions: commonAssetActions,
  },
  {
    id: 'retarget-faq',
    platform: 'Instagram',
    contentType: '评论区回应',
    hook: '如果你卡在“买哪种尺寸”，先看这 4 个问题。',
    visualDirection: '用问答卡片展示深度、宽度、高度和分类数量。',
    talkTrack: '回答犹豫用户最常见的尺寸与清洁问题。',
    cta: '把你的抽屉尺寸发给客服，先确认再下单。',
    stage: '再营销',
    riskNote: '避免保证适配所有家具尺寸。',
    status: '可交付',
    riskLevel: '低',
    sku: LISTING_FACTORY_SKU.name,
    category: LISTING_FACTORY_SKU.category,
    reusableStructure: '评论区问题 -> 四个核对项 -> 客服承接 -> 再营销 CTA',
    assetActions: commonAssetActions,
  },
  {
    id: 'boss-summary',
    platform: '内部汇报',
    contentType: 'FAQ 回应',
    hook: '这批 SKU 不是缺文案，而是缺规则、禁区和第一批可测试 Brief。',
    visualDirection: '用一页表格展示规则通过、风险、内容角度和下一步。',
    talkTrack: '说明为什么先做 8 条 Brief，而不是直接扩大生产。',
    cta: '批准 10 SKU 试跑，并在 7 天后复盘是否扩量。',
    stage: 'POC 报告',
    riskNote: '明确这是演示数据，不伪装成真实投放结果。',
    status: '已归档',
    riskLevel: '低',
    sku: LISTING_FACTORY_SKU.name,
    category: LISTING_FACTORY_SKU.category,
    reusableStructure: '管理摘要 -> 风险边界 -> 试跑范围 -> 扩量判断',
    assetActions: commonAssetActions,
  },
];

export const LISTING_FACTORY_INSIGHTS: ListingFactoryInsight[] = [
  {
    id: 'beauty-before-after',
    category: '美妆个护',
    platform: '小红书',
    contentType: '痛点转化',
    viralStructure: '痛点场景 -> 成分边界 -> 使用步骤 -> 适合人群',
    hook: '不是所有暗沉都该用猛料，先看你是哪一种使用场景。',
    audience: '敏感肌和新手护肤用户',
    reusableReason: '可复用为成分解释、使用前自查和客服 FAQ 三类 Brief。',
    skuFit: '有明确成分、用法和禁忌说明的护肤 SKU。',
    riskReminder: '避免治疗、修复疾病、永久改善等功效承诺。',
    recommendedBriefType: '成分边界 FAQ Brief',
  },
  {
    id: 'pet-daily-routine',
    category: '宠物用品',
    platform: 'TikTok',
    contentType: '达人种草',
    viralStructure: '一天中的真实使用 -> 宠物反应 -> 主人省事点 -> 购买提醒',
    hook: '养宠家庭最怕的不是脏，是每天重复清理同一个地方。',
    audience: '养猫养狗的一二线城市年轻家庭',
    reusableReason: '可复用为清洁、喂养、出行多个宠物 SKU 的生活流 Brief。',
    skuFit: '能展示真实使用过程，且不需要医学效果证明的宠物用品。',
    riskReminder: '避免暗示替代兽医建议或承诺行为改善。',
    recommendedBriefType: '真实使用日记 Brief',
  },
  {
    id: 'home-comparison',
    category: '家居生活',
    platform: 'Instagram',
    contentType: '对比测评',
    viralStructure: '三类产品横评 -> 适合谁 -> 不适合谁 -> 尺寸提醒',
    hook: '同样是收纳，透明款、布艺款、封闭款到底差在哪？',
    audience: '租房和小户型家庭',
    reusableReason: '可复用为材质、尺寸、容量和场景对比型 Brief。',
    skuFit: '有明确规格、材质、使用场景的家居 SKU。',
    riskReminder: '避免直接贬低竞品或使用第一、最强等绝对化表达。',
    recommendedBriefType: '对比测评 Brief',
  },
  {
    id: 'food-faq',
    category: '食品饮料',
    platform: 'Amazon',
    contentType: 'FAQ 回应',
    viralStructure: '口味疑问 -> 配料解释 -> 食用方式 -> 保存建议',
    hook: '买前最该确认的不是口味，而是你打算怎么吃。',
    audience: '尝鲜用户和礼品购买用户',
    reusableReason: '可复用为详情页 FAQ、客服回复和图文卡片。',
    skuFit: '配料、过敏原、保存方式信息完整的食品 SKU。',
    riskReminder: '避免健康疗效、减脂、治疗和未经证明的营养承诺。',
    recommendedBriefType: '购买前 FAQ Brief',
  },
  {
    id: 'electronics-use-case',
    category: '3C 配件',
    platform: 'Shopify',
    contentType: 'FAQ 回应',
    viralStructure: '设备痛点 -> 连接步骤 -> 使用场景 -> 兼容边界',
    hook: '别先看参数，先确认它能不能接上你手里的设备。',
    audience: '办公、桌搭和轻户外用户',
    reusableReason: '可复用为兼容清单、开箱脚本和详情页模块。',
    skuFit: '有清晰兼容型号、接口、功率或安全认证的 3C 配件。',
    riskReminder: '避免未验证兼容、夸大安全性或省略认证要求。',
    recommendedBriefType: '兼容清单 Brief',
  },
];

export const LISTING_FACTORY_CONFIG: ListingFactoryConfig = {
  skuOptions: [LISTING_FACTORY_SKU.name, '敏感肌旅行装护肤套组', '宠物慢食碗', 'USB-C 多口扩展坞'],
  platformOptions: LISTING_FACTORY_SKU.targetPlatforms,
  contentGoals: ['上新', '转化', '种草', '清库存', '达人合作'],
  riskPreferences: ['保守', '平衡', '激进'],
  outputScope: ['规则报告', '品牌禁区', '批量 Brief', '商务建议', 'Pricing 建议'],
  demoBoundary: '当前为公开演示试跑，正式版可保存真实 SKU、扩展规则库、生成更多内容资产，并关联团队权限与商务记录。',
};

export const LISTING_FACTORY_REPORT: ListingFactoryReport = {
  title: 'POC 试跑交付报告',
  conclusion: '该 SKU 适合进入第一轮内容试跑，但需要避开绝对化功效承诺，并优先测试痛点转化与对比测评方向。',
  skuSummary:
    '透明抽屉收纳盒 3 件套适合在 TikTok / Instagram / 小红书做场景内容，在 Amazon / Shopify 承接规格和购买前 FAQ。',
  categoryRuleJudgement:
    '类目规则整体可控，核心风险集中在尺寸误导、效果夸张和竞品对比边界。Brief 需要强制补充尺寸、材质、清洁方式和不适用场景。',
  brandRedlineSummary:
    '已识别 3 类品牌禁区：绝对化空间效果、未经验证的承重 / 耐用承诺、攻击式竞品对比。',
  contentOpportunity:
    '第一轮建议以“痛点转化 + 对比测评 + FAQ 回应”作为内容组合，先验证用户是否理解尺寸和场景价值，再决定是否扩展达人脚本。',
  consultantSummary:
    '本轮试跑已为该 SKU 完成类目规则识别、品牌禁区梳理和 8 条内容 Brief 生成。建议第一阶段优先测试痛点转化与对比测评两类内容，避免使用绝对化功效承诺，并在确认素材方向后进入正式批量生产。',
  priorities: [
    { level: 'P0', action: '先测试 2 条痛点转化 Brief。', reason: '最快验证用户是否理解“先核对尺寸再购买”的核心信息。' },
    { level: 'P1', action: '扩展对比测评和 FAQ 回应。', reason: '用材质、容量和场景边界减少误解，提升详情页和客服承接质量。' },
    { level: 'P2', action: '确认素材方向后进入正式批量生产。', reason: '当首批内容角度被验证，再扩展多平台 Brief 和达人脚本更稳。' },
  ],
  auditAdvice: [
    '所有对比内容只比较材质、尺寸、使用场景，不攻击具体竞品。',
    '所有 Hook 避免“最强、第一、空间翻倍”等绝对化表达。',
    '上线前由运营或品牌负责人复核规格、尺寸和不适用场景。',
  ],
  nextCommercialStep:
    '建议带着本报告进入咨询：确认月度 SKU 数、内容量、品牌禁区库范围和正式生产方案。',
};

export const LISTING_FACTORY_TIERS: ListingFactoryTier[] = [
  {
    name: 'Free / Demo',
    subtitle: '公开试跑，不保存真实项目',
    bestFor: '第一次评估 Wenai 是否适合上新流程',
    productionCapacity: '1 个演示 SKU，有限 Brief，样例报告',
    unlocks: ['公开试跑', '样例报告', '有限 Brief', '演示数据边界说明'],
    cta: '开始公开试跑',
    href: '/pipelines/new-listing',
  },
  {
    name: 'Starter',
    subtitle: '单 SKU / 小团队上新准备',
    bestFor: '每周少量上新的跨境运营或小品牌',
    productionCapacity: '单 SKU 规则、品牌禁区、首批内容 Brief',
    unlocks: ['上新规则卡', '品牌禁区清单', '6-12 条 Brief', 'POC 摘要'],
    cta: '选择 Starter',
    href: '/inquire?from=pricing-starter',
  },
  {
    name: 'Growth',
    subtitle: '多 SKU 批量内容生产',
    bestFor: '有稳定上新节奏的电商团队和代运营',
    productionCapacity: '多 SKU 批量 Brief、POC 报告、团队协作和商务推进',
    unlocks: ['批量 Brief 工厂', '内容工厂控制台', 'Brief 资产库', 'POC 报告', '团队协作'],
    cta: '选择 Growth',
    href: '/inquire?from=pricing-growth',
  },
  {
    name: 'Enterprise',
    subtitle: '品牌方 / 代理商 / 多团队规则库',
    bestFor: '需要统一品牌安全、类目知识和多团队权限的组织',
    productionCapacity: '品牌规则库、类目洞察库、后台 Inquiry、客户交付包和定制交付',
    unlocks: ['品牌规则库', '类目洞察库', '商务推进后台', '权限管理', '定制交付'],
    cta: '咨询 Enterprise',
    href: '/inquire?from=pricing-enterprise',
  },
];

export const LISTING_FACTORY_CASES: ListingFactoryCase[] = [
  {
    category: '美妆个护',
    skuBackground: '敏感肌旅行装护肤套组，已有成分表和使用步骤，但缺少场景内容。',
    categoryRisk: '容易触碰治疗、修复疾病、永久改善等功效承诺。',
    contentOpportunity: '用成分边界和使用前自查降低误解，生成 FAQ 与小红书图文 Brief。',
    briefCount: 8,
    pocConclusion: '适合先试跑 FAQ 回应和痛点转化，不建议直接做夸张前后对比。',
    nextStep: '用类似案例开始试跑，先验证成分解释是否足够清楚。',
  },
  {
    category: '宠物用品',
    skuBackground: '宠物慢食碗，卖点明确但需要真实日常使用素材。',
    categoryRisk: '不能暗示替代兽医建议，也不能承诺行为改善。',
    contentOpportunity: '用一天中的真实使用流程做种草短视频和达人脚本。',
    briefCount: 7,
    pocConclusion: '适合走生活流内容，先避开健康功效和行为治疗表达。',
    nextStep: '用类似案例开始试跑，补齐主人视角素材。',
  },
  {
    category: '家居生活',
    skuBackground: '透明抽屉收纳盒 3 件套，规格完整但缺少多场景内容。',
    categoryRisk: '尺寸误导、空间效果夸张和竞品对比边界。',
    contentOpportunity: '用痛点转化、对比测评和购买前 FAQ 形成首批内容组合。',
    briefCount: 8,
    pocConclusion: '适合进入第一轮内容试跑，建议先测痛点转化。',
    nextStep: '用类似案例开始试跑，并沉淀到 POC 报告。',
  },
  {
    category: '食品饮料',
    skuBackground: '低糖冲饮礼盒，配料和保存方式完整，但口味疑问多。',
    categoryRisk: '不能承诺减脂、治疗、健康改善或未经证明的营养效果。',
    contentOpportunity: '把配料解释、食用方式和保存建议做成详情页 FAQ。',
    briefCount: 6,
    pocConclusion: '适合先做购买前 FAQ 和礼品场景，不建议强调健康疗效。',
    nextStep: '用类似案例开始试跑，先补过敏原和保存信息。',
  },
  {
    category: '3C 配件',
    skuBackground: 'USB-C 多口扩展坞，参数齐全但兼容边界复杂。',
    categoryRisk: '容易出现未验证兼容、夸大安全性、省略认证要求。',
    contentOpportunity: '用兼容清单、开箱步骤和办公场景说明降低售前疑问。',
    briefCount: 9,
    pocConclusion: '适合先跑兼容清单 Brief，再扩展短视频开箱。',
    nextStep: '用类似案例开始试跑，先确认设备型号和认证信息。',
  },
];

export const LISTING_FACTORY_FACTORY_OVERVIEW: ListingFactoryFactoryOverview = {
  kpis: [
    { label: '当前 SKU 数', value: '24', note: '含 12 个试跑 SKU 与 12 个待排期 SKU' },
    { label: '进行中的上新流水线', value: '5', note: '覆盖家居、美妆、宠物、食品、3C' },
    { label: '已识别类目规则', value: '31', note: '规则会约束后续 Brief 与报告' },
    { label: '已识别品牌禁区', value: '14', note: '禁止词、功效边界、竞品边界' },
    { label: '已生成 Brief', value: '46', note: '其中 18 条可交付，11 条待审核' },
    { label: '待交付内容任务', value: '9', note: '本周需要进入客户交付包' },
    { label: '待商务跟进询盘', value: '4', note: '来自报告、Pricing、Cases 与 Pipeline' },
  ],
  todayActions: [
    '先审核宠物用品 SKU 的品牌禁区，避免暗示替代兽医建议。',
    '将美妆类目的痛点转化 Brief 推入 POC 报告，补充成分边界。',
    '把已完成的 8 条收纳 Brief 归档到客户交付包，准备 Growth 报价。',
    '对家居类目新增 FAQ 回应内容角度，减少尺寸误判。',
  ],
};

export const LISTING_FACTORY_PIPELINE_BOARD: ListingFactoryPipelineCard[] = [
  {
    skuName: '敏感肌旅行装护肤套组',
    category: '美妆个护',
    targetPlatform: '小红书 / Shopify',
    stage: '规则识别中',
    briefCount: 4,
    riskLevel: '高',
    nextAction: '补充成分边界和禁用功效词。',
  },
  {
    skuName: '宠物慢食碗',
    category: '宠物用品',
    targetPlatform: 'TikTok',
    stage: '品牌安全审核',
    briefCount: 7,
    riskLevel: '中',
    nextAction: '复核兽医建议边界和行为改善表述。',
  },
  {
    skuName: LISTING_FACTORY_SKU.name,
    category: '家居生活',
    targetPlatform: 'Instagram / Amazon',
    stage: 'Brief 生成中',
    briefCount: 8,
    riskLevel: '中',
    nextAction: '生成 FAQ 回应与评论区回应 Brief。',
  },
  {
    skuName: '低糖冲饮礼盒',
    category: '食品饮料',
    targetPlatform: 'Amazon',
    stage: 'POC 报告完成',
    briefCount: 6,
    riskLevel: '高',
    nextAction: '把健康承诺风险写入客户汇报摘要。',
  },
  {
    skuName: 'USB-C 多口扩展坞',
    category: '3C 配件',
    targetPlatform: 'Shopify / TikTok',
    stage: '商务跟进中',
    briefCount: 9,
    riskLevel: '中',
    nextAction: '确认 Enterprise 是否需要兼容规则库。',
  },
];

export const LISTING_FACTORY_TASK_QUEUE: ListingFactoryTask[] = [
  { id: 'task-1', briefName: '收纳痛点转化短视频', platform: 'TikTok', contentType: '痛点转化', ownerRole: '内容运营', status: '待品牌审核', riskTag: '空间效果边界', action: '推进到下一步' },
  { id: 'task-2', briefName: '宠物真实使用日记', platform: 'TikTok', contentType: '达人种草', ownerRole: '达人协作', status: '待生成', riskTag: '兽医建议边界', action: '查看 Brief' },
  { id: 'task-3', briefName: '护肤成分边界 FAQ', platform: '小红书', contentType: 'FAQ 回应', ownerRole: '品牌审核', status: '可交付', riskTag: '功效承诺', action: '加入报告' },
  { id: 'task-4', briefName: '扩展坞兼容清单', platform: 'Shopify', contentType: 'FAQ 回应', ownerRole: '商品运营', status: '已进入报告', riskTag: '兼容认证', action: '加入报告' },
  { id: 'task-5', briefName: '食品礼盒购买前 FAQ', platform: 'Amazon', contentType: 'FAQ 回应', ownerRole: '详情页运营', status: '可交付', riskTag: '健康疗效', action: '加入报告' },
  { id: 'task-6', briefName: '收纳评论区尺寸回应', platform: 'Instagram', contentType: '评论区回应', ownerRole: '客服协同', status: '待生成', riskTag: '尺寸适配', action: '查看 Brief' },
];

export const LISTING_FACTORY_TASK_STATUS_FLOW: ListingFactoryTask['status'][] = [
  '待生成',
  '待品牌审核',
  '可交付',
  '已进入报告',
  '已归档',
];

export const LISTING_FACTORY_ACTIVITY_FEED: ListingFactoryActivity[] = [
  { time: '09:30', source: '类目洞察库', action: '生成 3 条美妆 Brief 草稿', object: '成分边界 FAQ 结构' },
  { time: '09:45', source: 'Brief 资产库', action: '将痛点转化 Brief 加入 POC 报告', object: '收纳痛点转化短视频' },
  { time: '10:10', source: '内容任务队列', action: '完成品牌禁区审核', object: '宠物真实使用日记' },
  { time: '10:35', source: '客户交付包', action: '进入商务跟进', object: '家居收纳 Q2 上新包' },
  { time: '11:00', source: 'Pricing 推荐', action: '推荐 Growth 方案给客户', object: 'ListingHome' },
];

export const LISTING_FACTORY_GENERATED_BRIEF_DRAFTS: ListingFactoryGeneratedBriefDraft[] = [
  {
    id: 'draft-ingredient-faq',
    hook: '先看成分边界，再决定这支产品适不适合你的使用场景。',
    platform: '小红书',
    contentType: 'FAQ 回应',
    sku: '敏感肌旅行装护肤套组',
    riskLevel: '中',
    status: '草稿',
  },
  {
    id: 'draft-pet-routine',
    hook: '养宠家庭真正省事的，不是少清理，而是少重复清理同一个地方。',
    platform: 'TikTok',
    contentType: '达人种草',
    sku: '宠物慢食碗',
    riskLevel: '中',
    status: '待审核',
  },
  {
    id: 'draft-home-comparison',
    hook: '同样是收纳，透明款更适合高频拿取的三个场景。',
    platform: 'Instagram',
    contentType: '对比测评',
    sku: LISTING_FACTORY_SKU.name,
    riskLevel: '低',
    status: '草稿',
  },
];

export const LISTING_FACTORY_DELIVERY_PACKAGES: ListingFactoryDeliveryPackage[] = [
  {
    customerName: 'ListingHome',
    projectName: '家居收纳 Q2 上新包',
    briefCount: 8,
    reportStatus: 'POC 报告已完成',
    pendingItems: ['确认真实场景素材', '复核尺寸图', '选择首批投放平台'],
    recommendedTier: 'Growth',
    nextCommercialAction: '确认月度 30 SKU 与 80 条内容 Brief 生产范围。',
  },
  {
    customerName: 'PetLoop',
    projectName: '宠物用品试跑包',
    briefCount: 7,
    reportStatus: '风险审核中',
    pendingItems: ['补充宠物真实使用素材', '确认禁用功效承诺'],
    recommendedTier: 'Starter',
    nextCommercialAction: '确认是否先以单 SKU 跑完品牌禁区库。',
  },
  {
    customerName: 'C-Port',
    projectName: '3C 配件兼容内容包',
    briefCount: 9,
    reportStatus: '客户已看报告',
    pendingItems: ['确认认证文件', '补充设备兼容表'],
    recommendedTier: 'Enterprise',
    nextCommercialAction: '确认多团队权限、兼容规则库和商务后台交付方式。',
  },
];

export const LISTING_FACTORY_BRIEF_FILTERS: ListingFactoryBriefFilters = {
  platforms: ['TikTok', 'Instagram', '小红书', 'Amazon', 'Shopify'],
  contentTypes: ['痛点转化', '对比测评', 'FAQ 回应', '达人种草', '评论区回应'],
  riskLevels: ['低', '中', '高'],
  statuses: ['草稿', '待审核', '可交付', '已归档'],
};

export const LISTING_FACTORY_ADMIN_INQUIRIES: ListingFactoryAdminInquiry[] = [
  {
    company: 'ListingHome',
    sourcePath: '/poc/report',
    relatedSku: LISTING_FACTORY_SKU.name,
    category: '家居生活',
    pocStage: 'POC 报告完成',
    briefCount: 8,
    riskLevel: '中',
    recommendedTier: 'Growth',
    expectedMonthlyVolume: '60-120 条内容',
    nextCommercialAction: '确认月度 SKU 数、内容量和客户交付包格式。',
    customerSummary: '客户已看到收纳类试跑报告，希望把 8 条 Brief 扩展成多平台内容包。',
    trialConclusion: LISTING_FACTORY_REPORT.conclusion,
    customerConcerns: ['尺寸误导风险', '素材不够真实', '团队是否能复用 Brief'],
    salesTalkTrack: '本轮不是承诺爆款，而是先把规则、禁区、Brief 和交付报告标准化，再决定扩量。',
    quoteDirection: '建议 Growth：按月度 SKU 数与 Brief 量报价，包含 POC 报告和客户交付包。',
    tierFit: '适合 Growth，后续如多品牌共用规则库再升级 Enterprise。',
  },
  {
    company: 'PetLoop',
    sourcePath: '/pipelines/new-listing',
    relatedSku: '宠物慢食碗',
    category: '宠物用品',
    pocStage: '品牌安全审核',
    briefCount: 7,
    riskLevel: '中',
    recommendedTier: 'Starter',
    expectedMonthlyVolume: '8 SKU / 20 条内容',
    nextCommercialAction: '确认是否需要先建立宠物类品牌禁区库。',
    customerSummary: '客户关心宠物用品不能碰的功效边界，希望先跑一个 SKU。',
    trialConclusion: '适合先走生活流内容，避开健康功效和行为治疗表达。',
    customerConcerns: ['兽医建议边界', '达人脚本审核', '素材真实性'],
    salesTalkTrack: '先用 Starter 把一个 SKU 的禁区和 Brief 跑顺，再扩到更多宠物类目。',
    quoteDirection: '建议 Starter：单 SKU 试跑 + 品牌禁区清单 + 6-12 条 Brief。',
    tierFit: '适合 Starter 起步。',
  },
  {
    company: 'C-Port',
    sourcePath: '/pricing',
    relatedSku: 'USB-C 多口扩展坞',
    category: '3C 配件',
    pocStage: '商务跟进中',
    briefCount: 9,
    riskLevel: '中',
    recommendedTier: 'Enterprise',
    expectedMonthlyVolume: '60 SKU / 160 条内容',
    nextCommercialAction: '确认兼容规则库、权限管理和后台 Inquiry 流程。',
    customerSummary: '客户来自 Pricing，关注多 SKU 兼容信息如何被统一管理。',
    trialConclusion: '适合建立兼容清单和详情页模块，再进入多团队生产。',
    customerConcerns: ['认证资料', '兼容型号', '多团队审核'],
    salesTalkTrack: 'Enterprise 的价值在于把兼容规则库和商务推进后台接到同一条生产线。',
    quoteDirection: '建议 Enterprise：按规则库、SKU 批次和团队席位组合报价。',
    tierFit: '适合 Enterprise。',
  },
];

export const LISTING_FACTORY_PRICING_RECOMMENDATION: ListingFactoryPricingRecommendation = {
  currentSku: LISTING_FACTORY_SKU.name,
  briefCount: LISTING_FACTORY_OVERVIEW.briefCount,
  riskLevel: '中',
  expectedMonthlyVolume: '60-120 条内容',
  recommendedTier: 'Growth',
  reasons: ['多 SKU 批量上新', '需要品牌禁区库', '需要 Brief 资产沉淀', '需要商务推进后台'],
};

export const LISTING_FACTORY_INQUIRY_STAGE_FLOW = [
  '新询盘',
  '已看 POC 报告',
  '已推荐套餐',
  '待确认预算',
  '可进入正式生产',
] as const;

export const LISTING_FACTORY_REVIEW_DASHBOARD: ListingFactoryReviewDashboard = {
  sku: LISTING_FACTORY_SKU.name,
  category: LISTING_FACTORY_SKU.category,
  targetPlatforms: LISTING_FACTORY_SKU.targetPlatforms.slice(0, 4),
  briefCount: LISTING_FACTORY_OVERVIEW.briefCount,
  reportBriefCount: 4,
  archivedPackageCount: 3,
  recommendedTier: 'Growth',
  opportunityStage: '已推荐套餐',
};

export const LISTING_FACTORY_BRIEF_QUALITY_SCORES: ListingFactoryBriefQualityScore[] = [
  {
    briefId: 'pain-hook-tiktok',
    title: '收纳痛点转化短视频',
    contentType: '痛点转化',
    hookCompleteness: 88,
    platformFit: 84,
    brandSafety: 78,
    ctaClarity: 86,
    reusePotential: 90,
    overallScore: 85,
  },
  {
    briefId: 'comparison-reel',
    title: '透明收纳对比测评',
    contentType: '对比测评',
    hookCompleteness: 82,
    platformFit: 86,
    brandSafety: 74,
    ctaClarity: 80,
    reusePotential: 84,
    overallScore: 81,
  },
  {
    briefId: 'faq-xhs',
    title: '购买前尺寸 FAQ',
    contentType: 'FAQ 回应',
    hookCompleteness: 80,
    platformFit: 88,
    brandSafety: 92,
    ctaClarity: 84,
    reusePotential: 87,
    overallScore: 86,
  },
  {
    briefId: 'creator-script',
    title: '达人真实使用脚本',
    contentType: '达人种草',
    hookCompleteness: 76,
    platformFit: 83,
    brandSafety: 70,
    ctaClarity: 78,
    reusePotential: 79,
    overallScore: 77,
  },
  {
    briefId: 'retarget-faq',
    title: '评论区尺寸回应',
    contentType: '评论区回应',
    hookCompleteness: 84,
    platformFit: 81,
    brandSafety: 90,
    ctaClarity: 88,
    reusePotential: 82,
    overallScore: 85,
  },
];

export const LISTING_FACTORY_RISK_REVIEW_ITEMS: ListingFactoryRiskReviewItem[] = [
  {
    highRiskExpression: '立刻扩大空间',
    manualReviewPoint: '容易被理解为绝对化效果承诺，需要回到具体抽屉尺寸和使用场景。',
    suggestedReplacement: '先把一个高频抽屉分成 3 个区域，再判断是否适合整套扩展。',
    productionImpact: '不影响正式生产，但所有痛点转化 Brief 上线前需要品牌复核。',
  },
  {
    highRiskExpression: '吊打布艺款',
    manualReviewPoint: '竞品对比语气过强，可能触碰品牌安全边界。',
    suggestedReplacement: '透明款更适合高频拿取，布艺款更适合低频收纳。',
    productionImpact: '对比测评可保留，但需要改成中性三栏横评。',
  },
  {
    highRiskExpression: '永久不发黄',
    manualReviewPoint: '耐用性承诺缺少材料证明。',
    suggestedReplacement: '日常清洁更容易观察污渍，建议按材质说明定期护理。',
    productionImpact: '影响 Amazon Listing 文案，需要补充材料与清洁说明。',
  },
];

export const LISTING_FACTORY_PRODUCTION_RECOMMENDATIONS = [
  '保留痛点转化结构，围绕厨房、浴室、桌面扩展 20 条变体。',
  '对比测评类内容需要降低绝对化承诺，改成材质、尺寸和适用场景横评。',
  'FAQ 回应适合进入客服内容库，优先沉淀为购买前尺寸自查清单。',
  '达人种草脚本适合进入第二轮试跑，但上线前需要标注演示场景。',
];

export const LISTING_FACTORY_DELIVERY_PACKAGE: ListingFactoryDeliveryPackagePreview = {
  pocSummary: '本轮 POC 已完成家居收纳 SKU 的类目规则、品牌禁区、8 条 Brief 和商务建议整理。',
  categoryRules: LISTING_FACTORY_RULES.platformLimits.slice(0, 3),
  brandRedlines: LISTING_FACTORY_RULES.brandSafetySystem.blockedClaims,
  briefSamples: LISTING_FACTORY_BRIEFS.slice(0, 3).map(brief => brief.hook),
  riskNotes: LISTING_FACTORY_RISK_REVIEW_ITEMS.map(item => item.manualReviewPoint),
  nextSuggestions: LISTING_FACTORY_PRODUCTION_RECOMMENDATIONS.slice(0, 3),
  recommendedTier: 'Growth',
  customerSummary:
    '本轮试跑已确认该 SKU 适合进入第一批内容生产。建议先扩展痛点转化、对比测评和 FAQ 回应三类 Brief，并把品牌禁区作为正式生产前的审核护栏。',
};

export const LISTING_FACTORY_CLIENT_PROJECTS: ListingFactoryClientProject[] = [
  {
    id: 'listinghome-q2',
    customerName: 'ListingHome',
    projectName: '家居收纳 Q2 上新项目',
    category: '家居生活',
    skuCount: 12,
    briefCount: 28,
    reportStatus: 'POC 报告已完成',
    deliveryPackageStatus: '交付包预览已生成',
    recommendedTier: 'Growth',
    opportunityStage: '已推荐套餐',
    nextAction: '确认 60-120 条内容的正式生产范围。',
    projectSummary: '围绕透明抽屉收纳、桌面整理和厨房小物三类 SKU，建立规则、禁区、Brief 和交付包。',
    generatedBriefs: ['收纳痛点转化短视频', '透明收纳对比测评', '购买前尺寸 FAQ'],
    archivedPackages: ['家居收纳 POC 报告', '客户汇报摘要', '首批 Brief 样例'],
    riskNotes: ['避免绝对化空间效果承诺', '竞品对比改成材质和场景横评'],
    customerReportSummary: LISTING_FACTORY_DELIVERY_PACKAGE.customerSummary,
    salesTalkTrack: 'Growth 适合把 8 条样例 Brief 扩展为多 SKU、多平台内容生产线。',
  },
  {
    id: 'petloop-trial',
    customerName: 'PetLoop',
    projectName: '宠物用品品牌安全试跑',
    category: '宠物用品',
    skuCount: 6,
    briefCount: 14,
    reportStatus: '风险复核中',
    deliveryPackageStatus: '待补充真实素材',
    recommendedTier: 'Starter',
    opportunityStage: '已看 POC 报告',
    nextAction: '确认是否先建立宠物类品牌禁区库。',
    projectSummary: '先用慢食碗和清洁用品跑通兽医建议边界、达人脚本审核和生活流内容。',
    generatedBriefs: ['宠物真实使用日记', '慢食碗 FAQ', '清洁用品场景脚本'],
    archivedPackages: ['宠物用品风险清单'],
    riskNotes: ['避免替代兽医建议', '避免承诺行为改善'],
    customerReportSummary: '本轮建议先保守推进生活流内容，确认禁区后再扩展达人脚本。',
    salesTalkTrack: 'Starter 可以先跑单 SKU，降低宠物类功效承诺风险。',
  },
  {
    id: 'cport-enterprise',
    customerName: 'C-Port',
    projectName: '3C 兼容规则库项目',
    category: '3C 配件',
    skuCount: 30,
    briefCount: 64,
    reportStatus: '客户已看报告',
    deliveryPackageStatus: '已发送客户摘要',
    recommendedTier: 'Enterprise',
    opportunityStage: '待确认预算',
    nextAction: '确认兼容规则库、权限和后台商务推进方式。',
    projectSummary: '围绕 USB-C、扩展坞和充电配件建立兼容清单、认证边界和详情页 FAQ。',
    generatedBriefs: ['扩展坞兼容清单', '办公场景 FAQ', '认证资料说明'],
    archivedPackages: ['3C 兼容 POC 报告', 'Enterprise 报价方向'],
    riskNotes: ['未验证兼容型号不能承诺', '认证资料需要客户补充'],
    customerReportSummary: '建议以 Enterprise 建立跨团队规则库，避免多 SKU 兼容信息反复返工。',
    salesTalkTrack: 'Enterprise 的价值在于把兼容规则库、团队权限和商务后台接在一起。',
  },
];

export const LISTING_FACTORY_CONTENT_CALENDAR: ListingFactoryCalendarItem[] = [
  { day: 'D1 周一', platform: 'TikTok', skuOrCategory: LISTING_FACTORY_SKU.name, contentType: '痛点转化', hook: '收纳盒不是越多越好，先看 3 个高频角落。', status: '待制作', riskLevel: '中' },
  { day: 'D2 周二', platform: 'Instagram', skuOrCategory: '家居生活', contentType: '对比测评', hook: '透明款更适合高频拿取的三个场景。', status: '待审核', riskLevel: '中' },
  { day: 'D3 周三', platform: '小红书', skuOrCategory: '家居生活', contentType: 'FAQ 回应', hook: '买回家闲置，通常是尺寸没算对。', status: '待发布', riskLevel: '低' },
  { day: 'D4 周四', platform: 'Amazon', skuOrCategory: LISTING_FACTORY_SKU.name, contentType: 'FAQ 回应', hook: 'One organizer, three daily zones.', status: '已进入报告', riskLevel: '低' },
  { day: 'D5 周五', platform: 'Shopify', skuOrCategory: LISTING_FACTORY_SKU.name, contentType: '痛点转化', hook: '先整理最常用的 20% 物品。', status: '待制作', riskLevel: '中' },
  { day: 'D6 周六', platform: 'TikTok', skuOrCategory: '宠物用品', contentType: '达人种草', hook: '养宠家庭最怕每天重复清理同一个地方。', status: '待审核', riskLevel: '中' },
  { day: 'D7 周日', platform: 'Instagram', skuOrCategory: '3C 配件', contentType: '评论区回应', hook: '如果卡在兼容型号，先看这 4 个问题。', status: '待制作', riskLevel: '中' },
];

export const LISTING_FACTORY_TEAM_ROLES: ListingFactoryTeamRole[] = [
  { role: '内容运营', responsibility: '负责 Brief 生成、内容日历排期和任务状态更新。', permissions: ['可查看', '可编辑'] },
  { role: '品牌审核', responsibility: '负责品牌禁区、风险表达和上线前审核。', permissions: ['可查看', '可审核'] },
  { role: '客户经理', responsibility: '负责 POC 报告、客户沟通和交付包确认。', permissions: ['可查看', '可编辑', '可管理项目'] },
  { role: '商务负责人', responsibility: '负责套餐推荐、报价方向和商机阶段推进。', permissions: ['可查看', '可推进商务'] },
  { role: '管理员', responsibility: '查看全局进度、团队权限和项目交付状态。', permissions: ['可查看', '可编辑', '可审核', '可推进商务', '可管理项目'] },
];

export const LISTING_FACTORY_WEEKLY_PRODUCTION_STATS: ListingFactoryWeeklyProductionStats = {
  kpis: [
    { label: 'Brief 生成数', value: '46', note: '本周覆盖 5 个类目、24 个 SKU' },
    { label: '可交付 Brief 数', value: '18', note: '已通过品牌安全复核' },
    { label: '高风险 Brief 数', value: '6', note: '集中在功效承诺和竞品对比' },
    { label: '已进入报告数', value: '12', note: '可沉淀到 POC 报告与客户交付包' },
    { label: '已转商机数', value: '4', note: '来自 POC 报告、Pricing 和客户案例' },
    { label: '推荐 Growth / Enterprise 项目数', value: '3', note: '具备批量生产或规则库需求' },
  ],
  contentTypeDistribution: [
    { label: '痛点转化', value: 32 },
    { label: 'FAQ 回应', value: 26 },
    { label: '对比测评', value: 18 },
    { label: '达人种草', value: 14 },
    { label: '评论区回应', value: 10 },
  ],
  platformDistribution: [
    { label: 'TikTok', value: 30 },
    { label: 'Instagram', value: 22 },
    { label: '小红书', value: 18 },
    { label: 'Amazon', value: 16 },
    { label: 'Shopify', value: 14 },
  ],
  riskDistribution: [
    { label: '低', value: 40 },
    { label: '中', value: 46 },
    { label: '高', value: 14 },
  ],
};

export const LISTING_FACTORY_ADMIN_REVIEW_LINKS: ListingFactoryAdminReviewLink[] = [
  {
    company: 'ListingHome',
    reviewConclusion: 'Brief 质量稳定，适合进入 Growth 批量生产。',
    briefOverallScore: 85,
    riskLevel: '中',
    expectedMonthlyVolume: '60-120 条内容',
    quoteDirection: '按 30 SKU / 80 条 Brief 组合报价，包含复盘看板和客户交付包。',
    deliveryPackageSent: true,
    nextCommercialAction: '约 30 分钟方案确认会，锁定首月 SKU 范围。',
  },
  {
    company: 'PetLoop',
    reviewConclusion: '宠物类风险可控，但需要先跑品牌禁区库。',
    briefOverallScore: 79,
    riskLevel: '中',
    expectedMonthlyVolume: '20-40 条内容',
    quoteDirection: 'Starter 先跑单 SKU，后续按类目扩展。',
    deliveryPackageSent: false,
    nextCommercialAction: '发送风险复盘摘要并确认素材补充清单。',
  },
  {
    company: 'C-Port',
    reviewConclusion: '多 SKU 兼容信息复杂，适合 Enterprise 规则库。',
    briefOverallScore: 82,
    riskLevel: '中',
    expectedMonthlyVolume: '120-180 条内容',
    quoteDirection: '按规则库、团队席位和 SKU 批次组合报价。',
    deliveryPackageSent: true,
    nextCommercialAction: '确认预算区间和权限管理需求。',
  },
];

export const LISTING_FACTORY_DEMO_BOUNDARY_COPY =
  '当前支持本地试跑：可输入 SKU、生成 Brief、形成 POC 报告和轻量交付包；数据仅保存在当前浏览器。正式版可连接团队项目、客户权限、平台数据和商务记录。';

export const LISTING_FACTORY_NAV_GROUPS: ListingFactoryNavGroup[] = [
  {
    title: '生产',
    items: [
      { label: '内容工厂', href: '/factory' },
      { label: '类目洞察', href: '/insights' },
      { label: '上新流水线', href: '/pipelines/new-listing' },
      { label: 'Brief 资产库', href: '/briefs' },
      { label: '内容日历', href: '/calendar' },
    ],
  },
  {
    title: '交付',
    items: [
      { label: 'POC 报告', href: '/poc/report' },
      { label: '复盘看板', href: '/review' },
      { label: '客户项目', href: '/clients' },
    ],
  },
  {
    title: '商务',
    items: [
      { label: '带报告咨询', href: '/inquire' },
      { label: 'Pricing', href: '/pricing' },
      { label: '商务后台', href: '/admin/inquiries' },
    ],
  },
  {
    title: '开始',
    items: [
      { label: '首页', href: '/' },
      { label: '公开试跑', href: '/poc' },
    ],
  },
];

export const LISTING_FACTORY_DEMO_PATH: ListingFactoryDemoStep[] = [
  { title: '看类目洞察', href: '/insights', body: '先从类目、平台和可复用结构理解上新机会。' },
  { title: '生成 Brief', href: '/briefs', body: '把洞察转成带 Hook、画面、CTA 和风险提示的 Brief 草稿。' },
  { title: '加入任务队列', href: '/factory', body: '把 Brief 推入内容任务队列，进入品牌审核和交付状态流转。' },
  { title: '排进内容日历', href: '/calendar', body: '把可执行 Brief 排到未来 7 天的生产与分发计划。' },
  { title: '生成 POC 报告', href: '/poc/report', body: '把 SKU 摘要、规则、禁区、Brief 和商务下一步汇总成报告。' },
  { title: '做复盘评分', href: '/review', body: '复盘 Brief 质量、品牌风险和下一步生产建议。' },
  { title: '归档客户项目', href: '/clients', body: '按客户沉淀项目、交付包、风险摘要和销售话术。' },
  { title: '转商务询盘', href: '/inquire', body: '带着报告和复盘结果进入正式生产咨询。' },
  { title: '推荐 Growth / Enterprise', href: '/pricing', body: '根据 SKU、Brief、风险和月内容量匹配商业方案。' },
];

export const LISTING_FACTORY_FLOW_NAV: ListingFactoryFlowNav[] = [
  { page: '/insights', previousLabel: '内容工厂', previousHref: '/factory', nextLabel: '进入 Brief 资产库', nextHref: '/briefs' },
  { page: '/briefs', previousLabel: '类目洞察', previousHref: '/insights', nextLabel: '排进内容日历', nextHref: '/calendar' },
  { page: '/factory', previousLabel: '首页', previousHref: '/', nextLabel: '进入内容日历', nextHref: '/calendar' },
  { page: '/pipelines/new-listing', previousLabel: '类目洞察', previousHref: '/insights', nextLabel: '生成 POC 报告', nextHref: '/poc/report' },
  { page: '/calendar', previousLabel: '内容工厂', previousHref: '/factory', nextLabel: '生成 POC 报告', nextHref: '/poc/report' },
  { page: '/poc/report', previousLabel: '上新流水线', previousHref: '/pipelines/new-listing', nextLabel: '进入 POC 复盘看板', nextHref: '/review' },
  { page: '/review', previousLabel: 'POC 报告', previousHref: '/poc/report', nextLabel: '进入客户项目空间', nextHref: '/clients' },
  { page: '/clients', previousLabel: '复盘看板', previousHref: '/review', nextLabel: '查看 Pricing', nextHref: '/pricing' },
  { page: '/inquire', previousLabel: '客户项目', previousHref: '/clients', nextLabel: '查看 Pricing', nextHref: '/pricing' },
  { page: '/pricing', previousLabel: '询盘', previousHref: '/inquire', nextLabel: '进入商务后台', nextHref: '/admin/inquiries' },
  { page: '/admin/inquiries', previousLabel: 'Pricing', previousHref: '/pricing', nextLabel: '推进商机阶段', nextHref: '/admin/inquiries' },
];

export function getPrimaryFactoryBrief(): ListingFactoryBrief {
  return LISTING_FACTORY_BRIEFS[0];
}

export function buildInsightBriefHref(insight: ListingFactoryInsight): string {
  const params = new URLSearchParams({
    from: 'insight-library',
    insight: insight.id,
    category: insight.category,
    hook: insight.hook,
    platform: insight.platform,
  });
  return `/pipelines/new-listing?${params.toString()}`;
}

export function buildListingFactoryReportHref(): string {
  const params = new URLSearchParams({
    from: 'listing-factory',
    category: 'home',
    benchmarkPreset: 'creative-test',
    skuPlanned: String(LISTING_FACTORY_OVERVIEW.skuCount),
    skuDelivered: '10',
    finalReviewPassRate: '86',
    benchmarkCoverage: '82',
    riskCount: String(LISTING_FACTORY_OVERVIEW.brandRedlineCount),
    missingAssetCount: '1',
    reworkCount: '1',
    contentTestReady: '1',
    ownerReady: '1',
    contractIntent: '1',
  });
  return `/poc/report?${params.toString()}`;
}

export function buildListingFactoryInquiryHref(source = 'listing-factory'): string {
  const params = new URLSearchParams({
    from: source,
    skuCount: String(LISTING_FACTORY_OVERVIEW.skuCount),
    platform: LISTING_FACTORY_SKU.targetPlatforms.slice(0, 3).join(' / '),
    category: LISTING_FACTORY_SKU.category,
  });
  return `/inquire?${params.toString()}`;
}

export function buildListingFactoryPricingHref(): string {
  return '/pricing?from=listing-factory';
}
