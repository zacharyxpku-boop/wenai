import { Container, PrimaryButton, Section, SecondaryButton } from './Container';

const TIERS = [
  {
    id: 'poc',
    name: 'POC',
    price: '10 SKU',
    desc: '适合首次验证交付质量和合作边界。',
    features: ['单类目上新包', 'Brand IQ 和禁区复核', '老板版复盘报告', '验收评分'],
    cta: '运行 POC',
    href: '/poc',
    recommended: false,
  },
  {
    id: 'team',
    name: '团队版',
    price: '标准交付',
    desc: '适合稳定跑上新、营销和复盘的电商团队。',
    features: ['批量上新 workflow', '内容 benchmark 包', 'CRM 下一步动作与 SLA', '可复用标准包'],
    cta: '提交询盘',
    href: '/inquire',
    recommended: true,
  },
  {
    id: 'enterprise',
    name: '企业版',
    price: '定制',
    desc: '适合需要权限、集成、私有规则和合同交付的团队。',
    features: ['工作区规则', '类目验收阈值', '外部 CRM 对接', '合同推进支持'],
    cta: '咨询企业版',
    href: '/enterprise',
    recommended: false,
  },
];

export function PricingTiers() {
  return (
    <Section className="border-y border-border-subtle bg-bg-surface/25">
      <Container className="space-y-10">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <div className="text-[11px] font-mono text-text-tertiary">商业路径</div>
          <h2 className="text-balance font-[family-name:var(--font-outfit)] text-3xl font-semibold text-text-primary md:text-4xl">
            先用 POC 证明价值，再进入主站合同和支付。
          </h2>
          <p className="text-pretty text-[15px] leading-7 text-text-secondary">
            当前代码作为子站进入平台，收费、支付和合同可以由主站承接；wenai 负责把交付质量和商机判断做硬。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col rounded-md p-6 ${
                tier.recommended ? 'border border-accent bg-bg-root' : 'border border-border-default bg-bg-surface'
              }`}
            >
              {tier.recommended && (
                <span className="absolute right-4 top-4 rounded-full border border-accent/40 px-2.5 py-1 text-[11px] font-mono text-accent">
                  推荐
                </span>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-text-primary">{tier.name}</h3>
                <div className="mt-4 font-mono text-3xl font-semibold text-accent tabular-nums">{tier.price}</div>
                <p className="mt-3 text-[13px] leading-6 text-text-secondary">{tier.desc}</p>
              </div>
              <ul className="mb-8 flex flex-1 flex-col gap-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-[14px] leading-6 text-text-secondary">
                    <span className="text-accent" aria-hidden>
                      +
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {tier.recommended ? (
                <PrimaryButton href={tier.href} className="justify-center">
                  {tier.cta}
                </PrimaryButton>
              ) : (
                <SecondaryButton href={tier.href} className="justify-center">
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
