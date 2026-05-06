'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { evaluatePocLaunchCheck, type PocLaunchCheckInput } from '@/lib/poc-launch-check';

const INITIAL: PocLaunchCheckInput = {
  skuCount: '10',
  platforms: 'Shopify + TikTok Shop',
  assetsReady: 'partial',
  benchmarkReady: false,
  acceptanceReady: false,
  ownerReady: false,
  timelineReady: false,
};

export default function PocLaunchChecklist() {
  const [input, setInput] = useState<PocLaunchCheckInput>(INITIAL);
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => evaluatePocLaunchCheck(input), [input]);

  const copyChecklist = async () => {
    await navigator.clipboard.writeText(result.checklistMarkdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <section className="border border-accent/30 rounded-lg bg-accent/5 p-5 md:p-6">
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-2">
            Launch Readiness
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)] text-text-primary">
            先判断这批 SKU 能不能启动 POC
          </h2>
          <p className="mt-2 text-[13px] text-text-secondary leading-relaxed max-w-2xl">
            客户不用理解 SOP。勾完这张表, 就知道现在是直接生成标准包, 还是先补 SKU、素材、benchmark 和验收人。
          </p>
        </div>
        <div className="min-w-[148px] text-right">
          <div className="text-3xl font-bold font-mono tabular-nums text-accent">{result.score}</div>
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">ready score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-4">
        <div className="border border-border-subtle rounded-md bg-bg-root/35 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="SKU 数量">
              <input
                value={input.skuCount}
                onChange={event => setInput(prev => ({ ...prev, skuCount: event.target.value }))}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-md text-[13px]"
                placeholder="例: 10"
              />
            </Field>
            <Field label="目标平台">
              <input
                value={input.platforms}
                onChange={event => setInput(prev => ({ ...prev, platforms: event.target.value }))}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-md text-[13px]"
                placeholder="例: Amazon + TikTok Shop"
              />
            </Field>
          </div>

          <Field label="素材状态">
            <select
              value={input.assetsReady}
              onChange={event => setInput(prev => ({ ...prev, assetsReady: event.target.value as PocLaunchCheckInput['assetsReady'] }))}
              className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-md text-[13px]"
            >
              <option value="ready">商品图、参数、卖点都齐</option>
              <option value="partial">部分齐, 还有缺口</option>
              <option value="none">还没有整理素材</option>
            </select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <CheckBox
              checked={input.benchmarkReady}
              label="已有 benchmark / 参考账号"
              onChange={value => setInput(prev => ({ ...prev, benchmarkReady: value }))}
            />
            <CheckBox
              checked={input.acceptanceReady}
              label="已明确验收口径"
              onChange={value => setInput(prev => ({ ...prev, acceptanceReady: value }))}
            />
            <CheckBox
              checked={input.ownerReady}
              label="已明确最终审核人"
              onChange={value => setInput(prev => ({ ...prev, ownerReady: value }))}
            />
            <CheckBox
              checked={input.timelineReady}
              label="已明确复盘时间窗"
              onChange={value => setInput(prev => ({ ...prev, timelineReady: value }))}
            />
          </div>
        </div>

        <div className="border border-border-subtle rounded-md bg-bg-root/35 p-4">
          <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
            <div>
              <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-1">
                判断结果
              </div>
              <div className="text-[18px] font-semibold text-text-primary">{result.label}</div>
              <p className="mt-1 text-[12px] text-text-secondary leading-relaxed">{result.nextStep}</p>
            </div>
            <span className="text-[10px] font-mono text-accent border border-accent/35 rounded px-2 py-1">
              {result.decision}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ResultList title="阻塞项" items={result.blockers} fallback="暂无关键阻塞" tone="risk" />
            <ResultList title="已具备" items={result.strengths} fallback="还没有形成足够强的启动条件" tone="good" />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <Link
              href={result.standardPackHref}
              className="inline-flex justify-center rounded-md bg-accent px-4 py-2 text-[12px] font-semibold text-bg-root hover:bg-accent-hover"
            >
              生成启动标准包
            </Link>
            <button
              type="button"
              onClick={copyChecklist}
              className="rounded-md border border-border-default px-4 py-2 text-[12px] font-mono text-text-primary hover:border-accent/40"
            >
              {copied ? '已复制自检表' : '复制自检表'}
            </button>
            <Link
              href="/inquire?from=poc-checklist"
              className="inline-flex justify-center rounded-md border border-accent/40 px-4 py-2 text-[12px] font-mono text-accent hover:bg-accent/10"
            >
              提交 POC 需求
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-mono text-text-secondary">{label}</label>
      {children}
    </div>
  );
}

function CheckBox({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-md border border-border-subtle bg-bg-surface/35 px-3 py-2 text-[12px] text-text-primary">
      <input
        type="checkbox"
        checked={checked}
        onChange={event => onChange(event.target.checked)}
        className="size-4 accent-[var(--color-accent)]"
      />
      <span>{label}</span>
    </label>
  );
}

function ResultList({
  title,
  items,
  fallback,
  tone,
}: {
  title: string;
  items: string[];
  fallback: string;
  tone: 'risk' | 'good';
}) {
  const visible = items.length > 0 ? items : [fallback];
  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface/35 p-3">
      <div className={`mb-2 text-[10px] font-mono uppercase tracking-wider ${tone === 'risk' ? 'text-error' : 'text-success'}`}>
        {title}
      </div>
      <ul className="space-y-1.5">
        {visible.map(item => (
          <li key={item} className="text-[11px] leading-relaxed text-text-secondary">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
