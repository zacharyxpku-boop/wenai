'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  CONTRACT_STAGE_OPTIONS,
  CRM_PRIORITY_OPTIONS,
  CRM_SYNC_STATUS_OPTIONS,
  LIFECYCLE_STAGE_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  QUOTE_STATUS_OPTIONS,
  STATUS_OPTIONS,
} from '@/lib/crm-labels';

type InquiryPatch = {
  id: string;
  status?: string;
  owner?: string;
  nextAction?: string;
  nextActionDue?: string;
  contractNextStep?: string;
  contractStage?: string;
  quoteStatus?: string;
  paymentStatus?: string;
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
  reviewNotes?: string;
};

export default function AdminInquiryCommercialEditor({ initial }: { initial: InquiryPatch }) {
  const [draft, setDraft] = useState<InquiryPatch>(initial);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');

  function update(patch: Partial<InquiryPatch>) {
    setDraft(prev => ({ ...prev, ...patch }));
  }

  async function save() {
    setSaving(true);
    setMessage('');
    try {
      const adminKey = sessionStorage.getItem('wenai_admin_key') || '';
      const res = await fetch('/api/sales/inquiry', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(adminKey ? { 'x-admin-key': adminKey } : {}),
        },
        body: JSON.stringify(draft),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setMessage('已保存。刷新页面可查看最新活动记录。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '保存失败');
    } finally {
      setSaving(false);
    }
  }

  async function syncExternalCrm() {
    setSyncing(true);
    setMessage('');
    try {
      const adminKey = sessionStorage.getItem('wenai_admin_key') || '';
      const res = await fetch('/api/sales/inquiry', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(adminKey ? { 'x-admin-key': adminKey } : {}),
        },
        body: JSON.stringify({ id: draft.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      if (data.sync) {
        update({
          crmSyncStatus: data.sync.status,
          crmSyncAt: new Date().toISOString(),
          crmSyncNote: data.sync.note,
          externalCrmId: data.sync.externalId || draft.externalCrmId,
          externalCrmUrl: data.sync.externalUrl || draft.externalCrmUrl,
        });
        setMessage(data.sync.note || '外部 CRM 同步已执行。');
      } else {
        setMessage('外部 CRM 同步已执行。');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '外部 CRM 同步失败');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <section className="rounded-md border border-accent/30 bg-accent/5 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-accent">CRM 工作台</div>
          <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
            维护线索状态、客户账户、联系人、商机、合同、付款、SLA 和外部 CRM 同步映射。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-md bg-accent px-4 py-2 text-[12px] font-semibold text-bg-root hover:bg-accent-hover disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存 CRM 记录'}
          </button>
          <button
            type="button"
            onClick={syncExternalCrm}
            disabled={syncing}
            className="rounded-md border border-accent/50 px-4 py-2 text-[12px] font-semibold text-accent hover:bg-accent/10 disabled:opacity-50"
          >
            {syncing ? '同步中...' : '同步外部 CRM'}
          </button>
        </div>
      </div>

      <Panel title="推进状态">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Select label="POC 状态" value={draft.status || 'new'} options={STATUS_OPTIONS} onChange={value => update({ status: value })} />
          <Select label="合同阶段" value={draft.contractStage || ''} options={CONTRACT_STAGE_OPTIONS} onChange={value => update({ contractStage: value })} />
          <Select label="报价状态" value={draft.quoteStatus || 'not_sent'} options={QUOTE_STATUS_OPTIONS} onChange={value => update({ quoteStatus: value })} />
          <Select label="付款状态" value={draft.paymentStatus || 'not_started'} options={PAYMENT_STATUS_OPTIONS} onChange={value => update({ paymentStatus: value })} />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[0.9fr_0.7fr_1.4fr]">
          <Input label="负责人" value={draft.owner} onChange={value => update({ owner: value })} />
          <Input label="SLA 截止" type="date" value={draft.nextActionDue} onChange={value => update({ nextActionDue: value })} />
          <Input label="合同下一步" value={draft.contractNextStep} onChange={value => update({ contractNextStep: value })} />
        </div>
        <Textarea label="下一动作" value={draft.nextAction} rows={3} onChange={value => update({ nextAction: value })} />
      </Panel>

      <Panel title="外部 CRM 映射">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Select label="同步状态" value={draft.crmSyncStatus || 'not_configured'} options={CRM_SYNC_STATUS_OPTIONS} onChange={value => update({ crmSyncStatus: value })} />
          <Input label="外部 CRM ID" value={draft.externalCrmId} onChange={value => update({ externalCrmId: value })} />
          <Input label="外部 CRM 链接" value={draft.externalCrmUrl} onChange={value => update({ externalCrmUrl: value })} />
          <Input label="同步时间" type="datetime-local" value={draft.crmSyncAt} onChange={value => update({ crmSyncAt: value })} />
        </div>
        <Textarea label="同步备注" value={draft.crmSyncNote} rows={2} onChange={value => update({ crmSyncNote: value })} />
      </Panel>

      <Panel title="账户与联系人">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Input label="官网域名" value={draft.accountDomain} onChange={value => update({ accountDomain: value })} />
          <Input label="公司负责人" value={draft.companyOwner} onChange={value => update({ companyOwner: value })} />
          <Select label="生命周期" value={draft.lifecycleStage || 'lead'} options={LIFECYCLE_STAGE_OPTIONS} onChange={value => update({ lifecycleStage: value })} />
          <Select label="优先级" value={draft.priority || 'normal'} options={CRM_PRIORITY_OPTIONS} onChange={value => update({ priority: value })} />
          <Input label="联系人姓名" value={draft.contactName} onChange={value => update({ contactName: value })} />
          <Input label="联系人角色" value={draft.contactRole} onChange={value => update({ contactRole: value })} />
          <Input label="邮箱" value={draft.contactEmail} onChange={value => update({ contactEmail: value })} />
          <Input label="电话/微信" value={draft.contactPhone} onChange={value => update({ contactPhone: value })} />
        </div>
      </Panel>

      <Panel title="商机与成交">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Input label="商机名" value={draft.dealName} onChange={value => update({ dealName: value })} />
          <Input label="金额" value={draft.dealAmount} onChange={value => update({ dealAmount: value })} />
          <Input label="币种" value={draft.dealCurrency || 'CNY'} onChange={value => update({ dealCurrency: value })} />
          <Input label="成交概率" value={draft.dealProbability} onChange={value => update({ dealProbability: value })} />
          <Input label="预计签约日" type="date" value={draft.closeDate} onChange={value => update({ closeDate: value })} />
          <Input label="最近联系" type="date" value={draft.lastContactedAt} onChange={value => update({ lastContactedAt: value })} />
          <Input label="下次会议" type="datetime-local" value={draft.nextMeetingAt} onChange={value => update({ nextMeetingAt: value })} />
          <Input label="线索来源" value={draft.crmSource} onChange={value => update({ crmSource: value })} />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input label="客户分层" value={draft.segment} onChange={value => update({ segment: value })} />
          <Input label="标签" value={draft.tags} onChange={value => update({ tags: value })} />
          <Input label="续费潜力" value={draft.renewalPotential} onChange={value => update({ renewalPotential: value })} />
        </div>
        <Textarea label="丢单原因" value={draft.lostReason} rows={2} onChange={value => update({ lostReason: value })} />
        <Textarea label="复盘备注" value={draft.reviewNotes} rows={3} onChange={value => update({ reviewNotes: value })} />
      </Panel>

      {message && (
        <div className="mt-3 rounded-md border border-border-subtle bg-bg-root/45 p-3 text-[11px] font-mono text-text-secondary">
          {message}
        </div>
      )}
    </section>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-4 rounded-md border border-border-subtle bg-bg-root/35 p-3">
      <div className="mb-3 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">{title}</div>
      {children}
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly (readonly [string, string])[];
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full rounded-md border border-border-default bg-bg-root px-3 py-2 text-[12px] text-text-primary"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </Field>
  );
}

function Input({
  label,
  value = '',
  type = 'text',
  onChange,
}: {
  label: string;
  value?: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <input
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full rounded-md border border-border-default bg-bg-root px-3 py-2 text-[12px] text-text-primary"
      />
    </Field>
  );
}

function Textarea({
  label,
  value = '',
  rows,
  onChange,
}: {
  label: string;
  value?: string;
  rows: number;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label} className="mt-3">
      <textarea
        value={value}
        onChange={event => onChange(event.target.value)}
        rows={rows}
        className="w-full resize-none rounded-md border border-border-default bg-bg-root px-3 py-2 text-[12px] leading-relaxed text-text-primary"
      />
    </Field>
  );
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-text-tertiary">{label}</span>
      {children}
    </label>
  );
}
