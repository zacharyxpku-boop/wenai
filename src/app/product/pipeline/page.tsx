import type { Metadata } from 'next';
import { COPY } from '@/i18n/zh';
import { Container, Section, PrimaryButton, SecondaryButton } from '@/components/marketing/Container';
import TopNav from '@/components/marketing/TopNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata: Metadata = {
  title: 'SKU launch pipeline | wenai',
  description:
    'A full ecommerce delivery line from SKU intake to Brand IQ, listing copy, content brief, compliance review, report, and CRM next action.',
};

export default function PipelinePage() {
  const data = COPY.productPipeline;
  const flowSteps = data.flow.split('->').map((step) => step.trim());

  return (
    <>
      <TopNav />
      <main className="bg-bg-root text-text-primary">
        <Section spacing="loose">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl font-[family-name:var(--font-outfit)]">
                {data.hero.h1}
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-text-secondary">{data.hero.h2}</p>
              <div className="mt-8">
                <PrimaryButton size="lg" href="/demo">Run demo SKU</PrimaryButton>
              </div>
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle">
          <Container>
            <h2 className="mb-10 text-center text-2xl font-bold md:text-3xl font-[family-name:var(--font-outfit)]">
              Complete operating line
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              {flowSteps.map((step, index) => (
                <div key={step} className="rounded-md border border-border-subtle bg-bg-surface p-4">
                  <div className="mb-1 font-mono text-xs text-text-tertiary">0{index + 1}</div>
                  <div className="text-sm font-bold leading-tight text-text-primary">{step}</div>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="text-center">
              <p className="mb-6 text-lg text-text-secondary">
                Replace scattered manual handoffs with one reviewable SKU delivery motion.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <PrimaryButton size="lg" href="/demo">Run demo SKU</PrimaryButton>
                <SecondaryButton size="lg" href="/pricing">View plans</SecondaryButton>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <MarketingFooter />
    </>
  );
}
