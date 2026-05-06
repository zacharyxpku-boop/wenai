import {
  CONTRACT_STAGE_LABELS,
  INQUIRY_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  QUOTE_STATUS_LABELS,
  REVIEW_DECISION_LABELS,
  type InquiryStatus,
} from './crm-labels';

export type { InquiryStatus };

export interface InquiryActivityEntry {
  at: string;
  type: 'created' | 'status' | 'ops' | 'legacy';
  title: string;
  body: string;
}

export interface InquiryActivitySeed {
  company?: string;
  source?: string;
  skuCount?: string;
  platforms?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  reviewDecision?: string;
  reviewCompletedAt?: string;
  contractNextStep?: string;
  reviewNotes?: string;
}

function truncateInline(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

function isInquiryStatus(value: string): value is InquiryStatus {
  return value in INQUIRY_STATUS_LABELS;
}

function safeAt(value?: string): string {
  return value && value.trim() ? value : new Date().toISOString();
}

export function parseInquiryActivity(raw: unknown): InquiryActivityEntry[] {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as InquiryActivityEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(item =>
        item &&
        typeof item.at === 'string' &&
        typeof item.title === 'string' &&
        typeof item.body === 'string',
      )
      .slice(-20);
  } catch {
    return [];
  }
}

export function serializeInquiryActivity(entries: InquiryActivityEntry[]): string {
  return JSON.stringify(entries.slice(-20));
}

export function appendInquiryActivity(
  raw: unknown,
  entries: InquiryActivityEntry[],
): string {
  return serializeInquiryActivity([...parseInquiryActivity(raw), ...entries].slice(-20));
}

export function buildInquiryCreatedActivity(seed: InquiryActivitySeed): InquiryActivityEntry {
  const summary = [
    seed.source ? `来源 ${seed.source}` : '',
    seed.skuCount ? `SKU ${seed.skuCount}` : 'SKU 待确认',
    seed.platforms ? `平台 ${seed.platforms}` : '平台待确认',
  ].filter(Boolean).join(' / ');

  return {
    at: safeAt(seed.createdAt),
    type: 'created',
    title: '收到新询盘',
    body: summary || `${seed.company || '客户'} 提交了新的 POC 需求`,
  };
}

export function buildLegacyInquiryActivities(seed: InquiryActivitySeed): InquiryActivityEntry[] {
  const entries: InquiryActivityEntry[] = [buildInquiryCreatedActivity(seed)];

  if (seed.status && isInquiryStatus(seed.status) && seed.status !== 'new') {
    entries.push({
      at: safeAt(seed.updatedAt || seed.createdAt),
      type: 'legacy',
      title: `当前状态：${INQUIRY_STATUS_LABELS[seed.status]}`,
      body: '该项目在本轮接管前未记录完整时间线，当前状态已补录。',
    });
  }

  const reviewSummary = [
    seed.reviewDecision && REVIEW_DECISION_LABELS[seed.reviewDecision as keyof typeof REVIEW_DECISION_LABELS]
      ? `复盘决策 ${REVIEW_DECISION_LABELS[seed.reviewDecision as keyof typeof REVIEW_DECISION_LABELS]}`
      : '',
    seed.contractNextStep ? `合同动作 ${truncateInline(seed.contractNextStep, 80)}` : '',
    seed.reviewNotes ? `结论 ${truncateInline(seed.reviewNotes, 100)}` : '',
  ].filter(Boolean).join(' / ');

  if (reviewSummary) {
    entries.push({
      at: safeAt(seed.reviewCompletedAt || seed.updatedAt || seed.createdAt),
      type: 'legacy',
      title: '补录既有复盘/合同结论',
      body: reviewSummary,
    });
  }

  return entries;
}

export function buildStatusChangeActivity(input: {
  status: InquiryStatus;
  nextAction?: string;
  nextActionDue?: string;
  at?: string;
}): InquiryActivityEntry {
  const body = [
    input.nextAction ? `下一动作 ${truncateInline(input.nextAction, 120)}` : '',
    input.nextActionDue ? `截止 ${input.nextActionDue}` : '',
  ].filter(Boolean).join(' / ');

  return {
    at: safeAt(input.at),
    type: 'status',
    title: `状态更新为 ${INQUIRY_STATUS_LABELS[input.status]}`,
    body: body || '状态已推进',
  };
}

