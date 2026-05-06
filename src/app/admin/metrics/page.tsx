'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import AdminHeader from '@/components/AdminHeader';
import modulesConfig from '@/config/modules.json';
import { buildStandardPack } from '@/lib/sop-workflows';
import { buildInquiryStandardPackPrefill } from '@/lib/standard-pack-routing';

interface FeedbackSummary {
  total: number;
  goodRatio: number;
}

interface HealthService {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latencyMs?: number;
}

interface UsageStats {
  todayCount: number;
  weekCount: number;
  totalCount: number;
  weekTokens: number;
  avgRating: number;
  ratingCount: number;
  ranking: { moduleId: string; count: number }[];
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

interface Inquiry {
  id: string;
  company: string;
  scale?: string;
  category?: string;
  skuCount?: string;
  platforms?: string;
  assetsReady?: string;
  expectedDeliverables?: string;
  creativeNeeds?: string;
  benchmarkLinks?: string;
  painPoint: string;
  source?: string;
  nextActionDue?: string;
  acceptanceScore?: string;
  leadScore?: string;
  readinessAcceptanceScore?: string;
  contractReadiness?: string;
  reviewDecision?: string;
  activityLog?: string;
  createdAt: string;
  updatedAt?: string;
  status: InquiryStatus;
}

interface ActivityEntry {
  at: string;
  type: 'created' | 'status' | 'ops' | 'legacy';
  title: string;
  body: string;
}

const POC_STATUSES: InquiryStatus[] = [
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

const FINAL_GOAL_MILESTONES = [
  {
    key: 'lead',
    phase: '阶段 1',
    title: '线索筛选',
    targetLabel: '合格率 >= 35%',
  },
  {
    key: 'delivery',
    phase: '阶段 2',
    title: 'POC 交付标品化',
    targetLabel: '交付率 >= 60%',
  },
  {
    key: 'review',
    phase: '阶段 3',
    title: '复盘转合同',
    targetLabel: '复盘率 >= 70% / 合同率 >= 15%',
  },
] as const;

function parseActivityLog(raw?: string): ActivityEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ActivityEntry[];
    return Array.isArray(parsed)
      ? parsed.filter(item => item && typeof item.at === 'string' && typeof item.title === 'string')
      : [];
  } catch {
    return [];
  }
}

