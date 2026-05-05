import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Enterprise | wenai',
  description:
    'Enterprise paths for Brand IQ, category rules, private deployment, API/ERP handoff, SLA, and contract-ready ecommerce delivery.',
};

const FITS = [
  ['Ecommerce operators', 'Teams shipping many SKUs and needing repeatable launch, content, and review workflows.'],
  ['Sensitive brands', 'Teams that need brand redlines, data boundaries, and human review before publication.'],
  ['Category specialists', 'Teams with deep category rules, thresholds, and acceptance standards.'],
];

const STEPS = [
  ['Discovery', 'Confirm SKU volume, category scope, data boundaries, and the real POC acceptance bar.'],
  ['POC run', 'Run 10-20 real SKUs through the system and capture quality, effort saved, and review issues.'],
  ['Contract scope', 'Write DPA, SLA, custom workflow scope, acceptance criteria, and commercial terms.'],
  ['Deployment', 'Connect the chosen environment, providers, admin keys, and customer handoff path.'],
  ['Review loop', 'Use reports and CRM motion to decide expansion, renewal, or workflow changes.'],
];

export default function EnterprisePage() {
  return (
    <div className="mx-auto max-w-[1000px] px-6 py-10">
      <div className="mb-10 text-center">
        <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-accent">Enterprise</div>
        <h1 className="mb-3 text-2xl font-bold text-text-primary lg:text-3xl font-[family-name:var(--font-outfit)]">
          Turn repeatable POCs into an account-specific ecommerce operating system.
        </h1>
        <p className="mx-auto max-w-[700px] text-[14px] leading-relaxed text-text-secondary">
          Enterprise work starts after a focused POC. The goal is to turn your SKU rules, brand redlines,
          content marketing process, reporting, and contract motion into a stable workspace.
        </p>
      </div>

      <section className="mb-10 rounded-md border border-border-subtle bg-bg-surface p-6">
        <div className="mb-4 text-[10px] font-mono uppercase tracking-wider text-accent">Best fit</div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {FITS.map(([title, body]) => (
            <div key={title} className="rounded-md border border-border-subtle bg-bg-root/35 p-4">
              <div className="mb-2 text-[13px] font-semibold text-text-primary">{title}</div>
              <p className="text-[11px] leading-relaxed text-text-secondary">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-4 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Commercial process</div>
        <div className="space-y-3">
          {STEPS.map(([title, body], index) => (
            <div key={title} className="flex gap-4 rounded-md border border-border-subtle bg-bg-surface/50 p-4">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-accent/40 bg-accent/10 font-mono text-[13px] text-accent tabular-nums">
                {index + 1}
              </div>
              <div>
                <div className="mb-1 text-[13px] font-semibold text-text-primary">{title}</div>
                <p className="text-[11px] leading-relaxed text-text-secondary">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-accent/40 bg-accent/5 p-6 text-center">
        <div className="mb-2 text-[11px] font-mono uppercase tracking-wider text-accent">Next step</div>
        <h2 className="mb-2 text-[18px] font-bold text-text-primary font-[family-name:var(--font-outfit)]">
          Start with a scoped POC, then decide enterprise depth.
        </h2>
        <p className="mx-auto mb-4 max-w-[560px] text-[12px] leading-relaxed text-text-secondary">
          Formal payment, contract, invoice, refund, and SLA terms should be handled by the main commercial flow.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/inquire?from=enterprise" className="rounded-md bg-accent px-5 py-2.5 text-[13px] font-semibold text-bg-root hover:bg-accent-hover">
            Submit inquiry
          </Link>
          <Link href="/poc" className="rounded-md border border-border-default px-5 py-2.5 text-[13px] font-mono text-text-primary hover:border-accent/40">
            Run POC first
          </Link>
          <Link href="/legal/dpa" className="rounded-md border border-border-default px-5 py-2.5 text-[13px] font-mono text-text-primary hover:border-accent/40">
            View DPA
          </Link>
        </div>
      </section>
    </div>
  );
}
