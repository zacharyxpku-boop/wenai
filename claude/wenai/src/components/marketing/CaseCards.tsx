import { Container, Section, SecondaryButton } from './Container';

const CASES = [
  {
    slug: 'home-decor',
    industry: '家居收纳',
    title: '把零散 SKU 资料转成上新交付包',
    lines: ['输入: 零散 SKU 备注', '输出: 结构化上新包', '验收: 标准清单和复盘动作'],
  },
  {
    slug: 'auto-parts',
    industry: '汽摩配件',
    title: '把适配风险和安装场景放进同一份报告',
    lines: ['输入: 规格表和参考内容', '输出: 商品页和短视频脚本', '验收: 商标与适配边界'],
  },
  {
    slug: 'electronics',
    industry: '数码配件',
    title: '把达人外联从散写消息变成受控流程',
    lines: ['输入: SKU 和达人清单', '输出: 个性化开头和跟进表', '验收: 回复归因和下一批建议'],
  },
];

export function CaseCards() {
  return (
    <Section>
      <Container>
        <div id="cases" className="scroll-mt-20" />

        <h2 className="mb-12 text-center text-3xl font-bold text-text-primary md:text-4xl font-[family-name:var(--font-outfit)]">
          三个客户能看懂的交付样例
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {CASES.map(item => (
            <article
              key={item.slug}
              className="flex flex-col rounded-md border border-border-default bg-bg-surface p-6 transition-colors hover:border-accent/40"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-md border border-border-subtle bg-bg-raised text-base font-medium text-text-secondary font-[family-name:var(--font-outfit)]">
                  {item.industry.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-primary">{item.industry}</div>
                  <div className="text-xs text-text-tertiary">行业模板样例</div>
                </div>
              </div>

              <h3 className="mb-5 text-[17px] font-semibold leading-relaxed text-text-primary">
                {item.title}
              </h3>

              <ul className="mb-6 flex flex-1 flex-col gap-2">
                {item.lines.map(line => (
                  <li key={line} className="rounded-md border border-border-subtle bg-bg-root/35 px-3 py-2 text-[12px] text-text-secondary">
                    {line}
                  </li>
                ))}
              </ul>

              <a href="/dashboard" className="mt-auto text-sm font-semibold text-accent transition-colors hover:text-accent-hover">
                从这个行业开始
              </a>
            </article>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <SecondaryButton href="/dashboard">从行业模板开始</SecondaryButton>
        </div>
      </Container>
    </Section>
  );
}
