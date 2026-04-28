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
  title: '全流水线交付 · 从 SKU 到上架闭环 · wenai',
  description: '商品信息进, 完整上架物料出 · 主图 + 文案 + 视频 + 客服话术 + 合规标识 一晚跑完',
};

export default function PipelinePage() {
  const data = COPY.productPipeline;
  const flowSteps = data.flow.split('→').map((s) => s.trim());

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
            <p className="mt-6 text-lg text-text-secondary leading-relaxed">
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

      {/* 2 · 流程可视化 */}
      <Section className="border-t border-border-subtle">
        <Container>
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)] mb-10 text-center">
            完整流水线
          </h2>
          {/* desktop · 横排 */}
          <div className="hidden lg:flex items-stretch gap-2 overflow-x-auto pb-2">
            {flowSteps.map((step, i) => (
              <div key={step} className="flex items-stretch shrink-0">
                <div className="bg-bg-surface border border-border-subtle rounded-lg px-4 py-5 min-w-[120px] flex items-center justify-center text-center">
                  <div>
                    <div className="text-xs text-text-tertiary font-mono mb-1">
                      0{i + 1}
                    </div>
                    <div className="text-sm font-bold text-text-primary leading-tight">
                      {step}
                    </div>
                  </div>
                </div>
                {i < flowSteps.length - 1 && (
                  <div className="flex items-center justify-center px-1 text-xl text-text-tertiary">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* mobile · 竖排 */}
          <div className="lg:hidden flex flex-col gap-2 max-w-md mx-auto">
            {flowSteps.map((step, i) => (
              <div key={step} className="flex flex-col items-center">
                <div className="w-full bg-bg-surface border border-border-subtle rounded-lg px-4 py-4 text-center">
                  <div className="text-xs text-text-tertiary font-mono mb-1">
                    0{i + 1}
                  </div>
                  <div className="text-sm font-bold text-text-primary">{step}</div>
                </div>
                {i < flowSteps.length - 1 && (
                  <div className="text-xl text-text-tertiary py-1">↓</div>
                )}
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
              一条流水线, 替代 10 个外包工位
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <PrimaryButton size="lg" href="/me/skus">
                免费跑 3 个 SKU
              </PrimaryButton>
              <SecondaryButton size="lg" href="/pricing">
                看完整定价
              </SecondaryButton>
            </div>
          </div>
        </Container>
      </Section>

      <MarketingFooter />
    </>
  );
}
