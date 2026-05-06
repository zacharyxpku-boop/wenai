import { Container, PrimaryButton, Section, SecondaryButton } from './Container';

const COMPARE_ROWS = [
  {
    title: '普通 AI 工具',
    body: '给你生成结果，但不对类目规则、品牌禁区、交付验收和合同推进负责。',
  },
  {
    title: 'wenai 交付系统',
    body: '把 SKU 输入、规则护栏、营销资产、老板版报告和 CRM 下一步动作放在同一条线里。',
  },
];

const MOATS = [
  '类目阈值、品牌禁用词、语气规则沉淀为工作区规则',
  'POC 输出不是散件，而是标准包、报告、复盘和推进建议',
  '内容营销和上新共用一套 SKU 上下文，避免团队切割',
  '从询盘到合同动作形成结构化运营层，而不是一堆聊天记录',
];

export function WhyFocused() {
  return (
    <Section className="border-b border-border-subtle bg-bg-surface/30" spacing="tight">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <div className="text-[11px] font-mono text-text-tertiary">为什么这不是另一个 AI 套壳</div>
            <h2 className="max-w-2xl text-balance font-[family-name:var(--font-outfit)] text-3xl font-semibold leading-tight text-text-primary md:text-4xl">
              客户买的不是“会生成”，而是可交付、可复核、可推进。
            </h2>
            <p className="max-w-2xl text-pretty text-[15px] leading-7 text-text-secondary">
              竞品常常把自己包装成内容平台、创意平台或代理人平台。wenai 更窄，但也更硬: 它盯住电商团队真正愿意付费的那段链路。
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href="/poc">看 POC 入口</PrimaryButton>
              <SecondaryButton href="/poc/report">看老板版报告</SecondaryButton>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {COMPARE_ROWS.map((row, index) => (
                <div key={row.title} className="rounded-md border border-border-subtle bg-bg-root px-5 py-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-base font-medium text-text-primary">{row.title}</div>
                    <div className="font-mono text-[11px] text-text-tertiary">0{index + 1}</div>
                  </div>
                  <div className="text-[14px] leading-6 text-text-secondary">{row.body}</div>
                </div>
              ))}
            </div>

            <div className="rounded-md border border-border-default bg-bg-root px-5 py-5">
              <div className="mb-4 text-[11px] font-mono text-accent">wenai 应该打出的壁垒</div>
              <div className="grid gap-3 md:grid-cols-2">
                {MOATS.map((item) => (
                  <div key={item} className="rounded-md border border-border-subtle bg-bg-surface px-4 py-3 text-[13px] leading-6 text-text-primary">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
