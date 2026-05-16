import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { checkRateLimit } from '@/lib/ratelimit';
import { buildStandardPack } from '@/lib/sop-workflows';
import { buildInquiryStandardPackPrefill } from '@/lib/standard-pack-routing';
import {
  appendInquiryActivity,
  buildInquiryCreatedActivity,
  buildLegacyInquiryActivities,
  buildOpsActivity,
  buildStatusChangeActivity,
  serializeInquiryActivity,
  type InquiryStatus,
} from '@/lib/inquiry-activity';
import { syncExternalCrm } from '@/lib/external-crm-sync';

interface Inquiry {
  company: string;
  contact: string;
  channel: string;
  scale: string;
  category: string;
  skuCount?: string;
  platforms?: string;
  assetsReady?: string;
  expectedDeliverables?: string;
  creativeNeeds?: string;
  benchmarkLinks?: string;
  painPoint: string;
  budget?: string;
  timeline?: string;
  source?: string;
  owner?: string;
  nextAction?: string;
  nextActionDue?: string;
  reviewNotes?: string;
  acceptanceScore?: string;
  leadScore?: string;
  readinessAcceptanceScore?: string;
  contractReadiness?: string;
  readinessDecision?: string;
  readinessLabel?: string;
  readinessStage?: string;
  recommendedAction?: string;
  contractBlockers?: string;
  reviewDecision?: string;
  reviewCompletedAt?: string;
  contractNextStep?: string;
  contractStage?: string;
  quoteStatus?: string;
  paymentStatus?: string;
  activityLog?: string;
  externalCrmId?: string;
  externalCrmUrl?: string;
  accountDomain?: string;
  contactName?: string;
  contactRole?: string;
  contactEmail?: string;
  contactPhone?: string;
  dealName?: string;
  dealAmount?: string;
  dealCurrency?: string;
  dealProbability?: string;
  closeDate?: string;
  lostReason?: string;
  lifecycleStage?: string;
  priority?: string;
  lastContactedAt?: string;
  nextMeetingAt?: string;
  crmSource?: string;
  crmSyncStatus?: string;
  crmSyncAt?: string;
  crmSyncNote?: string;
  tags?: string;
  segment?: string;
  companyOwner?: string;
  renewalPotential?: string;
}

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const SCALE_ALLOWED = new Set(['<50', '50-200', '200-1000', '1000+']);
const CATEGORY_ALLOWED = new Set(['home', 'auto', 'digital', 'tool', 'living', 'mixed', 'other']);
const ASSETS_ALLOWED = new Set(['ready', 'partial', 'none']);
const STATUS_ALLOWED = new Set<InquiryStatus>(['new', 'contacted', 'sku_received', 'needs_info', 'in_delivery', 'delivered', 'reviewed', 'contract', 'dropped']);
const REVIEW_DECISION_ALLOWED = new Set(['', 'iterate_poc', 'expand_sku', 'push_contract', 'drop']);
const CONTRACT_STAGE_ALLOWED = new Set(['', 'discovery', 'proposal', 'negotiation', 'waiting_payment', 'won', 'lost']);
const QUOTE_STATUS_ALLOWED = new Set(['', 'not_sent', 'drafting', 'sent', 'approved', 'rejected']);
const PAYMENT_STATUS_ALLOWED = new Set(['', 'not_started', 'pending', 'paid']);
const LIFECYCLE_STAGE_ALLOWED = new Set(['', 'lead', 'mql', 'sql', 'opportunity', 'customer', 'lost']);
const PRIORITY_ALLOWED = new Set(['', 'low', 'normal', 'high', 'urgent']);
const CRM_SYNC_STATUS_ALLOWED = new Set(['', 'not_configured', 'ready', 'queued', 'synced', 'failed']);

const CRM_PATCH_FIELDS = [
  'owner',
  'nextAction',
  'nextActionDue',
  'reviewNotes',
  'acceptanceScore',
  'reviewDecision',
  'reviewCompletedAt',
  'contractNextStep',
  'contractStage',
  'quoteStatus',
  'paymentStatus',
  'externalCrmId',
  'externalCrmUrl',
  'accountDomain',
  'contactName',
  'contactRole',
  'contactEmail',
  'contactPhone',
  'dealName',
  'dealAmount',
  'dealCurrency',
  'dealProbability',
  'closeDate',
  'lostReason',
  'lifecycleStage',
  'priority',
  'lastContactedAt',
  'nextMeetingAt',
  'crmSource',
  'crmSyncStatus',
  'crmSyncAt',
  'crmSyncNote',
  'tags',
  'segment',
  'companyOwner',
  'renewalPotential',
] as const;

