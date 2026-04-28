import { COPY } from '@/i18n/zh';
import { Container, Section, PrimaryButton, SecondaryButton } from './Container';

/**
 * 定价三栏 · compact 控制是否显示完整 features (预留)
 */
export function PricingTiers({ compact = false }: { compact?: boolean }) {
  void compact;
  return (
    <Section>
      <Container>
        <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-outfit)] text-text-primary text-center mb-3">
          {COPY.pricing.title}
        </h2>
        <p className="text-text-secondary text-center mb-12">
          {COPY.pricing.subtitle}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COPY.pricing.tiers.map((tier) => {
            const cardClass = tier.recommended
              ? 'relative bg-bg-surface border-2 border-accent rounded-lg p-6 flex flex-col'
              : 'relative bg-bg-surface border border-border-default rounded-lg p-6 flex flex-col';
            return (
              <div key={tier.id} className={cardClass}>
                {tier.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-accent text-bg-root">
                    推荐
                  </span>
                )}

                <div className="mb-5">
                  <h3 className="text-lg font-bold text-text-primary mb-2">
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-mono tabular-nums text-accent font-bold">
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="text-text-tertiary text-sm">
                        {tier.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="flex flex-col gap-2 mb-6 flex-1">
                  {tier.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-text-secondary"
                    >
                      <span
                        aria-hidden
                        className="text-accent mt-0.5 shrink-0"
                      >
                        ✓
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div>
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
              </div>
            );
          })}
        </div>

        <p className="text-center mt-10 text-sm">
          <a
            href="#faq"
            className="text-text-tertiary hover:text-accent transition-colors"
          >
            {COPY.pricing.faqLink}
          </a>
        </p>
      </Container>
    </Section>
  );
}
