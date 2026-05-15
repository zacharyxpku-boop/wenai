import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  LISTING_FACTORY_ACTIVITY_FEED,
  LISTING_FACTORY_ADMIN_INQUIRIES,
  LISTING_FACTORY_ADMIN_REVIEW_LINKS,
  LISTING_FACTORY_BRIEF_FILTERS,
  LISTING_FACTORY_BRIEFS,
  LISTING_FACTORY_BRIEF_QUALITY_SCORES,
  LISTING_FACTORY_CASES,
  LISTING_FACTORY_CLIENT_PROJECTS,
  LISTING_FACTORY_CONFIG,
  LISTING_FACTORY_CONTENT_CALENDAR,
  LISTING_FACTORY_DELIVERY_PACKAGES,
  LISTING_FACTORY_DELIVERY_PACKAGE,
  LISTING_FACTORY_DEMO_BOUNDARY_COPY,
  LISTING_FACTORY_DEMO_PATH,
  LISTING_FACTORY_FACTORY_OVERVIEW,
  LISTING_FACTORY_FLOW_NAV,
  LISTING_FACTORY_GENERATED_BRIEF_DRAFTS,
  LISTING_FACTORY_INQUIRY_STAGE_FLOW,
  LISTING_FACTORY_INSIGHTS,
  LISTING_FACTORY_NAV_GROUPS,
  LISTING_FACTORY_OVERVIEW,
  LISTING_FACTORY_PIPELINE_BOARD,
  LISTING_FACTORY_PRICING_RECOMMENDATION,
  LISTING_FACTORY_PRODUCTION_RECOMMENDATIONS,
  LISTING_FACTORY_REPORT,
  LISTING_FACTORY_REVIEW_DASHBOARD,
  LISTING_FACTORY_RISK_REVIEW_ITEMS,
  LISTING_FACTORY_RULES,
  LISTING_FACTORY_SKU,
  LISTING_FACTORY_STEPS,
  LISTING_FACTORY_TASK_QUEUE,
  LISTING_FACTORY_TASK_STATUS_FLOW,
  LISTING_FACTORY_TEAM_ROLES,
  LISTING_FACTORY_TIERS,
  LISTING_FACTORY_WEEKLY_PRODUCTION_STATS,
  buildInsightBriefHref,
  buildListingFactoryInquiryHref,
  buildListingFactoryReportHref,
  getPrimaryFactoryBrief,
} from '@/lib/listing-factory-demo';

