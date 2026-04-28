import { COPY } from '@/i18n/zh';
import { Container, Section, PrimaryButton } from './Container';

/**
 * 合规 section · 6 平台 + 三列功能 + CTA
 */
export function ComplianceStrip() {
  return (
    <Section>
      <Container>
        <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-outfit)] text-text-primary text-center mb-3">
          {COPY.compliance.title}
        </h2>
        <p className="text-text-secondary text-center mb-10">
          {COPY.compliance.subtitle}
        </p>

        {/* 6 平台 */}
        <div className="flex flex-wrap justify-center gap-3 mb-14">
          {COPY.compliance.platforms.map((p) => (
            <span
              key={p.name}
              style={{ color: p.color }}
              className="inline-flex items-center px-4 py-2 rounded-md bg-bg-surface border border-border-default text-sm font-medium"
            >
              {p.name}
            </span>
          ))}
        </div>

        {/* 三列说明 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {COPY.compliance.features.map((f, i) => (
            <div
              key={i}
              className="bg-bg-surface border border-border-default rounded-lg p-5"
            >
              <div className="font-mono tabular-nums text-3xl text-accent mb-3">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="font-bold text-text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <PrimaryButton href={COPY.compliance.ctaHref}>
            {COPY.compliance.cta}
          </PrimaryButton>
        </div>
      </Container>
    </Section>
  );
}
