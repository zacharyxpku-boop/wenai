'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CASE_DECISION_META,
  CASE_LANE_META,
  DEFAULT_CASE_LIBRARY_FILTERS,
  filterCaseLibrary,
  getCaseLibraryCategories,
  type CaseLibraryEntry,
  type CaseLibraryFilters,
} from '@/lib/case-library';

export default function CaseLibraryExplorer({
  entries,
}: {
  entries: CaseLibraryEntry[];
}) {
  const [filters, setFilters] = useState<CaseLibraryFilters>(
    DEFAULT_CASE_LIBRARY_FILTERS,
  );

  const categories = useMemo(() => getCaseLibraryCategories(entries), [entries]);
  const filteredEntries = useMemo(
    () => filterCaseLibrary(entries, filters),
    [entries, filters],
  );

  const contractReadyCount = filteredEntries.filter(
    item => item.decision === 'push-contract',
  ).length;
  const expansionCount = filteredEntries.filter(
    item => item.decision === 'expand-scope',
  ).length;

  return (
    <section className="border border-border-subtle rounded-md bg-bg-surface overflow-hidden">
      <div className="border-b border-border-subtle px-5 py-5 md:px-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="max-w-[720px]">
            <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-2">
              案例决策面板
            </div>
            <h2 className="text-[22px] font-semibold text-text-primary font-[family-name:var(--font-outfit)] text-balance">
              把案例库变成售前决策面板
            </h2>
            <p className="mt-3 text-[13px] text-text-secondary leading-relaxed text-pretty">
              不只是展示“做过什么”，而是直接回答客户现在能买什么、先跑哪一批 SKU、
              什么情况下应该推进合同。
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-[280px]">
            <SnapshotMetric label="可见案例" value={String(filteredEntries.length)} />
            <SnapshotMetric label="可推进合同" value={String(contractReadyCount)} />
            <SnapshotMetric label="可扩量" value={String(expansionCount)} />
          </div>
        </div>
      </div>

      <div className="border-b border-border-subtle px-5 py-5 md:px-6 space-y-5 bg-bg-root/20">
        <FilterGroup
          label="按交付类型筛"
          options={[
            { value: 'all', label: '全部', description: '看完整案例库。' },
            ...Object.entries(CASE_LANE_META).map(([value, meta]) => ({
              value,
              label: meta.label,
              description: meta.description,
            })),
          ]}
          selected={filters.lane}
          onSelect={value =>
            setFilters(current => ({
              ...current,
              lane: value as CaseLibraryFilters['lane'],
            }))
          }
        />

        <FilterGroup
          label="按商业决策筛"
          options={[
            { value: 'all', label: '全部', description: '看全部推进状态。' },
            ...Object.entries(CASE_DECISION_META).map(([value, meta]) => ({
              value,
              label: meta.label,
              description: meta.description,
            })),
          ]}
          selected={filters.decision}
          onSelect={value =>
            setFilters(current => ({
              ...current,
              decision: value as CaseLibraryFilters['decision'],
            }))
          }
        />

        <FilterGroup
          label="按类目筛"
          options={[
            { value: 'all', label: '全部', description: '看所有类目。' },
            ...categories.map(value => ({
              value,
              label: value,
              description: '聚焦同类目案例。',
            })),
          ]}
          selected={filters.category}
          onSelect={value =>
            setFilters(current => ({
              ...current,
              category: value,
            }))
          }
        />
      </div>

      <div className="px-5 py-5 md:px-6">
        <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-[12px] text-text-secondary">
            当前结果 <span className="text-text-primary tabular-nums">{filteredEntries.length}</span>{' '}
            条
          </div>
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_CASE_LIBRARY_FILTERS)}
            className="inline-flex items-center rounded-md border border-border-subtle px-3 py-1.5 text-[11px] font-mono text-text-secondary hover:text-text-primary hover:border-border-default transition-colors"
          >
            重置筛选
          </button>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="border border-border-subtle rounded-md bg-bg-root/35 p-6">
            <div className="text-[14px] font-semibold text-text-primary mb-2 font-[family-name:var(--font-outfit)]">
              当前筛选下没有案例
            </div>
            <p className="text-[13px] text-text-secondary leading-relaxed text-pretty">
              先放宽类目或商业决策条件，再看更接近成交场景的案例。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredEntries.map(entry => (
              <article
                key={entry.slug}
                className="border border-border-subtle rounded-md bg-bg-root/35 p-5"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Tag>{CASE_LANE_META[entry.lane].label}</Tag>
                      <Tag tone="muted">{CASE_DECISION_META[entry.decision].label}</Tag>
                      <Tag tone="subtle">{entry.stageLabel}</Tag>
                    </div>
                    <h3 className="text-[18px] font-semibold text-text-primary font-[family-name:var(--font-outfit)] text-balance">
                      {entry.title}
                    </h3>
                    <div className="text-[11px] font-mono text-text-tertiary">
                      {entry.segment}
                    </div>
                  </div>
                  <div className="min-w-[110px] border border-border-subtle rounded-md bg-bg-surface px-3 py-2">
                    <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider mb-1">
                      验收分
                    </div>
                    <div className="text-[13px] text-text-primary tabular-nums">
                      {entry.acceptanceScore}
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-[13px] text-text-secondary leading-relaxed text-pretty">
                  {entry.summary}
                </p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoBlock
                    label="这能证明什么"
                    value={entry.proofStatement}
                    emphasis
                  />
                  <InfoBlock label="商业用途" value={entry.commercialUse} />
                  <InfoBlock label="当前就绪度" value={entry.readiness} />
                  <InfoBlock label="下一步动作" value={entry.nextStep} />
                </div>

                <div className="mt-4 border border-accent/20 rounded-md bg-accent/5 p-4">
                  <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-2">
                    合同推进动作
                  </div>
                  <p className="text-[13px] text-text-primary leading-relaxed text-pretty">
                    {entry.contractAction}
                  </p>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/cases/${entry.slug}`}
                    className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-[12px] font-semibold text-bg-root hover:bg-accent-hover transition-colors"
                  >
                    查看完整案例
                  </Link>
                  <Link
                    href={entry.pipelineHref}
                    className="inline-flex items-center justify-center rounded-md border border-border-default px-4 py-2 text-[12px] font-semibold text-text-primary hover:border-accent hover:text-accent transition-colors"
                  >
                    跑同款流程
                  </Link>
                  <Link
                    href={entry.standardPackHref}
                    className="inline-flex items-center justify-center rounded-md border border-border-subtle px-4 py-2 text-[12px] font-semibold text-text-secondary hover:text-text-primary hover:border-border-default transition-colors"
                  >
                    生成标准包
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FilterGroup({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: Array<{ value: string; label: string; description: string }>;
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const active = selected === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(option.value)}
              className={`inline-flex items-center rounded-md border px-3 py-2 text-left transition-colors ${
                active
                  ? 'border-accent bg-accent/10 text-text-primary'
                  : 'border-border-subtle bg-bg-surface text-text-secondary hover:border-border-default hover:text-text-primary'
              }`}
            >
              <span>
                <span className="block text-[11px] font-mono">{option.label}</span>
                <span className="mt-1 block text-[11px] leading-relaxed text-inherit">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SnapshotMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border-subtle rounded-md bg-bg-root/35 px-4 py-3">
      <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-[16px] font-semibold text-text-primary tabular-nums">{value}</div>
    </div>
  );
}

function InfoBlock({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="border border-border-subtle rounded-md bg-bg-surface p-3">
      <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider mb-1">
        {label}
      </div>
      <p
        className={`text-[12px] leading-relaxed text-pretty ${
          emphasis ? 'text-text-primary' : 'text-text-secondary'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Tag({
  children,
  tone = 'default',
}: {
  children: string;
  tone?: 'default' | 'muted' | 'subtle';
}) {
  const className =
    tone === 'default'
      ? 'border-accent/30 bg-accent/10 text-accent'
      : tone === 'muted'
        ? 'border-border-default bg-bg-surface text-text-primary'
        : 'border-border-subtle bg-bg-root/35 text-text-secondary';

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-mono ${className}`}
    >
      {children}
    </span>
  );
}
