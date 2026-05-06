export type WorkflowId =
  | 'benchmark'
  | 'podcast-ugc'
  | 'street-interview'
  | 'slideshow-batch'
  | 'batch-ugc'
  | 'animated-ads'
  | 'editing-only';

export interface WorkflowTemplate {
  id: WorkflowId;
  label: string;
  shortLabel: string;
  whenToUse: string;
  requiredInputs: string[];
  outputs: string[];
  acceptanceCriteria: string[];
  redlines: string[];
  keywords: string[];
}

export interface StandardPackInput {
  goal: string;
  brand: string;
  sku: string;
  links: string;
  workflowId?: WorkflowId | '';
}

export interface StandardPack {
  workflow: WorkflowTemplate;
  missingInputs: string[];
  readiness: StandardPackReadiness;
  sections: Array<{ title: string; body: string[] }>;
  nextActions: string[];
}

export interface StandardPackReadiness {
  leadScore: number;
  acceptanceScore: number;
  contractReadiness: number;
  decision: 'ready-for-poc' | 'needs-info' | 'hypothesis-only';
  label: string;
  stageLabel: string;
  nextStepLabel: string;
  blockers: string[];
  strengths: string[];
  contractBlockers: string[];
  contractSignals: string[];
  reviewChecklist: string[];
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'benchmark',
    label: '内容拆解 / benchmark',
    shortLabel: 'Benchmark',
    whenToUse: '还没有确定创意方向, 需要先从竞品内容、评论和平台语境里找证据。',
    requiredInputs: ['SKU 卖点', '目标平台', '参考链接或竞品账号'],
    outputs: ['搜索地图', 'benchmark 拆解表', 'Hook 方向', '7 天测试假设'],
    acceptanceCriteria: ['至少 3 个参考来源', '每条 Hook 有对应场景', '未补链接时标注为假设'],
    redlines: ['不能伪装成已完成真实调研', '不能承诺 GMV 或爆款', '不能直接复刻他人素材'],
    keywords: ['benchmark', '竞品', '拆解', '参考', '评论', 'insight'],
  },
  {
    id: 'podcast-ugc',
    label: 'Podcast UGC',
    shortLabel: 'Podcast',
    whenToUse: '产品需要被解释、讨论、种草, 适合做轻访谈或双人口播。',
    requiredInputs: ['SKU 卖点', '目标用户', '品牌语气', '参考账号'],
    outputs: ['双人口播脚本', '片头 Hook', '问题清单', '剪辑点位'],
    acceptanceCriteria: ['开头 3 秒说清痛点', '每 20 秒有一个信息推进', 'CTA 不硬插'],
    redlines: ['不能编造用户评价', '不能做医疗/功效暗示', '不能使用未授权名人背书'],
    keywords: ['podcast', '访谈', '播客', '口播', '对谈'],
  },
  {
    id: 'street-interview',
    label: '街采 UGC',
    shortLabel: 'Street',
    whenToUse: '需要用路人视角验证痛点和第一反应, 适合低门槛消费品。',
    requiredInputs: ['SKU 卖点', '采访场景', '目标人群', '禁用表述'],
    outputs: ['街采问题', '路人回答方向', '镜头脚本', '授权提醒'],
    acceptanceCriteria: ['问题不诱导虚假评价', '镜头能展示产品使用', '授权口径明确'],
    redlines: ['不能伪造真实路人反馈', '不能侵犯肖像权', '不能引导夸大效果'],
    keywords: ['街采', 'street', 'interview', '路人', '采访'],
  },
  {
    id: 'slideshow-batch',
    label: 'Slideshow / Reels 批量测试',
    shortLabel: 'Slideshow',
    whenToUse: '需要低成本快速测试多个 Hook、首帧、卖点顺序。',
    requiredInputs: ['SKU 卖点', '商品图', '目标平台', '测试周期'],
    outputs: ['5 条 slideshow 版本', '首帧文案', '素材顺序', '测试命名规则'],
    acceptanceCriteria: ['每版只测试一个核心变量', '首帧可在 1 秒内读懂', '命名可追踪'],
    redlines: ['不能多个变量混测', '不能用模糊标题', '不能缺少复盘指标'],
    keywords: ['slideshow', 'reels', '轮播', '批量', '首帧'],
  },
  {
    id: 'batch-ugc',
    label: '批量 UGC 短视频',
    shortLabel: 'UGC',
    whenToUse: '已有产品卖点和基础素材, 需要批量生产可测试短视频脚本。',
    requiredInputs: ['SKU 卖点', '目标平台', '参考视频', '素材清单'],
    outputs: ['10 条短视频脚本', '镜头表', '口播文案', '素材 manifest'],
    acceptanceCriteria: ['每条脚本有明确 Hook', '镜头时长可拍', '素材缺口明确'],
    redlines: ['不能承诺真实用户体验', '不能搬运参考视频', '不能缺少人工审核'],
    keywords: ['ugc', '短视频', '视频', '批量', '脚本'],
  },
  {
    id: 'animated-ads',
    label: 'Animated Ads',
    shortLabel: 'Animated',
    whenToUse: '产品卖点偏功能或结构, 需要用动效解释使用前后或工作原理。',
    requiredInputs: ['SKU 结构', '核心功能', '使用场景', '品牌视觉'],
    outputs: ['动效脚本', '画面分镜', '字幕节奏', '设计资产清单'],
    acceptanceCriteria: ['功能解释准确', '字幕不遮挡产品', 'CTA 清楚'],
    redlines: ['不能夸大功能', '不能隐藏限制条件', '不能用无法交付的复杂镜头'],
    keywords: ['animated', '动画', '动效', '解释', '功能'],
  },
  {
    id: 'editing-only',
    label: '粗剪 / 精剪优化',
    shortLabel: 'Editing',
    whenToUse: '已有原始素材或旧视频, 需要重排结构、强化 Hook 和 CTA。',
    requiredInputs: ['原视频', '目标平台', '保留片段', '禁删内容'],
    outputs: ['剪辑诊断', '重排时间线', '字幕建议', '二剪版本清单'],
    acceptanceCriteria: ['前 3 秒更强', '节奏点明确', '保留信息不丢失'],
    redlines: ['不能删掉必要免责声明', '不能改变原素材事实', '不能过度包装效果'],
    keywords: ['剪辑', '粗剪', '精剪', 'editing', '优化'],
  },
];

