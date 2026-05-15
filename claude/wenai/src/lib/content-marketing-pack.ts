import { buildStandardPackRoute } from './standard-pack-routing';
import { getCategoryGuardrail } from './ecommerce-guardrails';

export interface ContentMarketingPackInput {
  category: string;
  sku: string;
  platform: 'tiktok' | 'instagram' | 'both';
  benchmarkLinks: string;
  brandVoice?: string;
  campaignGoal?: string;
}

export interface HookMatrixRow {
  angle: string;
  hook: string;
  firstFrame: string;
  proofNeeded: string;
  riskCheck: string;
}

export interface ContentMarketingPack {
  categoryLabel: string;
  platformLabel: string;
  hookMatrix: HookMatrixRow[];
  slideshowBrief: string[];
  reelBrief: string[];
  publishingReport: string[];
  redlines: string[];
  standardPackHref: string;
  markdown: string;
}

const PLATFORM_LABEL: Record<ContentMarketingPackInput['platform'], string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  both: 'TikTok + Instagram',
};

function hasBenchmark(input: ContentMarketingPackInput): boolean {
  return input.benchmarkLinks.trim().length >= 8;
}

export function buildContentMarketingPack(input: ContentMarketingPackInput): ContentMarketingPack {
  const playbook = getCategoryGuardrail(input.category);
  const platformLabel = PLATFORM_LABEL[input.platform];
  const benchmarkReady = hasBenchmark(input);
  const sku = input.sku.trim() || '未填写 SKU';
  const goal = input.campaignGoal?.trim() || '先验证内容角度，再决定是否扩大这批 SKU';

  const hookMatrix: HookMatrixRow[] = [
    {
      angle: '痛点开场',
      hook: `不要一上来只展示 ${sku}，先把买家遇到的问题说清楚。`,
      firstFrame: '展示使用前的混乱、低效或高摩擦场景。',
      proofNeeded: playbook.requiredProof[0] || 'SKU 证据',
      riskCheck: playbook.reviewQuestions[0] || '需要人工复核。',
    },
    {
      angle: '证据开场',
      hook: `这个${playbook.label} SKU 最有说服力的不是口号，而是看得见的证据。`,
      firstFrame: '展示细节特写、规格标注或前后对比。',
      proofNeeded: playbook.requiredProof[1] || '参考样例证据',
      riskCheck: playbook.reviewQuestions[1] || '避免无依据承诺。',
    },
    {
      angle: '场景开场',
      hook: `把这个 SKU 放进买家一眼能认出来的使用场景里。`,
      firstFrame: '真实使用场景，只展示一个清晰动作。',
      proofNeeded: playbook.requiredProof[2] || '使用场景证据',
      riskCheck: playbook.reviewQuestions[2] || '不要过度泛化。',
    },
    {
      angle: '异议开场',
      hook: `先回答买家最担心的问题，再引导下一步动作。`,
      firstFrame: '字幕点出一个顾虑：适配、尺寸、安全、材质、价格或使用门槛。',
      proofNeeded: '常见问答、评价摘要、参考样例或客服问题。',
      riskCheck: playbook.forbiddenClaims[0] || '不能夸大承诺。',
    },
  ];

  const slideshowBrief = [
    '版本 A：痛点开场五帧轮播，只测试开场痛点。',
    '版本 B：证据开场五帧轮播，只测试证据顺序。',
    '版本 C：场景开场五帧轮播，只测试使用场景。',
    '每个版本都用 SKU、平台、角度、日期和复核负责人命名。',
  ];

  const reelBrief = [
    `开头 0-2 秒：${hookMatrix[0].firstFrame}`,
    '中段 3-8 秒：把一个功能转成一个买家收益。',
    '证据 9-13 秒：展示材质、适配、尺寸、成分、上身效果或参考样例支撑。',
    '结尾 14-18 秒：只要求一个低门槛动作，不要硬卖。',
  ];

  const publishingReport = [
    `参考证据：${benchmarkReady ? '已提供，可拆解' : '缺失，当前内容只能当作假设' }。`,
    `测试目标：${goal}。`,
    '只发布已经指定复核负责人并完成红线检查的版本。',
    '7 天后复盘：开场留存、收藏/分享/评论信号、SKU 页面点击和客服异议。',
    '决策：扩大有效开场、补强弱证据，或继续收集参考样例。',
  ];

  const redlines = [
    ...playbook.forbiddenClaims.slice(0, 4),
    '不要逐字复制竞品素材或标题。',
    '不要把合成样例当作真实用户评价。',
  ];

  const markdown = [
    '# wenai 内容营销交付包',
    '',
    `- 类目: ${playbook.label}`,
    `- 平台: ${platformLabel}`,
    `- SKU: ${sku}`,
    `- 目标: ${goal}`,
    `- 参考状态: ${benchmarkReady ? '已提供' : '缺失 / 仅可作为假设'}`,
    '',
    '## TikTok / Instagram 开场句矩阵',
    ...hookMatrix.map(row => `- ${row.angle}: ${row.hook} / 第一帧: ${row.firstFrame} / 证据: ${row.proofNeeded} / 风险: ${row.riskCheck}`),
    '',
    '## 轮播脚本',
    ...slideshowBrief.map(item => `- ${item}`),
    '',
    '## 短视频脚本',
    ...reelBrief.map(item => `- ${item}`),
    '',
    '## 发布复盘报告',
    ...publishingReport.map(item => `- ${item}`),
    '',
    '## 风险红线',
    ...redlines.map(item => `- ${item}`),
  ].join('\n');

  const standardPackHref = buildStandardPackRoute({
    workflow: 'slideshow-batch',
    goal,
    brand: `${playbook.label} / ${platformLabel} / ${input.brandVoice || '未填写品牌语气'}`,
    sku,
    links: input.benchmarkLinks || '缺少参考样例；当前输出只能作为假设',
  });

  return {
    categoryLabel: playbook.label,
    platformLabel,
    hookMatrix,
    slideshowBrief,
    reelBrief,
    publishingReport,
    redlines,
    standardPackHref,
    markdown,
  };
}
