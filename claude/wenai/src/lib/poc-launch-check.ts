import { buildStandardPackRoute } from './standard-pack-routing';

export type PocLaunchDecision = 'ready' | 'needs-evidence' | 'needs-input';

export interface PocLaunchCheckInput {
  skuCount: string;
  platforms: string;
  assetsReady: 'ready' | 'partial' | 'none';
  benchmarkReady: boolean;
  acceptanceReady: boolean;
  ownerReady: boolean;
  timelineReady: boolean;
}

export interface PocLaunchCheckResult {
  score: number;
  decision: PocLaunchDecision;
  label: string;
  nextStep: string;
  blockers: string[];
  strengths: string[];
  standardPackHref: string;
  checklistMarkdown: string;
}

function parseSkuCount(value: string): number {
  const match = value.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : 0;
}

function buildChecklistMarkdown(input: PocLaunchCheckInput, result: Omit<PocLaunchCheckResult, 'checklistMarkdown'>): string {
  const lines = [
    '# wenai 10 SKU POC 启动自检',
    '',
    `- 准备度: ${result.score}/100`,
    `- 判断: ${result.label}`,
    `- 下一步: ${result.nextStep}`,
    '',
    '## 当前输入',
    `- SKU 数: ${input.skuCount || '未填'}`,
    `- 平台: ${input.platforms || '未填'}`,
    `- 素材状态: ${input.assetsReady}`,
    `- benchmark: ${input.benchmarkReady ? '已准备' : '未准备'}`,
    `- 验收口径: ${input.acceptanceReady ? '已明确' : '未明确'}`,
    `- 负责人: ${input.ownerReady ? '已明确' : '未明确'}`,
    `- 复盘时间窗: ${input.timelineReady ? '已明确' : '未明确'}`,
    '',
    '## 阻塞项',
  ];

  (result.blockers.length > 0 ? result.blockers : ['暂无关键阻塞, 可以进入标准包生成和 POC 排期。'])
    .forEach(item => lines.push(`- ${item}`));

  lines.push('', '## 已具备条件');
  (result.strengths.length > 0 ? result.strengths : ['暂未形成足够强的 POC 启动条件。'])
    .forEach(item => lines.push(`- ${item}`));

  return lines.join('\n').trim();
}

export function evaluatePocLaunchCheck(input: PocLaunchCheckInput): PocLaunchCheckResult {
  const skuCount = parseSkuCount(input.skuCount);
  const hasTenSku = skuCount >= 10;
  const hasPlatform = input.platforms.trim().length >= 3;
  const assetsScore = input.assetsReady === 'ready' ? 18 : input.assetsReady === 'partial' ? 10 : 0;

  const score = Math.min(100,
    (hasTenSku ? 22 : skuCount > 0 ? 10 : 0) +
    (hasPlatform ? 15 : 0) +
    assetsScore +
    (input.benchmarkReady ? 15 : 0) +
    (input.acceptanceReady ? 12 : 0) +
    (input.ownerReady ? 10 : 0) +
    (input.timelineReady ? 8 : 0)
  );

  const blockers = [
    !hasTenSku ? 'SKU 数不足 10 个, 更像单点试用, 不足以判断 POC 是否值得扩展' : '',
    !hasPlatform ? '缺少目标平台, 无法判断上新格式、内容形态和验收指标' : '',
    input.assetsReady === 'none' ? '缺少商品图/参数/卖点等基础素材, 暂不建议排产' : '',
    input.assetsReady === 'partial' ? '素材只部分齐, 需要先列出缺口再排期' : '',
    !input.benchmarkReady ? '缺少 benchmark 或参考账号, 当前只能生成假设包' : '',
    !input.acceptanceReady ? '缺少验收口径, 交付后难以判断是否推进合同' : '',
    !input.ownerReady ? '缺少最终审核人, 容易在人工终审环节卡住' : '',
    !input.timelineReady ? '缺少复盘时间窗, 难形成成交节奏' : '',
  ].filter(Boolean);

  const strengths = [
    hasTenSku ? 'SKU 数达到 10 个, 符合标准 POC 范围' : '',
    hasPlatform ? '已有目标平台, 可以约束交付格式' : '',
    input.assetsReady === 'ready' ? '素材齐备, 可以直接进入交付排期' : '',
    input.benchmarkReady ? '已有参考证据, 可进入 benchmark-to-campaign' : '',
    input.acceptanceReady ? '已有验收口径, 复盘能形成合同判断' : '',
    input.ownerReady ? '已有负责人, 人工终审路径清晰' : '',
    input.timelineReady ? '已有复盘时间窗, 具备推进节奏' : '',
  ].filter(Boolean);

  const decision: PocLaunchDecision = !hasTenSku || !hasPlatform || input.assetsReady === 'none'
    ? 'needs-input'
    : !input.benchmarkReady || !input.acceptanceReady
      ? 'needs-evidence'
      : 'ready';

  const label = decision === 'ready'
    ? '可以启动 10 SKU POC'
    : decision === 'needs-evidence'
      ? '先补证据再启动'
      : '先补基础资料';

  const nextStep = decision === 'ready'
    ? '生成 POC 标准包, 锁定交付排期和复盘会'
    : decision === 'needs-evidence'
      ? '补 benchmark、验收口径和复盘责任人, 再生成标准包'
      : '先补齐 SKU、平台和素材, 暂不建议直接排产';

  const standardPackHref = buildStandardPackRoute({
    workflow: 'benchmark',
    goal: '判断这批 SKU 是否可以启动 10 SKU POC, 并生成启动前标准交付包',
    brand: `POC 启动自检 / ${input.platforms || '平台待确认'} / ${label}`,
    sku: [
      input.skuCount ? `SKU 数: ${input.skuCount}` : 'SKU 数待确认',
      `素材状态: ${input.assetsReady}`,
      input.ownerReady ? '已有审核负责人' : '审核负责人待确认',
      input.timelineReady ? '已有复盘时间窗' : '复盘时间窗待确认',
    ].join('\n'),
    links: input.benchmarkReady
      ? 'benchmark 已准备, 请在正式交付时补充具体链接或账号。'
      : 'benchmark 待补, 当前只能生成搜索地图和内容假设。',
  });

  const base = {
    score,
    decision,
    label,
    nextStep,
    blockers,
    strengths,
    standardPackHref,
  };

  return {
    ...base,
    checklistMarkdown: buildChecklistMarkdown(input, base),
  };
}
