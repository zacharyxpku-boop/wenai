import { COPY } from '@/i18n/zh';
import { Container, Section, PrimaryButton, SecondaryButton } from './Container';

/**
 * 末尾 CTA 卡片 · 渐变背景 + 大标题 + 双 CTA
 */
export function FinalCta() {
  return (
    <Section spacing="loose">
      <Container className="max-w-[900px]">
        <div className="bg-gradient-to-br from-bg-surface to-bg-raised border border-accent/30 rounded-xl p-10 lg:p-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-outfit)] text-text-primary mb-4">
            {COPY.finalCta.h2}
          </h2>
          <p className="text-lg text-text-secondary mb-8">
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
