import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SharePageActions from '@/components/SharePageActions';
import {
  buildExecutiveRecap,
  type CommercialBriefingSnapshot,
  excerpt,
  getShare,
  readCommercialBriefing,
  SHARE_LABELS,
} from '@/lib/share-readonly';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const data = await getShare(id);
  if (!data) return { title: '分享已失效 · wenai' };

  const ogParams = new URLSearchParams({
    title: (data.title || 'wenai 分享内容').slice(0, 60),
    excerpt: excerpt(data.content, 140),
    module: SHARE_LABELS[data.source] || data.moduleId || '',
  });

  return {
    title: `${data.title || '分享内容'} · wenai`,
    description: excerpt(data.content, 140),
    openGraph: {
      title: data.title || 'wenai 分享内容',
      description: excerpt(data.content, 140),
      images: [{ url: `/api/og?${ogParams.toString()}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title || 'wenai 分享内容',
      description: excerpt(data.content, 140),
      images: [`/api/og?${ogParams.toString()}`],
    },
  };
}

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getShare(id);
  if (!data) notFound();
  const isPocReport = data.source === 'poc-report';
  const brief = isPocReport ? readCommercialBriefing(data.content) : null;
  const executiveRecap = brief ? buildExecutiveRecap(data.title || 'wenai POC 摘要', brief) : '';

  return (
    <div className="print-share-shell mx-auto max-w-[960px] px-6 py-10">
      <div className="print-share-card mb-6 border-b border-border-subtle pb-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Link href="/" className="text-[10px] font-mono uppercase tracking-[0.15em] text-accent hover:underline">
            wenai
          </Link>
          <span className="text-[10px] text-text-tertiary">/</span>
          <span className="text-[10px] font-mono text-text-tertiary">
            {SHARE_LABELS[data.source] || data.moduleId || '分享内容'}
          </span>
          <span className="text-[10px] text-text-tertiary">/</span>
          <span className="text-[10px] font-mono text-text-tertiary">read-only</span>
        </div>
        {data.title && (
          <h1 className="font-[family-name:var(--font-outfit)] text-xl font-bold leading-tight text-text-primary lg:text-2xl">
            {data.title}
          </h1>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] font-mono text-text-tertiary">
          <span>Generated {new Date(data.createdAt).toLocaleString('zh-CN')}</span>
          <span>/</span>
          <span>Expires in 7 days</span>
          {isPocReport && (
            <>
              <span>/</span>
              <span className="text-accent">Boss-ready POC recap</span>
            </>
          )}
        </div>
      </div>

      {isPocReport && (
        <div className="print-share-card mb-5 rounded-md border border-accent/40 bg-accent/5 px-4 py-3">
          <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-accent">Acceptance Note</div>
          <div className="text-[12px] leading-relaxed text-text-secondary">
            This read-only page is meant for review, contract judgment, and internal alignment. Edit the source report when metrics change.
          </div>
        </div>
      )}

      <SharePageActions isPocReport={isPocReport} executiveRecap={executiveRecap} />

      {brief && <PocDecisionCover title={data.title || 'wenai POC recap'} brief={brief} />}
      {brief && <PocBossBrief brief={brief} />}

      <article className="print-share-card print-break-before prose prose-invert prose-sm max-w-none text-[13px] leading-[1.8] text-text-secondary [&_code]:rounded [&_code]:bg-bg-raised [&_code]:px-1 [&_code]:font-mono [&_code]:text-[11px] [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-[16px] [&_h2]:font-semibold [&_h2]:text-text-primary [&_h3]:mb-1.5 [&_h3]:mt-4 [&_h3]:text-[14px] [&_h3]:text-text-primary [&_img]:my-3 [&_img]:rounded-md [&_img]:border [&_img]:border-border-subtle [&_li]:mb-1 [&_ol]:pl-5 [&_strong]:text-text-primary [&_table]:border-collapse [&_td]:border [&_td]:border-border-subtle [&_td]:px-2 [&_td]:py-1 [&_td]:text-[12px] [&_th]:border [&_th]:border-border-subtle [&_th]:bg-bg-raised [&_th]:px-2 [&_th]:py-1 [&_th]:text-[11px] [&_ul]:pl-5">
        <ReactMarkdown>{data.content}</ReactMarkdown>
      </article>

      <div className="print-hide mt-10 border-t border-border-subtle pt-6">
        <div className="rounded-md border border-accent/30 bg-accent/5 p-5 text-center">
          <div className="mb-2 text-[10px] font-mono text-accent">
            {isPocReport ? '想继续推进商务？' : '想亲自跑一遍这个流程？'}
          </div>
          <h3 className="mb-2 font-[family-name:var(--font-outfit)] text-[14px] font-semibold text-text-primary">
            {isPocReport ? '把这份 POC 复盘推进到正式合作。' : '从真实 SKU 开始，生成一份可交付标准包。'}
          </h3>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link
              href={isPocReport ? '/inquire?from=share-poc-report' : '/demo'}
              className="rounded-md bg-accent px-4 py-2 text-[12px] font-semibold text-bg-root hover:bg-accent-hover"
            >
              {isPocReport ? '提交 POC 需求' : '运行演示'}
            </Link>
            <Link
              href="/poc"
              className="rounded-md border border-border-default px-4 py-2 text-[12px] font-mono text-text-primary hover:border-accent/40"
            >
              查看 POC 标准
            </Link>
            <Link
              href="/cases"
              className="rounded-md border border-border-default px-4 py-2 text-[12px] font-mono text-text-primary hover:border-accent/40"
            >
              查看案例
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PocDecisionCover({
  title,
  brief,
}: {
  title: string;
  brief: CommercialBriefingSnapshot;
}) {
  const firstAction = brief.nextActions[0] || 'Review the source report and confirm the next commercial milestone.';
  const firstProof = brief.proofPoints[0] || 'No decisive proof point extracted yet.';
  const firstRisk = brief.conversionRisks[0] || 'No major conversion risk extracted yet.';

  return (
    <section className="print-share-card print-avoid-break mb-6 rounded-md border border-accent/35 bg-accent/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border-subtle pb-4">
        <div className="max-w-2xl">
          <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-accent">Decision cover</div>
          <h2 className="font-[family-name:var(--font-outfit)] text-[22px] font-semibold leading-tight text-text-primary">
            {brief.commercialMotion || brief.decision || 'Commercial decision brief'}
          </h2>
          <p className="mt-2 text-[12px] leading-relaxed text-text-secondary">
            {brief.packageRecommendation || 'Use this recap to decide whether the POC should close, expand, or be repaired before a contract motion.'}
          </p>
          <div className="mt-3 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
            {title}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <MetricPill label="Acceptance" value={brief.acceptanceScore || '--'} />
          <MetricPill label="Commercial" value={brief.commercialScore || '--'} />
          <BriefField label="Contract" value={brief.contractStatus || 'not specified'} />
          <BriefField label="Price signal" value={brief.priceSignal || 'not specified'} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <CoverPanel
          label="What should happen now"
          value={firstAction}
          tone="next"
        />
        <CoverPanel
          label="Why this can sell"
          value={firstProof}
          tone="good"
        />
        <CoverPanel
          label="What can still block close"
          value={firstRisk}
          tone="risk"
        />
      </div>
    </section>
  );
}

function PocBossBrief({ brief }: { brief: CommercialBriefingSnapshot }) {
  const proofPoints = brief.proofPoints.length > 0 ? brief.proofPoints : ['No decisive proof point extracted yet.'];
  const conversionRisks = brief.conversionRisks.length > 0 ? brief.conversionRisks : ['No major conversion risk extracted yet.'];
  const nextActions = brief.nextActions.length > 0 ? brief.nextActions : ['Review the source report before the next commercial step.'];

  return (
    <section className="print-share-card print-avoid-break mb-6 rounded-md border border-accent/35 bg-bg-surface p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border-subtle pb-4">
        <div>
          <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-accent">Operator brief</div>
          <h2 className="font-[family-name:var(--font-outfit)] text-[18px] font-semibold text-text-primary">
            {brief.commercialMotion || brief.decision || 'Commercial decision brief'}
          </h2>
          <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-text-secondary">
            {brief.packageRecommendation || 'Use this read-only recap to align on whether the POC should close, expand, or be repaired before contract motion.'}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-right">
          <MetricPill label="Acceptance" value={brief.acceptanceScore || '--'} />
          <MetricPill label="Commercial" value={brief.commercialScore || '--'} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <BriefField label="Contract status" value={brief.contractStatus || 'not specified'} />
        <BriefField label="Price signal" value={brief.priceSignal || 'not specified'} />
        <BriefField label="Decision" value={brief.decision || 'not specified'} />
      </div>

      {brief.ownerMessage && (
        <div className="mt-3 rounded-md border border-border-subtle bg-bg-root/45 p-3">
          <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Owner message</div>
          <div className="text-[12px] leading-relaxed text-text-primary">{brief.ownerMessage}</div>
        </div>
      )}

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <BriefList title="Proof to use" items={proofPoints} tone="good" />
        <BriefList title="Risks to watch" items={conversionRisks} tone="risk" />
        <BriefList title="Next actions" items={nextActions} tone="next" />
      </div>
    </section>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-root/45 px-3 py-2">
      <div className="font-mono text-[18px] font-semibold tabular-nums text-text-primary">{value}</div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">{label}</div>
    </div>
  );
}

function BriefField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-root/45 p-3">
      <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">{label}</div>
      <div className="text-[12px] font-semibold text-text-primary">{value}</div>
    </div>
  );
}

function BriefList({ title, items, tone }: { title: string; items: string[]; tone: 'good' | 'risk' | 'next' }) {
  const color = tone === 'good' ? 'text-success' : tone === 'risk' ? 'text-error' : 'text-accent';
  return (
    <div className="rounded-md border border-border-subtle bg-bg-root/45 p-3">
      <div className={`mb-2 text-[10px] font-mono uppercase tracking-wider ${color}`}>{title}</div>
      <ul className="space-y-1.5">
        {items.map(item => (
          <li key={item} className="text-[11px] leading-relaxed text-text-secondary">{item}</li>
        ))}
      </ul>
    </div>
  );
}

function CoverPanel({ label, value, tone }: { label: string; value: string; tone: 'good' | 'risk' | 'next' }) {
  const color = tone === 'good' ? 'text-success' : tone === 'risk' ? 'text-error' : 'text-accent';
  return (
    <div className="rounded-md border border-border-subtle bg-bg-root/45 p-4">
      <div className={`mb-2 text-[10px] font-mono uppercase tracking-wider ${color}`}>{label}</div>
      <div className="text-[12px] leading-relaxed text-text-primary">{value}</div>
    </div>
  );
}
