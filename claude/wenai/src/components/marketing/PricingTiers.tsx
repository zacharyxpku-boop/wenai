import { COPY } from '@/i18n/zh';
import { Container, Section, PrimaryButton, SecondaryButton } from './Container';

export function PricingTiers({ compact = false }: { compact?: boolean }) {
  void compact;

  return (
    <Section>
      <Container>
        <h2 className="mb-3 text-center text-3xl font-bold text-text-primary md:text-4xl font-[family-name:var(--font-outfit)]">
          {COPY.pricing.title}
        </h2>
        <p className="mb-12 text-center text-text-secondary">{COPY.pricing.subtitle}</p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {COPY.pricing.tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col rounded-md p-6 ${
                tier.recommended
                  ? 'border-2 border-accent bg-bg-surface'
                  : 'border border-border-default bg-bg-surface'
              }`}
            >
              {tier.recommended && (
                <span className="absolute top-0 left-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center rounded-md bg-accent px-3 py-1 text-xs font-semibold text-bg-root">
                  Recommended
                </span>
              )}

              <div className="mb-5">
                <h3 className="mb-2 text-lg font-bold text-text-primary">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-bold text-accent tabular-nums">{tier.price}</span>
                  {tier.period && <span className="text-sm text-text-tertiary">{tier.period}</span>}
                </div>
              </div>

              <ul className="mb-6 flex flex-1 flex-col gap-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span aria-hidden className="mt-0.5 shrink-0 text-accent">+</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {tier.recommended ? (
                <PrimaryButton href={tier.ctaHref} className="w-full justify-center">
                  {tier.cta}
                </PrimaryButton>
              ) : (
                <SecondaryButton href={tier.ctaHref} className="w-full justify-center">
                  {tier.cta}
                </SecondaryButton>
              )}
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm">
          <a href="/poc" className="text-text-tertiary transition-colors hover:text-accent">
            View the full POC checklist and acceptance bar -&gt;
          </a>
        </p>
      </Container>
    </Section>
  );
}
