import { COPY } from '@/i18n/zh';
import { Container, Section } from '@/components/marketing/Container';

/**
 * TrustWall · 信任墙
 *
 * 子站信任说明 · 不使用虚构客户 logo 或未验证业绩数
 */
export function TrustWall() {
  const { trust } = COPY;

  return (
    <Section spacing="tight">
      <Container>
        {/* 顶部居中小标题 */}
        <div className="mb-8 text-center">
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-text-tertiary">{trust.headline}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-12">
          <TrustNote label="定位" value="SKU 试跑子站" />
          <TrustNote label="用途" value="演示流程 / 承接线索" />
          <TrustNote label="收费" value="主站合同和支付" />
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

function TrustNote({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-bg-surface border border-border-subtle p-4">
      <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary mb-1">
        {label}
      </div>
      <div className="text-sm font-semibold text-text-primary">
        {value}
      </div>
    </div>
  );
}
