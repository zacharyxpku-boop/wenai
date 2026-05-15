import { Container, Section } from '@/components/marketing/Container';

const STEPS = [
  {
    step: '01',
    title: '准备 SKU',
    input: '名称 / 类目 / 卖点 / 平台 / 素材',
    output: '10 SKU 输入摘要',
    time: '客户准备',
    href: '/poc',
    cta: '打开试跑清单',
  },
  {
    step: '02',
    title: '生成交付包',
    input: 'SKU 输入摘要',
    output: '图片方向 / 文案 / 合规 / 客服 / 复盘',
    time: '试跑交付',
    href: '/pipelines/new-listing',
    cta: '跑上新流程',
  },
  {
    step: '03',
    title: '复盘并推进',
    input: '交付包 + 风险提示',
    output: '老板版验收报告',
    time: '合同判断',
    href: '/poc/report',
    cta: '查看报告模板',
  },
];

export function ThreeStepPipeline() {
  return (
    <Section>
      <Container>
        <h2 className="mb-12 text-center text-3xl font-bold text-text-primary md:mb-16 md:text-4xl font-[family-name:var(--font-outfit)]">
          从 SKU 输入到试跑验收, 三步跑通。
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map(step => (
            <a
              key={step.step}
              href={step.href}
              className="group block h-full rounded-md border border-border-default bg-bg-surface p-6 transition-colors hover:border-accent"
            >
              <div className="mb-4 text-5xl font-bold leading-none text-accent font-[family-name:var(--font-outfit)]">
                {step.step}
              </div>
              <h3 className="mb-4 text-xl font-bold text-text-primary">{step.title}</h3>
              <div className="mb-5 flex flex-col gap-1.5 text-[13px]">
                <Row label="要填什么" value={step.input} />
                <Row label="会出什么" value={step.output} />
                <Row label="适合阶段" value={step.time} />
              </div>
              <span className="inline-flex text-sm text-accent transition-colors group-hover:text-accent-hover">
                {step.cta}
              </span>
            </a>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-text-tertiary">
          每一步都服务同一个问题: 这个客户是否应该进入正式合作和付款流程。
        </p>
      </Container>
    </Section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="shrink-0 text-text-tertiary">{label}:</span>
      <span className="text-text-primary">{value}</span>
    </div>
  );
}
