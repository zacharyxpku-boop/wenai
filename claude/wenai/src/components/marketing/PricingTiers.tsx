import { Container, Section, PrimaryButton, SecondaryButton } from './Container';

const TIERS = [
  {
    id: 'poc',
    name: '试跑',
    price: '10 SKU',
    body: '先用一批真实 SKU 看质量、边界和是否值得继续合作。',
    cta: '开始试跑',
    href: '/poc',
    features: ['上新标准包', '品牌禁区检查', '老板版报告', '下一步动作'],
  },
  {
    id: 'team',
    name: '团队交付',
    price: '标准合作',
    body: '适合每周都有上新、内容测试和复盘动作的电商团队。',
    cta: '提交合作需求',
    href: '/inquire',
    recommended: true,
    features: ['批量上新流程', '内容营销包', '商务推进记录', '可复用标准包'],
  },
  {
    id: 'enterprise',
    name: '企业版',
    price: '定制范围',
    body: '适合有品牌红线、类目阈值、私有数据和长期交付要求的团队。',
    cta: '查看企业路径',
    href: '/enterprise',
    features: ['品牌知识库', '类目验收阈值', '私有工作区', '合同交付支持'],
  },
];

export function PricingTiers({ compact = false }: { compact?: boolean }) {
  void compact;

  return (
    <Section>
      <Container>
        <h2 className="mb-3 text-center text-3xl font-bold text-text-primary md:text-4xl font-[family-name:var(--font-outfit)]">
          先试跑, 再决定是否正式合作。
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-[14px] leading-relaxed text-text-secondary">
          不在首页硬卖复杂套餐。客户先看标准包和报告, 再根据交付稳定性进入团队或企业合作。
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TIERS.map(tier => (
            <div
              key={tier.id}
              className={`relative flex flex-col rounded-md p-6 ${
                tier.recommended
                  ? 'border-2 border-accent bg-bg-surface'
                  : 'border border-border-default bg-bg-surface'
              }`}
            >
              {tier.recommended && (
                <span className="absolute left-1/2 top-0 inline-flex -translate-x-1/2 -translate-y-1/2 items-center rounded-md bg-accent px-3 py-1 text-xs font-semibold text-bg-root">
                  推荐路径
                </span>
              )}

              <div className="mb-5">
                <h3 className="mb-2 text-lg font-bold text-text-primary">{tier.name}</h3>
                <div className="font-mono text-3xl font-bold text-accent tabular-nums">{tier.price}</div>
                <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">{tier.body}</p>
              </div>

              <ul className="mb-6 flex flex-1 flex-col gap-2">
                {tier.features.map(feature => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span aria-hidden className="mt-0.5 shrink-0 text-accent">+</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {tier.recommended ? (
                <PrimaryButton href={tier.href} className="w-full justify-center">
                  {tier.cta}
                </PrimaryButton>
              ) : (
                <SecondaryButton href={tier.href} className="w-full justify-center">
                  {tier.cta}
                </SecondaryButton>
              )}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