function authed(req: NextRequest): boolean {
  const required = process.env.ADMIN_KEY;
  if (!required) return true;
  return req.headers.get('x-admin-key') === required;
}

function genId(): string {
  return `inq_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function getIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'anon';
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function take(value: unknown, maxLength: number): string {
  return str(value).slice(0, maxLength);
}

function deriveContactParts(contact: string): Pick<Inquiry, 'contactEmail' | 'contactPhone' | 'contactName'> {
  const email = contact.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  const phone = contact.match(/(?:\+?\d[\d\s-]{6,}\d)/)?.[0]?.trim() || '';
  const name = contact
    .replace(email, '')
    .replace(phone, '')
    .replace(/[|,，/]+/g, ' ')
    .trim()
    .slice(0, 80);
  return { contactEmail: email, contactPhone: phone, contactName: name };
}

function buildReadinessSnapshot(body: Inquiry) {
  const prefill = buildInquiryStandardPackPrefill({
    company: body.company || '',
    scale: body.scale || '',
    category: body.category || '',
    skuCount: body.skuCount || '',
    platforms: body.platforms || '',
    assetsReady: body.assetsReady || '',
    expectedDeliverables: body.expectedDeliverables || '',
    creativeNeeds: body.creativeNeeds || '',
    benchmarkLinks: body.benchmarkLinks || '',
    painPoint: body.painPoint || '',
  });
  const pack = buildStandardPack({
    goal: prefill.goal,
    brand: prefill.brand,
    sku: prefill.sku,
    links: prefill.links || '',
    workflowId: prefill.workflow,
  });
  return {
    leadScore: String(pack.readiness.leadScore),
    readinessAcceptanceScore: String(pack.readiness.acceptanceScore),
    contractReadiness: String(pack.readiness.contractReadiness),
    readinessDecision: pack.readiness.decision,
    readinessLabel: pack.readiness.label,
    readinessStage: pack.readiness.stageLabel,
    recommendedAction: pack.readiness.nextStepLabel.slice(0, 240),
    contractBlockers: pack.readiness.contractBlockers.join(' / ').slice(0, 600),
  };
}

function hasReadinessSnapshot(row: Record<string, unknown>): boolean {
  return typeof row.leadScore === 'string' &&
    typeof row.readinessAcceptanceScore === 'string' &&
    typeof row.contractReadiness === 'string' &&
    typeof row.readinessDecision === 'string';
}

function buildCrmDefaults(row: Record<string, unknown>): Record<string, string> {
  const contact = str(row.contact);
  const contactParts = deriveContactParts(contact);
  const company = str(row.company);
  return {
    externalCrmId: str(row.externalCrmId),
    externalCrmUrl: str(row.externalCrmUrl),
    accountDomain: str(row.accountDomain),
    contactName: str(row.contactName) || contactParts.contactName || contact,
    contactRole: str(row.contactRole),
    contactEmail: str(row.contactEmail) || contactParts.contactEmail || '',
    contactPhone: str(row.contactPhone) || contactParts.contactPhone || '',
    dealName: str(row.dealName) || `${company || '未命名客户'} / 10 SKU POC`,
    dealAmount: str(row.dealAmount),
    dealCurrency: str(row.dealCurrency) || 'CNY',
    dealProbability: str(row.dealProbability),
    closeDate: str(row.closeDate),
    lostReason: str(row.lostReason),
    lifecycleStage: str(row.lifecycleStage) || 'lead',
    priority: str(row.priority) || 'normal',
    lastContactedAt: str(row.lastContactedAt),
    nextMeetingAt: str(row.nextMeetingAt),
    crmSource: str(row.crmSource) || str(row.source) || 'wenai-inquiry',
    crmSyncStatus: str(row.crmSyncStatus) || 'not_configured',
    crmSyncAt: str(row.crmSyncAt),
    crmSyncNote: str(row.crmSyncNote),
    tags: str(row.tags),
    segment: str(row.segment) || str(row.category),
    companyOwner: str(row.companyOwner),
    renewalPotential: str(row.renewalPotential),
  };
}

function normalizeInquiryRow(row: Record<string, unknown>): Record<string, string> {
  const snapshot = buildReadinessSnapshot({
    company: str(row.company),
    contact: str(row.contact),
    channel: str(row.channel),
    scale: str(row.scale),
    category: str(row.category),
    skuCount: str(row.skuCount),
    platforms: str(row.platforms),
    assetsReady: str(row.assetsReady),
    expectedDeliverables: str(row.expectedDeliverables),
    creativeNeeds: str(row.creativeNeeds),
    benchmarkLinks: str(row.benchmarkLinks),
    painPoint: str(row.painPoint),
  });
  const base = hasReadinessSnapshot(row) ? row : { ...row, ...snapshot };
  const activityLog = str(base.activityLog).trim()
    ? str(base.activityLog)
    : serializeInquiryActivity(buildLegacyInquiryActivities({
      company: str(row.company),
      source: str(row.source),
      skuCount: str(row.skuCount),
      platforms: str(row.platforms),
      createdAt: str(row.createdAt),
      updatedAt: str(row.updatedAt),
      status: str(row.status),
      reviewDecision: str(row.reviewDecision),
      reviewCompletedAt: str(row.reviewCompletedAt),
      contractNextStep: str(row.contractNextStep),
      reviewNotes: str(row.reviewNotes),
    }));

  return {
    id: str(base.id),
    company: str(base.company),
    contact: str(base.contact),
    channel: str(base.channel),
    scale: str(base.scale),
    category: str(base.category),
    skuCount: str(base.skuCount),
    platforms: str(base.platforms),
    assetsReady: str(base.assetsReady),
    expectedDeliverables: str(base.expectedDeliverables),
    creativeNeeds: str(base.creativeNeeds),
    benchmarkLinks: str(base.benchmarkLinks),
    painPoint: str(base.painPoint),
    budget: str(base.budget),
    timeline: str(base.timeline),
    source: str(base.source),
    owner: str(base.owner),
    nextAction: str(base.nextAction),
    nextActionDue: str(base.nextActionDue),
    reviewNotes: str(base.reviewNotes),
    acceptanceScore: str(base.acceptanceScore),
    leadScore: str(base.leadScore),
    readinessAcceptanceScore: str(base.readinessAcceptanceScore),
    contractReadiness: str(base.contractReadiness),
    readinessDecision: str(base.readinessDecision),
    readinessLabel: str(base.readinessLabel),
    readinessStage: str(base.readinessStage),
    recommendedAction: str(base.recommendedAction),
    contractBlockers: str(base.contractBlockers),
    reviewDecision: str(base.reviewDecision),
    reviewCompletedAt: str(base.reviewCompletedAt),
    contractNextStep: str(base.contractNextStep),
    contractStage: str(base.contractStage),
    quoteStatus: str(base.quoteStatus),
    paymentStatus: str(base.paymentStatus),
    activityLog,
    ip: str(base.ip),
    createdAt: str(base.createdAt),
    updatedAt: str(base.updatedAt),
    status: str(base.status) || 'new',
    ...buildCrmDefaults(base),
  };
}

function buildExternalCrmRecord(row: Record<string, string>) {
  return {
    wenaiId: row.id,
    externalCrmId: row.externalCrmId,
    externalCrmUrl: row.externalCrmUrl,
    account: {
      name: row.company,
      domain: row.accountDomain,
      owner: row.companyOwner || row.owner,
      segment: row.segment,
      lifecycleStage: row.lifecycleStage,
      source: row.crmSource,
      tags: row.tags,
    },
    contact: {
      name: row.contactName,
      role: row.contactRole,
      email: row.contactEmail,
      phone: row.contactPhone,
      raw: row.contact,
    },
    deal: {
      name: row.dealName,
      amount: row.dealAmount,
      currency: row.dealCurrency,
      probability: row.dealProbability,
      stage: row.contractStage,
      quoteStatus: row.quoteStatus,
      paymentStatus: row.paymentStatus,
      closeDate: row.closeDate,
      lostReason: row.lostReason,
      priority: row.priority,
      nextAction: row.nextAction,
      nextActionDue: row.nextActionDue,
    },
    sync: {
      status: row.crmSyncStatus,
      at: row.crmSyncAt,
      note: row.crmSyncNote,
    },
  };
}

function validateEnum(value: unknown, allowed: Set<string>, label: string): string | null {
  if (typeof value === 'string' && !allowed.has(value)) return `${label} 非法`;
  return null;
}

export async function POST(req: NextRequest) {
  let body: Inquiry;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  if (!body.company?.trim() || !body.contact?.trim() || !body.painPoint?.trim()) {
    return NextResponse.json({ error: '公司名、联系方式、主要痛点为必填项' }, { status: 400 });
  }
  if (body.painPoint.length > 2000) {
    return NextResponse.json({ error: '痛点描述过长，请控制在 2000 字以内' }, { status: 400 });
  }
  const validationError =
    validateEnum(body.scale, SCALE_ALLOWED, '规模档位') ||
    validateEnum(body.category, CATEGORY_ALLOWED, '类目档位') ||
    validateEnum(body.assetsReady, ASSETS_ALLOWED, '素材状态') ||
    validateEnum(body.contractStage, CONTRACT_STAGE_ALLOWED, '合同阶段') ||
    validateEnum(body.quoteStatus, QUOTE_STATUS_ALLOWED, '报价状态') ||
    validateEnum(body.paymentStatus, PAYMENT_STATUS_ALLOWED, '付款状态') ||
    validateEnum(body.lifecycleStage, LIFECYCLE_STAGE_ALLOWED, '客户生命周期') ||
    validateEnum(body.priority, PRIORITY_ALLOWED, '优先级') ||
    validateEnum(body.crmSyncStatus, CRM_SYNC_STATUS_ALLOWED, 'CRM 同步状态');
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const ip = getIp(req);
  const limit = await checkRateLimit('inquiry', `ip:${ip}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: '提交过于频繁，请稍后再试，或直接邮件联系 zachary.x.pku@gmail.com' },
      { status: 429 },
    );
  }

  const id = genId();
  const readiness = buildReadinessSnapshot(body);
  const createdAt = new Date().toISOString();
  const contactParts = deriveContactParts(body.contact);
  const payload: Record<string, string> = {
    id,
    company: take(body.company, 120),
    contact: take(body.contact, 120),
    channel: take(body.channel, 30) || '未指定',
    scale: body.scale || '',
    category: body.category || '',
    skuCount: take(body.skuCount, 60),
    platforms: take(body.platforms, 120),
    assetsReady: body.assetsReady || '',
    expectedDeliverables: take(body.expectedDeliverables, 200),
    creativeNeeds: take(body.creativeNeeds, 80),
    benchmarkLinks: take(body.benchmarkLinks, 400),
    painPoint: take(body.painPoint, 2000),
    budget: take(body.budget, 100),
    timeline: take(body.timeline, 100),
    source: take(body.source, 60),
    owner: '',
    nextAction: '联系客户确认 10 个真实 SKU、目标平台、现有素材、benchmark 链接、内容 workflow 和 POC 验收口径',
    nextActionDue: '',
    reviewNotes: '',
    acceptanceScore: '',
    ...readiness,
    reviewDecision: '',
    reviewCompletedAt: '',
    contractNextStep: '',
    contractStage: body.contractStage || '',
    quoteStatus: body.quoteStatus || 'not_sent',
    paymentStatus: body.paymentStatus || 'not_started',
    externalCrmId: take(body.externalCrmId, 120),
    externalCrmUrl: take(body.externalCrmUrl, 300),
    accountDomain: take(body.accountDomain, 120),
    contactName: take(body.contactName, 80) || contactParts.contactName || take(body.contact, 80),
    contactRole: take(body.contactRole, 80),
    contactEmail: take(body.contactEmail, 120) || contactParts.contactEmail || '',
    contactPhone: take(body.contactPhone, 60) || contactParts.contactPhone || '',
    dealName: take(body.dealName, 160) || `${take(body.company, 80)} / 10 SKU POC`,
    dealAmount: take(body.dealAmount, 40),
    dealCurrency: take(body.dealCurrency, 12) || 'CNY',
    dealProbability: take(body.dealProbability, 20),
    closeDate: take(body.closeDate, 40),
    lostReason: take(body.lostReason, 240),
    lifecycleStage: body.lifecycleStage || 'lead',
    priority: body.priority || 'normal',
    lastContactedAt: take(body.lastContactedAt, 40),
    nextMeetingAt: take(body.nextMeetingAt, 40),
    crmSource: take(body.crmSource, 80) || take(body.source, 60) || 'wenai-inquiry',
    crmSyncStatus: body.crmSyncStatus || 'not_configured',
    crmSyncAt: take(body.crmSyncAt, 40),
    crmSyncNote: take(body.crmSyncNote, 240),
    tags: take(body.tags, 240),
    segment: take(body.segment, 80) || body.category || '',
    companyOwner: take(body.companyOwner, 80),
    renewalPotential: take(body.renewalPotential, 80),
    activityLog: serializeInquiryActivity([
      buildInquiryCreatedActivity({
        company: body.company,
        source: body.source,
        skuCount: body.skuCount,
        platforms: body.platforms,
        createdAt,
      }),
    ]),
    ip,
    createdAt,
    status: 'new',
  };

  if (redis) {
    try {
      await redis.hset(`wenai:inquiry:${id}`, payload);
      await redis.lpush('wenai:inquiries:list', id);
      await redis.ltrim('wenai:inquiries:list', 0, 499);
    } catch (error) {
      console.warn('[INQUIRY] Redis 写入失败', error);
    }
  }

  return NextResponse.json({ ok: true, id, message: '已收到，wenai 会在 24 小时内主动联系你' });
}

