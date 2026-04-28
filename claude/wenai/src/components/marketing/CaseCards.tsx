import { COPY, PLACEHOLDER } from '@/i18n/zh';
import { Container, Section, SecondaryButton } from './Container';

/**
 * 3 家客户案例卡片 section
 * id="cases" 供 Hero 次 CTA #cases 锚定
 */
export function CaseCards() {
  return (
    <Section>
      <Container>
        <div id="cases" className="scroll-mt-20" />

        <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-outfit)] text-text-primary text-center mb-12">
          {COPY.caseSection.title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLACEHOLDER.cases.map((c) => (
            <div
              key={c.slug}
              className="bg-bg-surface border border-border-default rounded-lg p-6 hover:border-accent/40 transition-colors flex flex-col"
            >
              {/* logo + 行业 + 公司 */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-bg-raised border border-border-subtle flex items-center justify-center text-text-secondary text-base font-medium font-[family-name:var(--font-outfit)]">
                  {c.industry.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-text-primary font-medium">
                    {c.industry}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    {c.brandPlaceholder}
                  </span>
                </div>
              </div>

              {/* headline */}
              <p className="text-base font-medium text-text-primary leading-relaxed mb-5">
                「{c.headline}」
              </p>

              {/* metrics 表格 */}
              <ul className="flex flex-col gap-2 text-xs mb-5">
                {c.metrics.map((m, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2 py-1 border-b border-border-subtle last:border-0"
                  >
                    <span className="text-text-tertiary shrink-0">
                      {m.label}
                    </span>
                    <span className="text-text-secondary font-mono tabular-nums">
                      {m.from} → {m.to}
                    </span>
                    {m.multiple ? (
                      <span className="text-accent font-mono tabular-nums shrink-0 w-10 text-right">
                        {m.multiple}
                      </span>
                    ) : (
                      <span className="w-10" />
                    )}
                  </li>
                ))}
              </ul>

              {/* 看完整复盘 */}
              <a
                href={`/cases/${c.slug}`}
                className="text-sm text-accent hover:text-accent-hover transition-colors mt-auto"
              >
                {COPY.caseSection.fullCaseLink} →
              </a>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <SecondaryButton href={COPY.caseSection.moreLink.href}>
            {COPY.caseSection.moreLink.label}
          </SecondaryButton>
        </div>
      </Container>
    </Section>
  );
}
