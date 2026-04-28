import type { Metadata } from 'next';
import { COPY } from '@/i18n/zh';
import {
  Container,
  Section,
  PrimaryButton,
  SecondaryButton,
} from '@/components/marketing/Container';
import TopNav from '@/components/marketing/TopNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata: Metadata = {
  title: 'AI 视频 · 5 秒短视频一晚批量出 · wenai',
  description: '商品图 + 文案 → 5 秒带货短视频, 抖店 / TikTok / 视频号一次跑',
};

export default function VideoPage() {
  const data = COPY.productVideo;

  return (
    <>
      <TopNav />

      {/* 1 · Hero */}
      <Section spacing="loose">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-outfit)] text-text-primary">
              {data.hero.h1}
            </h1>
            <p className="mt-6 text-lg text-text-secondary leading-relaxed whitespace-pre-line">
              {data.hero.h2}
            </p>
            <div className="mt-8">
              <PrimaryButton size="lg" href="/me/skus">
                开始免费跑 3 个 SKU
              </PrimaryButton>
            </div>
          </div>
        </Container>
      </Section>

      {/* 2 · 3 类视频场景 */}
      <Section className="border-t border-border-subtle">
        <Container>
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)] mb-10 text-center">
            {data.modesTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {data.modes.map((m) => (
              <div
                key={m.title}
                className="bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col"
              >
                <div className="aspect-video rounded-md bg-gradient-to-br from-bg-raised to-bg-surface mb-5 flex items-center justify-center border border-border-subtle">
                  <span className="text-text-tertiary text-sm font-mono">
                    {m.title}
                  </span>
                </div>
                <div className="font-bold text-text-primary text-lg mb-2">
                  {m.title}
                </div>
                <div className="text-text-secondary text-sm leading-relaxed">
                  {m.desc}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 3 · 底部 CTA */}
      <Section className="border-t border-border-subtle" spacing="tight">
        <Container>
          <div className="text-center">
            <p className="text-lg text-text-secondary mb-6">
              想看完整流水线? 主图 + 视频 + 详情页 + 客服话术一晚跑完
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <PrimaryButton size="lg" href="/pricing">
                看完整定价
              </PrimaryButton>
              <SecondaryButton size="lg" href="/product/pipeline">
                了解全流水线
              </SecondaryButton>
            </div>
          </div>
        </Container>
      </Section>

      <MarketingFooter />
    </>
  );
}