export async function GET(req: NextRequest) {
  if (!authed(req)) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  if (!redis) {
    return NextResponse.json({ inquiries: [], notice: '当前为本地试用模式，询盘不会跨环境持久化。' });
  }
  try {
    const ids = await redis.lrange('wenai:inquiries:list', 0, 99);
    const inquiries = (await Promise.all(
      ids.map(async (id) => {
        try {
          const raw = await redis!.hgetall<Record<string, unknown>>(`wenai:inquiry:${id}`);
          if (!raw || Object.keys(raw).length === 0) return null;
          const normalized = normalizeInquiryRow(raw);
          if (!hasReadinessSnapshot(raw) || typeof raw.activityLog !== 'string' || !raw.activityLog.trim() || !raw.crmSyncStatus) {
            await redis!.hset(`wenai:inquiry:${id}`, normalized);
          }
          return normalized;
        } catch {
          return null;
        }
      }),
    )).filter((item): item is Record<string, string> => Boolean(item));

    if (req.nextUrl.searchParams.get('format') === 'external-crm') {
      return NextResponse.json({
        records: inquiries.map(buildExternalCrmRecord),
        mappingVersion: 'wenai-crm-v1',
        note: '该结构可直接映射到 HubSpot、Salesforce、飞书多维表格或自建 CRM；真实同步需要在主站配置 token。',
      });
    }

    return NextResponse.json({ inquiries });
  } catch (error) {
    console.warn('[INQUIRY] Redis 读取失败', error);
    return NextResponse.json({ inquiries: [], error: '读取失败' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: '未授权' }, { status: 401 });
  if (!redis) return NextResponse.json({ error: '询盘工作台暂未启用云端存储。' }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const id = str(body.id);
  if (!id) return NextResponse.json({ error: 'id 必填' }, { status: 400 });

  const validationError =
    validateEnum(body.status, STATUS_ALLOWED, 'POC 状态') ||
    validateEnum(body.reviewDecision, REVIEW_DECISION_ALLOWED, '复盘决策') ||
    validateEnum(body.contractStage, CONTRACT_STAGE_ALLOWED, '合同阶段') ||
    validateEnum(body.quoteStatus, QUOTE_STATUS_ALLOWED, '报价状态') ||
    validateEnum(body.paymentStatus, PAYMENT_STATUS_ALLOWED, '付款状态') ||
    validateEnum(body.lifecycleStage, LIFECYCLE_STAGE_ALLOWED, '客户生命周期') ||
    validateEnum(body.priority, PRIORITY_ALLOWED, '优先级') ||
    validateEnum(body.crmSyncStatus, CRM_SYNC_STATUS_ALLOWED, 'CRM 同步状态');
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  try {
    const previous = await redis.hgetall<Record<string, unknown>>(`wenai:inquiry:${id}`);
    if (!previous || Object.keys(previous).length === 0) {
      return NextResponse.json({ error: '未找到该询盘' }, { status: 404 });
    }

    const updatedAt = new Date().toISOString();
    const patch: Record<string, string> = { updatedAt };
    if (typeof body.status === 'string' && body.status) patch.status = body.status;

    const maxLength: Record<string, number> = {
      owner: 80,
      nextAction: 400,
      nextActionDue: 40,
      reviewNotes: 1200,
      acceptanceScore: 20,
      reviewDecision: 40,
      reviewCompletedAt: 40,
      contractNextStep: 400,
      contractStage: 40,
      quoteStatus: 40,
      paymentStatus: 40,
      externalCrmId: 120,
      externalCrmUrl: 300,
      accountDomain: 120,
      contactName: 80,
      contactRole: 80,
      contactEmail: 120,
      contactPhone: 60,
      dealName: 160,
      dealAmount: 40,
      dealCurrency: 12,
      dealProbability: 20,
      closeDate: 40,
      lostReason: 240,
      lifecycleStage: 40,
      priority: 40,
      lastContactedAt: 40,
      nextMeetingAt: 40,
      crmSource: 80,
      crmSyncStatus: 40,
      crmSyncAt: 40,
      crmSyncNote: 240,
      tags: 240,
      segment: 80,
      companyOwner: 80,
      renewalPotential: 80,
    };

    CRM_PATCH_FIELDS.forEach(field => {
      if (typeof body[field] === 'string') {
        patch[field] = body[field].slice(0, maxLength[field] || 120);
      }
    });

    const entries = [];
    if (patch.status) {
      entries.push(buildStatusChangeActivity({
        status: patch.status as InquiryStatus,
        nextAction: patch.nextAction,
        nextActionDue: patch.nextActionDue,
        at: updatedAt,
      }));
    }
    const opsEntry = buildOpsActivity({ previous, patch, at: updatedAt });
    if (opsEntry) entries.push(opsEntry);
    if (entries.length > 0) {
      patch.activityLog = appendInquiryActivity(previous.activityLog, entries);
    }

    await redis.hset(`wenai:inquiry:${id}`, patch);
    return NextResponse.json({ ok: true, updatedAt });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '更新失败' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: '未授权' }, { status: 401 });
  if (!redis) return NextResponse.json({ error: '询盘工作台暂未启用云端存储。' }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const id = str(body.id);
  if (!id) return NextResponse.json({ error: 'id 必填' }, { status: 400 });

  try {
    const raw = await redis.hgetall<Record<string, unknown>>(`wenai:inquiry:${id}`);
    if (!raw || Object.keys(raw).length === 0) {
      return NextResponse.json({ error: '未找到该询盘' }, { status: 404 });
    }

    const normalized = normalizeInquiryRow(raw);
    const record = buildExternalCrmRecord(normalized);
    const result = await syncExternalCrm(record);
    const syncedAt = new Date().toISOString();
    const patch = {
      crmSyncStatus: result.status,
      crmSyncAt: syncedAt,
      crmSyncNote: result.note.slice(0, 240),
      ...(result.externalId ? { externalCrmId: result.externalId.slice(0, 120) } : {}),
      ...(result.externalUrl ? { externalCrmUrl: result.externalUrl.slice(0, 300) } : {}),
    };
    await redis.hset(`wenai:inquiry:${id}`, {
      ...patch,
      activityLog: appendInquiryActivity(normalized.activityLog, [
        buildOpsActivity({
          previous: normalized,
          patch,
          at: syncedAt,
        }),
      ].filter((item): item is NonNullable<typeof item> => Boolean(item))),
    });

    return NextResponse.json({ ok: result.ok, sync: result, record });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '外部 CRM 同步失败' }, { status: 500 });
  }
}
