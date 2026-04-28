import { COPY } from '@/i18n/zh';
import { Container } from './Container';

/**
 * Marketing 全站 footer · 4 列 + 底部 social
 *
 * 列: 产品 / 公司 / 资源 / 法务
 * 底部: logo + copyright + ICP · social 圆形图标
 */
export default function MarketingFooter() {
  const cols = COPY.footer.columns;
  const columnList = [cols.product, cols.company, cols.resources, cols.legal];

  return (
    <footer className="border-t border-border-subtle bg-bg-root">
      <Container className="py-14 lg:py-20">
        {/* 4 列链接 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {columnList.map((col) => (
            <div key={col.title}>
              <h3 className="text-[11px] uppercase tracking-[0.12em] text-text-tertiary font-semibold mb-4">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label + link.href}>
                    <a
                      href={link.href}
                      className="text-[13px] text-text-secondary hover:text-accent transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 底部一行 */}
        <div className="mt-14 pt-8 border-t border-border-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-lg font-bold text-accent font-[family-name:var(--font-outfit)] tracking-tight">
              {COPY.brand.name}
            </span>
            <span className="text-[12px] text-text-tertiary">
              {COPY.footer.copyright}
            </span>
            <span className="text-[12px] text-text-tertiary">
              {COPY.footer.icp}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {COPY.footer.socials.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                title={s.label}
                className="w-9 h-9 rounded-full bg-bg-surface border border-border-subtle flex items-center justify-center text-[12px] font-semibold text-text-secondary hover:border-accent hover:text-accent transition-colors"
              >
                {s.initial}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
