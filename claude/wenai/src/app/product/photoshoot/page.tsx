import type { Metadata } from 'next';
import { COPY, PLACEHOLDER } from '@/i18n/zh';
import { Container, Section, PrimaryButton } from '@/components/marketing/Container';
import TopNav from '@/components/marketing/TopNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata: Metadata = {
  title: 'AI product photo directions | wenai',
  description:
    'Generate scene directions, prompt-ready visual plans, and review notes for ecommerce SKU launch packs.',
};

export default function PhotoshootPage() {
  const data = COPY.productPhotoshoot;
  const homeCase = PLACEHOLDER.cases[0];

  return (
    <>
      <TopNav />
      <main className="bg-bg-root text-text-primary">
        <Section spacing="loose">
          <Container>
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl font-[family-name:var(--font-outfit)]">
                  {data.hero.h1}
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">{data.hero.h2}</p>
                <div className="mt-8">
                  <PrimaryButton size="lg" href={data.hero.ctaHref}>{data.hero.cta}</PrimaryButton>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {data.modes.map((mode, index) => (
                  <div
                    key={mode.title}
                    className="flex aspect-square items-center justify-center rounded-md border border-border-subtle bg-bg-surface p-2 text-center"
                  >
                    <span className="font-mono text-[10px] text-text-tertiary">
                      {String(index + 1).padStart(2, '0')} {mode.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle">
          <Container>
            <h2 className="mb-10 text-2xl font-bold md:text-3xl font-[family-name:var(--font-outfit)]">
              {data.modesTitle}
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {data.modes.map((mode) => (
                <div key={mode.title} className="rounded-md border border-border-subtle bg-bg-surface p-5">
                  <div className="mb-2 font-bold text-text-primary">{mode.title}</div>
                  <div className="text-sm leading-relaxed text-text-secondary">{mode.desc}</div>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle">
          <Container>
            <h2 className="mb-10 text-2xl font-bold md:text-3xl font-[family-name:var(--font-outfit)]">
              {data.workflow.title}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {data.workflow.steps.map((step, index) => (
                <div key={step.label} className="rounded-md border border-border-subtle bg-bg-surface p-6">
                  <div className="mb-2 font-mono text-xs uppercase tracking-wider text-text-tertiary">
                    Step {index + 1}
                  </div>
                  <div className="mb-2 text-lg font-bold text-text-primary">{step.label}</div>
                  <div className="text-sm leading-relaxed text-text-secondary">{step.desc}</div>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle">
          <Container>
            <h2 className="mb-10 text-2xl font-bold md:text-3xl font-[family-name:var(--font-outfit)]">
              Sample case / {homeCase.industry}
            </h2>
            <div className="rounded-md border border-border-subtle bg-bg-surface p-8">
              <div className="mb-3 text-xs uppercase tracking-[0.2em] text-text-tertiary">
                {homeCase.brandPlaceholder}
              </div>
              <div className="mb-8 text-xl font-bold leading-relaxed text-text-primary md:text-2xl">
                {homeCase.headline}
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {homeCase.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-md border border-border-subtle bg-bg-raised p-4">
                    <div className="mb-2 text-xs text-text-tertiary">{metric.label}</div>
                    <div className="text-sm text-text-secondary">
                      {metric.from} -&gt; <span className="font-bold text-text-primary">{metric.to}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="text-center">
              <p className="mb-6 text-lg text-text-secondary">
                Start with a sample output, then move real 10 SKU POC work into the main contract flow.
              </p>
              <PrimaryButton size="lg" href="/demo">Run demo SKU</PrimaryButton>
            </div>
          </Container>
        </Section>
      </main>
      <MarketingFooter />
    </>
  );
}
