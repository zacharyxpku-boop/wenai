export type InquiryStatus =
  | 'new'
  | 'contacted'
  | 'sku_received'
  | 'needs_info'
  | 'in_delivery'
  | 'delivered'
  | 'reviewed'
  | 'contract'
  | 'dropped';

export type ReviewDecision = '' | 'iterate_poc' | 'expand_sku' | 'push_contract' | 'drop';
export type ContractStage = '' | 'discovery' | 'proposal' | 'negotiation' | 'waiting_payment' | 'won' | 'lost';
export type QuoteStatus = '' | 'not_sent' | 'drafting' | 'sent' | 'approved' | 'rejected';
export type PaymentStatus = '' | 'not_started' | 'pending' | 'paid';
export type LifecycleStage = '' | 'lead' | 'mql' | 'sql' | 'opportunity' | 'customer' | 'lost';
export type CrmPriority = '' | 'low' | 'normal' | 'high' | 'urgent';
export type CrmSyncStatus = '' | 'not_configured' | 'ready' | 'queued' | 'synced' | 'failed';

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: '新需求',
  contacted: '已联系',
  sku_received: '已收 SKU',
  needs_info: '待补资料',
  in_delivery: '交付中',
  delivered: '已交付',
  reviewed: '已复盘',
  contract: '进合同',
  dropped: '已放弃',
};

export const REVIEW_DECISION_LABELS: Record<Exclude<ReviewDecision, ''>, string> = {
  iterate_poc: '继续迭代 POC',
  expand_sku: '扩 SKU',
  push_contract: '推进主站合同',
  drop: '停止推进',
};

export const CONTRACT_STAGE_LABELS: Record<Exclude<ContractStage, ''>, string> = {
  discovery: '需求确认',
  proposal: '方案/报价中',
  negotiation: '商务谈判中',
  waiting_payment: '待付款',
  won: '已成交',
  lost: '丢单',
};

export const QUOTE_STATUS_LABELS: Record<Exclude<QuoteStatus, ''>, string> = {
  not_sent: '未发报价',
  drafting: '报价草拟中',
  sent: '已发报价',
  approved: '报价已确认',
  rejected: '报价被拒绝',
};

export const PAYMENT_STATUS_LABELS: Record<Exclude<PaymentStatus, ''>, string> = {
  not_started: '未开始',
  pending: '待付款',
  paid: '已付款',
};

export const LIFECYCLE_STAGE_LABELS: Record<Exclude<LifecycleStage, ''>, string> = {
  lead: '线索',
  mql: '市场合格线索',
  sql: '销售合格线索',
  opportunity: '商机',
  customer: '客户',
  lost: '流失/丢单',
};

export const CRM_PRIORITY_LABELS: Record<Exclude<CrmPriority, ''>, string> = {
  low: '低',
  normal: '普通',
  high: '高',
  urgent: '紧急',
};

export const CRM_SYNC_STATUS_LABELS: Record<Exclude<CrmSyncStatus, ''>, string> = {
  not_configured: '未配置外部 CRM',
  ready: '待同步',
  queued: '同步队列中',
  synced: '已同步',
  failed: '同步失败',
};

export const STATUS_OPTIONS = Object.entries(INQUIRY_STATUS_LABELS) as [InquiryStatus, string][];
export const REVIEW_DECISION_OPTIONS: [ReviewDecision, string][] = [
  ['', '未选择'],
  ...Object.entries(REVIEW_DECISION_LABELS) as [Exclude<ReviewDecision, ''>, string][],
];
export const CONTRACT_STAGE_OPTIONS: [ContractStage, string][] = [
  ['', '待判断'],
  ...Object.entries(CONTRACT_STAGE_LABELS) as [Exclude<ContractStage, ''>, string][],
];
export const QUOTE_STATUS_OPTIONS: [QuoteStatus, string][] = [
  ['', '未记录'],
  ...Object.entries(QUOTE_STATUS_LABELS) as [Exclude<QuoteStatus, ''>, string][],
];
export const PAYMENT_STATUS_OPTIONS: [PaymentStatus, string][] = [
  ['', '未记录'],
  ...Object.entries(PAYMENT_STATUS_LABELS) as [Exclude<PaymentStatus, ''>, string][],
];
export const LIFECYCLE_STAGE_OPTIONS: [LifecycleStage, string][] = [
  ['', '未分层'],
  ...Object.entries(LIFECYCLE_STAGE_LABELS) as [Exclude<LifecycleStage, ''>, string][],
];
export const CRM_PRIORITY_OPTIONS: [CrmPriority, string][] = [
  ['', '未设置'],
  ...Object.entries(CRM_PRIORITY_LABELS) as [Exclude<CrmPriority, ''>, string][],
];
export const CRM_SYNC_STATUS_OPTIONS: [CrmSyncStatus, string][] = [
  ['', '未记录'],
  ...Object.entries(CRM_SYNC_STATUS_LABELS) as [Exclude<CrmSyncStatus, ''>, string][],
];

export function labelOrFallback(labels: Record<string, string>, value?: string, fallback = '未记录'): string {
  if (!value) return fallback;
  return labels[value] || value;
}
