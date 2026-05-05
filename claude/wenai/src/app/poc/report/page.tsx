import type { Metadata } from 'next';
import TopNav from '@/components/marketing/TopNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { Container, PrimaryButton, Section, SecondaryButton } from '@/components/marketing/Container';
import PocReportGenerator from '@/components/PocReportGenerator';
import {
  getPocBenchmarkLane,
  POC_BENCHMARK_LANES,
  POC_DEMO_SCENARIOS,
  POC_SCORE_RUBRIC,
  type PocReportInput,
} from '@/lib/poc-report-evaluator';
import { POC_REPORT_STANDARD_PACK_ROUTE } from '@/lib/standard-pack-routing';

export const metadata: Metadata = {
  title: 'POC Proposal Workspace | wenai',
  description:
    'Turn a 10 SKU ecommerce POC into an acceptance report, boss brief, buyer follow-up, sales pack, and close plan.',
};

const WORKSPACE_STEPS = [
  ['01', 'Advisor', 'Pick goal, category, SKU scope, material state, benchmark strength, and risk level.'],
  ['02', 'Acceptance', 'Score delivery coverage, review pass rate, missing assets, rework, and content-test readiness.'],
  ['03', 'Commercial motion', 'Translate the POC into close-now, paid-expansion, repair-sprint, or hold.'],
  ['04', 'Sales pack', 'Copy the boss brief, buyer follow-up, proposal checklist, and close plan.'],
] as const;

const COMPETITOR_PATTERNS = [
  ['Catalog AI', 'Bulk content systems focus on import, brand voice, generation, and export.'],
  ['Feed ops', 'Feed platforms emphasize channel quality, missing data, validation, and operator follow-up.'],
  ['Creative testing', 'Creative tools package hooks, UGC directions, asset angles, and test plans.'],
  ['wenai layer', 'wenai connects those outputs to POC acceptance, contract motion, and sales follow-up.'],
] as const;

const OUTPUTS = [
  ['Acceptance report', 'Decision-ready scoring for the POC delivery.'],
  ['Boss brief', 'Short read-only summary for decision makers.'],
  ['Buyer follow-up', 'A direct message sales can send after the review.'],
  ['Sales pack', 'One combined packet with brief, proof, risk, checklist, and close plan.'],
  ['Recap standard pack', 'A reusable SOP package for the next delivery batch.'],
] as const;

const SECTION_JUMPS = [
  ['starter', 'Start with a benchmark-backed demo lane'],
  ['workspace', 'Open the live proposal workspace'],
  ['library', 'Compare the four benchmark lanes'],
  ['rubric', 'Review the visible scoring rubric'],
  ['outputs', 'See the customer-facing deliverables'],
] as const;

function buildWorkspaceHref(input: PocReportInput) {
  const params = new URLSearchParams();
  if (input.category) params.set('category', input.category);
  if (input.benchmarkPreset) params.set('benchmarkPreset', input.benchmarkPreset);
  params.set('skuPlanned', String(input.skuPlanned));
  params.set('skuDelivered', String(input.skuDelivered));
  params.set('finalReviewPassRate', String(input.finalReviewPassRate));
  params.set('benchmarkCoverage', String(input.benchmarkCoverage));
  params.set('riskCount', String(input.riskCount));
  params.set('missingAssetCount', String(input.missingAssetCount));
  params.set('reworkCount', String(input.reworkCount));
  params.set('contentTestReady', input.contentTestReady ? '1' : '0');
  params.set('ownerReady', input.ownerReady ? '1' : '0');
  params.set('contractIntent', input.contractIntent ? '1' : '0');
  return `/poc/report?${params.toString()}`;
}

const STARTER_RECIPES = POC_DEMO_SCENARIOS.map(item => ({
  key: item.key,
  label: item.label,
  segment: item.segment,
  note: item.note,
  href: buildWorkspaceHref(item.input),
  lane: getPocBenchmarkLane(item.input.benchmarkPreset),
}));

