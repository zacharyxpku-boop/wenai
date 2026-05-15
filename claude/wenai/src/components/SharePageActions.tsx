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
  const [copiedState, setCopiedState] = useState<'idle' | 'link' | 'recap' | 'pdf' | 'error'>('idle');
  const [copyError, setCopyError] = useState('');
  const pathname = usePathname();
  const executiveHref = `${pathname}/executive`;

  async function copyValue(value: string, mode: 'link' | 'recap' | 'pdf') {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(value);
      setCopyError('');
      setCopiedState(mode);
      window.setTimeout(() => setCopiedState('idle'), 2000);
    } catch {
      setCopiedState('error');
      setCopyError('复制失败，请手动选中文本或使用浏览器分享功能。');
      window.setTimeout(() => {
        setCopiedState('idle');
        setCopyError('');
      }, 3200);
    }
  }

  return (
    <div className="print-hide mb-5 flex flex-wrap items-center gap-2">
      {isPocReport && (
        <div className="mr-auto min-w-[220px] rounded-md border border-accent/30 bg-accent/5 px-3 py-2">
          <div className="text-[10px] font-mono text-accent">老板版分享</div>
          <div className="mt-1 text-[11px] leading-relaxed text-text-secondary">
            给决策人看的只读链接、可打印 PDF 和短摘要。
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-md border border-border-default px-3 py-1.5 text-[11px] font-mono text-text-primary hover:border-accent/40"
      >
        打印 / 保存 PDF
      </button>
      {isPocReport && (
        <>
          <Link
            href={executiveHref}
            className="rounded-md border border-accent/40 px-3 py-1.5 text-[11px] font-mono text-accent hover:bg-accent/10"
          >
            打开老板版页面
          </Link>
          <button
            type="button"
            onClick={() => copyValue(`${window.location.href}\n\nPrint to PDF for board review.`, 'pdf')}
            className="rounded-md border border-border-default px-3 py-1.5 text-[11px] font-mono text-text-primary hover:border-accent/40"
          >
            {copiedState === 'pdf' ? 'PDF 说明已复制' : '复制 PDF 说明'}
          </button>
          <button
            type="button"
            onClick={() => copyValue(window.location.href, 'link')}
            className="rounded-md border border-accent/40 px-3 py-1.5 text-[11px] font-mono text-accent hover:bg-accent/10"
          >
            {copiedState === 'link' ? '老板版链接已复制' : '复制老板版链接'}
          </button>
          <button
            type="button"
            onClick={() => copyValue(executiveRecap || window.location.href, 'recap')}
            className="rounded-md border border-border-default px-3 py-1.5 text-[11px] font-mono text-text-primary hover:border-accent/40"
          >
            {copiedState === 'recap' ? '老板摘要已复制' : '复制老板摘要'}
          </button>
        </>
      )}
      {copiedState === 'error' && copyError && (
        <div role="status" className="w-full rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-[12px] font-bold text-amber-800">
          {copyError}
        </div>
      )}
    </div>
  );
}
