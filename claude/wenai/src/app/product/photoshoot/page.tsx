import type { Metadata } from 'next';
import { COPY, PLACEHOLDER } from '@/i18n/zh';
import {
  Container,
  Section,
  PrimaryButton,
} from '@/components/marketing/Container';
import TopNav from '@/components/marketing/TopNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata: Metadata = {
  title: 'AI 影棚 · 一晚出 200 SKU 主图 · wenai',
  description: '8 套场景模式 · 模特、白底、生活、节日、汽摩、数码、家居、美妆',
};

export default function PhotoshootPage() {
  const data = COPY.productPhotoshoot;
  const homeCase = PLACEHOLDER.cases[0];

  return (
    <>
      <TopNav />

      {/* 1 · Hero */}
      <Section spacing="loose">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-outfit)] text-text-primary">
                {data.hero.h1}
              </h1>
              <p className="mt-6 text-lg text-text-secondary leading-relaxed max-w-xl">
                {data.hero.h2}
              </p>
              <div className="mt-8">
                <PrimaryButton size="lg" href={data.hero.ctaHref}>
                  {data.hero.cta}
                </PrimaryButton>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => {
                const slug = `0${i + 1}`;
                const labels = ['模特', '白底', '生活', '节日', '汽摩', '数码', '家居', '美妆'];
                return (
                  <div
                    key={i}
                    className="aspect-square rounded-md bg-bg-surface border border-border-subtle overflow-hidden relative group"
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-xs text-text-tertiary font-mono z-0">
                      {slug}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/seed/photoshoot-mode-${slug}.jpg`}
                      alt={`${labels[i]}场景`}
                      className="absolute inset-0 w-full h-full object-cover z-10"
                      loading="lazy"
                    />
                    <span className="absolute bottom-1 left-1.5 right-1.5 text-[10px] font-mono text-white/95 bg-black/40 backdrop-blur-sm rounded-sm px-1.5 py-0.5 z-20 leading-none flex items-center justify-between">
                      <span>{slug}</span>
                      <span>{labels[i]}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </Section>

      {/* 2 · 8 模式 */}
      <Section className="border-t border-border-subtle">
        <Container>
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)] mb-10">
            {data.modesTitle}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.modes.map((m) => (
              <div
                key={m.title}
                className="bg-bg-surface border border-border-subtle rounded-lg p-5 hover:border-border-default transition-colors"
              >
                <div className="font-bold text-text-primary mb-2">{m.title}</div>
                <div className="text-text-secondary text-sm leading-relaxed">
                  {m.desc}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 3 · 工作流 */}
      <Section className="border-t border-border-subtle">
        <Container>
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)] mb-10">
            {data.workflow.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 md:gap-2 items-stretch">
            {data.workflow.steps.map((step, i) => (
              <div key={step.label} className="contents">
                <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col">
                  <div className="text-xs text-text-tertiary font-mono uppercase tracking-wider mb-2">
                    Step {i + 1}
                  </div>
                  <div className="text-lg font-bold text-text-primary mb-2">
                    {step.label}
                  </div>
                  <div className="text-sm text-text-secondary leading-relaxed">
                    {step.desc}
                  </div>
                </div>
                {i < data.workflow.steps.length - 1 && (
                  <div className="flex items-center justify-center text-2xl text-text-tertiary md:rotate-0 rotate-90 py-2 md:py-0">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 4 · 客户案例 */}
      <Section className="border-t border-border-subtle">
        <Container>
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)] mb-10">
            客户案例 · {homeCase.industry}
          </h2>
          <div className="bg-bg-surface border border-border-subtle rounded-lg p-8">
            <div className="text-text-tertiary text-xs uppercase tracking-[0.2em] mb-3">
              {homeCase.brandPlaceholder}
            </div>
            <div className="text-xl md:text-2xl font-bold text-text-primary mb-8 leading-relaxed">
              {homeCase.headline}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {homeCase.metrics.map((m) => (
                <div
                  key={m.label}
                  className="bg-bg-raised border border-border-subtle rounded-md p-4"
                >
                  <div className="text-xs text-text-tertiary mb-2">{m.label}</div>
                  <div className="text-sm text-text-secondary">
                    {m.from} → <span className="text-text-primary font-bold">{m.to}</span>
                  </div>
                  {m.multiple && (
                    <div className="text-accent font-bold mt-2 text-sm">
                      {m.multiple}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* 5 · 价格简版 */}
      <Section className="border-t border-border-subtle" spacing="tight">
        <Container>
          <div className="text-center">
            <p className="text-lg text-text-secondary mb-6">
              试用免费跑 3 个 SKU · Team 版 ¥499/月起 · Enterprise 面议
            </p>
            <PrimaryButton size="lg" href="/pricing">
              看完整定价
            </PrimaryButton>
          </div>
        </Container>
      </Section>

      {/* 6 · FAQ */}
      <Section className="border-t border-border-subtle">
        <Container>
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)] mb-10">
            常见问题
          </h2>
          <div className="space-y-6 max-w-3xl">
            {data.faq.map((item) => (
              <div
                key={item.q}
                className="border-b border-border-subtle pb-6 last:border-b-0"
              >
                <div className="font-bold text-text-primary mb-3">Q · {item.q}</div>
                <div className="text-text-secondary leading-relaxed">{item.a}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <MarketingFooter />
    </>
  );
}
