import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CASE_STUDY_DETAILS, getCaseStudyDetail } from '@/lib/case-study-details';

type CaseDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return CASE_STUDY_DETAILS.map(item => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: CaseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = getCaseStudyDetail(slug);

  if (!detail) {
    return {
      title: '案例不存在 · wenai',
    };
  }

  return {
    title: `${detail.title} · wenai 案例`,
    description: detail.summary,
  };
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { slug } = await params;
  const detail = getCaseStudyDetail(slug);

  if (!detail) notFound();

  const inquireHref = `/inquire?from=case-${detail.slug}&skuCount=10&platform=${encodeURIComponent(detail.segment)}`;

  return (
    <div className="max-w-[1180px] mx-auto px-5 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <Link href="/cases" className="text-[11px] font-mono text-text-tertiary hover:text-accent transition-colors">
          ← 返回案例库
        </Link>
        <div className="text-[10px] font-mono text-accent uppercase tracking-wider">{detail.proofLevel}</div>
      </div>

      <header className="border border-border-subtle rounded-md bg-bg-surface overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-0">
          <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-border-subtle">
            <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-3">
              {detail.segment}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary font-[family-name:var(--font-outfit)] text-balance">
              {detail.title}
            </h1>
            <p className="mt-4 text-[14px] text-text-secondary leading-relaxed text-pretty max-w-2xl">
              {detail.summary}
            </p>
            <p className="mt-5 text-[12px] text-text-tertiary leading-relaxed text-pretty">
              {detail.disclaimer}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href={inquireHref} className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-[13px] font-semibold text-bg-root hover:bg-accent-hover transition-colors">
                提交同类 POC →
              </Link>
              <Link href={detail.standardPackHref} className="inline-flex items-center justify-center rounded-md border border-border-default px-5 py-2.5 text-[13px] font-semibold text-text-primary hover:border-accent hover:text-accent transition-colors">
                生成标准交付包
              </Link>
              <Link href={detail.pipelineHref} className="inline-flex items-center justify-center rounded-md border border-border-subtle px-5 py-2.5 text-[13px] font-semibold text-text-secondary hover:text-text-primary hover:border-border-default transition-colors">
                跑同款 Pipeline
              </Link>
            </div>
          </div>
          <div className="p-5 md:p-6 bg-bg-root/35">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">POC Snapshot</div>
            <div className="grid grid-cols-2 gap-3">
              {detail.metrics.map(metric => (
                <Metric key={metric.label} label={metric.label} value={metric.value} />
              ))}
            </div>
            <div className="mt-4 border border-accent/30 rounded-md bg-accent/10 p-4">
              <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-2">合同动作</div>
              <p className="text-[13px] text-text-primary leading-relaxed">{detail.review.contractAction}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-6">
        <div className="border border-border-subtle rounded-md bg-bg-surface p-5">
          <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-3">真实场景</div>
          <p className="text-[14px] text-text-primary leading-relaxed text-pretty">{detail.scenario}</p>
          <div className="mt-5 border border-border-subtle rounded-md bg-bg-root/35 p-4">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">承接流水线</div>
            <Link href={detail.pipelineHref} className="text-[13px] text-accent hover:text-accent-hover transition-colors">
              {detail.pipelineLabel} →
            </Link>
          </div>
        </div>

        <div className="border border-border-subtle rounded-md bg-bg-surface p-5">
          <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-3">输入要求</div>
          <ul className="space-y-2">
            {detail.inputs.map(item => (
              <li key={item} className="text-[13px] text-text-secondary leading-relaxed border-b border-border-subtle last:border-b-0 pb-2 last:pb-0">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-6 border border-border-subtle rounded-md bg-bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border-subtle flex items-end justify-between gap-3 flex-wrap">
          <div>
            <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-2">Before / After</div>
            <h2 className="text-[18px] font-semibold text-text-primary font-[family-name:var(--font-outfit)]">从散活到可复核交付</h2>
          </div>
          <div className="text-[10px] font-mono text-text-tertiary">{detail.category}</div>
        </div>
        <div className="divide-y divide-border-subtle">
          {detail.beforeAfter.map(row => (
            <div key={row.label} className="grid grid-cols-1 md:grid-cols-[160px_1fr_1fr] gap-0">
              <div className="p-4 bg-bg-root/25 text-[11px] font-mono text-accent uppercase tracking-wider border-b md:border-b-0 md:border-r border-border-subtle">
                {row.label}
              </div>
              <div className="p-4 border-b md:border-b-0 md:border-r border-border-subtle">
                <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">Before</div>
                <p className="text-[12px] text-text-secondary leading-relaxed">{row.before}</p>
              </div>
              <div className="p-4">
                <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-1">After</div>
                <p className="text-[12px] text-text-primary leading-relaxed">{row.after}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="交付目录" eyebrow="Deliverables">
          <ul className="space-y-2">
            {detail.deliverables.map(item => (
              <li key={item} className="flex items-start justify-between gap-3 border-b border-border-subtle last:border-b-0 pb-2 last:pb-0">
                <span className="text-[13px] text-text-primary leading-relaxed">{item}</span>
                <span className="text-[10px] font-mono text-accent shrink-0">POC</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="产出样例" eyebrow="Sample Output">
          <div className="space-y-3">
            {detail.samples.map(item => (
              <div key={item.label} className="border border-border-subtle rounded-md bg-bg-root/35 p-3">
                <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-1">{item.label}</div>
                <p className="text-[12px] text-text-secondary leading-relaxed whitespace-pre-line">{item.body}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6">
        <Panel title="验收复盘" eyebrow="Review">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <Metric label="验收分" value={detail.review.acceptanceScore} />
            <Metric label="决策" value={detail.review.decision} />
            <Metric label="下一步" value={detail.review.nextStep} />
          </div>
          <p className="text-[13px] text-text-secondary leading-relaxed">{detail.review.readiness}</p>
        </Panel>

        <Panel title="风险边界" eyebrow="Guardrails">
          <ul className="space-y-2">
            {detail.risks.map(item => (
              <li key={item} className="text-[12px] text-text-secondary leading-relaxed border-b border-border-subtle last:border-b-0 pb-2 last:pb-0">
                {item}
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <section className="mt-6 border border-border-subtle rounded-md bg-bg-surface p-5">
        <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-4">标准闭环</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {detail.timeline.map(step => (
            <div key={step.label} className="border border-border-subtle rounded-md bg-bg-root/35 p-4">
              <div className="text-[10px] font-mono text-accent mb-2">{step.label}</div>
              <p className="text-[12px] text-text-secondary leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 border border-accent/30 rounded-md bg-accent/10 p-5 md:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-2">Next Step</div>
          <h2 className="text-[18px] font-semibold text-text-primary font-[family-name:var(--font-outfit)]">把你的 SKU 跑成同样的验收包</h2>
          <p className="mt-2 text-[12px] text-text-secondary leading-relaxed">
            先生成标准包, 再进流水线交付, 最后用复盘分决定扩 SKU 还是推进合同。
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={detail.standardPackHref} className="inline-flex items-center justify-center rounded-md border border-border-default px-5 py-2.5 text-[13px] font-semibold text-text-primary hover:border-accent hover:text-accent transition-colors">
            生成标准包
          </Link>
          <Link href={inquireHref} className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-[13px] font-semibold text-bg-root hover:bg-accent-hover transition-colors">
            提交 POC 需求
          </Link>
        </div>
      </section>
    </div>
  );
}

function Panel({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-border-subtle rounded-md bg-bg-surface p-5">
      <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-2">{eyebrow}</div>
      <h2 className="text-[18px] font-semibold text-text-primary font-[family-name:var(--font-outfit)] mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border-subtle rounded-md bg-bg-root/45 p-3">
      <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider mb-1">{label}</div>
      <div className="text-[12px] text-text-primary leading-relaxed tabular-nums">{value}</div>
    </div>
  );
}
