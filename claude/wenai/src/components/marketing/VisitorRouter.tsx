import { Container, Section } from './Container';

const ROUTES = [
  {
    label: '首次使用',
    title: '从行业模板创建第一个实验项目',
    body: '选择 3C、服装或美妆模板，上传平台 CSV，直接生成第一轮内容实验决策。',
    href: '/dashboard',
    cta: '创建工作台',
  },
  {
    label: '看结果样例',
    title: '先看一份老板能读懂的脱敏报告',
    body: '报告包含项目背景、核心结论、关键证据和下一步动作，适合转发给团队或客户。',
    href: '/poc/report',
    cta: '查看报告模板',
  },
  {
    label: '了解价格',
    title: '确认免费版和付费版权益边界',
    body: 'Free 可完成第一轮闭环；Starter 和 Growth 面向更多导入、无水印报告和团队协作。',
    href: '/pricing',
    cta: '查看定价',
  },
] as const;

export function VisitorRouter() {
  return (
    <Section spacing="tight" className="border-y border-border-subtle bg-bg-surface/20">
      <Container>
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 text-[10px] font-mono tracking-[0.18em] text-accent">
              第一次来，先选入口
            </div>
            <h2 className="text-balance text-2xl font-bold text-text-primary md:text-3xl font-[family-name:var(--font-outfit)]">
              不需要理解全部功能，先完成一轮内容实验。
            </h2>
          </div>
          <p className="max-w-md text-[13px] leading-relaxed text-text-secondary">
            当前商用主路径聚焦一件事：导入平台 CSV，获得可信决策，导出报告或生产 Brief，复制模板继续跑下一轮。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {ROUTES.map((route, index) => (
            <a
              key={route.label}
              href={route.href}
              className="group flex min-h-[210px] flex-col rounded-md border border-border-subtle bg-bg-root/45 p-5 transition-colors hover:border-accent/50"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="text-[10px] font-mono tracking-[0.14em] text-accent">
                  {route.label}
                </span>
                <span className="font-mono text-[11px] text-text-tertiary">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="text-balance text-[18px] font-semibold leading-snug text-text-primary">
                {route.title}
              </h3>
              <p className="mt-3 flex-1 text-[13px] leading-relaxed text-text-secondary">
                {route.body}
              </p>
              <span className="mt-5 inline-flex text-[12px] font-semibold text-accent transition-colors group-hover:text-accent-hover">
                {route.cta}
              </span>
            </a>
          ))}
        </div>
      </Container>
    </Section>
  );
}
