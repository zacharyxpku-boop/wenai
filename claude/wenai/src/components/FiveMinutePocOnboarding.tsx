'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { buildBrandIqProfile } from '@/lib/brand-iq';
import { buildBrandKnowledgeBrief, getCategoryGuardrail, type EcommerceCategoryKey } from '@/lib/ecommerce-guardrails';
import { evaluatePocLaunchCheck } from '@/lib/poc-launch-check';
import { buildPocReportRoute } from '@/lib/standard-pack-routing';

const CATEGORY_OPTIONS: Array<{ key: EcommerceCategoryKey; label: string }> = [
  { key: 'home', label: '家居' },
  { key: 'auto', label: '汽配' },
  { key: 'digital', label: '数码' },
  { key: 'beauty', label: '美妆' },
  { key: 'apparel', label: '服饰' },
  { key: 'supplement', label: '健康' },
  { key: 'mixed', label: '混合' },
];

export default function FiveMinutePocOnboarding() {
  const [category, setCategory] = useState<EcommerceCategoryKey>('home');
  const [skuInput, setSkuInput] = useState('10 个家居收纳 SKU：抽屉分隔盒、食品密封盒、橱柜置物架。目标平台：Shopify + TikTok Shop。');
  const [platforms, setPlatforms] = useState('Shopify + TikTok Shop');
  const [brandVoice, setBrandVoice] = useState('干净、可信、不夸张，像专业买手在解释商品。');
  const [forbiddenWords, setForbiddenWords] = useState('最强、治愈、保证、100%有效、永久');
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
    owner: ownerReady ? '客户已指定复核人' : '',
  }), [brandVoice, category, forbiddenWords, ownerReady, platforms]);
  const brandIq = useMemo(() => buildBrandIqProfile({
    category,
    brandName: 'POC 客户品牌',
    brandVoice,
    forbiddenWords,
    platforms,
    owner: ownerReady ? '客户已指定复核人' : '',
    benchmarkLinks: benchmarkReady ? '客户已提供参考内容或竞品链接' : '',
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
            5 分钟 POC 路径
          </div>
          <h2 className="text-balance font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary md:text-3xl">
            选类目 → 填 SKU → 出标准包 → 出报告 → 提交 POC
          </h2>
          <p className="mt-2 text-pretty text-[13px] leading-relaxed text-text-secondary">
            客户不需要理解 prompt 或 SOP。只要选择类目、粘贴 SKU、补充品牌规则，就能拿到标准交付包和可做判断的 POC 报告。
          </p>
        </div>
        <div className="min-w-[150px] text-right">
          <div className="font-mono text-3xl font-bold tabular-nums text-accent">{readiness.score}</div>
          <div className="text-[10px] font-mono text-text-tertiary">启动分</div>
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

          <Field label="SKU 或批次说明">
            <textarea
              value={skuInput}
              onChange={event => setSkuInput(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-md border border-border-default bg-bg-surface px-3 py-2 text-[13px] text-text-primary"
            />
          </Field>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="目标平台">
              <input
                value={platforms}
                onChange={event => setPlatforms(event.target.value)}
                className="w-full rounded-md border border-border-default bg-bg-surface px-3 py-2 text-[13px] text-text-primary"
              />
            </Field>
            <Field label="品牌语气">
              <input
                value={brandVoice}
                onChange={event => setBrandVoice(event.target.value)}
                className="w-full rounded-md border border-border-default bg-bg-surface px-3 py-2 text-[13px] text-text-primary"
              />
            </Field>
          </div>

          <Field label="禁用词 / 高风险宣称" className="mt-3">
            <input
              value={forbiddenWords}
              onChange={event => setForbiddenWords(event.target.value)}
              className="w-full rounded-md border border-border-default bg-bg-surface px-3 py-2 text-[13px] text-text-primary"
            />
          </Field>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Toggle label="已有参考竞品 / 内容样例" checked={benchmarkReady} onChange={setBenchmarkReady} />
            <Toggle label="已明确最终验收人" checked={ownerReady} onChange={setOwnerReady} />
            <Toggle label="已明确验收标准" checked={acceptanceReady} onChange={setAcceptanceReady} />
          </div>
        </div>

        <div className="rounded-md border border-border-subtle bg-bg-root/35 p-4">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-accent">
                类目规则
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
            <Metric label="复核通过率" value={`${guardrail.acceptanceThresholds.reviewPassRate}%`} />
            <Metric label="参考覆盖率" value={`${guardrail.acceptanceThresholds.benchmarkCoverage}%`} />
            <Metric label="风险上限" value={String(guardrail.acceptanceThresholds.maxRiskCount)} />
          </div>

          <div className="mt-3 rounded-md border border-accent/30 bg-accent/5 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="text-[10px] font-mono text-accent">品牌规则完整度</div>
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
                还需补齐：{brandIq.risks.join(' / ')}
              </div>
            )}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <ListBlock title="必须补齐的证据" items={guardrail.requiredProof} />
            <ListBlock title="禁用 / 高风险表达" items={[...guardrail.forbiddenClaims, ...forbiddenWords.split(/[,;\n]/).map(item => item.trim()).filter(Boolean)].slice(0, 7)} />
          </div>

          <div className="mt-3 rounded-md border border-border-subtle bg-bg-surface p-3">
            <div className="mb-1 text-[10px] font-mono text-text-tertiary">下一步动作</div>
            <p className="text-pretty text-[12px] leading-relaxed text-text-primary">{readiness.nextStep}</p>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              href={readiness.standardPackHref}
              className="inline-flex min-h-[40px] items-center justify-center rounded-md bg-accent px-4 py-2 text-[12px] font-semibold text-bg-root hover:bg-accent-hover"
            >
              生成标准包
            </Link>
            <Link
              href={reportHref}
              className="inline-flex min-h-[40px] items-center justify-center rounded-md border border-border-default px-4 py-2 text-[12px] font-semibold text-text-primary hover:border-accent hover:text-accent"
            >
              生成报告
            </Link>
            <Link
              href="/inquire?from=five-minute-onboarding&skuCount=10"
              className="inline-flex min-h-[40px] items-center justify-center rounded-md border border-accent/40 px-4 py-2 text-[12px] font-mono text-accent hover:bg-accent/10"
            >
              提交 POC
            </Link>
            <button
              type="button"
              onClick={copyBrandBrief}
              className="min-h-[40px] rounded-md border border-border-default px-4 py-2 text-[12px] font-mono text-text-primary hover:border-accent/40"
            >
              {copied ? '品牌规则已复制' : '复制品牌规则'}
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
      <div className="mb-1 text-[9px] font-mono text-text-tertiary">{label}</div>
      <div className="text-[14px] font-semibold text-text-primary tabular-nums">{value}</div>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface p-3">
      <div className="mb-2 text-[10px] font-mono text-accent">{title}</div>
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
