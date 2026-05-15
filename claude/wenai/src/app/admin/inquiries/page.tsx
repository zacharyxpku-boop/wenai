'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import AdminHeader from '@/components/AdminHeader';
import Link from 'next/link';
import {
  CONTRACT_STAGE_LABELS,
  INQUIRY_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  QUOTE_STATUS_LABELS,
  REVIEW_DECISION_LABELS,
} from '@/lib/crm-labels';
import { buildPipelineSummary } from '@/lib/crm-pipeline';
import { buildStandardPack } from '@/lib/sop-workflows';
import { buildInquiryStandardPackPrefill, buildInquiryStandardPackRoute } from '@/lib/standard-pack-routing';
import {
  LISTING_FACTORY_ADMIN_INQUIRIES,
  LISTING_FACTORY_ADMIN_REVIEW_LINKS,
  LISTING_FACTORY_DEMO_BOUNDARY_COPY,
  LISTING_FACTORY_FLOW_NAV,
  LISTING_FACTORY_NAV_GROUPS,
  LISTING_FACTORY_INQUIRY_STAGE_FLOW,
} from '@/lib/listing-factory-demo';

interface Inquiry {
  id: string;
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
  ip?: string;
  createdAt: string;
  status: InquiryStatus;
  updatedAt?: string;
}

interface ActivityEntry {
  at: string;
  type: 'created' | 'status' | 'ops' | 'legacy';
  title: string;
  body: string;
}

type InquiryStatus =
  | 'new'
  | 'contacted'
  | 'sku_received'
  | 'needs_info'
  | 'in_delivery'
  | 'delivered'
  | 'reviewed'
  | 'contract'
  | 'dropped';

const STATUSES: InquiryStatus[] = [
  'new',
  'contacted',
  'sku_received',
  'needs_info',
  'in_delivery',
  'delivered',
  'reviewed',
  'contract',
  'dropped',
];

const STATUS_LABEL: Record<InquiryStatus, { txt: string; cls: string }> = {
  new: { txt: INQUIRY_STATUS_LABELS.new, cls: 'bg-accent/15 text-accent border-accent/40' },
  contacted: { txt: INQUIRY_STATUS_LABELS.contacted, cls: 'bg-cat-content/15 text-cat-content border-cat-content/40' },
  sku_received: { txt: INQUIRY_STATUS_LABELS.sku_received, cls: 'bg-cat-execution/15 text-cat-execution border-cat-execution/40' },
  needs_info: { txt: INQUIRY_STATUS_LABELS.needs_info, cls: 'bg-error/10 text-error border-error/35' },
  in_delivery: { txt: INQUIRY_STATUS_LABELS.in_delivery, cls: 'bg-cat-strategy/15 text-cat-strategy border-cat-strategy/40' },
  delivered: { txt: INQUIRY_STATUS_LABELS.delivered, cls: 'bg-success/10 text-success border-success/35' },
  reviewed: { txt: INQUIRY_STATUS_LABELS.reviewed, cls: 'bg-success/15 text-success border-success/45' },
  contract: { txt: INQUIRY_STATUS_LABELS.contract, cls: 'bg-accent/20 text-accent border-accent/50' },
  dropped: { txt: INQUIRY_STATUS_LABELS.dropped, cls: 'bg-text-tertiary/15 text-text-tertiary border-text-tertiary/40' },
};

const ASSETS_LABEL: Record<string, string> = {
  ready: '素材齐全',
  partial: '素材部分齐全',
  none: '缺素材',
};

const CREATIVE_LABEL: Record<string, string> = {
  'benchmark-only': '爆款拆解',
  'podcast-ugc': '播客风 UGC',
  'street-interview': '街采风 UGC',
  'slideshow-batch': '图文轮播 / Reels 批量',
  'batch-ugc': '批量 UGC 视频',
  'animated-ads': '动画广告',
  'editing-only': '剪辑优化',
};

const ACTIVE_STATUSES = new Set<InquiryStatus>([
  'contacted',
  'sku_received',
  'needs_info',
  'in_delivery',
  'delivered',
]);

const STATUS_NEXT_ACTION: Record<InquiryStatus, { action: string; dueDays: number }> = {
  new: { action: '确认首批 10 个真实 SKU、目标渠道、现有素材、benchmark 链接、内容 workflow 和 POC 验收线。', dueDays: 1 },
  contacted: { action: '等待客户发送 SKU 表、产品图、卖点、平台链接、TikTok/Instagram/Amazon benchmark 和内容需求。', dueDays: 2 },
  sku_received: { action: '检查 SKU 是否覆盖 2-3 个子类目，标记缺素材、缺 benchmark、高风险类目和适合内容测试的 SKU。', dueDays: 1 },
  needs_info: { action: '发送缺资料清单：产品图、规格、功效宣称、目标平台、禁用词、竞品链接、参考账号和输出格式。', dueDays: 1 },
  in_delivery: { action: '完成上新包、增长测试包和创意生产包：SOP、主图、详情页文案、合规、客服话术、benchmark 拆解、brief/storyboard 和 30 天复盘表。', dueDays: 3 },
  delivered: { action: '预约复盘电话，记录修改点、通过率、内容测试标准、素材复用率，并判断是否推进主站合同。', dueDays: 2 },
  reviewed: { action: '写清复盘决策：推进主站合同、扩下一批 SKU，或停止推进该商机。', dueDays: 2 },
  contract: { action: '推进主站合同、付款和发票流程，同时保留子站作为交付证据层。', dueDays: 3 },
  dropped: { action: '记录放弃原因，并标记该账户后续是否重新外呼，或仅保留为案例库样本。', dueDays: 14 },
};

const SCALE_LABEL: Record<string, string> = {
  '<50': '50 人以下',
  '50-200': '50-200 人',
  '200-1000': '200-1000 人',
  '1000+': '1000 人以上',
};

const CATEGORY_LABEL: Record<string, string> = {
  home: '家居',
  auto: '汽配',
  digital: '数码',
  tool: '工具',
  living: '生活方式',
  mixed: '多类目',
  other: '其他',
};

const ACTIVITY_TYPE_LABEL: Record<ActivityEntry['type'], string> = {
  created: '创建',
  status: '状态',
  ops: '运营',
  legacy: '补录',
};

