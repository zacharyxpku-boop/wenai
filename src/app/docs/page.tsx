import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Docs | wenai POC delivery system',
  description:
    'How to run a 10 SKU POC, generate standard packs, review executive reports, and move qualified accounts into contract motion.',
};

const SECTIONS = [
  {
    id: 'quick-start',
    title: '5-minute customer path',
    body: [
      'Choose a category and paste a real SKU brief.',
      'Generate the standard launch pack.',
      'Open the POC report and review readiness.',
      'Share the executive page or submit the POC inquiry.',
    ],
  },
  {
    id: 'poc',
    title: '10 SKU POC operating bar',
    body: [
      'A qualified POC needs real SKU names, category, target platform, benefits, price band, assets, benchmark links, and brand redlines.',
      'Output should include listing copy, visual direction, compliance notes, support scripts, content direction, acceptance score, and next action.',
      'High-risk claims, trademarks, regulated categories, and platform policy questions must stay under human review.',
    ],
  },
  {
    id: 'marketing',
    title: 'Content marketing layer',
    body: [
      'Marketing modules should support the ecommerce POC, not become a generic social tool.',
      'The intended line is benchmark evidence, hook matrix, UGC or slideshow brief, testing plan, and recap report.',
      'When benchmark data is missing, the system should label outputs as assumptions instead of pretending research is complete.',
    ],
  },
  {
    id: 'crm',
    title: 'CRM-lite handoff',
    body: [
      'After delivery, record owner, status, contract stage, quote status, payment status, SLA due date, and next action.',
      'Use executive reports for stakeholder review and the inquiry detail page for commercial motion.',
      'The goal is to answer whether the account should move to the main site contract and payment flow.',
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-6 py-10">
      <div className="mb-8 text-center">
        <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-accent">Docs</div>
        <h1 className="mb-3 text-2xl font-bold text-text-primary lg:text-3xl font-[family-name:var(--font-outfit)]">
          wenai operating guide
        </h1>
        <p className="mx-auto max-w-[660px] text-[13px] leading-relaxed text-text-secondary">
          The product is a commercial delivery system for ecommerce teams: SKU intake, rules, Brand IQ,
          content marketing, POC report, and contract motion.
        </p>
      </div>

      <div className="mb-6 rounded-md border border-border-subtle bg-bg-surface/50 p-4">
        <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Contents</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SECTIONS.map((section) => (
            <a key={section.id} href={`#${section.id}`} className="text-[12px] text-text-secondary hover:text-accent">
              {section.title}
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-6">
            <h2 className="mb-3 border-l-2 border-accent pl-3 text-[18px] font-bold text-text-primary font-[family-name:var(--font-outfit)]">
              {section.title}
            </h2>
            <ul className="space-y-2 text-[12px] leading-relaxed text-text-secondary">
              {section.body.map((item) => (
                <li key={item} className="rounded-md border border-border-subtle bg-bg-surface/40 p-3">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 gap-3 border-t border-border-subtle pt-6 sm:grid-cols-3">
        <Link href="/poc" className="rounded-md border border-border-default px-4 py-3 text-center text-[12px] font-semibold text-text-primary hover:border-accent">
          Run POC
        </Link>
        <Link href="/pipelines/marketing-campaign" className="rounded-md border border-border-default px-4 py-3 text-center text-[12px] font-semibold text-text-primary hover:border-accent">
          Open marketing pack
        </Link>
        <Link href="/pricing" className="rounded-md border border-accent/40 px-4 py-3 text-center text-[12px] font-semibold text-accent hover:bg-accent/10">
          View plans
        </Link>
      </div>
    </div>
  );
}