function parseScore(value?: string): number {
  const parsed = Number.parseFloat((value || '').replace('/100', ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function AdminMetricsPage() {
  const [authed, setAuthed] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = sessionStorage.getItem('wenai_admin_key');
    return Boolean(saved && saved.length >= 6);
  });
  const [key, setKey] = useState('');
  const [feedbackSummary, setFeedbackSummary] = useState<Record<string, FeedbackSummary>>({});
  const [paymentPending, setPaymentPending] = useState(0);
  const [phase2Interest, setPhase2Interest] = useState(0);
  const [health, setHealth] = useState<{ overall: string; services: HealthService[] } | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [nowMs] = useState(() => Date.now());

  const adminHeaders = useCallback((): Record<string, string> => {
    const saved = sessionStorage.getItem('wenai_admin_key') || key;
    return saved ? { 'x-admin-key': saved } : {};
  }, [key]);

  useEffect(() => {
    if (!authed) return;

    fetch('/api/feedback?type=summary').then(r => r.json()).then(data => {
      if (data.summary) setFeedbackSummary(data.summary);
    }).catch(() => {});

    fetch('/api/feedback?type=feedback&moduleId=payment-claim').then(r => r.json()).then(data => {
      const total = (data.entries || []).length;
      const processed = JSON.parse(localStorage.getItem('wenai_payment_processed') || '[]') as string[];
      setPaymentPending(Math.max(0, total - processed.length));
    }).catch(() => {});

    fetch('/api/feedback?type=feedback&moduleId=phase2-image-gen').then(r => r.json()).then(data => {
      setPhase2Interest((data.entries || []).length);
    }).catch(() => {});

    fetch('/api/health', { cache: 'no-store' }).then(r => r.json()).then(setHealth).catch(() => {});
    fetch('/api/usage').then(r => r.json()).then(setUsage).catch(() => {});

    fetch('/api/sales/inquiry', { headers: adminHeaders() })
      .then(r => r.json())
      .then(data => setInquiries((data.inquiries || []) as Inquiry[]))
      .catch(() => {});
  }, [authed, adminHeaders]);

  const handleAuth = () => {
    if (key.length >= 6) {
      sessionStorage.setItem('wenai_admin_key', key);
      setAuthed(true);
    }
  };

  if (!authed) {
    return (
      <div className="max-w-md mx-auto py-20 px-6">
        <h1 className="text-lg font-semibold mb-6">后台 / 运营总览</h1>
        <p className="text-[12px] text-text-secondary mb-4">
          一屏查看 POC 漏斗、反馈、付款、健康度和使用指标。
        </p>
        <input
          type="password"
          placeholder="输入 6 位以上后台口令"
          value={key}
          onChange={event => setKey(event.target.value)}
          onKeyDown={event => event.key === 'Enter' && handleAuth()}
          className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-md text-[13px] mb-3"
        />
        <button
          onClick={handleAuth}
          disabled={key.length < 6}
          className="w-full py-2 bg-accent hover:bg-accent-hover disabled:bg-border-subtle text-bg-root text-[13px] font-semibold rounded-md"
        >
          进入后台
        </button>
      </div>
    );
  }

  const moduleNameMap: Record<string, string> = {};
  for (const moduleConfig of modulesConfig.modules) moduleNameMap[moduleConfig.id] = moduleConfig.name;
  moduleNameMap['payment-claim'] = '付款认领';
  moduleNameMap['phase2-image-gen'] = '图片管线兴趣';

  const feedbackTotal = Object.values(feedbackSummary).reduce((sum, value) => sum + value.total, 0);
  const feedbackGoodRatioOverall = feedbackTotal > 0
    ? Math.round(Object.values(feedbackSummary).reduce((sum, value) => sum + value.total * value.goodRatio, 0) / feedbackTotal)
    : 0;

  const buildInquiryPack = (inquiry: Inquiry) => {
    const prefill = buildInquiryStandardPackPrefill({
      company: inquiry.company,
      scale: inquiry.scale || '',
      category: inquiry.category || '',
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
  const statusCounts = Object.fromEntries(
    POC_STATUSES.map(status => [status, inquiries.filter(inquiry => (inquiry.status || 'new') === status).length])
  ) as Record<InquiryStatus, number>;
  const qualified = inquiries.filter(inquiry => scoreLead(inquiry) >= 60).length;
  const activePoc = inquiries.filter(inquiry => ['contacted', 'sku_received', 'needs_info', 'in_delivery', 'delivered'].includes(inquiry.status || 'new')).length;
  const delivered = statusCounts.delivered + statusCounts.reviewed + statusCounts.contract;
  const reviewed = statusCounts.reviewed + statusCounts.contract;
  const contractRate = inquiries.length > 0 ? Math.round((statusCounts.contract / inquiries.length) * 100) : 0;
  const deliveryRate = qualified > 0 ? Math.round((delivered / qualified) * 100) : 0;
  const reviewRate = delivered > 0 ? Math.round((reviewed / delivered) * 100) : 0;
  const overdue = inquiries.filter(inquiry =>
    inquiry.nextActionDue &&
    new Date(inquiry.nextActionDue).getTime() < nowMs &&
    !['contract', 'dropped'].includes(inquiry.status || 'new')
  ).length;

  const acceptanceScores = inquiries
    .map(inquiry => parseScore(inquiry.acceptanceScore || inquiry.readinessAcceptanceScore))
    .filter(Boolean);
  const avgAcceptance = acceptanceScores.length > 0
    ? Math.round(acceptanceScores.reduce((sum, score) => sum + score, 0) / acceptanceScores.length)
    : 0;
  const contractReadinessScores = inquiries.map(inquiry => Number.parseInt(inquiry.contractReadiness || '', 10) || buildInquiryPack(inquiry).readiness.contractReadiness);
  const avgContractReadiness = contractReadinessScores.length > 0
    ? Math.round(contractReadinessScores.reduce((sum, score) => sum + score, 0) / contractReadinessScores.length)
    : 0;
  const readyForContract = inquiries.filter(inquiry => buildInquiryPack(inquiry).readiness.contractReadiness >= 75).length;
  const reviewDecisionCounts = {
    iterate: inquiries.filter(inquiry => inquiry.reviewDecision === 'iterate_poc').length,
    expand: inquiries.filter(inquiry => inquiry.reviewDecision === 'expand_sku').length,
    contract: inquiries.filter(inquiry => inquiry.reviewDecision === 'push_contract').length,
    drop: inquiries.filter(inquiry => inquiry.reviewDecision === 'drop').length,
  };
  const inquiriesWithActivity = inquiries.filter(inquiry => parseActivityLog(inquiry.activityLog).length > 0).length;
  const activityEvents = inquiries.flatMap(inquiry => parseActivityLog(inquiry.activityLog));
  const recent14dActivity = activityEvents.filter(event => new Date(event.at).getTime() > nowMs - 14 * 24 * 3600 * 1000).length;
  const silentProjects = inquiries.filter(inquiry => {
    if (['contract', 'dropped'].includes(inquiry.status || 'new')) return false;
    const latestEvent = parseActivityLog(inquiry.activityLog)
      .map(event => new Date(event.at).getTime())
      .filter(Number.isFinite)
      .sort((a, b) => b - a)[0];
    const latestTouch = latestEvent || new Date(inquiry.updatedAt || inquiry.createdAt).getTime();
    return latestTouch < nowMs - 7 * 24 * 3600 * 1000;
  }).length;
  const missingMaterials = {
    sku: inquiries.filter(inquiry => (Number.parseInt(inquiry.skuCount || '0', 10) || 0) < 10).length,
    platform: inquiries.filter(inquiry => !inquiry.platforms?.trim()).length,
    assets: inquiries.filter(inquiry => inquiry.assetsReady !== 'ready').length,
    acceptance: inquiries.filter(inquiry => !inquiry.expectedDeliverables?.trim()).length,
  };
  const sourceRows = Object.entries(
    inquiries.reduce((acc, inquiry) => {
      const source = inquiry.source || 'direct';
      const row = acc[source] || { total: 0, contract: 0 };
      row.total += 1;
      if (inquiry.status === 'contract') row.contract += 1;
      acc[source] = row;
      return acc;
    }, {} as Record<string, { total: number; contract: number }>)
  )
    .map(([source, row]) => ({
      source,
      total: row.total,
      contract: row.contract,
      rate: row.total > 0 ? Math.round((row.contract / row.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const bottleneck = (() => {
    if (inquiries.length === 0) return '还没有 POC 数据。先把 /inquire 发给目标客户。';
    if (qualified / inquiries.length < 0.35) return '线索质量偏低。先优化入口文案和外呼名单，再投入交付时间。';
    if (deliveryRate < 50) return '合格线索没有顺利进入交付。先收紧资料收集和交付排期。';
    if (reviewRate < 60) return '已交付 POC 没有及时复盘。没有复盘就没有合同推进，先跟进已交付账户。';
    if (contractRate < 15) return '合同转化偏弱。复盘记录需要更清楚地指向主站合同和付款下一步。';
    return 'POC 漏斗健康。下一步看规模化渠道和交付效率。';
  })();

  const milestoneCards = [
    {
      ...FINAL_GOAL_MILESTONES[0],
      current: inquiries.length > 0 ? Math.round((qualified / inquiries.length) * 100) : 0,
      done: inquiries.length > 0 && qualified / inquiries.length >= 0.35,
      note: `${qualified}/${inquiries.length || 0} 个合格线索`,
    },
    {
      ...FINAL_GOAL_MILESTONES[1],
      current: deliveryRate,
      done: qualified > 0 && deliveryRate >= 60,
      note: `${delivered}/${qualified || 0} 个已交付 POC`,
    },
    {
      ...FINAL_GOAL_MILESTONES[2],
      current: reviewRate,
      done: delivered > 0 && reviewRate >= 70 && contractRate >= 15,
      note: `${reviewed}/${delivered || 0} 个已复盘 POC / 合同率 ${contractRate}%`,
    },
  ];

  return (
    <div className="max-w-[1100px] mx-auto py-8 px-6">
      <AdminHeader
        subtitle="POC 漏斗 / 反馈 / 付款 / 健康度 / 使用总览"
        onLogout={() => { sessionStorage.removeItem('wenai_admin_key'); setAuthed(false); }}
      />

      <section className="mb-6 border border-border-subtle rounded-md bg-bg-surface p-4">
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div>
            <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-1">最终目标</div>
            <p className="text-[12px] text-text-primary">
              最终目标不是堆功能页。wenai 作为子站，必须稳定推动 <span className="font-mono">10 SKU POC -&gt; 复盘 -&gt; 主站合同</span>。
            </p>
          </div>
          <div className="text-[10px] font-mono text-text-tertiary">
            北极星：每月进入合同的合格 POC 数
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {milestoneCards.map(card => (
              <div key={card.key} className="rounded border border-border-subtle bg-bg-root/45 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[10px] font-mono text-text-tertiary uppercase">{card.phase}</div>
                  <div className={`text-[10px] font-mono ${card.done ? 'text-success' : 'text-accent'}`}>
                    {card.done ? '达标' : '推进中'}
                  </div>
                </div>
                <div className="mt-1 text-[14px] font-semibold text-text-primary">{card.title}</div>
                <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-text-primary">{card.current}%</div>
                <div className="mt-1 text-[10px] text-text-tertiary">{card.targetLabel}</div>
                <div className="mt-2 text-[11px] text-text-secondary">{card.note}</div>
              </div>
            ))}
          </div>

          <div className="rounded border border-border-subtle bg-bg-root/35 p-3">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">边界</div>
            <div className="space-y-2 text-[11px] text-text-secondary leading-relaxed">
              <p>要做：合格询盘收集、POC 交付、验收复盘、主站合同推进。</p>
              <p>不做：泛 AI OS、低价自助工具、在本仓直接收款。</p>
              <p>判断规则：提高合格率、交付率、复盘率和合同率。</p>
            </div>
            <Link href="/docs" className="mt-3 inline-block text-[10px] font-mono text-accent hover:underline">
              查看公开文档 -&gt;
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-6 border border-accent/30 rounded-md bg-accent/5 p-4">
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div>
            <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-1">10 SKU POC 商业漏斗</div>
            <p className="text-[12px] text-text-secondary">
              判断线索是否合格、交付是否卡住、复盘是否推动合同。
            </p>
          </div>
          <Link href="/admin/inquiries" className="text-[10px] font-mono text-accent hover:underline">
            打开 POC 看板 -&gt;
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
          {[
            ['询盘', inquiries.length, '通过 /inquire 提交的全部线索'],
            ['合格', qualified, '线索分 >= 60'],
            ['活跃', activePoc, '已联系到已交付'],
            ['已交付', delivered, `${deliveryRate}% / 合格线索`],
            ['已复盘', reviewed, `${reviewRate}% / 已交付`],
            ['进合同', statusCounts.contract, `${contractRate}% / 总询盘`],
          ].map(([label, value, note]) => (
            <div key={label} className="rounded border border-border-subtle bg-bg-root/45 p-3">
              <div className="text-[10px] font-mono text-text-tertiary uppercase">{label}</div>
              <div className="mt-1 text-2xl font-bold text-text-primary font-mono tabular-nums">{value}</div>
              <div className="mt-1 text-[10px] text-text-tertiary leading-snug">{note}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">
          <div className="space-y-2">
            {[
              ['合格率', inquiries.length > 0 ? Math.round((qualified / inquiries.length) * 100) : 0],
              ['交付率', deliveryRate],
              ['复盘率', reviewRate],
              ['合同率', contractRate],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-[96px_1fr_48px] gap-3 items-center text-[11px]">
                <span className="text-text-secondary">{label}</span>
                <div className="h-2 bg-bg-root rounded-full overflow-hidden border border-border-subtle">
                  <div className="h-full bg-accent" style={{ width: `${value}%` }} />
                </div>
                <span className="font-mono text-accent text-right tabular-nums">{value}%</span>
              </div>
            ))}
            <div className="mt-3 rounded border border-border-subtle bg-bg-root/40 p-3">
              <div className="text-[10px] font-mono text-text-tertiary uppercase mb-1">诊断</div>
              <p className="text-[12px] text-text-primary leading-relaxed">{bottleneck}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              ['逾期跟进', overdue],
              ['平均验收分', avgAcceptance || '-'],
              ['平均合同就绪', avgContractReadiness || '-'],
              ['合同就绪', readyForContract],
              ['有时间线', inquiriesWithActivity],
              ['14 天活动', recent14dActivity],
              ['沉默项目', silentProjects],
              ['SKU 不足', missingMaterials.sku],
              ['素材不完整', missingMaterials.assets],
              ['缺平台', missingMaterials.platform],
              ['缺验收标准', missingMaterials.acceptance],
            ].map(([label, value]) => (
              <div key={label} className="rounded border border-border-subtle bg-bg-root/45 p-3">
                <div className="text-[10px] font-mono text-text-tertiary">{label}</div>
                <div className={`mt-1 text-xl font-bold font-mono tabular-nums ${label === '逾期跟进' && Number(value) > 0 ? 'text-error' : 'text-text-primary'}`}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {sourceRows.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border-subtle">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">来源质量 Top 6</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {sourceRows.map(row => (
                <div key={row.source} className="rounded border border-border-subtle bg-bg-root/40 p-3">
                  <div className="text-[11px] text-text-primary font-mono truncate">{row.source}</div>
                  <div className="mt-1 text-[10px] text-text-tertiary">
                    {row.total} 个询盘 / {row.contract} 个合同 / {row.rate}% 转化
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border-subtle">
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">复盘决策记录</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              ['继续迭代', reviewDecisionCounts.iterate],
              ['扩 SKU', reviewDecisionCounts.expand],
              ['推合同', reviewDecisionCounts.contract],
              ['停止', reviewDecisionCounts.drop],
            ].map(([label, value]) => (
              <div key={label} className="rounded border border-border-subtle bg-bg-root/40 p-3">
                <div className="text-[10px] font-mono text-text-tertiary">{label}</div>
                <div className="mt-1 text-xl font-bold text-text-primary font-mono tabular-nums">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard label="反馈总数" value={feedbackTotal} note={`${feedbackGoodRatioOverall}% 好评`} />
        <MetricCard label="待处理付款" value={paymentPending} note={paymentPending > 0 ? '需要处理' : '已全部处理'} accent={paymentPending > 0} />
        <MetricCard label="图片管线需求" value={phase2Interest} note="历史兴趣点击" accent />
        <MetricCard label="今日使用" value={usage?.todayCount ?? '-'} note={`本周 ${usage?.weekCount ?? 0} / 总计 ${usage?.totalCount ?? 0}`} />
      </div>

      {health && (
        <div className="mb-6 p-4 border border-border-subtle rounded-md bg-bg-surface">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">系统健康度</div>
            <Link href="/status" className="text-[10px] font-mono text-accent hover:underline">查看状态详情 -&gt;</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {health.services.map(service => {
              const color = service.status === 'operational' ? 'text-success'
                : service.status === 'degraded' ? 'text-accent' : 'text-error';
              return (
                <div key={service.name} className="flex items-center gap-2 text-[11px]">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    service.status === 'operational' ? 'bg-success'
                    : service.status === 'degraded' ? 'bg-accent' : 'bg-error'
                  }`} />
                  <span className="text-text-primary truncate flex-1">{service.name.replace(/^AI - /, '').replace(/^Auth - /, '')}</span>
                  <span className={`font-mono ${color}`}>{service.latencyMs ? `${service.latencyMs}ms` : service.status === 'operational' ? '正常' : service.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {Object.keys(feedbackSummary).length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">模块反馈排行（按条数）</div>
          </div>
          <div className="space-y-1.5">
            {Object.entries(feedbackSummary)
              .sort((a, b) => b[1].total - a[1].total)
              .map(([moduleId, summary]) => (
                <Link key={moduleId} href="/admin/feedback" className="flex items-center gap-3 px-3 py-2 border border-border-subtle rounded hover:border-accent/30 hover:bg-bg-surface transition-all">
                  <span className="text-[12px] text-text-primary truncate min-w-0 flex-1">{moduleNameMap[moduleId] || moduleId}</span>
                  <div className="flex-shrink-0 w-32 h-1 bg-bg-raised rounded-full overflow-hidden">
                    <div className="h-full bg-success/60" style={{ width: `${summary.goodRatio}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-text-tertiary w-16 text-right tabular-nums">{summary.total} 条</span>
                  <span className="text-[10px] font-mono text-success w-12 text-right tabular-nums">{summary.goodRatio}%</span>
                </Link>
              ))}
          </div>
        </div>
      )}

      {usage && usage.ranking.length > 0 && (
        <div>
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">模块使用排行（7 天）</div>
          <div className="space-y-1.5">
            {usage.ranking.slice(0, 10).map((row, index) => {
              const maxCount = usage.ranking[0].count || 1;
              return (
                <div key={row.moduleId} className="flex items-center gap-3 px-3 py-2 border border-border-subtle rounded">
                  <span className="text-[10px] font-mono text-text-tertiary w-4 text-right">{index + 1}</span>
                  <span className="text-[12px] text-text-primary truncate min-w-0 flex-1">{moduleNameMap[row.moduleId] || row.moduleId}</span>
                  <div className="flex-shrink-0 w-48 h-1 bg-bg-raised rounded-full overflow-hidden">
                    <div className="h-full bg-accent/60" style={{ width: `${(row.count / maxCount) * 100}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-accent w-12 text-right tabular-nums">{row.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, note, accent = false }: { label: string; value: number | string; note: string; accent?: boolean }) {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-md p-4">
      <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider mb-2">{label}</div>
      <div className={`text-2xl font-bold tabular-nums ${accent ? 'text-accent' : 'text-text-primary'}`}>{value}</div>
      <div className="text-[10px] font-mono text-text-tertiary mt-1">{note}</div>
    </div>
  );
}
