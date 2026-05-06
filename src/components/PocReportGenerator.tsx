'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  buildPocReportInputFromAdvisor,
  DEFAULT_POC_REPORT_INPUT,
  POC_BENCHMARK_LANES,
  POC_BENCHMARK_PRESETS,
  POC_DEMO_SCENARIOS,
  evaluatePocReport,
  getPocAdvisorPreset,
  recommendPocBenchmarkPreset,
  type PocAdvisorAnswers,
  type PocBenchmarkPresetId,
  type PocReportInput,
} from '@/lib/poc-report-evaluator';
import {
  buildPocReportRoute,
  buildPocReportStandardPackRoute,
} from '@/lib/standard-pack-routing';

const QUICK_START_CATEGORIES = ['home', 'digital', 'beauty', 'apparel', 'supplement'] as const;
type WorkspaceMode = 'guided' | 'expert';
type OutputTabKey = 'report' | 'handoff' | 'board' | 'followup' | 'sales';

function readNumber(params: URLSearchParams, key: keyof PocReportInput, min: number, max: number): number {
  const raw = params.get(key);
  const fallback = DEFAULT_POC_REPORT_INPUT[key] as number;
  const value = raw === null ? fallback : Number.parseInt(raw, 10);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function readBoolean(params: URLSearchParams, key: keyof PocReportInput): boolean {
  const raw = params.get(key);
  if (raw === '1' || raw === 'true') return true;
  if (raw === '0' || raw === 'false') return false;
  return DEFAULT_POC_REPORT_INPUT[key] as boolean;
}

function buildInitialAdvisorAnswers(input: PocReportInput): PocAdvisorAnswers {
  const goal: PocAdvisorAnswers['goal'] =
    input.benchmarkPreset === 'feed-ops'
      ? 'fix-feed'
      : input.benchmarkPreset === 'creative-test'
        ? 'test-creative'
        : input.benchmarkPreset === 'market-qa' || input.riskCount >= 2
          ? 'reduce-risk'
          : 'launch-catalog';
  const skuScope: PocAdvisorAnswers['skuScope'] =
    input.skuPlanned >= 15 ? 'large' : input.skuPlanned >= 8 ? 'poc' : 'small';
  const materialState: PocAdvisorAnswers['materialState'] =
    input.missingAssetCount >= 2
      ? 'missing'
      : input.missingAssetCount === 1 || input.skuDelivered < input.skuPlanned
        ? 'partial'
        : 'ready';
  const benchmarkState: PocAdvisorAnswers['benchmarkState'] =
    input.benchmarkCoverage >= 80 ? 'strong' : input.benchmarkCoverage >= 60 ? 'some' : 'none';
  const riskLevel: PocAdvisorAnswers['riskLevel'] =
    input.riskCount >= 2 ? 'high' : input.riskCount === 1 ? 'medium' : 'low';

  return {
    goal,
    category: input.category || 'mixed',
    skuScope,
    materialState,
    benchmarkState,
    riskLevel,
    contractIntent: input.contractIntent,
  };
}

export function buildInitialPocReportInput(params: URLSearchParams): PocReportInput {
  return {
    category: params.get('category') || '',
    benchmarkPreset: params.get('benchmarkPreset') as PocBenchmarkPresetId || '',
    skuPlanned: readNumber(params, 'skuPlanned', 0, 999),
    skuDelivered: readNumber(params, 'skuDelivered', 0, 999),
    finalReviewPassRate: readNumber(params, 'finalReviewPassRate', 0, 100),
    benchmarkCoverage: readNumber(params, 'benchmarkCoverage', 0, 100),
    riskCount: readNumber(params, 'riskCount', 0, 99),
    missingAssetCount: readNumber(params, 'missingAssetCount', 0, 99),
    reworkCount: readNumber(params, 'reworkCount', 0, 99),
    contentTestReady: readBoolean(params, 'contentTestReady'),
    ownerReady: readBoolean(params, 'ownerReady'),
    contractIntent: readBoolean(params, 'contractIntent'),
  };
}

export default function PocReportGenerator() {
  const params = useSearchParams();
  const [input, setInput] = useState<PocReportInput>(() => buildInitialPocReportInput(params));
  const [advisorAnswers, setAdvisorAnswers] = useState<PocAdvisorAnswers>(() => buildInitialAdvisorAnswers(buildInitialPocReportInput(params)));
  const [copied, setCopied] = useState(false);
  const [copiedHandoff, setCopiedHandoff] = useState(false);
  const [copiedBoard, setCopiedBoard] = useState(false);
  const [copiedBuyerFollowup, setCopiedBuyerFollowup] = useState(false);
  const [copiedSalesPack, setCopiedSalesPack] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('guided');
  const [activeOutput, setActiveOutput] = useState<OutputTabKey>('report');
  const [shareUrl, setShareUrl] = useState('');
  const [sharing, setSharing] = useState(false);
  const [crmSaving, setCrmSaving] = useState(false);
  const [crmSaved, setCrmSaved] = useState(false);
  const [error, setError] = useState('');
  const source = params.get('from') || 'poc-report-generator';
  const inquiryId = params.get('inquiryId') || '';
  const categoryLabel = params.get('category') || 'mixed categories';
  const result = useMemo(() => evaluatePocReport(input), [input]);
  const recommendation = useMemo(() => recommendPocBenchmarkPreset(input), [input]);
  const advisorResult = useMemo(() => buildPocReportInputFromAdvisor(advisorAnswers), [advisorAnswers]);
  const quickStartPreset = useMemo(() => getPocAdvisorPreset(advisorAnswers.category), [advisorAnswers.category]);
  const activeBenchmarkLane = POC_BENCHMARK_LANES.find(item => item.id === (input.benchmarkPreset || recommendation.preset.id)) || POC_BENCHMARK_LANES[0];
  const outputTabs = useMemo(
    () => [
      { key: 'report' as const, label: 'Report', content: result.reportMarkdown, heightClass: 'max-h-[320px]' },
      { key: 'handoff' as const, label: 'Handoff', content: result.handoffMarkdown, heightClass: 'max-h-[320px]' },
      { key: 'board' as const, label: 'Board brief', content: result.commercial.boardMarkdown, heightClass: 'max-h-[280px]' },
      { key: 'followup' as const, label: 'Buyer follow-up', content: result.commercial.buyerFollowupMarkdown, heightClass: 'max-h-[260px]' },
      { key: 'sales' as const, label: 'Sales pack', content: result.commercial.salesPackMarkdown, heightClass: 'max-h-[320px]' },
    ],
    [result],
  );
  const activeOutputTab = outputTabs.find(tab => tab.key === activeOutput) || outputTabs[0];
  const reportRoute = useMemo(() => buildPocReportRoute({
    ...input,
    source,
    categoryLabel: input.category || categoryLabel,
    benchmarkPreset: input.benchmarkPreset,
  }), [categoryLabel, input, source]);
  const standardPackRoute = useMemo(() => buildPocReportStandardPackRoute({
    ...input,
    decisionLabel: result.label,
    nextStep: result.nextStep,
    source,
    categoryLabel: input.category || categoryLabel,
  }), [categoryLabel, input, result.label, result.nextStep, source]);

  const copyReport = async () => {
    await navigator.clipboard.writeText(result.reportMarkdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const copyHandoff = async () => {
    await navigator.clipboard.writeText(result.handoffMarkdown);
    setCopiedHandoff(true);
    window.setTimeout(() => setCopiedHandoff(false), 1400);
  };

  const copyBoard = async () => {
    await navigator.clipboard.writeText(result.commercial.boardMarkdown);
    setCopiedBoard(true);
    window.setTimeout(() => setCopiedBoard(false), 1400);
  };

  const copyBuyerFollowup = async () => {
    await navigator.clipboard.writeText(result.commercial.buyerFollowupMarkdown);
    setCopiedBuyerFollowup(true);
    window.setTimeout(() => setCopiedBuyerFollowup(false), 1400);
  };

  const copySalesPack = async () => {
    await navigator.clipboard.writeText(result.commercial.salesPackMarkdown);
    setCopiedSalesPack(true);
    window.setTimeout(() => setCopiedSalesPack(false), 1400);
  };

  const copyReportLink = async () => {
    const origin = typeof window === 'undefined' ? '' : window.location.origin;
    await navigator.clipboard.writeText(`${origin}${reportRoute}`);
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 1400);
  };

  const createBossShare = async () => {
    setSharing(true);
    setError('');
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: 'poc-report',
          source: 'poc-report',
          title: `POC acceptance recap · ${result.label}`,
          content: `${result.reportMarkdown}\n\n${result.commercial.boardMarkdown}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      const url = `${window.location.origin}${data.url}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create share link');
    } finally {
      setSharing(false);
    }
  };

  const saveToCrm = async () => {
    if (!inquiryId) return;
    setCrmSaving(true);
    setCrmSaved(false);
    setError('');
    try {
      const due = new Date(Date.now() + result.sla.dueDays * 86400000).toISOString().slice(0, 10);
      const reviewDecision =
        result.decision === 'push-contract'
          ? 'push_contract'
          : result.decision === 'expand-sku'
            ? 'expand_sku'
            : result.decision === 'iterate'
              ? 'iterate_poc'
              : '';
      const status =
        result.contractStatus === 'ready'
          ? 'contract'
          : result.contractStatus === 'warm'
            ? 'reviewed'
            : 'needs_info';
      const res = await fetch('/api/sales/inquiry', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: inquiryId,
          status,
          acceptanceScore: `${result.acceptanceScore}/100`,
          reviewDecision,
          reviewCompletedAt: new Date().toISOString().slice(0, 10),
          reviewNotes: result.reportMarkdown.slice(0, 1200),
          contractNextStep: result.nextStep.slice(0, 240),
          nextAction: result.sla.nextAction.slice(0, 240),
          nextActionDue: due,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setCrmSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save CRM record');
    } finally {
      setCrmSaving(false);
    }
  };

  return (
    <section className="rounded-lg border border-accent/30 bg-accent/5 p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">
            Report Generator
          </div>
          <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary md:text-3xl">
            POC acceptance report
          </h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-text-secondary">
            Turn delivery coverage, review quality, risks, missing assets, rework and contract intent into a decision-ready recap.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="inline-flex rounded-md border border-border-default bg-bg-root/35 p-1">
            {(['guided', 'expert'] as const).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setWorkspaceMode(mode)}
                className={`rounded px-3 py-1.5 text-[11px] font-mono capitalize transition-colors ${
                  workspaceMode === mode ? 'bg-accent text-bg-root' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="min-w-[148px] text-right">
            <div className="font-mono text-3xl font-bold tabular-nums text-accent">{result.acceptanceScore}</div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">acceptance</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-md border border-border-subtle bg-bg-root/35 p-4">
          <div className="border-b border-border-subtle pb-4">
            <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-accent">POC Advisor</div>
            <div className="text-[16px] font-semibold text-text-primary">Start from a guided launch plan</div>
            <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
              Let the customer pick goal, SKU scope, material state, benchmark strength, and risk level. wenai translates that into a usable POC scorecard.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <SelectField
                label="Primary goal"
                value={advisorAnswers.goal}
                onChange={value => setAdvisorAnswers(prev => ({ ...prev, goal: value as PocAdvisorAnswers['goal'] }))}
                options={[
                  { value: 'launch-catalog', label: 'Launch catalog' },
                  { value: 'fix-feed', label: 'Fix feed / listing ops' },
                  { value: 'test-creative', label: 'Test creative angles' },
                  { value: 'reduce-risk', label: 'Reduce launch risk' },
                ]}
              />
              <SelectField
                label="Category"
                value={advisorAnswers.category}
                onChange={value => setAdvisorAnswers(prev => ({ ...prev, category: value }))}
                options={[
                  { value: 'home', label: 'Home' },
                  { value: 'living', label: 'Living' },
                  { value: 'digital', label: 'Digital' },
                  { value: 'auto', label: 'Auto' },
                  { value: 'tool', label: 'Tool' },
                  { value: 'beauty', label: 'Beauty' },
                  { value: 'apparel', label: 'Apparel' },
                  { value: 'pet', label: 'Pet' },
                  { value: 'outdoor', label: 'Outdoor' },
                  { value: 'supplement', label: 'Supplement' },
                  { value: 'mixed', label: 'Mixed' },
                  { value: 'other', label: 'Other' },
                ]}
              />
              <SelectField
                label="SKU scope"
                value={advisorAnswers.skuScope}
                onChange={value => setAdvisorAnswers(prev => ({ ...prev, skuScope: value as PocAdvisorAnswers['skuScope'] }))}
                options={[
                  { value: 'small', label: '1-5 SKU' },
                  { value: 'poc', label: '10 SKU POC' },
                  { value: 'large', label: '20+ SKU' },
                ]}
              />
              <SelectField
                label="Material state"
                value={advisorAnswers.materialState}
                onChange={value => setAdvisorAnswers(prev => ({ ...prev, materialState: value as PocAdvisorAnswers['materialState'] }))}
                options={[
                  { value: 'ready', label: 'Ready' },
                  { value: 'partial', label: 'Partial' },
                  { value: 'missing', label: 'Missing' },
                ]}
              />
              <SelectField
                label="Benchmark state"
                value={advisorAnswers.benchmarkState}
                onChange={value => setAdvisorAnswers(prev => ({ ...prev, benchmarkState: value as PocAdvisorAnswers['benchmarkState'] }))}
                options={[
                  { value: 'strong', label: 'Strong' },
                  { value: 'some', label: 'Some' },
                  { value: 'none', label: 'None' },
                ]}
              />
              <SelectField
                label="Risk level"
                value={advisorAnswers.riskLevel}
                onChange={value => setAdvisorAnswers(prev => ({ ...prev, riskLevel: value as PocAdvisorAnswers['riskLevel'] }))}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                ]}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CheckBox
                checked={advisorAnswers.contractIntent}
                label="Customer wants contract path"
                onChange={value => setAdvisorAnswers(prev => ({ ...prev, contractIntent: value }))}
              />
              <button
                type="button"
                onClick={() => setInput(advisorResult.input)}
                className="rounded-md bg-accent px-4 py-2 text-[11px] font-mono text-bg-root hover:bg-accent-hover"
              >
                Apply advisor plan
              </button>
            </div>

            <div className="mt-3 rounded-md border border-border-subtle bg-bg-root/35 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-accent">Industry quick-start</div>
                <span className="text-[10px] font-mono text-text-tertiary">{quickStartPreset.label}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-text-secondary">{quickStartPreset.rationale}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {QUICK_START_CATEGORIES.map(category => {
                  const preset = getPocAdvisorPreset(category);
                  const active = advisorAnswers.category === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setAdvisorAnswers(preset.answers);
                        setInput(buildPocReportInputFromAdvisor(preset.answers).input);
                      }}
                      className={`rounded-md border px-3 py-1.5 text-[11px] font-mono transition-colors ${
                        active
                          ? 'border-accent/45 bg-accent/10 text-accent'
                          : 'border-border-default bg-bg-surface text-text-primary hover:border-accent/40'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 rounded-md border border-border-subtle bg-bg-root/35 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-accent">Benchmark lanes</div>
                <span className="text-[10px] font-mono text-text-tertiary">{activeBenchmarkLane.label}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-text-secondary">{activeBenchmarkLane.customerQuestion}</p>
              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                {POC_BENCHMARK_LANES.map(lane => {
                  const active = activeBenchmarkLane.id === lane.id;
                  return (
                    <button
                      key={lane.id}
                      type="button"
                      onClick={() => setInput(prev => ({ ...prev, benchmarkPreset: lane.id }))}
                      className={`rounded-md border p-3 text-left transition-colors ${
                        active
                          ? 'border-accent/45 bg-accent/10'
                          : 'border-border-default bg-bg-surface/35 hover:border-accent/40'
                      }`}
                    >
                      <div className="text-[12px] font-semibold text-text-primary">{lane.label}</div>
                      <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">{lane.competitorPattern}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 rounded-md border border-accent/30 bg-accent/5 p-3">
                <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-accent">Wenai moat for this lane</div>
                <p className="text-[11px] leading-relaxed text-text-primary">{activeBenchmarkLane.wenaiMoat}</p>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <MiniList title="Proof to collect" items={activeBenchmarkLane.proofToCollect} />
                  <MiniList title="Acceptance signals" items={activeBenchmarkLane.acceptanceSignals} />
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-md border border-border-subtle bg-bg-root/35 p-3">
              <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">Demo scenarios</div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {POC_DEMO_SCENARIOS.map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setInput(item.input);
                      setAdvisorAnswers(buildInitialAdvisorAnswers(item.input));
                      setWorkspaceMode('guided');
                    }}
                    className="rounded-md border border-border-default bg-bg-surface/35 p-3 text-left transition-colors hover:border-accent/40"
                  >
                    <div className="text-[10px] font-mono uppercase text-accent">{item.segment}</div>
                    <div className="mt-1 text-[13px] font-semibold text-text-primary">{item.label}</div>
                    <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">{item.note}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-md border border-accent/30 bg-accent/5 p-3">
              <div className="text-[12px] font-semibold text-text-primary">{advisorResult.summary}</div>
              <ul className="mt-2 space-y-1">
                {advisorResult.assumptions.map(item => (
                  <li key={item} className="text-[11px] leading-relaxed text-text-secondary">{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {workspaceMode === 'expert' ? (
            <>
              <div className="mt-4 rounded-md border border-border-subtle bg-bg-surface/35 p-3">
                <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">Expert metric editor</div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <NumberField label="Planned SKU" value={input.skuPlanned} onChange={value => setInput(prev => ({ ...prev, skuPlanned: value }))} />
                  <NumberField label="Delivered SKU" value={input.skuDelivered} onChange={value => setInput(prev => ({ ...prev, skuDelivered: value }))} />
                  <NumberField label="Final review pass %" value={input.finalReviewPassRate} onChange={value => setInput(prev => ({ ...prev, finalReviewPassRate: value }))} />
                  <NumberField label="Benchmark coverage %" value={input.benchmarkCoverage} onChange={value => setInput(prev => ({ ...prev, benchmarkCoverage: value }))} />
                  <NumberField label="Risk count" value={input.riskCount} onChange={value => setInput(prev => ({ ...prev, riskCount: value }))} />
                  <NumberField label="Missing assets" value={input.missingAssetCount} onChange={value => setInput(prev => ({ ...prev, missingAssetCount: value }))} />
                  <NumberField label="Rework count" value={input.reworkCount} onChange={value => setInput(prev => ({ ...prev, reworkCount: value }))} />
                </div>
              </div>

              <div className="mt-3">
                <label className="mb-1 block text-[11px] font-mono text-text-secondary">Category threshold</label>
                <select
                  value={input.category || ''}
                  onChange={event => setInput(prev => ({ ...prev, category: event.target.value }))}
                  className="w-full rounded-md border border-border-default bg-bg-surface px-3 py-2 text-[13px]"
                >
                  <option value="">Generic</option>
                  <option value="home">Home</option>
                  <option value="living">Living</option>
                  <option value="digital">Digital</option>
                  <option value="auto">Auto</option>
                  <option value="tool">Tool</option>
                  <option value="beauty">Beauty</option>
                  <option value="apparel">Apparel</option>
                  <option value="pet">Pet</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="supplement">Supplement</option>
                  <option value="mixed">Mixed</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mt-3">
                <label className="mb-1 block text-[11px] font-mono text-text-secondary">Benchmark preset</label>
                <select
                  value={input.benchmarkPreset || ''}
                  onChange={event => setInput(prev => ({ ...prev, benchmarkPreset: event.target.value as PocBenchmarkPresetId }))}
                  className="w-full rounded-md border border-border-default bg-bg-surface px-3 py-2 text-[13px]"
                >
                  {Object.values(POC_BENCHMARK_PRESETS).map(preset => (
                    <option key={preset.id} value={preset.id}>{preset.label}</option>
                  ))}
                </select>
              </div>

              <div className="mt-3 rounded-md border border-accent/30 bg-accent/5 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-accent">Recommended preset</div>
                  <span className="text-[10px] font-mono text-text-tertiary">{recommendation.confidence}% fit</span>
                </div>
                <div className="text-[13px] font-semibold text-text-primary">{recommendation.preset.label}</div>
                <ul className="mt-2 space-y-1">
                  {recommendation.reasons.map(reason => (
                    <li key={reason} className="text-[11px] leading-relaxed text-text-secondary">{reason}</li>
                  ))}
                </ul>
                <div className="mt-2 text-[11px] leading-relaxed text-text-tertiary">{recommendation.nextInput}</div>
                <button
                  type="button"
                  onClick={() => setInput(prev => ({ ...prev, benchmarkPreset: recommendation.preset.id }))}
                  className="mt-3 rounded-md border border-accent/40 px-3 py-1.5 text-[11px] font-mono text-accent hover:bg-accent/10"
                >
                  Apply recommendation
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <CheckBox checked={input.contentTestReady} label="Content test ready" onChange={value => setInput(prev => ({ ...prev, contentTestReady: value }))} />
                <CheckBox checked={input.ownerReady} label="Review owner assigned" onChange={value => setInput(prev => ({ ...prev, ownerReady: value }))} />
                <CheckBox checked={input.contractIntent} label="Contract intent exists" onChange={value => setInput(prev => ({ ...prev, contractIntent: value }))} />
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-md border border-border-subtle bg-bg-surface/35 p-3">
              <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-accent">Guided mode</div>
              <p className="text-[12px] leading-relaxed text-text-secondary">
                Metrics are generated from the advisor and industry quick-start. Switch to Expert mode when you need to manually tune review pass rate, benchmark coverage, or risk counts.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-md border border-border-subtle bg-bg-root/35 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-accent">
                Decision output
              </div>
              <div className="text-[18px] font-semibold text-text-primary">{result.label}</div>
              <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">{result.nextStep}</p>
              <p className="mt-1 text-[11px] font-mono text-text-tertiary">
                Commercial: <span className="text-text-primary">{result.commercial.commercialScore}/100</span> / {result.commercial.label}
              </p>
              <p className="mt-2 text-[11px] font-mono text-text-tertiary">
                Contract status: <span className="text-text-primary">{result.contractStatus}</span> · SLA {result.sla.dueDays} day(s)
              </p>
            </div>
            <span className="rounded border border-accent/35 px-2 py-1 text-[10px] font-mono text-accent">
              {result.decision}
            </span>
          </div>

          <div className="mt-4 rounded-md border border-accent/30 bg-accent/5 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-accent">Action rail</div>
              <span className="text-[10px] font-mono text-text-tertiary">share / copy / handoff</span>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
              <ActionRailButton label={copied ? 'Report copied' : 'Copy report'} onClick={copyReport} tone="primary" />
              <ActionRailButton label={copiedHandoff ? 'Handoff copied' : 'Copy handoff memo'} onClick={copyHandoff} />
              <ActionRailButton label={copiedBoard ? 'Board brief copied' : 'Copy board brief'} onClick={copyBoard} />
              <ActionRailButton label={copiedBuyerFollowup ? 'Buyer follow-up copied' : 'Copy buyer follow-up'} onClick={copyBuyerFollowup} />
              <ActionRailButton label={copiedSalesPack ? 'Sales pack copied' : 'Copy sales pack'} onClick={copySalesPack} />
              <Link
                href={standardPackRoute}
                className="inline-flex min-h-[42px] items-center justify-center rounded-md border border-border-default bg-bg-surface/35 px-4 py-2 text-[12px] font-mono text-text-primary hover:border-accent/40"
              >
                Generate recap pack
              </Link>
              <ActionRailButton label={copiedLink ? 'Link copied' : 'Copy recap link'} onClick={copyReportLink} />
              <ActionRailButton
                label={sharing ? 'Sharing...' : 'Create boss page'}
                onClick={createBossShare}
                disabled={sharing}
              />
              {inquiryId ? (
                <ActionRailButton
                  label={crmSaving ? 'Saving...' : crmSaved ? 'Saved to CRM' : 'Save to CRM'}
                  onClick={saveToCrm}
                  disabled={crmSaving}
                />
              ) : (
                <Link
                  href={`/inquire?from=${encodeURIComponent(source)}`}
                  className="inline-flex min-h-[42px] items-center justify-center rounded-md border border-accent/40 bg-accent/10 px-4 py-2 text-[12px] font-mono text-accent hover:bg-accent/15"
                >
                  Submit POC request
                </Link>
              )}
            </div>
            {(shareUrl || error) && (
              <div className="mt-3 rounded-md border border-border-subtle bg-bg-surface/35 p-3 text-[11px] font-mono">
                {shareUrl && (
                  <a href={shareUrl} target="_blank" rel="noreferrer" className="break-all text-accent hover:underline">
                    {shareUrl}
                  </a>
                )}
                {error && <div className="text-error">{error}</div>}
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <ResultCard title="Strengths" items={result.strengths} fallback="No strong acceptance signal yet." tone="good" />
            <ResultCard title="Blockers" items={result.blockers} fallback="No critical blocker detected." tone="risk" />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <SnapshotMetric label="Acceptance" value={`${result.acceptanceScore}/100`} note={result.label} />
            <SnapshotMetric label="Commercial" value={`${result.commercial.commercialScore}/100`} note={result.commercial.label} />
            <SnapshotMetric label="SLA" value={`${result.sla.dueDays} day(s)`} note={result.sla.severity} />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">
              <div className="rounded-md border border-border-subtle bg-bg-surface/35 p-3">
                <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">SLA Next Action</div>
                <div className="text-[12px] leading-relaxed text-text-primary">{result.sla.nextAction}</div>
              </div>

              <div className="rounded-md border border-accent/30 bg-accent/5 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-accent">Commercial briefing</div>
                  <span className="text-[10px] font-mono text-text-tertiary">{result.commercial.priceSignal}</span>
                </div>
                <div className="text-[13px] font-semibold text-text-primary">{result.commercial.packageRecommendation}</div>
                <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">{result.commercial.ownerMessage}</p>
                <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <ResultCard title="Proof points" items={result.commercial.proofPoints} fallback="No strong proof point yet." tone="good" />
                  <ResultCard title="Conversion risks" items={result.commercial.conversionRisks} fallback="No major conversion risk detected." tone="risk" />
                </div>
                <div className="mt-3 rounded-md border border-border-subtle bg-bg-root/35 p-3">
                  <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Proposal checklist</div>
                  <ul className="space-y-1.5">
                    {result.commercial.proposalChecklist.map(item => (
                      <li key={item} className="text-[11px] leading-relaxed text-text-secondary">{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-3 rounded-md border border-border-subtle bg-bg-root/35 p-3">
                  <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Close plan</div>
                  <ul className="space-y-1.5">
                    {result.commercial.closePlan.map(item => (
                      <li key={`${item.day}-${item.action}`} className="text-[11px] leading-relaxed text-text-secondary">
                        <span className="text-text-primary">{item.day}</span> / {item.action} / {item.owner}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-md border border-border-subtle bg-bg-surface/35 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-accent">Category playbook</div>
                  <span className="text-[10px] font-mono text-text-tertiary">{result.playbook.label}</span>
                </div>
                <p className="text-[12px] leading-relaxed text-text-primary">{result.playbook.operatorLens}</p>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <ResultCard title="Benchmark signals" items={result.playbook.benchmarkSignals} fallback="No benchmark signal configured." tone="good" />
                  <ResultCard title="Risk checks" items={result.playbook.riskChecks} fallback="No risk check configured." tone="risk" />
                  <ResultCard title="Proposal angles" items={result.playbook.proposalAngles} fallback="No proposal angle configured." tone="next" />
                </div>
              </div>
            </div>

            <div className="space-y-3 xl:sticky xl:top-4 xl:self-start">
              <div className="rounded-md border border-border-subtle bg-bg-surface/35 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Detailed outputs</div>
                  <span className="text-[10px] font-mono text-text-tertiary">{activeOutputTab.label}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-text-secondary">
                  Long-form artifacts stay here for review, export, and handoff after the action rail has done the quick work.
                </p>
              </div>

              <div className="rounded-md border border-border-subtle bg-bg-surface/35 p-3">
                <div className="flex flex-wrap gap-2">
                  {outputTabs.map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveOutput(tab.key)}
                      className={`rounded-md border px-3 py-1.5 text-[11px] font-mono transition-colors ${
                        activeOutput === tab.key
                          ? 'border-accent/45 bg-accent/10 text-accent'
                          : 'border-border-default bg-bg-root/45 text-text-secondary hover:border-accent/40 hover:text-text-primary'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">{activeOutputTab.label}</div>
                  <pre className={`${activeOutputTab.heightClass} overflow-auto whitespace-pre-wrap rounded-md border border-border-subtle bg-bg-root/65 p-4 text-[11px] leading-relaxed text-text-tertiary`}>
                    {activeOutputTab.content}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ActionRailButton({
  label,
  onClick,
  tone = 'default',
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  tone?: 'primary' | 'default';
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-[42px] items-center justify-center rounded-md px-4 py-2 text-[12px] font-mono transition-colors disabled:opacity-50 ${
        tone === 'primary'
          ? 'bg-accent text-bg-root hover:bg-accent-hover'
          : 'border border-border-default bg-bg-surface/35 text-text-primary hover:border-accent/40'
      }`}
    >
      {label}
    </button>
  );
}

function SnapshotMetric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface/35 p-3">
      <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">{label}</div>
      <div className="text-[18px] font-semibold tabular-nums text-text-primary">{value}</div>
      <div className="mt-1 text-[11px] leading-relaxed text-text-secondary">{note}</div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-mono text-text-secondary">{label}</label>
      <input
        type="number"
        value={value}
        min={0}
        onChange={event => onChange(Number.parseInt(event.target.value || '0', 10) || 0)}
        className="w-full rounded-md border border-border-default bg-bg-surface px-3 py-2 text-[13px]"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-mono text-text-secondary">{label}</label>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full rounded-md border border-border-default bg-bg-surface px-3 py-2 text-[13px]"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
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

function ResultCard({
  title,
  items,
  fallback,
  tone,
}: {
  title: string;
  items: string[];
  fallback: string;
  tone: 'good' | 'risk' | 'next';
}) {
  const visible = items.length > 0 ? items : [fallback];
  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface/35 p-3">
      <div className={`mb-2 text-[10px] font-mono uppercase tracking-wider ${tone === 'good' ? 'text-success' : tone === 'risk' ? 'text-error' : 'text-accent'}`}>
        {title}
      </div>
      <ul className="space-y-1.5">
        {visible.map(item => (
          <li key={item} className="text-[11px] leading-relaxed text-text-secondary">{item}</li>
        ))}
      </ul>
    </div>
  );
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">{title}</div>
      <ul className="space-y-1">
        {items.map(item => (
          <li key={item} className="text-[11px] leading-relaxed text-text-secondary">{item}</li>
        ))}
      </ul>
    </div>
  );
}
