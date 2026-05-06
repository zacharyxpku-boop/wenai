import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Changelog | wenai',
  description: 'Major wenai product milestones and commercial readiness updates.',
};

const RELEASES = [
  {
    version: 'v0.90',
    date: '2026-05-05',
    phase: 'Commercial closeout',
    headline: 'POC delivery system, Brand IQ, CRM-lite, and executive reporting.',
    highlights: [
      '5-minute POC onboarding path tightened.',
      'Brand IQ and category guardrails added as product moat.',
      'Executive read-only share page and report motion hardened.',
      'CRM-lite commercial editor added for status, contract stage, quote, payment, owner, SLA, and next action.',
      'Marketing copy and public-facing pages cleaned for commercial presentation.',
    ],
  },
  {
    version: 'v0.80',
    date: '2026-05-04',
    phase: 'Standard packs',
    headline: 'Standard pack routes and launch pipeline handoff.',
    highlights: [
      'New listing flow connected to standard POC packages.',
      'Batch launch can generate review-ready standard pack summaries.',
      'Marketing campaign flow connected to benchmark, hooks, briefs, and recap.',
    ],
  },
  {
    version: 'v0.70',
    date: '2026-05-03',
    phase: 'Reporting',
    headline: 'POC report and share loop.',
    highlights: [
      'POC report generator added.',
      'Read-only share and executive report helpers added.',
      'Inquiry success path connects to POC package education.',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-[960px] px-6 py-10">
      <div className="mb-8 text-center">
        <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-accent">Changelog</div>
        <h1 className="mb-3 text-2xl font-bold text-text-primary lg:text-3xl font-[family-name:var(--font-outfit)]">
          Product milestones
        </h1>
        <p className="mx-auto max-w-[620px] text-[13px] leading-relaxed text-text-secondary">
          The log tracks real product closeout work: POC readiness, standard packs, reporting, CRM motion, and launch polish.
        </p>
      </div>

      <div className="space-y-6">
        {RELEASES.map((release, index) => (
          <article key={release.version} className="relative border-l-2 border-border-subtle pb-2 pl-8">
            <div className={`absolute left-0 top-0 size-2 -translate-x-[5px] rounded-full ${index === 0 ? 'bg-accent' : 'bg-text-tertiary'}`} />
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-[14px] font-bold text-text-primary font-[family-name:var(--font-outfit)]">
                  {release.version}
                </span>
                <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-accent">
                  {release.phase}
                </span>
              </div>
              <span className="font-mono text-[10px] text-text-tertiary">{release.date}</span>
            </div>
            <h2 className="mb-2 text-[15px] font-semibold text-text-primary">{release.headline}</h2>
            <ul className="space-y-1">
              {release.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2 text-[12px] leading-relaxed text-text-secondary">
                  <span className="mt-0.5 shrink-0 text-accent/60">+</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-12 rounded-md border border-border-subtle bg-bg-surface/50 p-5 text-center">
        <div className="mb-2 text-[11px] font-mono uppercase tracking-wider text-text-tertiary">Still moving</div>
        <p className="mb-4 text-[12px] text-text-secondary">
          Roadmap items are intentionally tied to commercial readiness instead of generic AI feature sprawl.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/roadmap" className="text-[11px] font-mono text-accent hover:underline">Roadmap</Link>
          <Link href="/poc" className="text-[11px] font-mono text-accent hover:underline">POC</Link>
          <Link href="/status" className="text-[11px] font-mono text-accent hover:underline">Status</Link>
        </div>
      </div>
    </div>
  );
}
