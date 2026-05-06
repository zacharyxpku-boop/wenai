import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tools | wenai',
  description:
    'Free and lightweight ecommerce tools for hook scoring, AIGC compliance, marketing campaign briefs, and POC preparation.',
};

const TOOLS = [
  {
    href: '/pipelines/marketing-campaign',
    title: 'Marketing campaign pack',
    desc: 'Benchmark evidence, hook matrix, UGC brief, slideshow/reel plan, and recap structure.',
    tag: 'POC',
  },
  {
    href: '/tools/hook-score',
    title: 'Hook score',
    desc: 'Score hook copy before testing and get a simple quality estimate.',
    tag: 'Free',
  },
  {
    href: '/tools/aigc-compliance',
    title: 'AIGC compliance check',
    desc: 'Review disclosure wording, platform risk, and human approval boundaries.',
    tag: 'Free',
  },
];

export default function ToolsIndex() {
  return (
    <div className="min-h-screen bg-bg-root">
      <div className="mx-auto max-w-[800px] px-6 py-8">
        <div className="mb-6 border-b border-border-subtle pb-4">
          <Link href="/" className="mb-2 inline-block text-[10px] font-mono text-text-tertiary hover:text-accent">
            &lt;- Home
          </Link>
          <h1 className="mb-1 text-2xl font-bold text-text-primary lg:text-3xl font-[family-name:var(--font-outfit)]">
            Tools
          </h1>
          <p className="text-[12px] text-text-secondary">
            Lightweight utilities that support the POC delivery system without turning wenai into a generic tool bundle.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group block rounded-md border border-border-subtle bg-bg-surface/30 p-5 transition-colors hover:border-accent/40"
            >
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-[15px] font-bold text-text-primary group-hover:text-accent">{tool.title}</span>
                <span className="rounded border border-accent/40 px-1.5 py-0.5 text-[9px] font-mono text-accent">
                  {tool.tag}
                </span>
              </div>
              <p className="text-[12px] leading-relaxed text-text-secondary">{tool.desc}</p>
              <div className="mt-3 text-[10px] font-mono text-text-tertiary">Open -&gt;</div>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-md border border-border-subtle bg-bg-surface/20 p-4 text-[11px] leading-relaxed text-text-secondary">
          Full SKU workspace, reports, and CRM motion live in the POC and inquiry flows.
        </div>
      </div>
    </div>
  );
}
