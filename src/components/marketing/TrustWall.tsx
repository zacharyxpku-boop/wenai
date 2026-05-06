import { Container, Section } from '@/components/marketing/Container';

const BLOCKS = [
  {
    title: 'Launch Pack',
    body: 'SKU 输入进入标准包，自动生成上新文案、验收要点和风险提示。',
    metric: '10 SKU / 批',
  },
  {
    title: 'Brand IQ',
    body: '品牌知识库、禁用词和语气规则进入工作区，输出不会每次重来。',
    metric: '可配置',
  },
  {
    title: 'Content Pack',
    body: 'Benchmark、Hook Matrix、Reel / Slideshow Brief 和复盘报告连成闭环。',
    metric: '4 个模块',
  },
  {
    title: 'CRM Lite',
    body: '询盘状态、SLA、下一步动作和成交判断被结构化，不靠口头同步。',
    metric: '1 条线',
  },
];

export function TrustWall() {
  return (
    <Section spacing="tight">
      <Container className="space-y-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="text-[11px] font-mono text-text-tertiary">产品结构</div>
            <h2 className="max-w-3xl text-balance font-[family-name:var(--font-outfit)] text-3xl font-semibold text-text-primary md:text-4xl">
              一个客户可以直接理解的 SaaS 形态，不是功能散落的工具箱。
            </h2>
          </div>
          <div className="max-w-xl text-pretty text-[14px] leading-6 text-text-secondary">
            参考竞品该学的是清晰的产品层级、可信的工作台和可复制的交付边界，不是再多堆几个 AI 按钮。
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {BLOCKS.map((block) => (
            <div key={block.title} className="rounded-md border border-border-subtle bg-bg-surface px-5 py-5">
              <div className="font-mono text-[11px] text-accent">{block.metric}</div>
              <div className="mt-2 text-lg font-medium text-text-primary">{block.title}</div>
              <div className="mt-3 text-[14px] leading-6 text-text-secondary">{block.body}</div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
