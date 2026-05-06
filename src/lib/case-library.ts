import { CASE_STUDY_DETAILS } from './case-study-details';

export type CaseLibraryLane =
  | 'launch-pack'
  | 'content-campaign'
  | 'creator-outbound'
  | 'image-production';

export type CaseLibraryDecision =
  | 'push-contract'
  | 'expand-scope'
  | 'iterate'
  | 'collect-inputs';

export interface CaseLibraryEntry {
  slug: string;
  title: string;
  segment: string;
  category: string;
  summary: string;
  pipelineLabel: string;
  pipelineHref: string;
  standardPackHref: string;
  proofLevel: string;
  contractAction: string;
  readiness: string;
  acceptanceScore: string;
  nextStep: string;
  lane: CaseLibraryLane;
  decision: CaseLibraryDecision;
  proofStatement: string;
  commercialUse: string;
  stageLabel: string;
}

export interface CaseLibraryFilters {
  lane: CaseLibraryLane | 'all';
  decision: CaseLibraryDecision | 'all';
  category: string | 'all';
}

export const CASE_LANE_META: Record<
  CaseLibraryLane,
  { label: string; description: string }
> = {
  'launch-pack': {
    label: '上新交付',
    description: '把 SKU 输入压成可验收的 launch pack。',
  },
  'content-campaign': {
    label: '内容营销',
    description: '把 benchmark 拆成 campaign-ready deliverables。',
  },
  'creator-outbound': {
    label: '达人外联',
    description: '把 outreach 从散发消息变成受控执行。',
  },
  'image-production': {
    label: '视觉生产',
    description: '把视觉候选图变成有边界的交付包。',
  },
};

export const CASE_DECISION_META: Record<
  CaseLibraryDecision,
  { label: string; description: string }
> = {
  'push-contract': {
    label: '推合同',
    description: '案例证明可以从 POC 进入长期合作。',
  },
  'expand-scope': {
    label: '扩范围',
    description: '案例证明可以加 SKU 或加模块继续卖。',
  },
  iterate: {
    label: '继续迭代',
    description: '案例证明有价值，但还要补交付稳定性。',
  },
  'collect-inputs': {
    label: '先补资料',
    description: '案例证明方向成立，但进入交付前要补边界。',
  },
};

const CASE_LIBRARY_META: Record<
  string,
  Omit<
    CaseLibraryEntry,
    | 'slug'
    | 'title'
    | 'segment'
    | 'category'
    | 'summary'
    | 'pipelineLabel'
    | 'pipelineHref'
    | 'standardPackHref'
    | 'proofLevel'
    | 'contractAction'
    | 'readiness'
    | 'acceptanceScore'
    | 'nextStep'
  >
> = {
  'home-decor': {
    lane: 'launch-pack',
    decision: 'expand-scope',
    proofStatement: '证明 10 SKU launch pack 可以把上新判断前移到交付前。',
    commercialUse: '适合卖 10 SKU POC、标准上新包、后续扩 SKU 月包。',
    stageLabel: 'Catalog launch',
  },
  'home-storage-launch-pack': {
    lane: 'launch-pack',
    decision: 'expand-scope',
    proofStatement: '证明 launch pack 不是文案服务，而是可复核的验收结构。',
    commercialUse: '适合当售前模板，直接给客户看交付目录和验收边界。',
    stageLabel: 'POC evidence',
  },
  homelody: {
    lane: 'launch-pack',
    decision: 'expand-scope',
    proofStatement: '证明多站点家居上新能被压成统一 SOP，而不是靠人记。',
    commercialUse: '适合卖多站点 listing 包和类目专属合规模板。',
    stageLabel: 'Operator case',
  },
  'auto-parts': {
    lane: 'content-campaign',
    decision: 'push-contract',
    proofStatement: '证明 benchmark 可以沉淀成 campaign 包，而不是一次性灵感。',
    commercialUse: '适合卖内容营销月包、合规词库、车品 campaign 续约。',
    stageLabel: 'Benchmark pack',
  },
  'auto-accessory-content-pack': {
    lane: 'content-campaign',
    decision: 'push-contract',
    proofStatement: '证明车品内容营销的价值在于结构化兼容说明和风险边界。',
    commercialUse: '适合给客户展示 benchmark-to-campaign 的标准交付。',
    stageLabel: 'POC evidence',
  },
  vicseed: {
    lane: 'content-campaign',
    decision: 'push-contract',
    proofStatement: '证明复杂 fitment 品类也能做成可卖的 campaign pack。',
    commercialUse: '适合卖 Shopify + Amazon 双渠道内容和合规协同包。',
    stageLabel: 'Operator case',
  },
  electronics: {
    lane: 'creator-outbound',
    decision: 'iterate',
    proofStatement: '证明外联效率提升本身不够，必须连同归因字段一起卖。',
    commercialUse: '适合卖达人外联 POC，再扩到 outreach execution 包。',
    stageLabel: 'Outreach system',
  },
  'micro-audio': {
    lane: 'creator-outbound',
    decision: 'iterate',
    proofStatement: '证明个性化达人外联可以标准化，但回收链路还要继续补强。',
    commercialUse: '适合卖第二轮 POC 和达人筛选规则包。',
    stageLabel: 'Operator case',
  },
  'novahome-image': {
    lane: 'image-production',
    decision: 'collect-inputs',
    proofStatement: '证明 AI 视觉可以做候选图生产，但不能跳过品牌终审。',
    commercialUse: '适合卖视觉规范整理、候选图 POC、再衔接长期图像生产。',
    stageLabel: 'Visual proof',
  },
};

export const DEFAULT_CASE_LIBRARY_FILTERS: CaseLibraryFilters = {
  lane: 'all',
  decision: 'all',
  category: 'all',
};

export function getCaseLibraryEntries(): CaseLibraryEntry[] {
  return CASE_STUDY_DETAILS.map(detail => {
    const meta = CASE_LIBRARY_META[detail.slug];

    if (!meta) {
      throw new Error(`Missing case-library meta for slug: ${detail.slug}`);
    }

    return {
      slug: detail.slug,
      title: detail.title,
      segment: detail.segment,
      category: detail.category,
      summary: detail.summary,
      pipelineLabel: detail.pipelineLabel,
      pipelineHref: detail.pipelineHref,
      standardPackHref: detail.standardPackHref,
      proofLevel: detail.proofLevel,
      contractAction: detail.review.contractAction,
      readiness: detail.review.readiness,
      acceptanceScore: detail.review.acceptanceScore,
      nextStep: detail.review.nextStep,
      ...meta,
    };
  });
}

export function getCaseLibraryCategories(entries: CaseLibraryEntry[]): string[] {
  return [...new Set(entries.map(item => item.category))].sort((left, right) =>
    left.localeCompare(right, 'zh-Hans-CN'),
  );
}

export function filterCaseLibrary(
  entries: CaseLibraryEntry[],
  filters: CaseLibraryFilters,
): CaseLibraryEntry[] {
  return entries.filter(entry => {
    const laneMatch = filters.lane === 'all' || entry.lane === filters.lane;
    const decisionMatch =
      filters.decision === 'all' || entry.decision === filters.decision;
    const categoryMatch =
      filters.category === 'all' || entry.category === filters.category;

    return laneMatch && decisionMatch && categoryMatch;
  });
}
