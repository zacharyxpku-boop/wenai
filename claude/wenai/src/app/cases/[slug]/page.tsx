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

export async function generateMetadata({
  params,
}: CaseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = getCaseStudyDetail(slug);

  if (!detail) {
    return {
      title: '案例不存在 · Wenai',
    };
  }

  return {
    title: `${detail.title} · Wenai 交付样例`,
    description: detail.summary,
  };
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { slug } = await params;
  const detail = getCaseStudyDetail(slug);

  if (!detail) notFound();

  const inquireHref = `/inquire?from=case-${detail.slug}&skuCount=10&platform=${encodeURIComponent(detail.segment)}`;

  return (
    <main className="max-w-[1180px] mx-auto px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/cases"
          className="text-[12px] font-semibold text-text-tertiary hover:text-accent transition-colors"
        >
          返回交付样例
        </Link>
        <div className="text-[10px] font-mono text-accent uppercase tracking-wider">
          {detail.proofLevel}
        </div>
      </div>

      <header className="overflow-hidden rounded-md border border-border-subtle bg-bg-surface">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-border-subtle p-5 md:p-8 lg:border-b-0 lg:border-r">
            <div className="mb-3 text-[10px] font-mono text-accent uppercase tracking-wider">
              {detail.segment}
            </div>
            <h1 className="text-[26px] leading-tight md:text-[36px] md:leading-[1.08] font-semibold text-text-primary font-[family-name:var(--font-outfit)] text-balance">
              {detail.title}
            </h1>
            <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-text-secondary text-pretty">
              {detail.summary}
            </p>
            <p className="mt-5 text-[12px] leading-relaxed text-text-tertiary text-pretty">
              {detail.disclaimer}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={inquireHref}
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-[13px] font-semibold text-bg-root hover:bg-accent-hover transition-colors"
              >
                提交同类试跑
              </Link>
              <Link
                href={detail.standardPackHref}
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-default px-5 py-2.5 text-[13px] font-semibold text-text-primary hover:border-accent hover:text-accent transition-colors"
              >
                生成标准交付包
              </Link>
              <Link
                href={detail.pipelineHref}
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-subtle px-5 py-2.5 text-[13px] font-semibold text-text-secondary hover:border-border-default hover:text-text-primary transition-colors"
              >
                跑同款流程
              </Link>
            </div>
          </div>
          <div className="bg-bg-root/35 p-5 md:p-6">
            <div className="mb-3 text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
              试跑快照
            </div>
            <div className="grid grid-cols-2 gap-3">
              {detail.metrics.map(metric => (
                <Metric key={metric.label} label={metric.label} value={metric.value} />
              ))}
            </div>
            <div className="mt-4 rounded-md border border-accent/30 bg-accent/10 p-4">
              <div className="mb-2 text-[10px] font-mono text-accent uppercase tracking-wider">
                商务推进动作
              </div>
              <p className="text-[13px] leading-relaxed text-text-primary">
                {detail.review.contractAction}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Panel title="真实业务场景" eyebrow="场景">
          <p className="text-[14px] leading-relaxed text-text-primary text-pretty">
            {detail.scenario}
          </p>
          <div className="mt-5 rounded-md border border-border-subtle bg-bg-root/35 p-4">
            <div className="mb-2 text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
              承接流程
            </div>
            <Link
              href={detail.pipelineHref}
              className="text-[13px] font-semibold text-accent hover:text-accent-hover transition-colors"
            >
              {detail.pipelineLabel}
            </Link>
          </div>
        </Panel>

        <Panel title="客户需要提供什么" eyebrow="输入">
          <ul className="space-y-2">
            {detail.inputs.map(item => (
              <li
                key={item}
                className="border-b border-border-subtle pb-2 text-[13px] leading-relaxed text-text-secondary last:border-b-0 last:pb-0"
              >
                {item}
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <section className="mt-6 overflow-hidden rounded-md border border-border-subtle bg-bg-surface">
        <div className="flex flex-col gap-2 border-b border-border-subtle px-5 py-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 text-[10px] font-mono text-accent uppercase tracking-wider">
              改造前后
            </div>
            <h2 className="text-[18px] font-semibold text-text-primary font-[family-name:var(--font-outfit)]">
              从散乱执行到可复核交付
            </h2>
          </div>
          <div className="text-[10px] font-mono text-text-tertiary">{detail.category}</div>
        </div>
        <div className="divide-y divide-border-subtle">
          {detail.beforeAfter.map(row => (
            <div key={row.label} className="grid grid-cols-1 md:grid-cols-[150px_1fr_1fr]">
              <div className="border-b border-border-subtle bg-bg-root/25 p-4 text-[11px] font-mono text-accent uppercase tracking-wider md:border-b-0 md:border-r">
                {row.label}
              </div>
              <div className="border-b border-border-subtle p-4 md:border-b-0 md:border-r">
                <div className="mb-1 text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                  改造前
                </div>
                <p className="text-[12px] leading-relaxed text-text-secondary">{row.before}</p>
              </div>
              <div className="p-4">
                <div className="mb-1 text-[10px] font-mono text-accent uppercase tracking-wider">
                  改造后
                </div>
                <p className="text-[12px] leading-relaxed text-text-primary">{row.after}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="交付目录" eyebrow="客户会拿到什么">
          <ul className="space-y-2">
            {detail.deliverables.map(item => (
              <li
                key={item}
                className="flex items-start justify-between gap-3 border-b border-border-subtle pb-2 last:border-b-0 last:pb-0"
              >
                <span className="text-[13px] leading-relaxed text-text-primary">{item}</span>
                <span className="shrink-0 text-[10px] font-mono text-accent">试跑</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="产出样例" eyebrow="样例">
          <div className="space-y-3">
            {detail.samples.map(item => (
              <div key={item.label} className="rounded-md border border-border-subtle bg-bg-root/35 p-3">
                <div className="mb-1 text-[10px] font-mono text-accent uppercase tracking-wider">
                  {item.label}
                </div>
                <p className="whitespace-pre-line text-[12px] leading-relaxed text-text-secondary">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Panel title="验收复盘" eyebrow="是否值得继续">
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Metric label="验收分" value={detail.review.acceptanceScore} />
            <Metric label="决策" value={detail.review.decision} />
            <Metric label="下一步" value={detail.review.nextStep} />
          </div>
          <p className="text-[13px] leading-relaxed text-text-secondary">
            {detail.review.readiness}
          </p>
        </Panel>

        <Panel title="风险边界" eyebrow="不上头">
          <ul className="space-y-2">
            {detail.risks.map(item => (
              <li
                key={item}
                className="border-b border-border-subtle pb-2 text-[12px] leading-relaxed text-text-secondary last:border-b-0 last:pb-0"
              >
                {item}
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <section className="mt-6 rounded-md border border-border-subtle bg-bg-surface p-5">
        <div className="mb-4 text-[10px] font-mono text-accent uppercase tracking-wider">
          标准闭环
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {detail.timeline.map(step => (
            <div key={step.label} className="rounded-md border border-border-subtle bg-bg-root/35 p-4">
              <div className="mb-2 text-[10px] font-mono text-accent">{step.label}</div>
              <p className="text-[12px] leading-relaxed text-text-secondary">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 flex flex-col gap-4 rounded-md border border-accent/30 bg-accent/10 p-5 md:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 text-[10px] font-mono text-accent uppercase tracking-wider">
            下一步
          </div>
          <h2 className="text-[18px] font-semibold text-text-primary font-[family-name:var(--font-outfit)]">
            把你的 SKU 跑成同样的验收包
          </h2>
          <p className="mt-2 text-[12px] leading-relaxed text-text-secondary">
            先生成标准包, 再进入流程交付, 最后用复盘分决定扩 SKU 还是推进合同。
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={detail.standardPackHref}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-default px-5 py-2.5 text-[13px] font-semibold text-text-primary hover:border-accent hover:text-accent transition-colors"
          >
            生成标准包
          </Link>
          <Link
            href={inquireHref}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-[13px] font-semibold text-bg-root hover:bg-accent-hover transition-colors"
          >
            提交试跑需求
          </Link>
        </div>
      </section>
    </main>
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
    <section className="rounded-md border border-border-subtle bg-bg-surface p-5">
      <div className="mb-2 text-[10px] font-mono text-accent uppercase tracking-wider">
        {eyebrow}
      </div>
      <h2 className="mb-4 text-[18px] font-semibold text-text-primary font-[family-name:var(--font-outfit)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-root/45 p-3">
      <div className="mb-1 text-[9px] font-mono text-text-tertiary uppercase tracking-wider">
        {label}
      </div>
      <div className="text-[12px] leading-relaxed text-text-primary tabular-nums">{value}</div>
    </div>
  );
}
