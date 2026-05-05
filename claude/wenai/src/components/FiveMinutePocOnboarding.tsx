'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { buildBrandIqProfile } from '@/lib/brand-iq';
import { buildBrandKnowledgeBrief, getCategoryGuardrail, type EcommerceCategoryKey } from '@/lib/ecommerce-guardrails';
import { evaluatePocLaunchCheck } from '@/lib/poc-launch-check';
import { buildPocReportRoute } from '@/lib/standard-pack-routing';

const CATEGORY_OPTIONS: Array<{ key: EcommerceCategoryKey; label: string }> = [
  { key: 'home', label: 'Home' },
  { key: 'auto', label: 'Auto' },
  { key: 'digital', label: 'Digital' },
  { key: 'beauty', label: 'Beauty' },
  { key: 'apparel', label: 'Apparel' },
  { key: 'supplement', label: 'Health' },
  { key: 'mixed', label: 'Mixed' },
];

export default function FiveMinutePocOnboarding() {
  const [category, setCategory] = useState<EcommerceCategoryKey>('home');
  const [skuInput, setSkuInput] = useState('10 SKU home storage launch batch: drawer organizer, food container, cabinet rack. Shopify + TikTok Shop.');
  const [platforms, setPlatforms] = useState('Shopify + TikTok Shop');
  const [brandVoice, setBrandVoice] = useState('clean, credible, not exaggerated');
  const [forbiddenWords, setForbiddenWords] = useState('best, cure, guaranteed, 100%');
  const [benchmarkReady, setBenchmarkReady] = useState(false);
  const [ownerReady, setOwnerReady] = useState(false);
  const [acceptanceReady, setAcceptanceReady] = useState(false);
  const [copied, setCopied] = useState(false);

  const guardrail = useMemo(() => getCategoryGuardrail(category), [category]);
  const skuCount = useMemo(() => {
    const match = skuInput.match(/\d+\s*SKU/i);
    return match?.[0] || '10';
  }, [skuInput]);
  const readiness = useMemo(() => evaluatePocLaunchCheck({
    skuCount,
    platforms,
    assetsReady: skuInput.trim().length >= 40 ? 'partial' : 'none',
    benchmarkReady,
    acceptanceReady,
    ownerReady,
    timelineReady: true,
  }), [acceptanceReady, benchmarkReady, ownerReady, platforms, skuCount, skuInput]);
  const brandBrief = useMemo(() => buildBrandKnowledgeBrief({
    category,
    brandVoice,
    forbiddenWords,
    platforms,
    owner: ownerReady ? 'assigned in customer review' : '',
  }), [brandVoice, category, forbiddenWords, ownerReady, platforms]);
  const brandIq = useMemo(() => buildBrandIqProfile({
    category,
    brandName: 'POC customer brand',
    brandVoice,
    forbiddenWords,
    platforms,
    owner: ownerReady ? 'assigned in customer review' : '',
    benchmarkLinks: benchmarkReady ? 'customer benchmark provided' : '',
  }), [benchmarkReady, brandVoice, category, forbiddenWords, ownerReady, platforms]);
  const reportHref = useMemo(() => buildPocReportRoute({
    benchmarkPreset: benchmarkReady ? 'creative-test' : 'catalog-launch',
    skuPlanned: Number.parseInt(skuCount, 10) || 10,
    skuDelivered: readiness.decision === 'ready' ? 10 : 7,
    finalReviewPassRate: readiness.decision === 'ready' ? guardrail.acceptanceThresholds.reviewPassRate : 70,
    benchmarkCoverage: benchmarkReady ? guardrail.acceptanceThresholds.benchmarkCoverage : 45,
    riskCount: readiness.decision === 'ready' ? guardrail.acceptanceThresholds.maxRiskCount : 2,
    missingAssetCount: skuInput.trim().length >= 40 ? 1 : 3,
    reworkCount: readiness.decision === 'ready' ? 1 : 3,
    contentTestReady: benchmarkReady,
    ownerReady,
    contractIntent: readiness.decision === 'ready',
    source: 'five-minute-onboarding',
    categoryLabel: category,
  }), [benchmarkReady, category, guardrail, ownerReady, readiness.decision, skuCount, skuInput]);

  async function copyBrandBrief() {
    await navigator.clipboard.writeText(brandBrief);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className="rounded-lg border border-accent/35 bg-accent/5 p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">
            5-minute POC path
          </div>
          <h2 className="text-balance font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary md:text-3xl">
            Category / SKU / Standard pack / Report / POC request
          </h2>
          <p className="mt-2 text-pretty text-[13px] leading-relaxed text-text-secondary">
            Customers do not need to understand prompts or SOPs. They choose a category, paste SKU context,
            set brand rules, and get a standard delivery pack plus a decision-ready POC report.
          </p>
        </div>
        <div className="min-w-[150px] text-right">
          <div className="font-mono text-3xl font-bold tabular-nums text-accent">{readiness.score}</div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">ready score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-md border border-border-subtle bg-bg-root/35 p-4">
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CATEGORY_OPTIONS.map(item => (
              <button
                key={item.key}
                type="button"
                aria-pressed={category === item.key}
                onClick={() => setCategory(item.key)}
                className={`rounded-md border px-3 py-2 text-[11px] font-mono transition-colors ${
                  category === item.key
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border-subtle bg-bg-surface text-text-secondary hover:border-border-default hover:text-text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <Field label="SKU / batch context">
            <textarea
              value={skuInput}
              onChange={event => setSkuInput(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-md border border-border-default bg-bg-surface px-3 py-2 text-[13px] text-text-primary"
            />
          </Field>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Target platforms">
              <input
                value={platforms}
                onChange={event => setPlatforms(event.target.value)}
                className="w-full rounded-md border border-border-default bg-bg-surface px-3 py-2 text-[13px] text-text-primary"
              />
            </Field>
            <Field label="Brand voice">
              <input
                value={brandVoice}
                onChange={event => setBrandVoice(event.target.value)}
                className="w-full rounded-md border border-border-default bg-bg-surface px-3 py-2 text-[13px] text-text-primary"
              />
            </Field>
          </div>

          <Field label="Forbidden words / risky claims" className="mt-3">
            <input
              value={forbiddenWords}
              onChange={event => setForbiddenWords(event.target.value)}
              className="w-full rounded-md border border-border-default bg-bg-surface px-3 py-2 text-[13px] text-text-primary"
            />
          </Field>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Toggle label="Benchmark ready" checked={benchmarkReady} onChange={setBenchmarkReady} />
            <Toggle label="Acceptance owner" checked={ownerReady} onChange={setOwnerReady} />
            <Toggle label="Acceptance criteria" checked={acceptanceReady} onChange={setAcceptanceReady} />
          </div>
        </div>

        <div className="rounded-md border border-border-subtle bg-bg-root/35 p-4">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-accent">
                Category guardrail
              </div>
              <div className="text-[18px] font-semibold text-text-primary">{guardrail.label}</div>
              <p className="mt-1 text-pretty text-[12px] leading-relaxed text-text-secondary">
                {guardrail.buyerPromise}
              </p>
            </div>
            <span className="rounded border border-accent/35 px-2 py-1 text-[10px] font-mono text-accent">
              {readiness.label}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Metric label="Review pass" value={`${guardrail.acceptanceThresholds.reviewPassRate}%`} />
            <Metric label="Benchmark" value={`${guardrail.acceptanceThresholds.benchmarkCoverage}%`} />
            <Metric label="Risk max" value={String(guardrail.acceptanceThresholds.maxRiskCount)} />
          </div>

          <div className="mt-3 rounded-md border border-accent/30 bg-accent/5 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-accent">Brand IQ</div>
              <div className="font-mono text-[18px] font-bold text-accent tabular-nums">{brandIq.readinessScore}/100</div>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {brandIq.workflowDefaults.map(item => (
                <div key={item} className="rounded border border-border-subtle bg-bg-root/35 p-2 text-[11px] leading-relaxed text-text-secondary">
                  {item}
                </div>
              ))}
            </div>
            {brandIq.risks.length > 0 && (
              <div className="mt-2 text-[11px] leading-relaxed text-text-tertiary">
                Setup risk: {brandIq.risks.join(' / ')}
              </div>
            )}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <ListBlock title="Required proof" items={guardrail.requiredProof} />
            <ListBlock title="Forbidden / risky claims" items={[...guardrail.forbiddenClaims, ...forbiddenWords.split(/[,;\n]/).map(item => item.trim()).filter(Boolean)].slice(0, 7)} />
          </div>

          <div className="mt-3 rounded-md border border-border-subtle bg-bg-surface p-3">
            <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Next action</div>
            <p className="text-pretty text-[12px] leading-relaxed text-text-primary">{readiness.nextStep}</p>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              href={readiness.standardPackHref}
              className="inline-flex min-h-[40px] items-center justify-center rounded-md bg-accent px-4 py-2 text-[12px] font-semibold text-bg-root hover:bg-accent-hover"
            >
              Generate standard pack
            </Link>
            <Link
              href={reportHref}
              className="inline-flex min-h-[40px] items-center justify-center rounded-md border border-border-default px-4 py-2 text-[12px] font-semibold text-text-primary hover:border-accent hover:text-accent"
            >
              Generate report
            </Link>
            <Link
              href="/inquire?from=five-minute-onboarding&skuCount=10"
              className="inline-flex min-h-[40px] items-center justify-center rounded-md border border-accent/40 px-4 py-2 text-[12px] font-mono text-accent hover:bg-accent/10"
            >
              Submit POC
            </Link>
            <button
              type="button"
              onClick={copyBrandBrief}
              className="min-h-[40px] rounded-md border border-border-default px-4 py-2 text-[12px] font-mono text-text-primary hover:border-accent/40"
            >
              {copied ? 'Brand brief copied' : 'Copy brand brief'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] font-mono text-text-secondary">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex min-h-[40px] items-center gap-2 rounded-md border border-border-subtle bg-bg-surface px-3 py-2 text-[12px] text-text-primary">
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface p-3">
      <div className="mb-1 text-[9px] font-mono uppercase tracking-wider text-text-tertiary">{label}</div>
      <div className="text-[14px] font-semibold text-text-primary tabular-nums">{value}</div>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface p-3">
      <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">{title}</div>
      <ul className="space-y-1.5">
        {items.map(item => (
          <li key={item} className="text-[11px] leading-relaxed text-text-secondary">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
