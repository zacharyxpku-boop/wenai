import { Container, Section } from '@/components/marketing/Container';

const STEPS = [
  {
    step: '01',
    title: '输入 SKU 和类目',
    input: 'SKU、平台、卖点、风险点、现有素材',
    output: 'POC 标准包预填',
    href: '/poc',
  },
  {
    step: '02',
    title: '生成交付与营销资产',
    input: '品牌规则、类目阈值、竞品内容参考',
    output: '上新包、Brief、报告、复盘清单',
    href: '/pipelines/marketing-campaign',
  },
  {
    step: '03',
    title: '提交验收并推进合同',
    input: '执行结果、风险摘要、负责人判断',
    output: '老板版报告、CRM 下一步动作',
    href: '/poc/report',
  },
];

export function ThreeStepPipeline() {
  return (
    <Section className="border-y border-border-subtle bg-bg-surface/25">
      <Container className="space-y-10">
        <div className="max-w-3xl space-y-3">
          <div className="text-[11px] font-mono text-text-tertiary">核心路径</div>
          <h2 className="text-balance font-[family-name:var(--font-outfit)] text-3xl font-semibold text-text-primary md:text-4xl">
            客户 5 分钟能跑通的链路，才有资格被卖出去。
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {STEPS.map((step) => (
            <a
              key={step.step}
              href={step.href}
              className="rounded-md border border-border-default bg-bg-root px-5 py-5 transition-colors hover:border-accent/50"
            >
              <div className="flex items-center justify-between">
                <div className="font-mono text-sm text-accent">{step.step}</div>
                <div className="text-[12px] text-text-tertiary">可直接体验</div>
              </div>
              <div className="mt-5 text-xl font-medium text-text-primary">{step.title}</div>
              <div className="mt-5 grid gap-3 text-[13px] leading-6 text-text-secondary">
                <div>
                  <div className="font-mono text-[11px] text-text-tertiary">输入</div>
                  <div>{step.input}</div>
                </div>
                <div>
                  <div className="font-mono text-[11px] text-text-tertiary">输出</div>
                  <div>{step.output}</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </Container>
    </Section>
  );
}
