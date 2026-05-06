import { Container } from './Container';

const COLUMNS = [
  {
    title: '产品',
    links: [
      { label: '5 分钟 POC', href: '/poc' },
      { label: '上新 SOP', href: '/pipelines/new-listing' },
      { label: '内容营销', href: '/pipelines/marketing-campaign' },
    ],
  },
  {
    title: '资源',
    links: [
      { label: '案例库', href: '/cases' },
      { label: '文档', href: '/docs' },
      { label: '路线图', href: '/roadmap' },
    ],
  },
  {
    title: '商业',
    links: [
      { label: '方案', href: '/pricing' },
      { label: '企业版', href: '/enterprise' },
      { label: '提交询盘', href: '/inquire' },
    ],
  },
  {
    title: '合规',
    links: [
      { label: '隐私政策', href: '/privacy' },
      { label: '服务条款', href: '/terms' },
      { label: '数据处理协议', href: '/legal/dpa' },
    ],
  },
];

export default function MarketingFooter() {
  return (
    <footer className="border-t border-border-subtle bg-bg-root">
      <Container className="py-12 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-[11px] font-mono text-text-tertiary">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-[13px] text-text-secondary transition-colors hover:text-accent">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border-subtle pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span className="font-[family-name:var(--font-outfit)] text-lg font-semibold text-text-primary">wenai</span>
            <span className="text-[12px] text-text-tertiary">给电商团队的 AI 商业交付系统</span>
          </div>
          <div className="text-[12px] text-text-tertiary">© 2026 wenai. POC 子站，可接入独立站支付和合同流程。</div>
        </div>
      </Container>
    </footer>
  );
}
