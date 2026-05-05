import { COPY, PLACEHOLDER } from '@/i18n/zh';
import { Container, Section, SecondaryButton } from './Container';

export function CaseCards() {
  return (
    <Section>
      <Container>
        <div id="cases" className="scroll-mt-20" />

        <h2 className="mb-12 text-center text-3xl font-bold text-text-primary md:text-4xl font-[family-name:var(--font-outfit)]">
          {COPY.caseSection.title}
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLACEHOLDER.cases.map((item) => (
            <div
              key={item.slug}
              className="flex flex-col rounded-md border border-border-default bg-bg-surface p-6 transition-colors hover:border-accent/40"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-md border border-border-subtle bg-bg-raised text-base font-medium text-text-secondary font-[family-name:var(--font-outfit)]">
                  {item.industry.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-text-primary">{item.industry}</span>
                  <span className="text-xs text-text-tertiary">{item.brandPlaceholder}</span>
                </div>
              </div>

              <p className="mb-5 text-base font-medium leading-relaxed text-text-primary">&quot;{item.headline}&quot;</p>

              <ul className="mb-5 flex flex-col gap-2 text-xs">
                {item.metrics.map((metric) => (
                  <li
                    key={`${metric.label}-${metric.to}`}
                    className="flex items-center justify-between gap-2 border-b border-border-subtle py-1 last:border-0"
                  >
                    <span className="shrink-0 text-text-tertiary">{metric.label}</span>
                    <span className="font-mono text-text-secondary tabular-nums">
                      {metric.from} -&gt; {metric.to}
                    </span>
                    {metric.multiple ? (
                      <span className="w-10 shrink-0 text-right font-mono text-accent tabular-nums">
                        {metric.multiple}
                      </span>
                    ) : (
                      <span className="w-10" />
                    )}
                  </li>
                ))}
              </ul>

              <a href={`/cases/${item.slug}`} className="mt-auto text-sm text-accent transition-colors hover:text-accent-hover">
                {COPY.caseSection.fullCaseLink} -&gt;
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <SecondaryButton href={COPY.caseSection.moreLink.href}>
            {COPY.caseSection.moreLink.label}
          </SecondaryButton>
        </div>
      </Container>
    </Section>
  );
}
