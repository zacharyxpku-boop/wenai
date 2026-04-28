import { COPY } from '@/i18n/zh';
import { Container, Section, PrimaryButton, SecondaryButton } from '@/components/marketing/Container';

/**
 * Hero · 跨境电商内容生产, 便宜 50 倍
 *
 * 桌面端 60/40 两栏 · 移动端单栏 stack
 * 左栏: H1 + H2 + 三数字锚点 + 双 CTA
 * 右栏: Before/After 占位卡片 (纯 CSS, 无图)
 */
export function Hero() {
  const { hero } = COPY;

  return (
    <Section spacing="loose" className="relative overflow-hidden">
      {/* 微弱 accent radial 装饰 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200, 151, 90, 0.5), transparent 70%)',
        }}
      />

      <Container className="relative">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-12 items-center">
          {/* 左栏 60% */}
          <div className="md:col-span-3 flex flex-col gap-7">
            <h1 className="text-[2rem] sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] text-text-primary font-[family-name:var(--font-outfit)]">
              {hero.h1}
            </h1>

            <p className="text-base md:text-lg text-text-secondary leading-relaxed whitespace-pre-line max-w-2xl">
              {hero.h2}
            </p>

            {/* 三数字锚点 */}
            <div className="flex items-end gap-6 sm:gap-10 pt-2">
              {hero.stats.map((s, i) => (
                <div key={s.value} className="flex items-end gap-6 sm:gap-10">
                  <div className="flex flex-col gap-1">
                    <div className="text-3xl md:text-4xl font-bold text-accent font-mono tabular-nums leading-none">
                      {s.value}
                    </div>
                    <div className="text-xs md:text-sm text-text-secondary">
                      {s.label}
                    </div>
                  </div>
                  {i < hero.stats.length - 1 && (
                    <div className="h-10 w-px bg-border-subtle self-end mb-1" aria-hidden />
                  )}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <PrimaryButton href="#roi-calculator" size="lg">
                {hero.primaryCta} <span aria-hidden>→</span>
              </PrimaryButton>
              <SecondaryButton href="#cases" size="lg">
                {hero.secondaryCta}
              </SecondaryButton>
            </div>
          </div>

          {/* 右栏 40% Before/After 占位 */}
          <div className="md:col-span-2">
            <div className="relative aspect-[4/3] rounded-xl border border-border-default bg-gradient-to-br from-bg-surface to-bg-raised overflow-hidden shadow-sm">
              {/* 上半 真人摄影 */}
              <div className="absolute inset-x-0 top-0 h-1/2 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-bg-surface to-bg-surface/40">
                <div className="text-[10px] text-text-tertiary tracking-wider">
                  BEFORE
                </div>
                <div className="text-sm md:text-base text-text-primary font-medium">
                  真人摄影
                </div>
                <div className="text-xs md:text-sm text-text-secondary font-mono tabular-nums">
                  3 天 · ¥3,500
                </div>
              </div>

              {/* 中间 vs 分隔线 */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center z-10">
                <div className="flex-1 h-px bg-border-default" />
                <div className="px-3 py-1 mx-2 rounded-full border border-border-default bg-bg-root text-xs font-mono text-text-secondary">
                  vs
                </div>
                <div className="flex-1 h-px bg-border-default" />
              </div>

              {/* 下半 wenai · accent tint */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-transparent to-accent/10">
                <div className="text-[10px] text-accent tracking-wider">
                  AFTER
                </div>
                <div className="text-sm md:text-base text-text-primary font-medium">
                  wenai
                </div>
                <div className="text-xs md:text-sm text-accent font-mono tabular-nums font-semibold">
                  一晚 · ¥50
                </div>
              </div>

              {/* 角落小字 */}
              <div className="absolute bottom-2 right-3 text-[10px] text-text-tertiary z-20">
                Before · After 占位 · 客户授权图待业主上传
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
