import { Container, Section, SecondaryButton } from './Container';

const CASES = [
  {
    slug: 'home-decor',
    industry: '家居收纳',
    title: '把混乱 SKU 资料转成上新包',
    rows: ['输入: 零散 SKU 备注', '输出: 标准 brief + 文案 + 验收清单', '推进: POC 决策材料'],
  },
  {
    slug: 'auto-parts',
    industry: '汽配',
    title: '把安装场景和适配风险放进同一条记录',
    rows: ['输入: 规格表和安装场景', '输出: 适配提示 + 客服口径', '推进: 风险复核清单'],
  },
  {
    slug: 'electronics',
    industry: '数码配件',
    title: '在内容测试前先跑上新和合规',
    rows: ['输入: 卖点和参考内容', '输出: 标题 + Hook + Brief', '推进: 下一轮测试假设'],
  },
];

export function CaseCards() {
  return (
    <Section className="border-y border-border-subtle bg-bg-surface/25">
      <Container className="space-y-10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="text-[11px] font-mono text-text-tertiary">案例库</div>
            <h2 className="max-w-3xl text-balance font-[family-name:var(--font-outfit)] text-3xl font-semibold text-text-primary md:text-4xl">
              用样例让客户知道会拿到什么，而不是听概念。
            </h2>
          </div>
          <SecondaryButton href="/cases">查看全部案例</SecondaryButton>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {CASES.map((item) => (
            <a
              key={item.slug}
              href={`/cases/${item.slug}`}
              className="rounded-md border border-border-default bg-bg-root p-5 transition-colors hover:border-accent/50"
            >
              <div className="font-mono text-[12px] text-accent">{item.industry}</div>
              <div className="mt-3 text-lg font-medium leading-7 text-text-primary">{item.title}</div>
              <ul className="mt-5 space-y-2">
                {item.rows.map((row) => (
                  <li key={row} className="border-t border-border-subtle pt-2 text-[13px] leading-6 text-text-secondary">
                    {row}
                  </li>
                ))}
              </ul>
              <div className="mt-5 text-[13px] text-accent">查看案例 -&gt;</div>
            </a>
          ))}
        </div>
      </Container>
    </Section>
  );
}
