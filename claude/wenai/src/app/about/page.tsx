import type { Metadata } from 'next';
import { COPY, PLACEHOLDER } from '@/i18n/zh';
import {
  Container,
  Section,
} from '@/components/marketing/Container';
import TopNav from '@/components/marketing/TopNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata: Metadata = {
  title: '关于 wenai · 让中国跨境品牌用 1/50 成本做出顶级内容',
  description: 'wenai 创始人故事、团队、客户、加入我们',
};

export default function AboutPage() {
  const founder = PLACEHOLDER.founder;
  const team = PLACEHOLDER.team;
  const testimonials = PLACEHOLDER.testimonials;

  return (
    <>
      <TopNav />

      {/* Section 1 · 使命 */}
      <Section spacing="loose">
        <Container>
          <div className="text-center">
            <div className="text-text-tertiary text-xs uppercase tracking-[0.2em] mb-6">
              Our Mission
            </div>
            <p className="text-3xl md:text-4xl font-medium leading-relaxed max-w-[800px] mx-auto text-text-primary">
              {COPY.about.mission}
            </p>
          </div>
        </Container>
      </Section>

      {/* Section 2 · 创始人 */}
      <Section className="border-t border-border-subtle">
        <Container>
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)] mb-10">
            {COPY.about.sections.founder}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 items-start">
            <div className="flex md:block">
              <div className="rounded-lg aspect-square w-full max-w-[300px] bg-gradient-to-br from-bg-surface to-bg-raised flex items-center justify-center">
                <span className="text-7xl font-bold text-accent font-[family-name:var(--font-outfit)]">
                  {founder.namePlaceholder.charAt(0)}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-text-primary">
                {founder.namePlaceholder}
              </div>
              <div className="text-text-secondary mt-1 mb-5">
                {founder.titlePlaceholder}
              </div>
              <p className="text-base leading-relaxed text-text-primary whitespace-pre-line">
                {founder.storyPlaceholder}
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Section 3 · 团队 */}
      <div id="team" />
      <Section className="border-t border-border-subtle">
        <Container>
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)] mb-10">
            {COPY.about.sections.team}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {team.map((m) => (
              <div
                key={m.namePlaceholder}
                className="flex flex-col items-center text-center p-6 rounded-lg bg-bg-surface border border-border-subtle"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-bg-raised to-bg-surface flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-accent font-[family-name:var(--font-outfit)]">
                    {m.initial}
                  </span>
                </div>
                <div className="font-bold text-text-primary">{m.namePlaceholder}</div>
                <div className="text-text-secondary text-sm mt-1">{m.role}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Section 4 · 客户 */}
      <div id="customers" />
      <Section className="border-t border-border-subtle">
        <Container>
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)] mb-10">
            {COPY.about.sections.customers}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.personPlaceholder}
                className="bg-bg-surface border border-border-subtle rounded-lg p-5 flex flex-col"
              >
                <p className="text-base leading-relaxed text-text-primary flex-1">
                  「{t.quote}」
                </p>
                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border-subtle">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bg-raised to-bg-surface flex items-center justify-center">
                    <span className="text-sm font-bold text-accent">{t.initial}</span>
                  </div>
                  <span className="text-sm text-text-secondary">
                    {t.personPlaceholder}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Section 5 · 招聘 */}
      <div id="careers" />
      <Section className="border-t border-border-subtle">
        <Container>
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)] mb-4">
            {COPY.about.sections.careers}
          </h2>
          <p className="text-text-secondary text-base mb-8 max-w-2xl">
            {COPY.about.careers.desc}
          </p>
          <ul className="border-t border-border-subtle">
            {COPY.about.careers.jobs.map((job) => (
              <li
                key={job.title}
                className="border-b border-border-subtle py-3 flex justify-between items-center gap-4"
              >
                <span className="font-medium text-text-primary">{job.title}</span>
                <span className="text-text-tertiary text-xs font-mono">
                  {job.location}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8 text-sm text-text-secondary">
            投递简历到{' '}
            <a
              href={`mailto:${COPY.about.careers.contact}`}
              className="text-accent font-semibold hover:underline"
            >
              {COPY.about.careers.contact}
            </a>
          </div>
        </Container>
      </Section>

      <MarketingFooter />
    </>
  );
}
