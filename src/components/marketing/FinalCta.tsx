import { Container, PrimaryButton, Section, SecondaryButton } from './Container';

export function FinalCta() {
  return (
    <Section spacing="loose">
      <Container>
        <div className="rounded-md border border-border-default bg-bg-surface px-6 py-10 text-center md:px-12 md:py-14">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="text-[11px] font-mono text-text-tertiary">下一步</div>
            <h2 className="text-balance font-[family-name:var(--font-outfit)] text-3xl font-semibold text-text-primary md:text-5xl">
              先跑 10 个 SKU，让客户看到完整交付包。
            </h2>
            <p className="text-pretty text-[15px] leading-7 text-text-secondary">
              跑通后再接入主站支付、合同、API Key 和真实客户数据。当前版本已经可以承担演示、试点和销售沟通。
            </p>
            <div className="flex flex-col justify-center gap-3 pt-3 sm:flex-row">
              <PrimaryButton href="/poc" size="lg">
                运行 5 分钟 POC
              </PrimaryButton>
              <SecondaryButton href="/inquire" size="lg">
                提交合作询盘
              </SecondaryButton>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