export default function PocReportPage() {
  return (
    <div className="min-h-screen bg-bg-root text-text-primary">
      <TopNav />
      <main>
        <Section spacing="loose">
          <Container>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
              <div>
                <div className="mb-4 text-[10px] font-mono uppercase tracking-[0.22em] text-accent">
                  Proposal Workspace
                </div>
                <h1 className="max-w-3xl font-[family-name:var(--font-outfit)] text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                  Turn a 10 SKU POC into a contract-ready sales packet.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
                  This page is the commercial handoff layer for wenai. It converts delivery evidence into an
                  acceptance report, boss brief, buyer follow-up, proposal checklist, sales pack, and close plan.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <PrimaryButton href="/inquire?from=poc-report" size="lg">
                    Submit POC request
                  </PrimaryButton>
                  <SecondaryButton href={POC_REPORT_STANDARD_PACK_ROUTE} size="lg">
                    Generate recap pack
                  </SecondaryButton>
                  <SecondaryButton href="/poc" size="lg">
                    View POC standard
                  </SecondaryButton>
                </div>
              </div>

              <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
                <div className="mb-3 flex items-center justify-between gap-3 border-b border-border-subtle pb-3">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-accent">Workspace shape</div>
                    <div className="mt-1 text-[14px] font-semibold text-text-primary">From POC evidence to sales action</div>
                  </div>
                  <div className="rounded border border-accent/35 px-2 py-1 text-[10px] font-mono text-accent">
                    customer-ready
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {WORKSPACE_STEPS.map(([num, title, body]) => (
                    <div key={num} className="rounded-md border border-border-subtle bg-bg-root/35 p-3">
                      <div className="mb-2 text-[10px] font-mono text-accent">{num}</div>
                      <div className="text-[13px] font-semibold text-text-primary">{title}</div>
                      <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="rounded-lg border border-border-subtle bg-bg-surface/45 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-accent">Use this page</div>
                  <div className="mt-1 text-[14px] font-semibold text-text-primary">Move from lane choice to decision logic without leaving the workspace.</div>
                </div>
                <div className="rounded-md border border-accent/30 bg-accent/5 px-2 py-1 text-[10px] font-mono text-accent">
                  anchor map
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
                {SECTION_JUMPS.map(([id, label], index) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="rounded-md border border-border-subtle bg-bg-root/35 p-3 transition-colors hover:border-accent/40"
                  >
                    <div className="text-[10px] font-mono text-accent">{String(index + 1).padStart(2, '0')}</div>
                    <div className="mt-1 text-pretty text-[11px] leading-relaxed text-text-secondary">{label}</div>
                  </a>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        <Section id="starter" className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">
                  Fast Start
                </div>
                <h2 className="text-balance font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary md:text-3xl">
                  Choose the closest starting lane and open the workspace with defaults.
                </h2>
                <p className="mt-2 max-w-3xl text-pretty text-[13px] leading-relaxed text-text-secondary">
                  Customers do not need real production data to understand the flow. These benchmark-backed starter cards
                  preload realistic POC conditions so they can see which lane closes, expands, repairs, or blocks.
                </p>
              </div>
              <div className="rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-[11px] font-mono text-accent">
                guided onboarding / lane defaults / demo-ready
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
              {STARTER_RECIPES.map(item => (
                <article key={item.key} className="rounded-md border border-border-subtle bg-bg-surface/45 p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-accent">{item.segment}</div>
                    <div className="text-[10px] font-mono text-text-tertiary">{item.lane.label}</div>
                  </div>
                  <h3 className="text-balance text-[15px] font-semibold text-text-primary">{item.label}</h3>
                  <p className="mt-2 text-pretty text-[11px] leading-relaxed text-text-secondary">{item.note}</p>
                  <div className="mt-3 rounded-md border border-border-subtle bg-bg-root/35 p-3">
                    <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Why this lane</div>
                    <p className="text-pretty text-[11px] leading-relaxed text-text-secondary">{item.lane.customerQuestion}</p>
                  </div>
                  <a
                    href={item.href}
                    className="mt-3 inline-flex min-h-[40px] w-full items-center justify-center rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-[11px] font-mono text-accent transition-colors hover:bg-accent/15"
                  >
                    Open this starter
                  </a>
                </article>
              ))}
            </div>
          </Container>
        </Section>

        <Section id="workspace" className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">
                  Live Workspace
                </div>
                <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary md:text-3xl">
                  Generate the proposal pack from POC signals
                </h2>
                <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-text-secondary">
                  Start with the advisor if the customer has no hard metrics yet, or edit the metrics directly when a
                  delivery recap already exists.
                </p>
              </div>
              <div className="rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-[11px] font-mono text-accent">
                report / brief / follow-up / close plan
              </div>
            </div>
            <PocReportGenerator />
          </Container>
        </Section>

        <Section className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <div className="mb-3 text-[10px] font-mono uppercase tracking-wider text-accent">
                  Competitive Framing
                </div>
                <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary md:text-3xl">
                  The moat is not one generator. It is the handoff system.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  Competitors often optimize a single step: catalog writing, feed quality, creative testing, or asset
                  production. wenai packages those patterns into one POC acceptance and sales motion layer for ecommerce teams.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {COMPETITOR_PATTERNS.map(([title, body]) => (
                  <div key={title} className="rounded-md border border-border-subtle bg-bg-surface/45 p-4">
                    <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">{title}</div>
                    <p className="text-[12px] leading-relaxed text-text-secondary">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        <Section id="library" className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">
                  Benchmark Library
                </div>
                <h2 className="text-balance font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary md:text-3xl">
                  Four repeatable lanes, each inspired by competitor patterns but closed by wenai.
                </h2>
                <p className="mt-2 max-w-3xl text-pretty text-[13px] leading-relaxed text-text-secondary">
                  This is where wenai stops looking like a general AI tool. Each lane defines the buyer question,
                  evidence shape, acceptance signals, and the handoff logic that competitors usually leave disconnected.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {POC_BENCHMARK_LANES.map(lane => (
                <article key={lane.id} className="rounded-md border border-border-subtle bg-bg-surface/45 p-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-accent">{lane.id}</div>
                      <h3 className="mt-1 text-[18px] font-semibold text-text-primary">{lane.label}</h3>
                    </div>
                    <div className="rounded-md border border-border-subtle bg-bg-root/35 px-2 py-1 text-[10px] font-mono text-text-tertiary">
                      customer-direct
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-md border border-border-subtle bg-bg-root/35 p-3">
                      <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Competitor pattern</div>
                      <p className="text-pretty text-[11px] leading-relaxed text-text-secondary">{lane.competitorPattern}</p>
                    </div>
                    <div className="rounded-md border border-border-subtle bg-bg-root/35 p-3">
                      <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Customer question</div>
                      <p className="text-pretty text-[11px] leading-relaxed text-text-secondary">{lane.customerQuestion}</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-md border border-accent/30 bg-accent/5 p-3">
                    <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-accent">Wenai moat</div>
                    <p className="text-pretty text-[11px] leading-relaxed text-text-primary">{lane.wenaiMoat}</p>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-md border border-border-subtle bg-bg-root/35 p-3">
                      <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Proof to collect</div>
                      <ul className="space-y-1.5">
                        {lane.proofToCollect.map(item => (
                          <li key={item} className="text-[11px] leading-relaxed text-text-secondary">{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-md border border-border-subtle bg-bg-root/35 p-3">
                      <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Acceptance signals</div>
                      <ul className="space-y-1.5">
                        {lane.acceptanceSignals.map(item => (
                          <li key={item} className="text-[11px] leading-relaxed text-text-secondary">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </Section>

        <Section id="rubric" className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">
                  Score Rubric
                </div>
                <h2 className="text-balance font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary md:text-3xl">
                  The POC score is explainable, auditable, and hard to game.
                </h2>
                <p className="mt-2 max-w-3xl text-pretty text-[13px] leading-relaxed text-text-secondary">
                  A mature buyer needs to know why wenai recommends close, expansion, repair, or hold. This rubric makes the scoring logic visible before the customer commits.
                </p>
              </div>
              <div className="rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-[11px] font-mono text-accent">
                transparent scoring / buyer trust / sales control
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-lg border border-border-subtle bg-bg-surface">
                <div className="border-b border-border-subtle p-4">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-accent">Score weights</div>
                </div>
                <div className="grid grid-cols-1 divide-y divide-border-subtle md:grid-cols-2 md:divide-x md:divide-y-0">
                  <div>
                    {POC_SCORE_RUBRIC.scoreWeights.map(item => (
                      <div key={item.label} className="border-b border-border-subtle p-4 last:border-b-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-[13px] font-semibold text-text-primary">{item.label}</div>
                          <div className="font-mono text-[12px] text-accent">{item.weight}</div>
                        </div>
                        <p className="mt-1 text-pretty text-[11px] leading-relaxed text-text-secondary">{item.note}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    {POC_SCORE_RUBRIC.penalties.map(item => (
                      <div key={item.label} className="border-b border-border-subtle p-4 last:border-b-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-[13px] font-semibold text-text-primary">{item.label}</div>
                          <div className="font-mono text-[12px] text-error">{item.maxPenalty}</div>
                        </div>
                        <p className="mt-1 text-pretty text-[11px] leading-relaxed text-text-secondary">{item.note}</p>
                      </div>
                    ))}
                    <div className="p-4">
                      <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Required inputs</div>
                      <div className="flex flex-wrap gap-2">
                        {POC_SCORE_RUBRIC.requiredInputs.map(item => (
                          <span key={item} className="rounded border border-border-subtle bg-bg-root/45 px-2 py-1 text-[10px] font-mono text-text-secondary">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border-subtle bg-bg-surface">
                <div className="border-b border-border-subtle p-4">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-accent">Outcome matrix</div>
                </div>
                <div className="divide-y divide-border-subtle">
                  {POC_SCORE_RUBRIC.outcomeBands.map(item => (
                    <div key={item.label} className="p-4">
                      <div className="text-[13px] font-semibold text-text-primary">{item.label}</div>
                      <p className="mt-1 text-[11px] leading-relaxed text-text-tertiary">{item.condition}</p>
                      <p className="mt-2 text-pretty text-[11px] leading-relaxed text-text-secondary">{item.commercialMeaning}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section id="outputs" className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="rounded-lg border border-border-subtle bg-bg-surface">
              <div className="border-b border-border-subtle p-5">
                <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">Output Contract</div>
                <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary">
                  What the customer can use immediately
                </h2>
              </div>
              <div className="grid grid-cols-1 divide-y divide-border-subtle md:grid-cols-5 md:divide-x md:divide-y-0">
                {OUTPUTS.map(([title, body]) => (
                  <div key={title} className="p-4">
                    <div className="text-[13px] font-semibold text-text-primary">{title}</div>
                    <p className="mt-2 text-[11px] leading-relaxed text-text-secondary">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <MarketingFooter />
    </div>
  );
}