export function getWorkflow(id: WorkflowId | string | undefined): WorkflowTemplate {
  return WORKFLOW_TEMPLATES.find(item => item.id === id) || WORKFLOW_TEMPLATES[0];
}

export function recommendWorkflowId(text: string): WorkflowId {
  const lower = text.toLowerCase();
  const scored = WORKFLOW_TEMPLATES
    .map(template => ({
      id: template.id,
      score: template.keywords.reduce((sum, word) => sum + (lower.includes(word.toLowerCase()) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score);
  return scored[0]?.score > 0 ? scored[0].id : 'benchmark';
}

function hasAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some(pattern => pattern.test(text));
}

export function scoreStandardPackReadiness(input: StandardPackInput, missingInputs: string[]): StandardPackReadiness {
  const fullText = `${input.goal}\n${input.brand}\n${input.sku}\n${input.links}`.toLowerCase();
  const hasGoal = input.goal.trim().length >= 12;
  const hasBrand = input.brand.trim().length >= 12;
  const hasSku = input.sku.trim().length >= 12;
  const hasBenchmark = input.links.trim().length > 0;
  const hasPlatform = hasAny(fullText, [/tiktok|instagram|amazon|shopify|shopee|etsy|reels|小红书|抖音|淘宝|天猫|拼多多|独立站/i]);
  const hasAcceptanceIntent = hasAny(fullText, [/验收|复盘|review|acceptance|ctr|转化|合同|poc|测试|test/i]);
  const hasRiskContext = hasAny(fullText, [/合规|商标|禁用|restricted|claim|法务|功效|敏感|risk/i]);
  const hasTenSkuSignal = hasAny(fullText, [/10\s*sku|10个|10 个|十个|批量|batch/i]);
  const hasOwnerSignal = hasAny(fullText, [/负责人|审核人|owner|reviewer|founder|team|团队/i]);
  const hasTimelineSignal = hasAny(fullText, [/7天|7 天|14天|14 天|30天|30 天|本周|下周|timeline|deadline|launch/i]);
  const hasAssetSignal = hasAny(fullText, [/素材|商品图|video|image|listing|详情页|脚本|口播|主图/i]);
  const hasExpansionSignal = hasAny(fullText, [/扩sku|扩品|放量|scale|签约|主站|retainer|续约|monthly/i]);

  const leadScore = Math.min(100,
    (hasGoal ? 18 : 0) +
    (hasBrand ? 18 : 0) +
    (hasSku ? 24 : 0) +
    (hasPlatform ? 12 : 0) +
    (hasBenchmark ? 14 : 0) +
    (hasAcceptanceIntent ? 8 : 0) +
    (hasTenSkuSignal ? 6 : 0)
  );
  const acceptanceScore = Math.max(0, Math.min(100,
    100 -
    missingInputs.length * 16 -
    (hasBenchmark ? 0 : 12) -
    (hasAcceptanceIntent ? 0 : 8) -
    (hasRiskContext ? 0 : 6)
  ));
  const contractReadiness = Math.min(100,
    (hasAcceptanceIntent ? 24 : 0) +
    (hasTenSkuSignal ? 18 : 0) +
    (hasBenchmark ? 15 : 0) +
    (hasPlatform ? 12 : 0) +
    (hasRiskContext ? 10 : 0) +
    (hasOwnerSignal ? 9 : 0) +
    (hasTimelineSignal ? 7 : 0) +
    (hasAssetSignal ? 5 : 0)
  );

  const blockers = [
    !hasGoal ? '增长目标不清晰, 不能判断交付是否有效' : '',
    !hasBrand ? '缺少品牌/店铺上下文, 输出容易偏离语气和平台定位' : '',
    !hasSku ? '缺少 SKU 卖点, 不能进入真实 POC 交付' : '',
    !hasPlatform ? '缺少目标平台, 无法判断内容形态和验收指标' : '',
    !hasBenchmark ? '缺少 benchmark 链接或竞品账号, 当前只能产出假设' : '',
    !hasAcceptanceIntent ? '缺少验收/复盘口径, 后续难以推进合同判断' : '',
  ].filter(Boolean);

  const strengths = [
    hasSku ? '已有 SKU/卖点, 可以进入交付结构化' : '',
    hasPlatform ? '已有目标平台, 可以约束内容形态' : '',
    hasBenchmark ? '已有参考证据, 可以进入 benchmark-to-campaign' : '',
    hasAcceptanceIntent ? '已有验收意图, 便于复盘和合同推进' : '',
    hasRiskContext ? '已有风险上下文, 便于人工终审' : '',
    hasTenSkuSignal ? '已有 10 SKU/批量信号, 接近正式 POC 场景' : '',
  ].filter(Boolean);
  const contractBlockers = [
    !hasBenchmark ? '缺少 benchmark 证据, 复盘时无法解释内容假设来源' : '',
    !hasAcceptanceIntent ? '没有明确验收或复盘口径, 即使交付也难以进入下一轮签约讨论' : '',
    !hasTenSkuSignal ? '缺少 10 SKU/批量范围, 更像一次性工具试用而不是标准 POC' : '',
    !hasOwnerSignal ? '没有看到审核人/负责人信号, 复盘会容易失焦' : '',
    !hasTimelineSignal ? '没有启动和复盘时间窗, 难形成成交节奏' : '',
    !hasRiskContext ? '没有提前定义合规和红线, 后面容易返工' : '',
  ].filter(Boolean);
  const contractSignals = [
    hasAcceptanceIntent ? '有验收语言, 可以把结果拉到复盘会' : '',
    hasTenSkuSignal ? '范围接近 10 SKU 标准包, 符合正式 POC 形态' : '',
    hasBenchmark ? '证据链存在, 复盘时更容易解释为什么继续投' : '',
    hasOwnerSignal ? '存在审核/负责人信号, 便于会后推进' : '',
    hasTimelineSignal ? '有明确时间窗, 适合安排启动和复盘节点' : '',
    hasExpansionSignal ? '出现扩 SKU / 签约 / 主站信号, 有转合同机会' : '',
  ].filter(Boolean);

  const decision = !hasSku || !hasBrand || !hasPlatform
    ? 'needs-info'
    : !hasBenchmark
      ? 'hypothesis-only'
      : acceptanceScore >= 80
        ? 'ready-for-poc'
        : 'needs-info';

  const label = decision === 'ready-for-poc'
    ? '可进入 POC 交付'
    : decision === 'hypothesis-only'
      ? '只能生成假设包'
      : '先补资料';
  const stageLabel = decision === 'ready-for-poc'
    ? contractReadiness >= 75
      ? '交付后可直接复盘推进合同'
      : '可启动 POC, 但签约前置信息还不够'
    : decision === 'hypothesis-only'
      ? '只有内容假设, 还不能当正式交付'
      : '资料未齐, 暂不应排产';
  const nextStepLabel = decision === 'needs-info'
    ? '先补资料再排期'
    : decision === 'hypothesis-only'
      ? '先补 benchmark, 再决定是否进入 POC'
      : contractReadiness >= 75
        ? '锁复盘会并准备扩 SKU / 主站合同'
        : '先跑 10 SKU POC, 同时补齐复盘与审核机制';

  return {
    leadScore,
    acceptanceScore,
    contractReadiness,
    decision,
    label,
    stageLabel,
    nextStepLabel,
    blockers,
    strengths,
    contractBlockers,
    contractSignals,
    reviewChecklist: [
      '确认是否有 5-10 个真实 SKU, 而不是单次试图',
      '确认 benchmark 是否真实可访问, 不把假设包装成调研结论',
      '确认是否有最终审核人和验收口径',
      '确认高风险品类、功效词、商标词是否需要人工终审',
      '确认下一步是补资料、进入 POC、扩 SKU, 还是转主站合同',
    ],
  };
}

export function buildStandardPack(input: StandardPackInput): StandardPack {
  const workflow = getWorkflow(input.workflowId || recommendWorkflowId(Object.values(input).join('\n')));
  const hasBenchmark = input.links.trim().length > 0;
  const missingInputs = [
    !input.goal.trim() ? '增长目标' : '',
    !input.brand.trim() ? '品牌 / 店铺上下文' : '',
    !input.sku.trim() ? 'SKU / 卖点' : '',
    !hasBenchmark ? 'benchmark URL / 竞品账号 / 评论证据' : '',
  ].filter(Boolean);

  const benchmarkNote = hasBenchmark
    ? input.links.trim()
    : '待补 benchmark。当前只能生成搜索地图和内容假设, 不能作为已完成调研结论。';
  const readiness = scoreStandardPackReadiness(input, missingInputs);

  return {
    workflow,
    missingInputs,
    readiness,
    sections: [
      {
        title: '01 输入摘要',
        body: [
          `增长目标: ${input.goal.trim() || '待补'}`,
          `品牌 / 店铺: ${input.brand.trim() || '待补'}`,
          `SKU / 卖点: ${input.sku.trim() || '待补'}`,
          `参考链接 / 账号: ${benchmarkNote}`,
        ],
      },
      {
        title: '02 推荐 workflow',
        body: [
          `${workflow.label}`,
          `适用判断: ${workflow.whenToUse}`,
          `必须补齐: ${workflow.requiredInputs.join(' / ')}`,
        ],
      },
      {
        title: '03 标准交付物',
        body: workflow.outputs.map((item, index) => `${index + 1}. ${item}`),
      },
      {
        title: '04 验收标准',
        body: workflow.acceptanceCriteria.map((item, index) => `${index + 1}. ${item}`),
      },
      {
        title: '05 人工终审边界',
        body: workflow.redlines.map((item, index) => `${index + 1}. ${item}`),
      },
      {
        title: '06 7 天测试节奏',
        body: [
          'Day 1: 补齐 benchmark 与素材, 定义版本命名。',
          'Day 2-3: 产出首批 3-5 个版本, 只测试一个核心变量。',
          'Day 4-5: 根据播放、点击、评论信号做二轮改写。',
          'Day 6: 汇总胜出 Hook、首帧、CTA 和素材缺口。',
          'Day 7: 决定进入下一轮 SKU、进入主站合同, 或先补资料。',
        ],
      },
      {
        title: '07 POC 准入与复盘判断',
        body: [
          `线索分: ${readiness.leadScore}/100`,
          `验收准备度: ${readiness.acceptanceScore}/100`,
          `合同准备度: ${readiness.contractReadiness}/100`,
          `当前判断: ${readiness.label}`,
          `交付阶段: ${readiness.stageLabel}`,
          `主要阻塞: ${readiness.blockers.length ? readiness.blockers.join(' / ') : '暂无硬阻塞'}`,
          `可用优势: ${readiness.strengths.length ? readiness.strengths.join(' / ') : '暂无明显优势信号'}`,
        ],
      },
      {
        title: '08 商业推进动作',
        body: [
          `本轮建议动作: ${readiness.nextStepLabel}`,
          `签约阻塞: ${readiness.contractBlockers.length ? readiness.contractBlockers.join(' / ') : '暂无关键签约阻塞'}`,
          `签约信号: ${readiness.contractSignals.length ? readiness.contractSignals.join(' / ') : '当前还没有明确签约信号'}`,
          '复盘会最晚应在本轮 7 天测试结束后 48 小时内召开, 否则这份包很容易停留在演示层。',
        ],
      },
    ],
    nextActions: readiness.decision === 'hypothesis-only'
      ? ['补 benchmark 证据', '重算准入评分', '再决定是否进入 10 SKU POC']
      : missingInputs.length > 0
      ? [
        ...missingInputs.map(item => `补齐 ${item}`),
        '补齐后再安排制作和复盘时间',
      ]
      : readiness.contractReadiness >= 75
          ? ['导出交付包', '进入人工终审', '锁定复盘会', '准备扩 SKU / 主站合同']
          : ['导出交付包', '进入人工终审', '提交 10 SKU POC', '补齐审核人和复盘节点'],
  };
}

export function formatStandardPackMarkdown(pack: StandardPack): string {
  const lines = [`# wenai ${pack.workflow.label} 标准交付包`, ''];
  for (const section of pack.sections) {
    lines.push(`## ${section.title}`, '');
    section.body.forEach(item => lines.push(`- ${item}`));
    lines.push('');
  }
  lines.push('## 下一步', '');
  pack.nextActions.forEach(item => lines.push(`- ${item}`));
  return lines.join('\n').trim();
}

export function formatStandardPackReport(pack: StandardPack): string {
  const executionPlan = getStandardPackExecutionPlan(pack);
  const lines = [
    `# wenai ${pack.workflow.shortLabel} 验收摘要`,
    '',
    '## 一句话判断',
    `- POC 判断: ${pack.readiness.label}`,
    `- 阶段判断: ${pack.readiness.stageLabel}`,
    `- 建议动作: ${pack.readiness.nextStepLabel}`,
    '',
    '## 评分',
    `- 线索分: ${pack.readiness.leadScore}/100`,
    `- 验收准备: ${pack.readiness.acceptanceScore}/100`,
    `- 合同准备: ${pack.readiness.contractReadiness}/100`,
    '',
    '## 可继续推进的理由',
  ];

  (pack.readiness.strengths.length > 0 ? pack.readiness.strengths : ['当前优势还不够明显, 先补齐输入后再看。'])
    .forEach(item => lines.push(`- ${item}`));

  lines.push('', '## 主要阻塞');
  (pack.readiness.contractBlockers.length > 0 ? pack.readiness.contractBlockers : ['暂无关键签约阻塞。'])
    .forEach(item => lines.push(`- ${item}`));

  lines.push('', '## 下一步');
  pack.nextActions.forEach(item => lines.push(`- ${item}`));

  lines.push(
    '',
    '## 推荐执行路线',
    `- 主执行入口: ${executionPlan.primaryPipeline.label}`,
    `- 路径: ${executionPlan.primaryPipeline.href}`,
    `- 原因: ${executionPlan.primaryPipeline.reason}`,
    '',
    '## 客户四步走',
  );
  executionPlan.customerSteps.forEach(item => lines.push(`- ${item}`));

  return lines.join('\n').trim();
}

export function formatStandardPackOpsBrief(pack: StandardPack): string {
  const lines = [
    `# wenai ${pack.workflow.shortLabel} 执行 Brief`,
    '',
    '## 工作流',
    `- 当前 workflow: ${pack.workflow.label}`,
    `- 适用判断: ${pack.workflow.whenToUse}`,
    '',
    '## 本次必须产出',
  ];

  pack.workflow.outputs.forEach(item => lines.push(`- ${item}`));

  lines.push('', '## 验收标准');
  pack.workflow.acceptanceCriteria.forEach(item => lines.push(`- ${item}`));

  lines.push('', '## 红线');
  pack.workflow.redlines.forEach(item => lines.push(`- ${item}`));

  lines.push('', '## 复盘检查');
  pack.readiness.reviewChecklist.forEach(item => lines.push(`- ${item}`));

  return lines.join('\n').trim();
}

export function formatStandardPackFollowup(pack: StandardPack): string {
  const summarySection = pack.sections.find(section => section.title.includes('输入摘要'));
  const summary = summarySection
    ? summarySection.body.map(item => `- ${item}`).join('\n')
    : '- 待补输入摘要';

  const lines = [
    '你好，',
    '',
    '我已经把这次 POC 的输入整理成可执行标准包，当前判断如下：',
    `- POC 状态: ${pack.readiness.label}`,
    `- 当前阶段: ${pack.readiness.stageLabel}`,
    `- 建议下一步: ${pack.readiness.nextStepLabel}`,
    '',
    '这次我们会重点围绕以下输入推进：',
    summary,
    '',
    '为了让交付更稳、后续更容易进入复盘和合同判断，请优先补齐：',
  ];

  (pack.missingInputs.length > 0 ? pack.missingInputs : ['当前核心输入已齐，可以直接进入交付和人工终审。'])
    .forEach(item => lines.push(`- ${item}`));

  lines.push('', '拿到这些信息后，我们就能按标准包推进交付、验收和下一轮决策。');

  return lines.join('\n').trim();
}

export interface StandardPackExecutionPlan {
  primaryPipeline: {
    label: string;
    href: string;
    reason: string;
  };
  supportingPipelines: Array<{
    label: string;
    href: string;
  }>;
  customerSteps: string[];
}

const EXECUTION_PLAN_BY_WORKFLOW: Record<WorkflowId, StandardPackExecutionPlan> = {
  benchmark: {
    primaryPipeline: {
      label: '市场宣传包',
      href: '/pipelines/marketing-campaign',
      reason: '先把 benchmark、评论痛点、Hook 和测试假设整理成增长测试包。',
    },
    supportingPipelines: [
      { label: '拆参考视频', href: '/pipelines/video-teardown' },
      { label: '新品上新', href: '/pipelines/new-listing' },
    ],
    customerSteps: [
      '补齐 3 个以上参考来源或竞品账号',
      '生成 benchmark-to-campaign 标准包',
      '确认哪些假设进入 7 天内容测试',
      '复盘后决定扩 SKU 或推进主站合同',
    ],
  },
  'podcast-ugc': {
    primaryPipeline: {
      label: 'AI 视频',
      href: '/pipelines/ai-video',
      reason: '把口播脚本、镜头节奏和 CTA 变成可生产的视频资产。',
    },
    supportingPipelines: [
      { label: '市场宣传包', href: '/pipelines/marketing-campaign' },
      { label: '拆参考视频', href: '/pipelines/video-teardown' },
    ],
    customerSteps: [
      '确认目标人群、品牌语气和不能碰的功效词',
      '生成双人口播脚本和剪辑点位',
      '进入视频生产或人工拍摄 brief',
      '用首帧、完播和评论反馈复盘',
    ],
  },
  'street-interview': {
    primaryPipeline: {
      label: '市场宣传包',
      href: '/pipelines/marketing-campaign',
      reason: '先把街采问题、场景、授权边界和脚本拆成可执行清单。',
    },
    supportingPipelines: [
      { label: 'AI 视频', href: '/pipelines/ai-video' },
      { label: '达人外联', href: '/pipelines/influencer-outbound' },
    ],
    customerSteps: [
      '确认采访场景和授权口径',
      '生成街采问题和镜头脚本',
      '人工终审敏感表达',
      '复盘素材是否值得扩到达人/UGC 批量生产',
    ],
  },
  'slideshow-batch': {
    primaryPipeline: {
      label: 'AB 测试',
      href: '/pipelines/ab-test',
      reason: 'Slideshow 的价值在于快速验证 Hook、首帧和卖点顺序。',
    },
    supportingPipelines: [
      { label: '产品主图', href: '/pipelines/product-image' },
      { label: '市场宣传包', href: '/pipelines/marketing-campaign' },
    ],
    customerSteps: [
      '确认每个版本只测试一个变量',
      '生成 5 条 slideshow 版本和命名规则',
      '进入 AB 测试或平台小预算测试',
      '按 CTR、收藏、加购或评论信号复盘',
    ],
  },
  'batch-ugc': {
    primaryPipeline: {
      label: 'AI 视频',
      href: '/pipelines/ai-video',
      reason: '批量 UGC 需要把脚本、镜头表和素材 manifest 接到视频生产。',
    },
    supportingPipelines: [
      { label: '市场宣传包', href: '/pipelines/marketing-campaign' },
      { label: '达人外联', href: '/pipelines/influencer-outbound' },
    ],
    customerSteps: [
      '确认素材清单和可拍镜头',
      '生成 10 条短视频脚本',
      '进入视频生产或达人外联',
      '复盘哪些脚本可以沉淀为长期模板',
    ],
  },
  'animated-ads': {
    primaryPipeline: {
      label: 'AI 视频',
      href: '/pipelines/ai-video',
      reason: '动效广告需要把功能解释、字幕节奏和 CTA 接到视频资产。',
    },
    supportingPipelines: [
      { label: '产品主图', href: '/pipelines/product-image' },
      { label: 'AB 测试', href: '/pipelines/ab-test' },
    ],
    customerSteps: [
      '确认功能结构和不能夸大的限制条件',
      '生成动效分镜和字幕节奏',
      '进入视频生产',
      '用首帧和完播率判断是否扩版本',
    ],
  },
  'editing-only': {
    primaryPipeline: {
      label: '视频拆解',
      href: '/pipelines/video-teardown',
      reason: '已有素材时先诊断结构，再重排 Hook、字幕和 CTA。',
    },
    supportingPipelines: [
      { label: 'AI 视频', href: '/pipelines/ai-video' },
      { label: '数据洞察', href: '/pipelines/data-insights' },
    ],
    customerSteps: [
      '上传原视频或旧素材链接',
      '诊断前 3 秒、节奏点和 CTA',
      '生成重排时间线和二剪版本清单',
      '复盘新旧版本数据差异',
    ],
  },
};

export function getStandardPackExecutionPlan(pack: StandardPack): StandardPackExecutionPlan {
  return EXECUTION_PLAN_BY_WORKFLOW[pack.workflow.id];
}
