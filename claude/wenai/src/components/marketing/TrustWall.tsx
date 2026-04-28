import { COPY } from '@/i18n/zh';
import { Container, Section } from '@/components/marketing/Container';

/**
 * TrustWall · 信任墙
 *
 * 顶部小标题 + 8 个 logo 占位 (4×2 / 2×4) + 4 项数据条
 */
export function TrustWall() {
  const { trust } = COPY;

  return (
    <Section spacing="tight">
      <Container>
        {/* 顶部居中小标题 */}
        <div className="text-center mb-8">
          <p className="text-sm text-text-tertiary">{trust.headline}</p>
        </div>

        {/* Logo 墙 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12">
          {Array.from({ length: trust.logoCount }).map((_, i) => (
            <div
              key={i}
              title="logo placeholder"
              className="aspect-[3/1] rounded-md bg-bg-surface border border-border-subtle flex items-center justify-center text-text-tertiary hover:text-accent hover:border-border-default transition-colors"
            >
              <span className="text-xs font-mono tracking-[0.2em]">CLIENT</span>
            </div>
          ))}
        </div>

        {/* 数据条 */}
        <div className="border-y border-border-subtle py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
            {trust.stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center gap-1.5">
                <div className="text-3xl md:text-4xl font-bold text-accent font-mono tabular-nums leading-none">
                  {s.value}
                </div>
                <div className="text-xs md:text-sm text-text-secondary">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