export function buildOpsActivity(input: {
  previous: Record<string, unknown>;
  patch: Record<string, string>;
  at?: string;
}): InquiryActivityEntry | null {
  const changes: string[] = [];
  const previousValue = (key: string) => typeof input.previous[key] === 'string' ? input.previous[key] as string : '';

  const addTextChange = (key: string, label: string, maxLength = 100) => {
    if (Object.prototype.hasOwnProperty.call(input.patch, key) && input.patch[key] !== previousValue(key)) {
      changes.push(`${label} ${truncateInline(input.patch[key] || '未填写', maxLength)}`);
    }
  };

  if (Object.prototype.hasOwnProperty.call(input.patch, 'owner') && input.patch.owner !== previousValue('owner')) {
    changes.push(`负责人 ${previousValue('owner') || '未分配'} -> ${input.patch.owner || '未分配'}`);
  }
  addTextChange('nextAction', '下一动作', 100);
  addTextChange('nextActionDue', '动作日期', 40);
  addTextChange('acceptanceScore', '验收分', 20);

  if (Object.prototype.hasOwnProperty.call(input.patch, 'reviewDecision') && input.patch.reviewDecision !== previousValue('reviewDecision')) {
    const label = REVIEW_DECISION_LABELS[input.patch.reviewDecision as keyof typeof REVIEW_DECISION_LABELS] || input.patch.reviewDecision || '未定';
    changes.push(`复盘决策 ${label}`);
  }
  addTextChange('reviewCompletedAt', '复盘完成', 40);
  addTextChange('contractNextStep', '合同动作', 100);

  if (Object.prototype.hasOwnProperty.call(input.patch, 'contractStage') && input.patch.contractStage !== previousValue('contractStage')) {
    const label = CONTRACT_STAGE_LABELS[input.patch.contractStage as keyof typeof CONTRACT_STAGE_LABELS] || input.patch.contractStage || '未定';
    changes.push(`成交阶段 ${label}`);
  }
  if (Object.prototype.hasOwnProperty.call(input.patch, 'quoteStatus') && input.patch.quoteStatus !== previousValue('quoteStatus')) {
    const label = QUOTE_STATUS_LABELS[input.patch.quoteStatus as keyof typeof QUOTE_STATUS_LABELS] || input.patch.quoteStatus || '未定';
    changes.push(`报价状态 ${label}`);
  }
  if (Object.prototype.hasOwnProperty.call(input.patch, 'paymentStatus') && input.patch.paymentStatus !== previousValue('paymentStatus')) {
    const label = PAYMENT_STATUS_LABELS[input.patch.paymentStatus as keyof typeof PAYMENT_STATUS_LABELS] || input.patch.paymentStatus || '未定';
    changes.push(`付款状态 ${label}`);
  }

  addTextChange('dealAmount', '成交金额', 40);
  addTextChange('dealProbability', '成交概率', 20);
  addTextChange('closeDate', '预计签约日', 40);
  addTextChange('lostReason', '丢单原因', 100);
  addTextChange('externalCrmId', '外部 CRM ID', 80);
  addTextChange('crmSyncStatus', 'CRM 同步状态', 40);
  addTextChange('crmSyncNote', '同步备注', 120);
  addTextChange('reviewNotes', '复盘结论', 120);

  if (changes.length === 0) return null;

  const hasCommercialChange = [
    'acceptanceScore',
    'reviewDecision',
    'reviewCompletedAt',
    'contractNextStep',
    'contractStage',
    'quoteStatus',
    'paymentStatus',
    'reviewNotes',
    'dealAmount',
    'dealProbability',
    'closeDate',
    'lostReason',
    'externalCrmId',
    'crmSyncStatus',
    'crmSyncNote',
  ].some(key => Object.prototype.hasOwnProperty.call(input.patch, key));

  return {
    at: safeAt(input.at),
    type: 'ops',
    title: hasCommercialChange ? '保存复盘/合同/CRM 记录' : '更新运营动作',
    body: changes.join(' / '),
  };
}
