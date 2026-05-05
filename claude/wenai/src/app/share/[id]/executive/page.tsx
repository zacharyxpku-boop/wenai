import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  buildExecutiveRecap,
  excerpt,
  getShare,
  readCommercialBriefing,
} from '@/lib/share-readonly';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const data = await getShare(id);
  if (!data) return { title: 'Executive share | wenai' };

  return {
    title: `${data.title || 'Executive recap'} | wenai`,
    description: excerpt(data.content, 140),
  };
}

export default async function ExecutiveSharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getShare(id);
  if (!data) notFound();

  const brief = readCommercialBriefing(data.content);
  const recap = buildExecutiveRecap(data.title || 'wenai executive recap', brief);

  return (
    <div className="mx-auto max-w-[920px] px-6 py-10">
      <div className="rounded-lg border border-accent/35 bg-accent/5 p-6">
        <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-accent">Executive recap</div>
        <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-bold text-text-primary">
          {data.title || 'wenai POC executive recap'}
        </h1>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-text-secondary">
          Read-only summary for decision makers. Use this page when you need the contract judgment,
          pricing signal, and next action without the full operator workspace.
        </p>
      </div>

      <section className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
        {[
          ['Acceptance', brief.acceptanceScore || '--'],
          ['Commercial', brief.commercialScore || '--'],
          ['Contract', brief.contractStatus || 'not specified'],
          ['Decision', brief.decision || 'not specified'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-border-subtle bg-bg-surface/40 p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">{label}</div>
            <div className="mt-1 text-[18px] font-semibold text-text-primary">{value}</div>
          </div>
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-md border border-border-subtle bg-bg-surface/40 p-5">
          <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">Executive note</div>
          <pre className="whitespace-pre-wrap text-[12px] leading-relaxed text-text-primary">{recap}</pre>
        </div>
        <div className="space-y-4">
          <Card title="Commercial motion" body={brief.commercialMotion || 'Not specified'} />
          <Card title="Package recommendation" body={brief.packageRecommendation || 'Not specified'} />
          <Card title="Owner message" body={brief.ownerMessage || 'Not specified'} />
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ListCard title="Proof points" items={brief.proofPoints} fallback="No proof points captured." />
        <ListCard title="Conversion risks" items={brief.conversionRisks} fallback="No major risks captured." />
      </section>

      <section className="mt-6 rounded-md border border-border-subtle bg-bg-surface/40 p-5">
        <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">Next actions</div>
        <ul className="space-y-2">
          {(brief.nextActions.length > 0 ? brief.nextActions : ['No next actions captured.']).map(item => (
            <li key={item} className="text-[12px] leading-relaxed text-text-secondary">{item}</li>
          ))}
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/share/${id}`} className="rounded-md border border-border-default px-4 py-2 text-[12px] font-mono text-text-primary hover:border-accent/40">
          Open full report
        </Link>
        <Link href={`/inquire?from=executive-share`} className="rounded-md bg-accent px-4 py-2 text-[12px] font-semibold text-bg-root hover:bg-accent-hover">
          Start a POC
        </Link>
      </div>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface/40 p-4">
      <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">{title}</div>
      <p className="mt-2 text-[12px] leading-relaxed text-text-primary">{body}</p>
    </div>
  );
}

function ListCard({ title, items, fallback }: { title: string; items: string[]; fallback: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface/40 p-4">
      <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">{title}</div>
      <ul className="mt-2 space-y-2">
        {(items.length > 0 ? items : [fallback]).map(item => (
          <li key={item} className="text-[12px] leading-relaxed text-text-secondary">{item}</li>
        ))}
      </ul>
    </div>
  );
}
