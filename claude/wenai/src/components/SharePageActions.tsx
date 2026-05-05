'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function SharePageActions({
  isPocReport,
  executiveRecap,
}: {
  isPocReport: boolean;
  executiveRecap?: string;
}) {
  const [copiedState, setCopiedState] = useState<'idle' | 'link' | 'recap' | 'pdf'>('idle');
  const pathname = usePathname();
  const executiveHref = `${pathname}/executive`;

  async function copyValue(value: string, mode: 'link' | 'recap' | 'pdf') {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedState(mode);
      window.setTimeout(() => setCopiedState('idle'), 2000);
    } catch {
      setCopiedState('idle');
    }
  }

  return (
    <div className="print-hide mb-5 flex flex-wrap items-center gap-2">
      {isPocReport && (
        <div className="mr-auto min-w-[220px] rounded-md border border-accent/30 bg-accent/5 px-3 py-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-accent">Executive share</div>
          <div className="mt-1 text-[11px] leading-relaxed text-text-secondary">
            Read-only link, printable PDF, and short recap for customer decision makers.
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-md border border-border-default px-3 py-1.5 text-[11px] font-mono text-text-primary hover:border-accent/40"
      >
        Print / Save PDF
      </button>
      {isPocReport && (
        <>
          <Link
            href={executiveHref}
            className="rounded-md border border-accent/40 px-3 py-1.5 text-[11px] font-mono text-accent hover:bg-accent/10"
          >
            Open executive page
          </Link>
          <button
            type="button"
            onClick={() => copyValue(`${window.location.href}\n\nPrint to PDF for board review.`, 'pdf')}
            className="rounded-md border border-border-default px-3 py-1.5 text-[11px] font-mono text-text-primary hover:border-accent/40"
          >
            {copiedState === 'pdf' ? 'PDF note copied' : 'Copy PDF note'}
          </button>
          <button
            type="button"
            onClick={() => copyValue(window.location.href, 'link')}
            className="rounded-md border border-accent/40 px-3 py-1.5 text-[11px] font-mono text-accent hover:bg-accent/10"
          >
            {copiedState === 'link' ? 'Boss link copied' : 'Copy boss link'}
          </button>
          <button
            type="button"
            onClick={() => copyValue(executiveRecap || window.location.href, 'recap')}
            className="rounded-md border border-border-default px-3 py-1.5 text-[11px] font-mono text-text-primary hover:border-accent/40"
          >
            {copiedState === 'recap' ? 'Recap copied' : 'Copy executive recap'}
          </button>
        </>
      )}
    </div>
  );
}
