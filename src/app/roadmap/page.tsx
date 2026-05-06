import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Roadmap | wenai',
  description:
    'The next milestones for wenai: launch POC, content marketing, CRM-lite, Brand IQ, and enterprise handoff.',
};

const QUARTERS = [
  {
    label: 'Now',
    period: 'POC-ready closeout',
    theme: 'Make the customer-facing path commercial-ready.',
    items: [
      '5-minute POC onboarding',
      'Brand IQ and category guardrails',
      'Executive read-only report',
      'CRM-lite inquiry and contract motion',
      'Marketing benchmark to creative brief',
    ],
  },
  {
    label: 'Next',
    period: 'Launch preparation',
    theme: 'Prepare the subsite for real customers and main-site payment handoff.',
    items: [
      'Production env checklist',
      'Demo seed data and sample reports',
      'Mobile visual QA',
      'Main-site contract and payment routing',
      'Authorized case library',
    ],
  },
  {
    label: 'Later',
    period: 'Enterprise depth',
    theme: 'Turn repeatable POCs into account-specific operating systems.',
    items: [
      'Workspace-specific Brand IQ',
      'Category threshold presets',
      'Persistent delivery history',
      'Private deployment package',
      'API and ERP handoff',
    ],
  },
];

export default function RoadmapPage() {
  return (
    <div className="mx-auto max-w-[960px] px-6 py-10">
      <div className="mb-8 text-center">
        <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-accent">Roadmap</div>
        <h1 className="mb-3 text-2xl font-bold text-text-primary lg:text-3xl font-[family-name:var(--font-outfit)]">
          From POC system to commercial operating layer
        </h1>
        <p className="mx-auto max-w-[660px] text-[13px] leading-relaxed text-text-secondary">
          The roadmap stays focused: make ecommerce SKU work repeatable, reviewable, shareable, and contract-ready.
        </p>
      </div>

      <div className="space-y-6">
        {QUARTERS.map((quarter, index) => (
          <section key={quarter.label} className="rounded-md border border-border-subtle bg-bg-surface p-6">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[18px] font-bold text-text-primary font-[family-name:var(--font-outfit)]">
                    {quarter.label}
                  </span>
                  {index === 0 && (
                    <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-accent">
                      Current
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[13px] text-text-secondary">{quarter.theme}</div>
              </div>
              <span className="font-mono text-[10px] text-text-tertiary">{quarter.period}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {quarter.items.map((item) => (
                <div key={item} className="rounded-md border border-border-subtle bg-bg-root/35 p-3 text-[12px] text-text-primary">
                  {item}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-6">
        <Link href="/changelog" className="text-[12px] font-semibold text-accent hover:underline">
          View changelog
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link href="/poc" className="rounded-md border border-border-default px-3 py-1.5 text-[11px] font-mono text-text-secondary hover:border-accent/40">
            POC
          </Link>
          <Link href="/pricing" className="rounded-md border border-border-default px-3 py-1.5 text-[11px] font-mono text-text-secondary hover:border-accent/40">
            Plans
          </Link>
          <Link href="/enterprise" className="rounded-md border border-border-default px-3 py-1.5 text-[11px] font-mono text-text-secondary hover:border-accent/40">
            Enterprise
          </Link>
        </div>
      </div>
    </div>
  );
}
