import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
import AdminInquiryCommercialEditor from '@/components/AdminInquiryCommercialEditor';
import { buildPipelineSummary, scoreOpportunity } from '@/lib/crm-pipeline';
import {
  CONTRACT_STAGE_LABELS,
  CRM_PRIORITY_LABELS,
  CRM_SYNC_STATUS_LABELS,
  INQUIRY_STATUS_LABELS,
  LIFECYCLE_STAGE_LABELS,
  PAYMENT_STATUS_LABELS,
  QUOTE_STATUS_LABELS,
  labelOrFallback,
} from '@/lib/crm-labels';

type Inquiry = Record<string, string>;

async function getInquiry(id: string): Promise<Inquiry | null> {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/sales/inquiry`, {
    headers: process.env.ADMIN_KEY ? { 'x-admin-key': process.env.ADMIN_KEY } : undefined,
    cache: 'no-store',
  }).catch(() => null);
  if (!res || !res.ok) return null;
  const data = await res.json().catch(() => null);
  const items = Array.isArray(data?.inquiries) ? data.inquiries : [];
  return items.find((item: Inquiry) => item.id === id) || null;
}

function parseActivity(raw?: string) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as { at: string; title: string; body: string; type: string }[];
    return Array.isArray(parsed) ? parsed.slice(-12).reverse() : [];
  } catch {
    return [];
  }
}

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inquiry = await getInquiry(id);
  if (!inquiry) notFound();

  const pipeline = buildPipelineSummary([{
    id,
    company: inquiry.company,
    status: inquiry.status,
    leadScore: inquiry.leadScore,
    contractReadiness: inquiry.contractReadiness,
    readinessAcceptanceScore: inquiry.readinessAcceptanceScore,
    contractStage: inquiry.contractStage,
    quoteStatus: inquiry.quoteStatus,
    paymentStatus: inquiry.paymentStatus,
    nextAction: inquiry.nextAction,
    nextActionDue: inquiry.nextActionDue,
  }]);
  const opportunity = pipeline.opportunities[0];
  const score = scoreOpportunity({
    id,
    company: inquiry.company,
    status: inquiry.status,
    leadScore: inquiry.leadScore,
    contractReadiness: inquiry.contractReadiness,
    readinessAcceptanceScore: inquiry.readinessAcceptanceScore,
    contractStage: inquiry.contractStage,
    quoteStatus: inquiry.quoteStatus,
    paymentStatus: inquiry.paymentStatus,
  });
  const activities = parseActivity(inquiry.activityLog);

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-8">
      <AdminHeader subtitle="询盘详情 / 外部 CRM 映射 / 合同推进 / 活动记录" />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-accent">询盘详情</div>
          <h1 className="mt-1 text-2xl font-bold text-text-primary">{inquiry.company}</h1>
          <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
            {inquiry.channel || '未指定渠道'} / {inquiry.contact || '未记录联系人'} / {inquiry.platforms || '未指定平台'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/api/sales/inquiry?format=external-crm`}
            className="rounded-md border border-accent/40 px-4 py-2 text-[12px] font-mono text-accent hover:bg-accent/10"
          >
            导出 CRM 映射
          </Link>
          <Link
            href="/admin/inquiries"
            className="rounded-md border border-border-default px-4 py-2 text-[12px] font-mono text-text-primary hover:border-accent/40"
          >
            返回询盘列表
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-5">
        {[
          ['商机分', `${score}/100`],
          ['阶段', opportunity?.stageLabel || labelOrFallback(INQUIRY_STATUS_LABELS, inquiry.status, '新需求')],
          ['合同', labelOrFallback(CONTRACT_STAGE_LABELS, inquiry.contractStage, '待判断')],
          ['报价', labelOrFallback(QUOTE_STATUS_LABELS, inquiry.quoteStatus, '未记录')],
          ['付款', labelOrFallback(PAYMENT_STATUS_LABELS, inquiry.paymentStatus, '未记录')],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-border-subtle bg-bg-surface/40 p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">{label}</div>
            <div className="mt-1 text-[18px] font-semibold text-text-primary">{value}</div>
          </div>
        ))}
      </section>

      <div className="mt-5">
        <AdminInquiryCommercialEditor initial={{ ...inquiry, id }} />
      </div>

      <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <Card title="客户痛点" body={inquiry.painPoint || '未填写'} />
          <Card title="下一动作" body={inquiry.nextAction || '暂无下一动作'} />
          <Card title="合同下一步" body={inquiry.contractNextStep || '暂无合同动作'} />
          <Card title="复盘备注" body={inquiry.reviewNotes || '暂无复盘备注'} />
        </div>

        <div className="space-y-4">
          <Card title="评分快照" body={`线索 ${inquiry.leadScore || '--'} / 验收 ${inquiry.readinessAcceptanceScore || '--'} / 合同 ${inquiry.contractReadiness || '--'}`} />
          <Card title="SLA 截止" body={inquiry.nextActionDue || '暂无 SLA'} />
          <Card title="负责人" body={inquiry.owner || '未分配'} />
          <Card title="来源" body={inquiry.source || '未记录'} />
        </div>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="账户映射" body={[
          `域名：${inquiry.accountDomain || '未记录'}`,
          `公司负责人：${inquiry.companyOwner || inquiry.owner || '未分配'}`,
          `生命周期：${labelOrFallback(LIFECYCLE_STAGE_LABELS, inquiry.lifecycleStage, '未分层')}`,
          `优先级：${labelOrFallback(CRM_PRIORITY_LABELS, inquiry.priority, '未设置')}`,
          `客户分层：${inquiry.segment || '未记录'}`,
          `标签：${inquiry.tags || '未记录'}`,
        ].join('\n')} />
        <Card title="联系人" body={[
          `姓名：${inquiry.contactName || '未记录'}`,
          `角色：${inquiry.contactRole || '未记录'}`,
          `邮箱：${inquiry.contactEmail || '未记录'}`,
          `电话/微信：${inquiry.contactPhone || '未记录'}`,
        ].join('\n')} />
        <Card title="外部 CRM 同步" body={[
          `状态：${labelOrFallback(CRM_SYNC_STATUS_LABELS, inquiry.crmSyncStatus, '未记录')}`,
          `外部 ID：${inquiry.externalCrmId || '未记录'}`,
          `链接：${inquiry.externalCrmUrl || '未记录'}`,
          `同步时间：${inquiry.crmSyncAt || '未记录'}`,
          `备注：${inquiry.crmSyncNote || '未记录'}`,
        ].join('\n')} />
      </section>

      <section className="mt-5 rounded-md border border-border-subtle bg-bg-surface/40 p-4">
        <div className="mb-3 text-[10px] font-mono uppercase tracking-wider text-accent">活动记录</div>
        {activities.length === 0 ? (
          <p className="text-[12px] text-text-tertiary">暂无活动记录</p>
        ) : (
          <div className="space-y-3">
            {activities.map((item, index) => (
              <div key={`${item.at}-${index}`} className="rounded-md border border-border-subtle bg-bg-root/35 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[12px] font-semibold text-text-primary">{item.title}</div>
                  <div className="text-[10px] font-mono text-text-tertiary">{new Date(item.at).toLocaleString('zh-CN')}</div>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-[12px] leading-relaxed text-text-secondary">{item.body}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface/40 p-4">
      <div className="text-[10px] font-mono uppercase tracking-wider text-accent">{title}</div>
      <p className="mt-2 whitespace-pre-wrap text-[12px] leading-relaxed text-text-primary">{body}</p>
    </div>
  );
}
