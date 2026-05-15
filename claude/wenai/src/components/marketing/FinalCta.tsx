import { COPY } from '@/i18n/zh';
import { Container, Section, PrimaryButton, SecondaryButton } from './Container';

export function FinalCta() {
  return (
    <Section spacing="loose">
      <Container className="max-w-[900px]">
        <div className="rounded-md border border-accent/30 bg-bg-surface p-8 text-center lg:p-12">
          <h2 className="mb-4 text-balance text-3xl font-bold font-[family-name:var(--font-outfit)] text-text-primary md:text-5xl">
            {COPY.finalCta.h2}
          </h2>
          <p className="mb-8 text-pretty text-base leading-relaxed text-text-secondary md:text-lg">
            {COPY.finalCta.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
            <PrimaryButton size="lg" href={COPY.finalCta.primaryCtaHref}>
              {COPY.finalCta.primaryCta}
            </PrimaryButton>
            <SecondaryButton size="lg" href={COPY.finalCta.secondaryCtaHref}>
              {COPY.finalCta.secondaryCta}
            </SecondaryButton>
          </div>

          <p className="text-xs text-text-tertiary">
            {COPY.finalCta.note}
          </p>
        </div>
      </Container>
    </Section>
  );
}
