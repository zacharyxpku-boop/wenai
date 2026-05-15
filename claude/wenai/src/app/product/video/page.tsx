import type { Metadata } from 'next';
import { COPY } from '@/i18n/zh';
import { Container, Section, PrimaryButton, SecondaryButton } from '@/components/marketing/Container';
import TopNav from '@/components/marketing/TopNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata: Metadata = {
  title: '短视频 Brief | wenai',
  description:
    '把电商 SKU 卖点和 benchmark 转成 TikTok、Reels 和轮播 brief，方便内容测试和人工复核。',
};

export default function VideoPage() {
  const data = COPY.productVideo;

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
              <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-text-secondary">{data.hero.h2}</p>
              <div className="mt-8">
                <PrimaryButton size="lg" href="/demo">运行演示 SKU</PrimaryButton>
              </div>
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle">
          <Container>
            <h2 className="mb-10 text-center text-2xl font-bold md:text-3xl font-[family-name:var(--font-outfit)]">
              {data.modesTitle}
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {data.modes.map((mode, index) => (
                <div key={mode.title} className="flex flex-col rounded-md border border-border-subtle bg-bg-surface p-6">
                  <div className="mb-5 flex aspect-video items-center justify-center rounded-md border border-border-subtle bg-bg-raised">
                    <span className="font-mono text-sm text-text-tertiary">方案 0{index + 1}</span>
                  </div>
                  <div className="mb-2 text-lg font-bold text-text-primary">{mode.title}</div>
                  <div className="text-sm leading-relaxed text-text-secondary">{mode.desc}</div>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="text-center">
              <p className="mb-6 text-lg text-text-secondary">
                想要完整上新链路：图片方向、视频 brief、详情页文案、客服话术和复盘报告？
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <PrimaryButton size="lg" href="/pricing">View plans</PrimaryButton>
              <SecondaryButton size="lg" href="/product/pipeline">打开完整流程</SecondaryButton>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <MarketingFooter />
    </>
  );
}