function AdminListingFactoryNav() {
  const flow = LISTING_FACTORY_FLOW_NAV.find(item => item.page === '/admin/inquiries');

  return (
    <section className="mb-5 rounded-lg border border-border-subtle bg-bg-surface/35 p-3">
      <div className="grid gap-3 lg:grid-cols-4">
        {LISTING_FACTORY_NAV_GROUPS.map(group => (
          <div key={group.title}>
            <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-accent">{group.title}</div>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible">
              {group.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded border px-2.5 py-1.5 text-[10px] font-mono transition-colors ${
                    item.href === '/admin/inquiries'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border-subtle text-text-secondary hover:border-accent/40 hover:text-accent'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded border border-border-subtle bg-bg-root/35 p-3 text-[11px] leading-relaxed text-text-secondary">
        {LISTING_FACTORY_DEMO_BOUNDARY_COPY}
      </div>
      {flow && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Link href={flow.previousHref} className="rounded border border-border-subtle px-3 py-2 text-[11px] font-mono text-text-secondary hover:border-accent/40">
            上一站：{flow.previousLabel}
          </Link>
          <Link href={flow.nextHref} className="rounded border border-accent bg-accent px-3 py-2 text-[11px] font-mono font-semibold text-bg-root">
            下一站：{flow.nextLabel}
          </Link>
        </div>
      )}
    </section>
  );
}

function parseActivityLog(raw?: string): ActivityEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ActivityEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(item => item && typeof item.at === 'string' && typeof item.title === 'string' && typeof item.body === 'string')
      .slice(-8)
      .reverse();
  } catch {
    return [];
  }
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [key, setKey] = useState('');
  const [filter, setFilter] = useState<'all' | InquiryStatus>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [openSourceTop, setOpenSourceTop] = useState<Set<string>>(new Set());
  const [opsDraft, setOpsDraft] = useState<Record<string, Partial<Inquiry>>>({});
  const [demoInquiryStages, setDemoInquiryStages] = useState<Record<string, number>>(() =>
    Object.fromEntries(LISTING_FACTORY_ADMIN_INQUIRIES.map((item, index) => [item.company, Math.min(index + 1, LISTING_FACTORY_INQUIRY_STAGE_FLOW.length - 1)])),
  );

  const advanceDemoInquiryStage = (company: string) => {
    setDemoInquiryStages(prev => ({
      ...prev,
      [company]: Math.min((prev[company] ?? 0) + 1, LISTING_FACTORY_INQUIRY_STAGE_FLOW.length - 1),
    }));
  };

  const adminHeaders = useCallback((): Record<string, string> => {
    const saved = sessionStorage.getItem('wenai_admin_key') || key;
    return saved ? { 'x-admin-key': saved } : {};
  }, [key]);

  useEffect(() => {
    const saved = sessionStorage.getItem('wenai_admin_key');
    if (saved && saved.length >= 6) setAuthed(true);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/sales/inquiry', { headers: adminHeaders() })
      .then(r => r.json())
      .then(data => {
        setInquiries((data.inquiries || []) as Inquiry[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [adminHeaders]);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  const handleAuth = () => {
    if (key.length >= 6) {
      sessionStorage.setItem('wenai_admin_key', key);
      setAuthed(true);
    }
  };

  const buildInquiryPack = (inquiry: Inquiry) => {
    const prefill = buildInquiryStandardPackPrefill({
      company: inquiry.company,
      scale: SCALE_LABEL[inquiry.scale] || inquiry.scale,
      category: CATEGORY_LABEL[inquiry.category] || inquiry.category,
      skuCount: inquiry.skuCount || '',
      platforms: inquiry.platforms || '',
      assetsReady: inquiry.assetsReady || '',
      expectedDeliverables: inquiry.expectedDeliverables || '',
      creativeNeeds: inquiry.creativeNeeds || '',
      benchmarkLinks: inquiry.benchmarkLinks || '',
      painPoint: inquiry.painPoint,
    });
    return buildStandardPack({
      goal: prefill.goal,
      brand: prefill.brand,
      sku: prefill.sku,
      links: prefill.links || '',
      workflowId: prefill.workflow,
    });
  };

  const scoreLead = (inquiry: Inquiry) => Number.parseInt(inquiry.leadScore || '', 10) || buildInquiryPack(inquiry).readiness.leadScore;
  const scoreContract = (inquiry: Inquiry) => Number.parseInt(inquiry.contractReadiness || '', 10) || buildInquiryPack(inquiry).readiness.contractReadiness;

  const updateStatus = async (id: string, status: InquiryStatus) => {
    setUpdating(id);
    try {
      const defaults = STATUS_NEXT_ACTION[status];
      const payload = {
        id,
        status,
        nextAction: defaults.action,
        nextActionDue: new Date(Date.now() + defaults.dueDays * 86400000).toISOString().slice(0, 10),
      };
      const res = await fetch('/api/sales/inquiry', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...adminHeaders() },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setInquiries(prev => prev.map(item => (item.id === id ? { ...item, ...payload, updatedAt: new Date().toISOString() } : item)));
      }
    } finally {
      setUpdating(null);
    }
  };

  const updateOpsDraft = (id: string, patch: Partial<Inquiry>) => {
    setOpsDraft(prev => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));
  };

  const saveOps = async (item: Inquiry) => {
    const draft = opsDraft[item.id] || {};
    setUpdating(item.id);
    try {
      const payload = {
        id: item.id,
        owner: draft.owner ?? item.owner ?? '',
        nextAction: draft.nextAction ?? item.nextAction ?? '',
        nextActionDue: draft.nextActionDue ?? item.nextActionDue ?? '',
        reviewNotes: draft.reviewNotes ?? item.reviewNotes ?? '',
        acceptanceScore: draft.acceptanceScore ?? item.acceptanceScore ?? '',
        reviewDecision: draft.reviewDecision ?? item.reviewDecision ?? '',
        reviewCompletedAt: draft.reviewCompletedAt ?? item.reviewCompletedAt ?? '',
        contractNextStep: draft.contractNextStep ?? item.contractNextStep ?? '',
        contractStage: draft.contractStage ?? item.contractStage ?? '',
        quoteStatus: draft.quoteStatus ?? item.quoteStatus ?? '',
        paymentStatus: draft.paymentStatus ?? item.paymentStatus ?? '',
      };
      const res = await fetch('/api/sales/inquiry', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...adminHeaders() },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setInquiries(prev => prev.map(entry => (entry.id === item.id ? { ...entry, ...payload, updatedAt: new Date().toISOString() } : entry)));
        setOpsDraft(prev => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
      }
    } finally {
      setUpdating(null);
    }
  };

  const buildFollowupText = (item: Inquiry) => {
    const skuLine = item.skuCount ? `${item.skuCount} 个 SKU` : '10 个真实 SKU';
    const platformLine = item.platforms || '目标渠道';
    const creativeLine = item.creativeNeeds ? CREATIVE_LABEL[item.creativeNeeds] || item.creativeNeeds : '爆款拆解、UGC、轮播图或动画广告';
    const benchmarkLine = item.benchmarkLinks || 'TikTok / Instagram / Amazon / 独立站竞品链接或账号';
    return [
      `${item.company} 你好，我们已经看过你提交的 wenai 电商 SKU 增长 POC 需求。`,
      '',
      '正式判断是否启动 POC 前，我们需要先确认 6 类输入：',
      `1. ${skuLine}：SKU 名称、类目、价格带和核心卖点。`,
      `2. ${platformLine} 的上新目标：独立站、Amazon、TikTok Shop 或其他平台。`,
      '3. 现有素材：产品图、规格表、功效/性能宣称，以及必须避开的品牌词和合规词。',
      `4. 参考样例：${benchmarkLine}。没有参考样例也能启动，但第一版会先产出搜索地图和假设，而不是完整内容研究结论。`,
      `5. 需要的内容打法：${creativeLine}。`,
      '6. 验收标准：本轮主要验证主图方向、详情页文案、合规、客服话术、内容脚本，还是 30 天复盘节奏？',
      '',
      '我们不会在 POC 前承诺 GMV 或转化提升。POC 的目标是交付一套可验收的 SKU 增长包，验证返工是否减少、审批是否变顺、内容测试是否能沉淀下一步合同证据。',
      '',
      '你可以把资料整理成表格或压缩包发来，我们会先判断这个范围是否适合进入 POC。',
    ].join('\n');
  };

  const buildStandardPackHref = (item: Inquiry) => buildInquiryStandardPackRoute({
    company: item.company,
    scale: SCALE_LABEL[item.scale] || item.scale,
    category: CATEGORY_LABEL[item.category] || item.category,
    skuCount: item.skuCount || '',
    platforms: item.platforms || '',
    assetsReady: item.assetsReady || '',
    expectedDeliverables: item.expectedDeliverables || '',
    creativeNeeds: item.creativeNeeds || '',
    benchmarkLinks: item.benchmarkLinks || '',
    painPoint: item.painPoint,
  });

  const exportCSV = () => {
    const rows = [
      'id,company,contact,channel,scale,category,skuCount,platforms,assetsReady,expectedDeliverables,creativeNeeds,benchmarkLinks,painPoint,budget,timeline,source,owner,nextAction,nextActionDue,acceptanceScore,leadScore,readinessAcceptanceScore,contractReadiness,reviewDecision,reviewCompletedAt,contractNextStep,contractStage,quoteStatus,paymentStatus,reviewNotes,activityLog,createdAt,status',
    ];
    const esc = (value: string) => `"${(value || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    for (const item of inquiries) {
      rows.push([
        item.id,
        esc(item.company),
        esc(item.contact),
        esc(item.channel),
        esc(SCALE_LABEL[item.scale] || item.scale || ''),
        esc(CATEGORY_LABEL[item.category] || item.category || ''),
        esc(item.skuCount || ''),
        esc(item.platforms || ''),
        esc(ASSETS_LABEL[item.assetsReady || ''] || item.assetsReady || ''),
        esc(item.expectedDeliverables || ''),
        esc(CREATIVE_LABEL[item.creativeNeeds || ''] || item.creativeNeeds || ''),
        esc(item.benchmarkLinks || ''),
        esc(item.painPoint || ''),
        esc(item.budget || ''),
        esc(item.timeline || ''),
        esc(item.source || ''),
        esc(item.owner || ''),
        esc(item.nextAction || ''),
        esc(item.nextActionDue || ''),
        esc(item.acceptanceScore || ''),
        esc(item.leadScore || ''),
        esc(item.readinessAcceptanceScore || ''),
        esc(item.contractReadiness || ''),
        esc(item.reviewDecision || ''),
        esc(item.reviewCompletedAt || ''),
        esc(item.contractNextStep || ''),
        esc(CONTRACT_STAGE_LABELS[item.contractStage as keyof typeof CONTRACT_STAGE_LABELS] || item.contractStage || ''),
        esc(QUOTE_STATUS_LABELS[item.quoteStatus as keyof typeof QUOTE_STATUS_LABELS] || item.quoteStatus || ''),
        esc(PAYMENT_STATUS_LABELS[item.paymentStatus as keyof typeof PAYMENT_STATUS_LABELS] || item.paymentStatus || ''),
        esc(item.reviewNotes || ''),
        esc(parseActivityLog(item.activityLog).map(a => `${a.at} ${a.title}: ${a.body}`).join(' | ')),
        esc(item.createdAt),
        item.status,
      ].join(','));
    }
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `wenai-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (!authed) {
    return (
      <div className="max-w-md mx-auto py-20 px-6">
        <h1 className="text-lg font-semibold mb-6">后台 / CRM 询盘</h1>
        <p className="text-[12px] text-text-secondary mb-4">用于管理 B2B 电商 POC 询盘、交付复盘和合同推进。</p>
        <input
          type="password"
          placeholder="输入 6 位以上后台口令"
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAuth()}
          className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-md text-[13px] mb-3"
        />
        <button
          onClick={handleAuth}
          disabled={key.length < 6}
          className="w-full py-2 bg-accent hover:bg-accent-hover disabled:bg-border-subtle text-bg-root text-[13px] font-semibold rounded-md transition-colors"
        >
          进入后台
        </button>
      </div>
    );
  }

  const filtered = filter === 'all' ? inquiries : inquiries.filter(item => item.status === filter);
  const counts = {
    all: inquiries.length,
    ...Object.fromEntries(STATUSES.map(status => [status, inquiries.filter(item => (item.status || 'new') === status).length])),
  } as Record<'all' | InquiryStatus, number>;

  const activePoc = inquiries.filter(item => ACTIVE_STATUSES.has(item.status || 'new')).length;
  const benchmarkLinked = inquiries.filter(item => item.benchmarkLinks?.trim()).length;
  const creativeRequests = inquiries.filter(item => item.creativeNeeds?.trim()).length;
  const nextQueue = inquiries
    .filter(item => ['new', 'needs_info', 'delivered'].includes(item.status || 'new'))
    .sort((a, b) => (scoreLead(b) + scoreContract(b)) - (scoreLead(a) + scoreContract(a)))
    .slice(0, 5);
  const overdueActions = inquiries.filter(item => item.nextActionDue && new Date(item.nextActionDue).getTime() < Date.now() && !['contract', 'dropped'].includes(item.status || 'new')).length;
  const deliveredNeedsReview = inquiries.filter(item => item.status === 'delivered' && !item.reviewCompletedAt).length;
  const contractReady = inquiries.filter(item => item.status === 'reviewed' || item.status === 'contract').length;
  const quoteSent = inquiries.filter(item => ['sent', 'approved'].includes(item.quoteStatus || '')).length;
  const paidCount = inquiries.filter(item => item.paymentStatus === 'paid').length;
  const avgContractReadiness = inquiries.length ? Math.round(inquiries.reduce((sum, item) => sum + scoreContract(item), 0) / inquiries.length) : 0;
  const pipeline = buildPipelineSummary(inquiries);

  const cutoff30d = Date.now() - 30 * 24 * 3600 * 1000;
  const recent = inquiries.filter(item => new Date(item.createdAt).getTime() > cutoff30d);
  const sourceMap = new Map<string, Map<string, { total: number; converted: number }>>();
  for (const item of recent) {
    const raw = item.source || 'direct';
    const dash = raw.indexOf('-');
    const top = dash === -1 ? raw : raw.slice(0, dash);
    const sub = dash === -1 ? '' : raw.slice(dash + 1);
    if (!sourceMap.has(top)) sourceMap.set(top, new Map());
    const subMap = sourceMap.get(top)!;
    const current = subMap.get(sub) ?? { total: 0, converted: 0 };
    current.total += 1;
    if (item.status === 'contract') current.converted += 1;
    subMap.set(sub, current);
  }
  const sourceRows = Array.from(sourceMap.entries())
    .map(([top, subMap]) => {
      const children = Array.from(subMap.entries())
        .map(([sub, row]) => ({ sub, total: row.total, converted: row.converted, rate: row.total ? row.converted / row.total : 0 }))
        .sort((a, b) => b.total - a.total);
      const total = children.reduce((sum, child) => sum + child.total, 0);
      const converted = children.reduce((sum, child) => sum + child.converted, 0);
      return { top, total, converted, rate: total ? converted / total : 0, children };
    })
    .sort((a, b) => b.total - a.total);

  return (
    <div className="max-w-[1100px] mx-auto py-8 px-6">
      <AdminHeader
        subtitle="电商 SKU 增长管线 / 询盘 / benchmark / 创意生产 / 复盘 / 合同推进"
        onLogout={() => {
          sessionStorage.removeItem('wenai_admin_key');
          setAuthed(false);
        }}
      />
      <AdminListingFactoryNav />

      <section className="mb-5 grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          ['活跃 POC', activePoc],
          ['有 benchmark', benchmarkLinked],
          ['创意需求', creativeRequests],
          ['交付中', counts.in_delivery],
          ['进合同', counts.contract],
        ].map(([label, value]) => (
          <div key={label} className="border border-border-subtle rounded-lg bg-bg-surface/35 p-3">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">{label}</div>
            <div className="mt-1 text-2xl font-bold text-accent font-mono tabular-nums">{value}</div>
          </div>
        ))}
      </section>

      <section className="mb-5 rounded-lg border border-accent/30 bg-accent/5 p-4">
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-accent">商务推进后台</div>
            <h2 className="mt-1 text-[18px] font-semibold text-text-primary">Listing Factory 商机详情样例</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
              用 demo data 展示来源路径、关联 SKU、试跑阶段、推荐套餐、月内容量和销售下一步；不伪装成真实保存。
            </p>
          </div>
          <a href="/factory" className="text-[11px] font-mono text-accent hover:underline">查看内容工厂控制台 →</a>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {LISTING_FACTORY_ADMIN_INQUIRIES.map(item => (
            <article key={item.company} className="rounded-md border border-border-subtle bg-bg-root/35 p-3">
              {(() => {
                const stageIndex = demoInquiryStages[item.company] ?? 0;
                const stageLabel = LISTING_FACTORY_INQUIRY_STAGE_FLOW[stageIndex];
                const reviewLink = LISTING_FACTORY_ADMIN_REVIEW_LINKS.find(link => link.company === item.company);
                return (
                  <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[13px] font-semibold text-text-primary">{item.company}</div>
                  <div className="mt-1 text-[10px] font-mono text-accent">{item.sourcePath} · {item.pocStage}</div>
                </div>
                <span className="rounded border border-accent/30 px-2 py-1 text-[10px] font-mono text-accent">
                  {item.recommendedTier}
                </span>
              </div>
              <div className="mt-3 rounded border border-accent/25 bg-accent/5 p-2">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-accent">商机阶段</span>
                  <button
                    type="button"
                    onClick={() => advanceDemoInquiryStage(item.company)}
                    className="rounded border border-accent/30 px-2 py-1 text-[10px] font-mono text-accent hover:bg-accent/10"
                  >
                    推进阶段
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {LISTING_FACTORY_INQUIRY_STAGE_FLOW.map((stage, index) => (
                    <span
                      key={stage}
                      className={`rounded px-2 py-1 text-[10px] font-mono ${
                        index <= stageIndex
                          ? 'border border-accent/35 bg-accent/10 text-accent'
                          : 'border border-border-subtle text-text-tertiary'
                      }`}
                    >
                      {stage}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-text-secondary">
                  当前阶段：{stageLabel}。下一步：{item.nextCommercialAction}
                </p>
              </div>
              <div className="mt-3 grid gap-2 text-[11px] text-text-secondary">
                <div><span className="text-text-tertiary">关联 SKU：</span>{item.relatedSku}</div>
                <div><span className="text-text-tertiary">类目：</span>{item.category}</div>
                <div><span className="text-text-tertiary">Brief / 风险：</span>{item.briefCount} 条 · {item.riskLevel}</div>
                <div><span className="text-text-tertiary">预计月内容量：</span>{item.expectedMonthlyVolume}</div>
              </div>
              {reviewLink && (
                <div className="mt-3 rounded border border-border-subtle bg-bg-surface/50 p-3 text-[11px] leading-relaxed text-text-secondary">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-accent">关联 POC 复盘结论</div>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <div><span className="text-text-primary">复盘结论：</span>{reviewLink.reviewConclusion}</div>
                    <div><span className="text-text-primary">Brief 综合评分：</span>{reviewLink.briefOverallScore}/100</div>
                    <div><span className="text-text-primary">风险等级：</span>{reviewLink.riskLevel}</div>
                    <div><span className="text-text-primary">推荐月内容量：</span>{reviewLink.expectedMonthlyVolume}</div>
                    <div><span className="text-text-primary">交付包：</span>{reviewLink.deliveryPackageSent ? '已发送交付包' : '待发送交付包'}</div>
                    <div><span className="text-text-primary">报价方向：</span>{reviewLink.quoteDirection}</div>
                  </div>
                  <p className="mt-2 text-text-primary">下一步商务动作：{reviewLink.nextCommercialAction}</p>
                </div>
              )}
              <details className="mt-3 rounded border border-border-subtle bg-bg-surface/50 p-3">
                <summary className="cursor-pointer text-[11px] font-mono text-accent">商机详情</summary>
                <div className="mt-3 space-y-2 text-[11px] leading-relaxed text-text-secondary">
                  <p><span className="text-text-primary">试跑结论：</span>{item.trialConclusion}</p>
                  <p><span className="text-text-primary">客户关注点：</span>{item.customerConcerns.join(' / ')}</p>
                  <p><span className="text-text-primary">建议销售话术：</span>{item.salesTalkTrack}</p>
                  <p><span className="text-text-primary">推荐报价方向：</span>{item.quoteDirection}</p>
                  <p><span className="text-text-primary">套餐判断：</span>{item.tierFit}</p>
                </div>
              </details>
              <p className="mt-3 text-[12px] leading-relaxed text-text-secondary">
                下一步商务动作：{item.nextCommercialAction}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-text-tertiary">
                客户摘要：{item.customerSummary}
              </p>
                  </>
                );
              })()}
            </article>
          ))}
        </div>
      </section>

      <section className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
        {[
          ['待复盘', deliveredNeedsReview, '交付后 48 小时内必须约复盘，否则商务势能会快速衰减。'],
          ['合同就绪', contractReady, '已经复盘或正在进入合同阶段的账户。'],
          ['已发报价', quoteSent, '已经草拟、发送或确认报价的商机。'],
          ['已付款', paidCount, '付款状态已经完成的商机。'],
          ['动作逾期', overdueActions, '下一动作已过期，但尚未成交或放弃。'],
          ['平均合同就绪度', `${avgContractReadiness}/100`, '基于当前 readiness 快照估算。'],
        ].map(([label, value, note]) => (
          <div key={label} className="rounded-lg border border-accent/30 bg-accent/5 p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-accent">{label}</div>
            <div className="mt-1 text-2xl font-bold text-text-primary font-mono tabular-nums">{value}</div>
            <p className="mt-2 text-[11px] leading-relaxed text-text-secondary">{note}</p>
          </div>
        ))}
      </section>

      {overdueActions > 0 && (
        <section className="mb-5 border border-error/30 rounded-lg bg-error/5 p-3 text-[12px] text-error">
          有 {overdueActions} 个 POC 的下一动作已经逾期。先清掉这批，再新增交付工作。
        </section>
      )}

      <section className="mb-5 rounded-lg border border-border-subtle bg-bg-surface/35 p-4">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-accent">CRM 管线</div>
            <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
              从询盘、报价、付款、SLA 到下一动作的结构化合同推进。
            </p>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl font-bold text-accent tabular-nums">{pipeline.weightedPipeline}</div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">加权管线分</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {pipeline.opportunities.slice(0, 4).map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setExpanded(item.id)}
              className="rounded-md border border-border-subtle bg-bg-root/40 p-3 text-left transition-colors hover:border-accent/50"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate text-[12px] font-semibold text-text-primary">{item.company}</span>
                <span className="font-mono text-[12px] text-accent">{item.probability}%</span>
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">{item.stageLabel}</div>
              <div className={`mt-2 inline-flex rounded border px-1.5 py-0.5 text-[10px] font-mono ${
                item.slaRisk === 'overdue'
                  ? 'border-error/35 text-error'
                  : item.slaRisk === 'due-soon'
                    ? 'border-accent/35 text-accent'
                    : 'border-success/25 text-success'
              }`}>
                {item.slaLabel}
              </div>
            </button>
          ))}
        </div>
      </section>

      {nextQueue.length > 0 && (
        <section className="mb-5 border border-accent/30 rounded-lg bg-accent/10 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-1">下一动作队列</div>
              <div className="text-[13px] text-text-secondary">
                优先处理高分新线索、缺资料请求，以及已交付但等待复盘的 POC。
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {nextQueue.map(item => {
              const pack = buildInquiryPack(item);
              return (
                <button
                  key={item.id}
                  onClick={() => setExpanded(item.id)}
                  className="text-left border border-border-subtle rounded-md bg-bg-root/45 p-3 hover:border-accent/50 transition-colors"
                >
                  <div className="text-[11px] font-semibold text-text-primary truncate">{item.company}</div>
                  <div className="mt-1 text-[10px] font-mono text-accent">{STATUS_LABEL[item.status || 'new'].txt}</div>
                  <div className="mt-1 text-[10px] text-text-tertiary truncate">{item.skuCount || '缺 SKU 数'} / {item.platforms || '缺平台'}</div>
                  <div className="mt-1 text-[10px] text-text-tertiary truncate">{CREATIVE_LABEL[item.creativeNeeds || ''] || '创意范围待定'}</div>
                  <div className="mt-1 text-[10px] font-mono text-success">优先级 {scoreLead(item)}/100</div>
                  <div className="mt-1 text-[10px] font-mono text-accent">合同就绪 {pack.readiness.contractReadiness}/100</div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {sourceRows.length > 0 && (
        <section className="mb-5 border border-border-subtle rounded-lg p-4 bg-bg-surface/30">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
              近 30 天来源分析（n={recent.length}）/ 点击一级来源展开子来源
            </div>
            <button
              onClick={() => {
                if (openSourceTop.size === sourceRows.length) setOpenSourceTop(new Set());
                else setOpenSourceTop(new Set(sourceRows.map(row => row.top)));
              }}
              className="text-[10px] font-mono text-accent hover:underline"
            >
              {openSourceTop.size === sourceRows.length ? '全部收起' : '全部展开'}
            </button>
          </div>
          <table className="w-full text-[11px]">
            <thead className="text-[10px] font-mono text-text-tertiary border-b border-border-subtle">
              <tr>
                <th className="text-left py-1 w-8"></th>
                <th className="text-left py-1">来源</th>
                <th className="text-right py-1">询盘</th>
                <th className="text-right py-1">合同</th>
                <th className="text-right py-1">转化率</th>
              </tr>
            </thead>
            <tbody>
              {sourceRows.map(row => {
                const isOpen = openSourceTop.has(row.top);
                const expandable = row.children.some(child => child.sub.length > 0);
                return (
                  <Fragment key={row.top}>
                    <tr
                      className={`border-b border-border-subtle/40 ${expandable ? 'cursor-pointer hover:bg-bg-surface/50' : ''}`}
                      onClick={() => {
                        if (!expandable) return;
                        const next = new Set(openSourceTop);
                        if (isOpen) next.delete(row.top);
                        else next.add(row.top);
                        setOpenSourceTop(next);
                      }}
                    >
                      <td className="py-1 text-text-tertiary text-[10px]">{expandable ? (isOpen ? 'v' : '>') : ''}</td>
                      <td className="py-1 font-mono text-text-primary font-bold">
                        {row.top}
                        {expandable && <span className="ml-2 text-[9px] font-normal text-text-tertiary">({row.children.length} 个子来源)</span>}
                      </td>
                      <td className="py-1 text-right tabular-nums">{row.total}</td>
                      <td className="py-1 text-right tabular-nums text-success">{row.converted}</td>
                      <td className="py-1 text-right tabular-nums text-accent">{(row.rate * 100).toFixed(1)}%</td>
                    </tr>
                    {isOpen && row.children.filter(child => child.sub.length > 0).map(child => (
                      <tr key={`${row.top}:${child.sub}`} className="border-b border-border-subtle/20 bg-bg-root/30">
                        <td></td>
                        <td className="py-1 pl-3 font-mono text-text-secondary text-[10px]">- {child.sub}</td>
                        <td className="py-1 text-right tabular-nums text-text-secondary">{child.total}</td>
                        <td className="py-1 text-right tabular-nums text-success/80">{child.converted}</td>
                        <td className="py-1 text-right tabular-nums text-accent/80">{(child.rate * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', ...STATUSES] as const).map(entry => (
            <button
              key={entry}
              onClick={() => setFilter(entry)}
              className={`text-[11px] font-mono px-2.5 py-1 rounded border ${
                filter === entry
                  ? 'border-accent text-accent bg-accent/10'
                  : 'border-border-subtle text-text-secondary hover:border-accent/40'
              }`}
            >
              {entry === 'all' ? '全部' : STATUS_LABEL[entry].txt} ({counts[entry]})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="text-[11px] font-mono text-text-secondary hover:text-accent border border-border-subtle rounded px-2.5 py-1"
          >
            刷新
          </button>
          {inquiries.length > 0 && (
            <button
              onClick={exportCSV}
              className="text-[11px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded px-2.5 py-1"
            >
              导出 CSV
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-tertiary font-mono text-[12px]">询盘加载中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 border border-border-subtle rounded-md">
          <p className="text-text-tertiary text-[13px] mb-2">还没有询盘。</p>
          <p className="text-text-tertiary text-[11px] font-mono">
            把 `/inquire` 发给目标客户，他们提交后会出现在这里。
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => {
            const pack = buildInquiryPack(item);
            const status = (item.status || 'new') as InquiryStatus;
            const isOpen = expanded === item.id;
            const acceptanceScore = Number.parseInt(item.readinessAcceptanceScore || '', 10) || pack.readiness.acceptanceScore;
            const stageLabel = item.readinessStage || pack.readiness.stageLabel;
            const readinessLabel = item.readinessLabel || pack.readiness.label;
            const recommendedAction = item.recommendedAction || pack.readiness.nextStepLabel;
            const contractBlockers = item.contractBlockers || (pack.readiness.contractBlockers.length ? pack.readiness.contractBlockers.join(' / ') : '暂无关键合同阻塞项');
            const activity = parseActivityLog(item.activityLog);
            return (
              <div key={item.id} className="border border-border-subtle rounded-md overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : item.id)}
                  className="w-full text-left p-4 hover:bg-bg-surface/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-semibold text-text-primary">{item.company}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${STATUS_LABEL[status].cls}`}>{STATUS_LABEL[status].txt}</span>
                      {item.scale && <span className="text-[10px] font-mono text-text-tertiary border border-border-subtle px-1.5 py-0.5 rounded">{SCALE_LABEL[item.scale] || item.scale}</span>}
                      {item.category && <span className="text-[10px] font-mono text-text-tertiary border border-border-subtle px-1.5 py-0.5 rounded">{CATEGORY_LABEL[item.category] || item.category}</span>}
                      {item.skuCount && <span className="text-[10px] font-mono text-accent border border-accent/25 px-1.5 py-0.5 rounded">SKU {item.skuCount}</span>}
                      {item.benchmarkLinks && <span className="text-[10px] font-mono text-cat-content border border-cat-content/25 px-1.5 py-0.5 rounded">有 benchmark</span>}
                      {item.creativeNeeds && <span className="text-[10px] font-mono text-cat-strategy border border-cat-strategy/25 px-1.5 py-0.5 rounded">{CREATIVE_LABEL[item.creativeNeeds] || item.creativeNeeds}</span>}
                      <span className="text-[10px] font-mono text-success border border-success/25 px-1.5 py-0.5 rounded">线索分 {scoreLead(item)}</span>
                      <span className="text-[10px] font-mono text-accent border border-accent/25 px-1.5 py-0.5 rounded">合同就绪 {scoreContract(item)}</span>
                      <span className="text-[10px] font-mono text-cat-content border border-cat-content/25 px-1.5 py-0.5 rounded">{readinessLabel}</span>
                    </div>
                    <span className="text-[10px] font-mono text-text-tertiary tabular-nums">{new Date(item.createdAt).toLocaleString('zh-CN')}</span>
                  </div>
                  <p className="text-[12px] text-text-secondary line-clamp-2 leading-relaxed">{item.painPoint}</p>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-text-tertiary mt-2 flex-wrap">
                    <span>{item.channel} / {item.contact}</span>
                    {item.budget && <span>预算 {item.budget}</span>}
                    {item.timeline && <span>时间线 {item.timeline}</span>}
                    {item.platforms && <span>平台 {item.platforms}</span>}
                    {item.assetsReady && <span>{ASSETS_LABEL[item.assetsReady] || item.assetsReady}</span>}
                    {item.owner && <span>负责人 {item.owner}</span>}
                    {item.nextActionDue && <span>下次截止 {item.nextActionDue}</span>}
                    {item.contractStage && <span>阶段 {CONTRACT_STAGE_LABELS[item.contractStage as keyof typeof CONTRACT_STAGE_LABELS] || item.contractStage}</span>}
                    {item.quoteStatus && <span>报价 {QUOTE_STATUS_LABELS[item.quoteStatus as keyof typeof QUOTE_STATUS_LABELS] || item.quoteStatus}</span>}
                    {item.paymentStatus && <span>付款 {PAYMENT_STATUS_LABELS[item.paymentStatus as keyof typeof PAYMENT_STATUS_LABELS] || item.paymentStatus}</span>}
                    {item.source && <span>来源 {item.source}</span>}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-border-subtle bg-bg-surface/30 p-4 space-y-3">
                    <div>
                      <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">POC 资格判断</div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[12px] mb-3">
                        <div className="border border-border-subtle rounded p-2"><span className="text-text-tertiary">线索分： </span>{pack.readiness.leadScore}/100</div>
                        <div className="border border-border-subtle rounded p-2"><span className="text-text-tertiary">验收就绪： </span>{acceptanceScore}/100</div>
                        <div className="border border-border-subtle rounded p-2"><span className="text-text-tertiary">合同就绪： </span>{scoreContract(item)}/100</div>
                        <div className="border border-border-subtle rounded p-2"><span className="text-text-tertiary">阶段： </span>{stageLabel}</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
                        <div className="border border-border-subtle rounded p-2">
                          <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-1">建议动作</div>
                          <div className="text-text-primary leading-relaxed">{recommendedAction}</div>
                        </div>
                        <div className="border border-border-subtle rounded p-2">
                          <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-1">合同阻塞项</div>
                          <div className="text-text-primary leading-relaxed">{contractBlockers}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">POC 输入上下文</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
                        <div className="border border-border-subtle rounded p-2"><span className="text-text-tertiary">SKU 数： </span>{item.skuCount || '缺失'}</div>
                        <div className="border border-border-subtle rounded p-2"><span className="text-text-tertiary">平台： </span>{item.platforms || '缺失'}</div>
                        <div className="border border-border-subtle rounded p-2"><span className="text-text-tertiary">素材： </span>{ASSETS_LABEL[item.assetsReady || ''] || '缺失'}</div>
                        <div className="border border-border-subtle rounded p-2"><span className="text-text-tertiary">验收目标： </span>{item.expectedDeliverables || '缺失'}</div>
                        <div className="border border-border-subtle rounded p-2"><span className="text-text-tertiary">内容打法： </span>{CREATIVE_LABEL[item.creativeNeeds || ''] || item.creativeNeeds || '缺失'}</div>
                        <div className="border border-border-subtle rounded p-2 break-words"><span className="text-text-tertiary">参考样例： </span>{item.benchmarkLinks || '缺失'}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">客户痛点</div>
                      <p className="text-[12px] text-text-primary leading-relaxed whitespace-pre-wrap">{item.painPoint}</p>
                    </div>

                    <div className="border-t border-border-subtle pt-3">
                      <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">POC 运营记录</div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10px] font-mono text-text-tertiary mb-1 block">负责人</label>
                          <input value={opsDraft[item.id]?.owner ?? item.owner ?? ''} onChange={e => updateOpsDraft(item.id, { owner: e.target.value })} placeholder="例：阁主 / 运营 A" className="w-full px-2 py-1.5 bg-bg-root border border-border-subtle rounded text-[11px]" />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-text-tertiary mb-1 block">下一动作截止</label>
                          <input type="date" value={opsDraft[item.id]?.nextActionDue ?? item.nextActionDue ?? ''} onChange={e => updateOpsDraft(item.id, { nextActionDue: e.target.value })} className="w-full px-2 py-1.5 bg-bg-root border border-border-subtle rounded text-[11px]" />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-text-tertiary mb-1 block">验收分</label>
                          <input value={opsDraft[item.id]?.acceptanceScore ?? item.acceptanceScore ?? ''} onChange={e => updateOpsDraft(item.id, { acceptanceScore: e.target.value })} placeholder="例：72/100" className="w-full px-2 py-1.5 bg-bg-root border border-border-subtle rounded text-[11px]" />
                        </div>
                        <div className="flex items-end">
                          <button onClick={() => saveOps(item)} disabled={updating === item.id} className="w-full px-2 py-1.5 bg-accent text-bg-root rounded text-[11px] font-semibold disabled:opacity-50">保存运营记录</button>
                        </div>

                        <div className="md:col-span-4">
                          <label className="text-[10px] font-mono text-text-tertiary mb-1 block">复盘决策</label>
                          <select value={opsDraft[item.id]?.reviewDecision ?? item.reviewDecision ?? ''} onChange={e => updateOpsDraft(item.id, { reviewDecision: e.target.value })} className="w-full px-2 py-1.5 bg-bg-root border border-border-subtle rounded text-[11px]">
                            <option value="">待判断</option>
                            <option value="iterate_poc">{REVIEW_DECISION_LABELS.iterate_poc}</option>
                            <option value="expand_sku">{REVIEW_DECISION_LABELS.expand_sku}</option>
                            <option value="push_contract">{REVIEW_DECISION_LABELS.push_contract}</option>
                            <option value="drop">{REVIEW_DECISION_LABELS.drop}</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono text-text-tertiary mb-1 block">合同阶段</label>
                          <select value={opsDraft[item.id]?.contractStage ?? item.contractStage ?? ''} onChange={e => updateOpsDraft(item.id, { contractStage: e.target.value })} className="w-full px-2 py-1.5 bg-bg-root border border-border-subtle rounded text-[11px]">
                            <option value="">待判断</option>
                            <option value="discovery">{CONTRACT_STAGE_LABELS.discovery}</option>
                            <option value="proposal">{CONTRACT_STAGE_LABELS.proposal}</option>
                            <option value="negotiation">{CONTRACT_STAGE_LABELS.negotiation}</option>
                            <option value="waiting_payment">{CONTRACT_STAGE_LABELS.waiting_payment}</option>
                            <option value="won">{CONTRACT_STAGE_LABELS.won}</option>
                            <option value="lost">{CONTRACT_STAGE_LABELS.lost}</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-text-tertiary mb-1 block">报价状态</label>
                          <select value={opsDraft[item.id]?.quoteStatus ?? item.quoteStatus ?? 'not_sent'} onChange={e => updateOpsDraft(item.id, { quoteStatus: e.target.value })} className="w-full px-2 py-1.5 bg-bg-root border border-border-subtle rounded text-[11px]">
                            <option value="not_sent">{QUOTE_STATUS_LABELS.not_sent}</option>
                            <option value="drafting">{QUOTE_STATUS_LABELS.drafting}</option>
                            <option value="sent">{QUOTE_STATUS_LABELS.sent}</option>
                            <option value="approved">{QUOTE_STATUS_LABELS.approved}</option>
                            <option value="rejected">{QUOTE_STATUS_LABELS.rejected}</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-text-tertiary mb-1 block">付款状态</label>
                          <select value={opsDraft[item.id]?.paymentStatus ?? item.paymentStatus ?? 'not_started'} onChange={e => updateOpsDraft(item.id, { paymentStatus: e.target.value })} className="w-full px-2 py-1.5 bg-bg-root border border-border-subtle rounded text-[11px]">
                            <option value="not_started">{PAYMENT_STATUS_LABELS.not_started}</option>
                            <option value="pending">{PAYMENT_STATUS_LABELS.pending}</option>
                            <option value="paid">{PAYMENT_STATUS_LABELS.paid}</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-text-tertiary mb-1 block">复盘完成日</label>
                          <input type="date" value={opsDraft[item.id]?.reviewCompletedAt ?? item.reviewCompletedAt ?? ''} onChange={e => updateOpsDraft(item.id, { reviewCompletedAt: e.target.value })} className="w-full px-2 py-1.5 bg-bg-root border border-border-subtle rounded text-[11px]" />
                        </div>
                        <div className="md:col-span-3">
                          <label className="text-[10px] font-mono text-text-tertiary mb-1 block">合同下一步</label>
                          <input value={opsDraft[item.id]?.contractNextStep ?? item.contractNextStep ?? ''} onChange={e => updateOpsDraft(item.id, { contractNextStep: e.target.value })} placeholder="例：约合同评审、发报价、确认付款路径" className="w-full px-2 py-1.5 bg-bg-root border border-border-subtle rounded text-[11px]" />
                        </div>
                        <div className="md:col-span-4">
                          <label className="text-[10px] font-mono text-text-tertiary mb-1 block">下一动作</label>
                          <input value={opsDraft[item.id]?.nextAction ?? item.nextAction ?? ''} onChange={e => updateOpsDraft(item.id, { nextAction: e.target.value })} placeholder="例：等 SKU 表 + benchmark，或交付后约复盘电话" className="w-full px-2 py-1.5 bg-bg-root border border-border-subtle rounded text-[11px]" />
                        </div>
                        <div className="md:col-span-4">
                          <label className="text-[10px] font-mono text-text-tertiary mb-1 block">复盘备注 / 合同判断</label>
                          <textarea value={opsDraft[item.id]?.reviewNotes ?? item.reviewNotes ?? ''} onChange={e => updateOpsDraft(item.id, { reviewNotes: e.target.value })} rows={3} placeholder="记录修改点、通过率、内容测试标准、素材复用率、合同意向和下一批需要验证的 SKU 类目。" className="w-full px-2 py-1.5 bg-bg-root border border-border-subtle rounded text-[11px] resize-none" />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border-subtle pt-3">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">交付时间线 / 证据链</div>
                        <div className="text-[10px] font-mono text-text-tertiary">{activity.length > 0 ? `${activity.length} 条最近更新` : '等待下一次触达'}</div>
                      </div>
                      {activity.length > 0 ? (
                        <div className="space-y-2">
                          {activity.map((event, index) => (
                            <div key={`${event.at}-${event.title}-${index}`} className="grid grid-cols-[92px_1fr] gap-3 border border-border-subtle rounded bg-bg-root/35 p-2">
                              <div>
                                <div className="text-[9px] font-mono text-accent uppercase tracking-wider">{ACTIVITY_TYPE_LABEL[event.type] || event.type}</div>
                                <div className="mt-1 text-[10px] font-mono text-text-tertiary tabular-nums">{new Date(event.at).toLocaleDateString('zh-CN')}</div>
                              </div>
                              <div>
                                <div className="text-[12px] font-semibold text-text-primary">{event.title}</div>
                                <div className="mt-1 text-[11px] text-text-secondary leading-relaxed">{event.body}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border border-border-subtle rounded bg-bg-root/35 p-3 text-[11px] text-text-tertiary">
                          历史记录暂时没有活动时间线。下一次保存运营备注或更新状态时，会自动开始沉淀证据链。
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border-subtle">
                      <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">更新状态</span>
                      {STATUSES.map(nextStatus => (
                        <button
                          key={nextStatus}
                          disabled={updating === item.id || status === nextStatus}
                          onClick={() => updateStatus(item.id, nextStatus)}
                          className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
                            status === nextStatus
                              ? 'border-accent text-accent bg-accent/10 cursor-default'
                              : 'border-border-subtle text-text-secondary hover:border-accent/40'
                          } disabled:opacity-50`}
                        >
                          {STATUS_LABEL[nextStatus].txt}
                        </button>
                      ))}
                      <span className="ml-auto text-[10px] font-mono text-text-tertiary">{item.id}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-border-subtle flex-wrap">
                      {item.channel === 'email' && (
                        <a href={`mailto:${item.contact}?subject=${encodeURIComponent(`wenai 试跑需求回复 / ${item.company}`)}`} className="text-[10px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded px-2 py-1">
                          发邮件
                        </a>
                      )}
                      {item.channel === 'phone' && (
                        <a href={`tel:${item.contact}`} className="text-[10px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded px-2 py-1">
                          打电话
                        </a>
                      )}
                      <button onClick={() => navigator.clipboard.writeText(item.contact)} className="text-[10px] font-mono text-text-secondary border border-border-subtle hover:border-accent/40 rounded px-2 py-1">复制联系方式</button>
                      <button onClick={() => navigator.clipboard.writeText(buildFollowupText(item))} className="text-[10px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded px-2 py-1">复制 POC 跟进话术</button>
                      <a href={buildStandardPackHref(item)} className="text-[10px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded px-2 py-1">生成交付标品包</a>
                      <a href={`/admin/inquiries/${item.id}`} className="text-[10px] font-mono text-text-primary border border-border-subtle hover:border-accent/40 rounded px-2 py-1">打开 CRM 详情</a>
                      {item.ip && <span className="ml-auto text-[10px] font-mono text-text-tertiary">IP {item.ip}</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
