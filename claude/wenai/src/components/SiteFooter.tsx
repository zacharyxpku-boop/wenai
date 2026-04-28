/**
 * 全局 footer · 三栏链接
 *
 * 给商家发现 wenai 的所有公开层 · 也是 SEO 内链锚点
 */

import Link from 'next/link';

interface ColLink {
  href: string;
  label: string;
  external?: boolean;
}

const COL_TOOLS: ColLink[] = [
  { href: '/tools',                  label: '🧰 全部工具' },
  { href: '/tools/hook-score',       label: 'Hook 跑前打分' },
  { href: '/tools/aigc-compliance',  label: 'AIGC 合规速查' },
  { href: '/me/inventory',           label: '库存监控' },
];

const COL_PRODUCT: ColLink[] = [
  { href: '/pipelines/new-listing', label: '新品上新流水线' },
  { href: '/pipelines/product-image', label: '主图工厂' },
  { href: '/pipelines/video-teardown', label: '视频拆解' },
  { href: '/pipelines/data-insights', label: '数据洞察' },
  { href: '/me/skus', label: '我的 SKU 库' },
];

const COL_RESOURCE: ColLink[] = [
  { href: '/changelog', label: '更新日志' },
  { href: '/roadmap', label: '路线图' },
  { href: '/MOAT_MAP', label: 'MOAT 文档' },
  { href: '/status', label: '系统状态' },
  { href: '/pricing', label: '定价' },
  { href: '/inquire', label: '企业询盘' },
];

const COL_LEGAL: ColLink[] = [
  { href: '/terms', label: '服务条款' },
  { href: '/privacy', label: '隐私政策' },
  { href: 'https://github.com/zacharyxpku-boop/wenai', label: 'GitHub', external: true },
];

function LinkColumn({ title, items }: { title: string; items: ColLink[] }) {
  return (
    <div>
      <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map(item => (
          <li key={item.href}>
            {item.external ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] text-text-secondary hover:text-accent"
              >
                {item.label} ↗
              </a>
            ) : (
              <Link href={item.href} className="text-[12px] text-text-secondary hover:text-accent">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-12 mb-16 sm:mb-0 border-t border-border-subtle pt-6 pb-8">
      <div className="max-w-[1100px] mx-auto px-4 lg:px-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <LinkColumn title="🧰 免费工具" items={COL_TOOLS} />
          <LinkColumn title="🚀 产品" items={COL_PRODUCT} />
          <LinkColumn title="📚 资源" items={COL_RESOURCE} />
          <LinkColumn title="📜 法律" items={COL_LEGAL} />
        </div>
        <div className="border-t border-border-subtle pt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-text-tertiary">
          <div>
            wenai · 跨境电商 AI 工作台 · 商家把空白 SKU 跑成上架的完整流水线
          </div>
          <div>
            © {new Date().getFullYear()} · made with care
          </div>
        </div>
      </div>
    </footer>
  );
}
