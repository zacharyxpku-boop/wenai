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
  if (!data) return { title: '老板版分享 | wenai' };

  return {
    title: `${data.title || '老板版摘要'} | wenai`,
    description: excerpt(data.content, 140),
  };
}

export default async function ExecutiveSharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getShare(id);
  if (!data) notFound();

  const brief = readCommercialBriefing(data.content);
  const recap = buildExecutiveRecap(data.title || 'wenai 老板版摘要', brief);

  return (
    <div className="mx-auto max-w-[920px] px-6 py-10">
      <div className="rounded-lg border border-accent/35 bg-accent/5 p-6">
        <div className="mb-2 text-[10px] font-mono text-accent">老板版摘要</div>
        <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-bold text-text-primary">
          {data.title || 'wenai POC 老板版摘要'}
        </h1>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-text-secondary">
          这是给决策人看的只读页面。重点只放合同判断、价格信号、推进建议，不需要打开完整操作工作台。
        </p>
      </div>

      <section className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
        {[
          ['验收分', brief.acceptanceScore || '--'],
          ['商业分', brief.commercialScore || '--'],
          ['合同状态', brief.contractStatus || '未填写'],
          ['结论', brief.decision || '未填写'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-border-subtle bg-bg-surface/40 p-4">
            <div className="text-[10px] font-mono text-text-tertiary">{label}</div>
            <div className="mt-1 text-[18px] font-semibold text-text-primary">{value}</div>
          </div>
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-md border border-border-subtle bg-bg-surface/40 p-5">
          <div className="mb-2 text-[10px] font-mono text-accent">老板备注</div>
          <pre className="whitespace-pre-wrap text-[12px] leading-relaxed text-text-primary">{recap}</pre>
        </div>
        <div className="space-y-4">
          <Card title="商务推进建议" body={brief.commercialMotion || '未填写'} />
          <Card title="建议合作包" body={brief.packageRecommendation || '未填写'} />
          <Card title="对接人说明" body={brief.ownerMessage || '未填写'} />
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ListCard title="支撑证据" items={brief.proofPoints} fallback="暂无支撑证据。" />
        <ListCard title="转化风险" items={brief.conversionRisks} fallback="暂无明显转化风险。" />
      </section>

      <section className="mt-6 rounded-md border border-border-subtle bg-bg-surface/40 p-5">
        <div className="mb-2 text-[10px] font-mono text-accent">下一步动作</div>
        <ul className="space-y-2">
          {(brief.nextActions.length > 0 ? brief.nextActions : ['暂无下一步动作。']).map(item => (
            <li key={item} className="text-[12px] leading-relaxed text-text-secondary">{item}</li>
          ))}
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/share/${id}`} className="rounded-md border border-border-default px-4 py-2 text-[12px] font-mono text-text-primary hover:border-accent/40">
          查看完整报告
        </Link>
        <Link href="/inquire?from=executive-share" className="rounded-md bg-accent px-4 py-2 text-[12px] font-semibold text-bg-root hover:bg-accent-hover">
          提交 POC 需求
        </Link>
      </div>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface/40 p-4">
      <div className="text-[10px] font-mono text-text-tertiary">{title}</div>
      <p className="mt-2 text-[12px] leading-relaxed text-text-primary">{body}</p>
    </div>
  );
}

function ListCard({ title, items, fallback }: { title: string; items: string[]; fallback: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface/40 p-4">
      <div className="text-[10px] font-mono text-text-tertiary">{title}</div>
      <ul className="mt-2 space-y-2">
        {(items.length > 0 ? items : [fallback]).map(item => (
          <li key={item} className="text-[12px] leading-relaxed text-text-secondary">{item}</li>
        ))}
      </ul>
    </div>
  );
}