describe('listing factory demo data', () => {
  it('models the public listing factory loop from SKU rules to commercial handoff', () => {
    expect(LISTING_FACTORY_OVERVIEW.skuCount).toBeGreaterThanOrEqual(8);
    expect(LISTING_FACTORY_OVERVIEW.categoryRuleCount).toBeGreaterThanOrEqual(4);
    expect(LISTING_FACTORY_OVERVIEW.brandRedlineCount).toBeGreaterThanOrEqual(3);
    expect(LISTING_FACTORY_OVERVIEW.briefCount).toBe(LISTING_FACTORY_BRIEFS.length);
    expect(LISTING_FACTORY_OVERVIEW.nextAction).toContain('POC');

    expect(LISTING_FACTORY_STEPS.map(step => step.title)).toEqual([
      'SKU 基础信息',
      '类目规则',
      '品牌禁区',
      '类目灵感',
      '批量 Brief',
      'POC 与商务推进',
    ]);

    const primaryBrief = getPrimaryFactoryBrief();
    expect(primaryBrief.platform).toMatch(/TikTok|小红书|Amazon|Shopify|Instagram/);
    expect(primaryBrief.riskNote).toContain('避免');
    expect(buildListingFactoryReportHref()).toContain('/poc/report?');
    expect(buildListingFactoryInquiryHref()).toContain('/inquire?');
    expect(buildListingFactoryInquiryHref()).toContain('from=listing-factory');
  });

  it('turns category insights into reusable brief links', () => {
    expect(LISTING_FACTORY_INSIGHTS.length).toBeGreaterThanOrEqual(5);

    for (const insight of LISTING_FACTORY_INSIGHTS) {
      expect(insight.category).toBeTruthy();
      expect(insight.platform).toBeTruthy();
      expect(insight.hook).toBeTruthy();
      expect(insight.reusableReason).toContain('复用');
      expect(insight.riskReminder).toContain('避免');
      expect(buildInsightBriefHref(insight)).toContain('/pipelines/new-listing?');
      expect(buildInsightBriefHref(insight)).toContain('insight=');
    }
  });

  it('describes the Listing Factory 2.0 workbench contract', () => {
    expect(LISTING_FACTORY_SKU.name).toContain('收纳');
    expect(LISTING_FACTORY_SKU.category).toBeTruthy();
    expect(LISTING_FACTORY_SKU.targetPlatforms.length).toBeGreaterThanOrEqual(3);
    expect(LISTING_FACTORY_SKU.valueProps.length).toBeGreaterThanOrEqual(3);

    expect(LISTING_FACTORY_RULES.platformLimits.length).toBeGreaterThanOrEqual(3);
    expect(LISTING_FACTORY_RULES.ruleImpactOnBrief).toContain('Brief');
    expect(LISTING_FACTORY_RULES.brandSafetySystem.blockedClaims.length).toBeGreaterThanOrEqual(3);
    expect(LISTING_FACTORY_RULES.brandSafetySystem.toneBoundary).toContain('品牌');

    expect(LISTING_FACTORY_CONFIG.contentGoals).toEqual(
      expect.arrayContaining(['上新', '转化', '种草', '清库存', '达人合作']),
    );
    expect(LISTING_FACTORY_CONFIG.riskPreferences).toEqual(['保守', '平衡', '激进']);
    expect(LISTING_FACTORY_CONFIG.outputScope).toEqual(
      expect.arrayContaining(['规则报告', '品牌禁区', '批量 Brief', '商务建议', 'Pricing 建议']),
    );

    expect(LISTING_FACTORY_REPORT.title).toBe('POC 试跑交付报告');
    expect(LISTING_FACTORY_REPORT.consultantSummary).toContain('8 条内容 Brief');
    expect(LISTING_FACTORY_REPORT.priorities.map(item => item.level)).toEqual(['P0', 'P1', 'P2']);
    expect(LISTING_FACTORY_REPORT.nextCommercialStep).toContain('正式生产');

    expect(LISTING_FACTORY_TIERS.map(tier => tier.name)).toEqual(['Free / Demo', 'Starter', 'Growth', 'Enterprise']);
    expect(LISTING_FACTORY_CASES.length).toBeGreaterThanOrEqual(5);
    expect(LISTING_FACTORY_CASES[0].briefCount).toBeGreaterThanOrEqual(6);
    expect(LISTING_FACTORY_CASES[0].nextStep).toContain('试跑');
  });

  it('models Listing Factory 3.0 as an enterprise content production console', () => {
    expect(LISTING_FACTORY_FACTORY_OVERVIEW.kpis.map(item => item.label)).toEqual(
      expect.arrayContaining([
        '当前 SKU 数',
        '进行中的上新流水线',
        '已识别类目规则',
        '已识别品牌禁区',
        '已生成 Brief',
        '待交付内容任务',
        '待商务跟进询盘',
      ]),
    );
    expect(LISTING_FACTORY_FACTORY_OVERVIEW.todayActions.length).toBeGreaterThanOrEqual(3);

    expect(LISTING_FACTORY_PIPELINE_BOARD.length).toBeGreaterThanOrEqual(5);
    expect(LISTING_FACTORY_PIPELINE_BOARD.map(item => item.stage)).toEqual(
      expect.arrayContaining(['规则识别中', '品牌安全审核', 'Brief 生成中', 'POC 报告完成', '商务跟进中']),
    );

    expect(LISTING_FACTORY_TASK_QUEUE.length).toBeGreaterThanOrEqual(6);
    expect(LISTING_FACTORY_TASK_QUEUE[0]).toMatchObject({
      platform: expect.any(String),
      contentType: expect.any(String),
      ownerRole: expect.any(String),
      status: expect.any(String),
      riskTag: expect.any(String),
    });

    expect(LISTING_FACTORY_DELIVERY_PACKAGES.length).toBeGreaterThanOrEqual(3);
    expect(LISTING_FACTORY_DELIVERY_PACKAGES[0].projectName).toBeTruthy();
    expect(LISTING_FACTORY_DELIVERY_PACKAGES[0].briefCount).toBeGreaterThan(0);
    expect(LISTING_FACTORY_DELIVERY_PACKAGES[0].nextCommercialAction).toContain('确认');
  });

  it('supports brief assets, insight library, and admin commercial details', () => {
    expect(LISTING_FACTORY_BRIEF_FILTERS.platforms).toEqual(
      expect.arrayContaining(['TikTok', 'Instagram', '小红书', 'Amazon', 'Shopify']),
    );
    expect(LISTING_FACTORY_BRIEF_FILTERS.contentTypes).toEqual(
      expect.arrayContaining(['痛点转化', '对比测评', 'FAQ 回应', '达人种草', '评论区回应']),
    );
    expect(LISTING_FACTORY_BRIEF_FILTERS.riskLevels).toEqual(['低', '中', '高']);
    expect(LISTING_FACTORY_BRIEF_FILTERS.statuses).toEqual(
      expect.arrayContaining(['草稿', '待审核', '可交付', '已归档']),
    );

    for (const brief of LISTING_FACTORY_BRIEFS) {
      expect(brief.reusableStructure).toBeTruthy();
      expect(brief.assetActions).toEqual(expect.arrayContaining(['加入 POC 报告', '归档到客户交付包']));
    }

    for (const insight of LISTING_FACTORY_INSIGHTS) {
      expect(insight.category).toBeTruthy();
      expect(insight.platform).toBeTruthy();
      expect(insight.hook).toBeTruthy();
      expect(insight.riskReminder).toContain('避免');
      expect(insight.recommendedBriefType).toContain('Brief');
    }

    expect(LISTING_FACTORY_ADMIN_INQUIRIES.length).toBeGreaterThanOrEqual(3);
    expect(LISTING_FACTORY_ADMIN_INQUIRIES[0]).toMatchObject({
      sourcePath: expect.stringMatching(/^\/(poc|pipelines|pricing|cases)/),
      recommendedTier: expect.stringMatching(/Starter|Growth|Enterprise/),
      nextCommercialAction: expect.any(String),
    });
  });

  it('models Listing Factory 4.0 interactive production flow states', () => {
    expect(LISTING_FACTORY_ACTIVITY_FEED.length).toBeGreaterThanOrEqual(5);
    expect(LISTING_FACTORY_ACTIVITY_FEED[0]).toMatchObject({
      time: expect.any(String),
      source: expect.any(String),
      action: expect.any(String),
      object: expect.any(String),
    });

    expect(LISTING_FACTORY_TASK_STATUS_FLOW).toEqual([
      '待生成',
      '待品牌审核',
      '可交付',
      '已进入报告',
      '已归档',
    ]);

    expect(LISTING_FACTORY_PRICING_RECOMMENDATION.recommendedTier).toBe('Growth');
    expect(LISTING_FACTORY_PRICING_RECOMMENDATION.reasons).toEqual(
      expect.arrayContaining(['多 SKU 批量上新', '需要品牌禁区库', '需要 Brief 资产沉淀', '需要商务推进后台']),
    );

    expect(LISTING_FACTORY_INQUIRY_STAGE_FLOW).toEqual([
      '新询盘',
      '已看 POC 报告',
      '已推荐套餐',
      '待确认预算',
      '可进入正式生产',
    ]);

    expect(LISTING_FACTORY_GENERATED_BRIEF_DRAFTS.length).toBeGreaterThanOrEqual(3);
    for (const draft of LISTING_FACTORY_GENERATED_BRIEF_DRAFTS) {
      expect(draft.hook).toBeTruthy();
      expect(draft.platform).toBeTruthy();
      expect(draft.contentType).toBeTruthy();
      expect(['草稿', '待审核']).toContain(draft.status);
    }
  });

  it('models Listing Factory 5.0 review, delivery, and enterprise project layers', () => {
    expect(LISTING_FACTORY_REVIEW_DASHBOARD).toMatchObject({
      sku: expect.any(String),
      category: expect.any(String),
      briefCount: expect.any(Number),
      archivedPackageCount: expect.any(Number),
      recommendedTier: expect.stringMatching(/Starter|Growth|Enterprise/),
      opportunityStage: expect.any(String),
    });
    expect(LISTING_FACTORY_REVIEW_DASHBOARD.briefCount).toBeGreaterThanOrEqual(6);

    expect(LISTING_FACTORY_BRIEF_QUALITY_SCORES.length).toBeGreaterThanOrEqual(5);
    expect(LISTING_FACTORY_BRIEF_QUALITY_SCORES[0]).toMatchObject({
      hookCompleteness: expect.any(Number),
      platformFit: expect.any(Number),
      brandSafety: expect.any(Number),
      ctaClarity: expect.any(Number),
      reusePotential: expect.any(Number),
      overallScore: expect.any(Number),
    });

    expect(LISTING_FACTORY_RISK_REVIEW_ITEMS.length).toBeGreaterThanOrEqual(3);
    expect(LISTING_FACTORY_RISK_REVIEW_ITEMS[0]).toMatchObject({
      highRiskExpression: expect.any(String),
      manualReviewPoint: expect.any(String),
      suggestedReplacement: expect.any(String),
      productionImpact: expect.any(String),
    });
    expect(LISTING_FACTORY_PRODUCTION_RECOMMENDATIONS.length).toBeGreaterThanOrEqual(4);

    expect(LISTING_FACTORY_CLIENT_PROJECTS.length).toBeGreaterThanOrEqual(3);
    expect(LISTING_FACTORY_CLIENT_PROJECTS[0]).toMatchObject({
      customerName: expect.any(String),
      skuCount: expect.any(Number),
      briefCount: expect.any(Number),
      opportunityStage: expect.any(String),
      nextAction: expect.any(String),
      salesTalkTrack: expect.any(String),
    });

    expect(LISTING_FACTORY_DELIVERY_PACKAGE).toMatchObject({
      pocSummary: expect.any(String),
      categoryRules: expect.any(Array),
      brandRedlines: expect.any(Array),
      briefSamples: expect.any(Array),
      customerSummary: expect.any(String),
      recommendedTier: expect.any(String),
    });
    expect(LISTING_FACTORY_DELIVERY_PACKAGE.customerSummary).toContain('试跑');

    expect(LISTING_FACTORY_CONTENT_CALENDAR).toHaveLength(7);
    expect(LISTING_FACTORY_CONTENT_CALENDAR[0]).toMatchObject({
      day: expect.any(String),
      platform: expect.any(String),
      skuOrCategory: expect.any(String),
      contentType: expect.any(String),
      hook: expect.any(String),
      status: expect.stringMatching(/待制作|待审核|待发布|已进入报告/),
      riskLevel: expect.stringMatching(/低|中|高/),
    });

    expect(LISTING_FACTORY_TEAM_ROLES.map(role => role.role)).toEqual(
      expect.arrayContaining(['内容运营', '品牌审核', '客户经理', '商务负责人', '管理员']),
    );
    expect(LISTING_FACTORY_TEAM_ROLES[0].permissions).toEqual(expect.arrayContaining(['可查看']));

    expect(LISTING_FACTORY_WEEKLY_PRODUCTION_STATS.kpis.map(item => item.label)).toEqual(
      expect.arrayContaining(['Brief 生成数', '已进入报告数', '已转商机数']),
    );
    expect(LISTING_FACTORY_ADMIN_REVIEW_LINKS[0]).toMatchObject({
      company: expect.any(String),
      reviewConclusion: expect.any(String),
      briefOverallScore: expect.any(Number),
      deliveryPackageSent: expect.any(Boolean),
    });
  });

  it('models Listing Factory 6.0 navigation, executive demo path, and consistent data language', () => {
    expect(LISTING_FACTORY_DEMO_PATH.map(step => step.title)).toEqual([
      '看类目洞察',
      '生成 Brief',
      '加入任务队列',
      '排进内容日历',
      '生成 POC 报告',
      '做复盘评分',
      '归档客户项目',
      '转商务询盘',
      '推荐 Growth / Enterprise',
    ]);
    expect(LISTING_FACTORY_DEMO_PATH.every(step => step.href.startsWith('/'))).toBe(true);

    expect(LISTING_FACTORY_NAV_GROUPS.map(group => group.title)).toEqual(['生产', '交付', '商务', '开始']);
    expect(LISTING_FACTORY_NAV_GROUPS.flatMap(group => group.items.map(item => item.href))).toEqual(
      expect.arrayContaining([
        '/factory',
        '/insights',
        '/pipelines/new-listing',
        '/briefs',
        '/calendar',
        '/poc/report',
        '/review',
        '/clients',
        '/inquire',
        '/pricing',
        '/admin/inquiries',
        '/',
        '/poc',
      ]),
    );

    expect(LISTING_FACTORY_DEMO_BOUNDARY_COPY).toBe(
      '当前支持本地试跑：可输入 SKU、生成 Brief、形成 POC 报告和轻量交付包；数据仅保存在当前浏览器。正式版可连接团队项目、客户权限、平台数据和商务记录。',
    );

    expect(LISTING_FACTORY_REVIEW_DASHBOARD.briefCount).toBe(LISTING_FACTORY_OVERVIEW.briefCount);
    expect(LISTING_FACTORY_REVIEW_DASHBOARD.recommendedTier).toBe(LISTING_FACTORY_PRICING_RECOMMENDATION.recommendedTier);
    expect(LISTING_FACTORY_REVIEW_DASHBOARD.opportunityStage).toBe('已推荐套餐');
    expect(LISTING_FACTORY_PRICING_RECOMMENDATION.riskLevel).toBe(LISTING_FACTORY_REVIEW_DASHBOARD.category.includes('家居') ? '中' : LISTING_FACTORY_PRICING_RECOMMENDATION.riskLevel);
    expect(LISTING_FACTORY_CLIENT_PROJECTS[0].customerName).toBe('ListingHome');
    expect(LISTING_FACTORY_ADMIN_REVIEW_LINKS[0].expectedMonthlyVolume).toBe(LISTING_FACTORY_PRICING_RECOMMENDATION.expectedMonthlyVolume);
    expect(LISTING_FACTORY_DELIVERY_PACKAGE.recommendedTier).toBe(LISTING_FACTORY_PRICING_RECOMMENDATION.recommendedTier);
    expect(LISTING_FACTORY_FLOW_NAV.find(item => item.page === '/pipelines/new-listing')).toMatchObject({
      previousHref: '/insights',
      nextHref: '/poc/report',
    });
  });

  it('keeps the public Listing Factory route copy visible in source', () => {
    const root = process.cwd();
    const files = [
      'src/app/factory/page.tsx',
      'src/app/briefs/page.tsx',
      'src/app/insights/page.tsx',
      'src/app/review/page.tsx',
      'src/app/clients/page.tsx',
      'src/app/calendar/page.tsx',
      'src/app/pipelines/new-listing/page.tsx',
      'src/app/poc/report/page.tsx',
      'src/app/inquire/page.tsx',
      'src/app/pricing/page.tsx',
      'src/app/cases/page.tsx',
      'src/app/admin/inquiries/page.tsx',
      'src/components/marketing/ListingFactorySections.tsx',
      'src/lib/listing-factory-demo.ts',
      'docs/listing-factory-demo-script.md',
    ].map(file => readFileSync(join(root, file), 'utf8'));
    const source = files.join('\n');

    expect(source).toContain('新品上新流水线');
    expect(source).toContain('POC 试跑交付报告');
    expect(source).toContain('带着试跑结果咨询正式生产方案');
    expect(source).toContain('正式生产方案');
    expect(source).toContain('类目灵感');
    expect(source).toContain('内容工厂控制台');
    expect(source).toContain('Brief 资产库');
    expect(source).toContain('类目洞察库');
    expect(source).toContain('商务推进后台');
    expect(source).toContain('最近操作流');
    expect(source).toContain('加入任务队列');
    expect(source).toContain('已加入 POC 报告');
    expect(source).toContain('根据本次试跑推荐');
    expect(source).toContain('商机阶段');
    expect(source).toContain('POC 复盘看板');
    expect(source).toContain('客户项目空间');
    expect(source).toContain('内容日历');
    expect(source).toContain('客户交付包');
    expect(source).toContain('团队协作');
    expect(source).toContain('本周生产复盘');
    expect(source).toContain('5 分钟看完 Wenai 如何跑完一次电商上新');
    expect(source).toContain('上一站');
    expect(source).toContain('下一站');
  });
});
