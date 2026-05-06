export type CrmInquiryLike = {
  id: string;
  company: string;
  status?: string;
  leadScore?: string;
  contractReadiness?: string;
  readinessAcceptanceScore?: string;
  contractStage?: string;
  quoteStatus?: string;
  paymentStatus?: string;
  nextAction?: string;
  nextActionDue?: string;
  reviewCompletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface PipelineOpportunity {
  id: string;
  company: string;
  stage: string;
  stageLabel: string;
  probability: number;
  slaLabel: string;
  slaRisk: 'ok' | 'due-soon' | 'overdue';
  nextAction: string;
}

export interface PipelineSummary {
  opportunities: PipelineOpportunity[];
  stageCounts: Record<string, number>;
  weightedPipeline: number;
  overdueCount: number;
  nextBestActions: string[];
}

const STATUS_WEIGHT: Record<string, number> = {
  new: 12,
  contacted: 20,
  sku_received: 32,
  needs_info: 24,
  in_delivery: 48,
  delivered: 58,
  reviewed: 70,
  contract: 82,
  dropped: 0,
};

const CONTRACT_STAGE_WEIGHT: Record<string, number> = {
  discovery: 26,
  proposal: 58,
  negotiation: 72,
  waiting_payment: 86,
  won: 100,
  lost: 0,
};

const QUOTE_WEIGHT: Record<string, number> = {
  not_sent: 0,
  drafting: 8,
  sent: 14,
  approved: 20,
  rejected: -18,
};

const PAYMENT_WEIGHT: Record<string, number> = {
  not_started: 0,
  pending: 12,
  paid: 100,
};

const STAGE_LABEL: Record<string, string> = {
  new: '新需求',
  contacted: '已联系',
  sku_received: '已收 SKU',
  needs_info: '待补资料',
  in_delivery: '交付中',
  delivered: '已交付',
  reviewed: '已复盘',
  contract: '进合同',
  dropped: '已放弃',
  discovery: '需求确认',
  proposal: '方案/报价中',
  negotiation: '商务谈判中',
  waiting_payment: '待付款',
  won: '已成交',
  lost: '丢单',
};

function toNumber(value?: string): number {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function scoreOpportunity(input: CrmInquiryLike): number {
  if (input.paymentStatus === 'paid' || input.contractStage === 'won') return 100;
  if (input.contractStage === 'lost' || input.quoteStatus === 'rejected' || input.status === 'dropped') return 0;

  const statusBase = STATUS_WEIGHT[input.status || 'new'] ?? 12;
  const contractBase = input.contractStage ? CONTRACT_STAGE_WEIGHT[input.contractStage] ?? statusBase : statusBase;
  const quoteLift = QUOTE_WEIGHT[input.quoteStatus || 'not_sent'] ?? 0;
  const paymentLift = PAYMENT_WEIGHT[input.paymentStatus || 'not_started'] ?? 0;
  const leadScore = toNumber(input.leadScore);
  const readiness = toNumber(input.contractReadiness);
  const acceptance = toNumber(input.readinessAcceptanceScore);
  const scoreSignal = Math.round((leadScore + readiness + acceptance) / (leadScore && readiness && acceptance ? 9 : 12));

  return clamp(Math.max(statusBase, contractBase) + quoteLift + paymentLift + scoreSignal);
}

export function getSlaState(input: CrmInquiryLike, now = new Date()): PipelineOpportunity['slaRisk'] {
  if (!input.nextActionDue) return 'ok';
  const due = new Date(input.nextActionDue);
  if (Number.isNaN(due.getTime())) return 'ok';
  const diffDays = (due.getTime() - now.getTime()) / (24 * 3600 * 1000);
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 1) return 'due-soon';
  return 'ok';
}

export function buildPipelineSummary(inquiries: CrmInquiryLike[], now = new Date()): PipelineSummary {
  const opportunities = inquiries
    .filter(item => item.status !== 'dropped' && item.contractStage !== 'lost')
    .map(item => {
      const stage = item.contractStage || item.status || 'new';
      const slaRisk = getSlaState(item, now);
      return {
        id: item.id,
        company: item.company,
        stage,
        stageLabel: STAGE_LABEL[stage] || stage,
        probability: scoreOpportunity(item),
        slaLabel: item.nextActionDue || '无 SLA',
        slaRisk,
        nextAction: item.nextAction || '确认 SKU、benchmark、负责人和下一步商务动作。',
      };
    })
    .sort((a, b) => b.probability - a.probability);

  const stageCounts = opportunities.reduce<Record<string, number>>((acc, item) => {
    acc[item.stage] = (acc[item.stage] || 0) + 1;
    return acc;
  }, {});

  return {
    opportunities,
    stageCounts,
    weightedPipeline: opportunities.reduce((sum, item) => sum + item.probability, 0),
    overdueCount: opportunities.filter(item => item.slaRisk === 'overdue').length,
    nextBestActions: opportunities.slice(0, 5).map(item => `${item.company}: ${item.nextAction}`),
  };
}
