import type { Metadata } from 'next';
import { COPY, PLACEHOLDER } from '@/i18n/zh';
import { Container, Section } from '@/components/marketing/Container';
import TopNav from '@/components/marketing/TopNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata: Metadata = {
  title: '关于 | wenai 电商 AI 商业交付系统',
  description:
    'wenai 把 SKU 输入、Brand IQ、内容营销、POC 报告和合同推进变成一条电商交付线。',
};

export default function AboutPage() {
  const founder = PLACEHOLDER.founder;
  const team = PLACEHOLDER.team;
  const testimonials = PLACEHOLDER.testimonials;

  return (
    <>
      <TopNav />

      <main className="bg-bg-root text-text-primary">
        <Section spacing="loose">
          <Container>
            <div className="text-center">
              <div className="mb-6 text-xs text-text-tertiary">我们为什么做 wenai</div>
              <p className="mx-auto max-w-[820px] text-3xl font-medium leading-relaxed text-text-primary md:text-4xl">
                {COPY.about.mission}
              </p>
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle">
          <Container>
            <h2 className="mb-10 text-2xl font-bold md:text-3xl font-[family-name:var(--font-outfit)]">
              {COPY.about.sections.founder}
            </h2>
            <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[1fr_2fr]">
              <div className="rounded-md border border-border-subtle bg-bg-surface p-8">
                <div className="text-7xl font-bold text-accent font-[family-name:var(--font-outfit)]">
                  {founder.namePlaceholder.charAt(0)}
                </div>
                <div className="mt-4 text-xl font-bold text-text-primary">{founder.namePlaceholder}</div>
                <div className="mt-1 text-text-secondary">{founder.titlePlaceholder}</div>
              </div>
              <p className="whitespace-pre-line text-base leading-relaxed text-text-primary">
                {founder.storyPlaceholder}
              </p>
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle">
          <Container>
            <h2 className="mb-10 text-2xl font-bold md:text-3xl font-[family-name:var(--font-outfit)]">
              {COPY.about.sections.team}
            </h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              {team.map((member) => (
                <div
                  key={member.namePlaceholder}
                  className="flex flex-col items-center rounded-md border border-border-subtle bg-bg-surface p-6 text-center"
                >
                  <div className="mb-4 flex size-20 items-center justify-center rounded-md border border-border-subtle bg-bg-raised text-2xl font-bold text-accent">
                    {member.initial}
                  </div>
                  <div className="font-bold text-text-primary">{member.namePlaceholder}</div>
                  <div className="mt-1 text-sm text-text-secondary">{member.role}</div>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle">
          <Container>
            <h2 className="mb-10 text-2xl font-bold md:text-3xl font-[family-name:var(--font-outfit)]">
              {COPY.about.sections.customers}
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {testimonials.map((item) => (
                <div key={item.personPlaceholder} className="flex flex-col rounded-md border border-border-subtle bg-bg-surface p-5">
                  <p className="flex-1 text-base leading-relaxed text-text-primary">&quot;{item.quote}&quot;</p>
                  <div className="mt-5 flex items-center gap-3 border-t border-border-subtle pt-4">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-bg-raised text-sm font-bold text-accent">
                      {item.initial}
                    </div>
                    <span className="text-sm text-text-secondary">{item.personPlaceholder}</span>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle">
          <Container>
            <h2 className="mb-4 text-2xl font-bold md:text-3xl font-[family-name:var(--font-outfit)]">
              {COPY.about.sections.careers}
            </h2>
            <p className="mb-8 max-w-2xl text-base text-text-secondary">{COPY.about.careers.desc}</p>
            <ul className="border-t border-border-subtle">
              {COPY.about.careers.jobs.map((job) => (
                <li key={job.title} className="flex items-center justify-between gap-4 border-b border-border-subtle py-3">
                  <span className="font-medium text-text-primary">{job.title}</span>
                  <span className="font-mono text-xs text-text-tertiary">{job.location}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 text-sm text-text-secondary">
              联系我们：{' '}
              <a href={`mailto:${COPY.about.careers.contact}`} className="font-semibold text-accent hover:underline">
                {COPY.about.careers.contact}
              </a>
            </div>
          </Container>
        </Section>
      </main>

      <MarketingFooter />
    </>
  );
}
