'use client';

import { useState } from 'react';
import { COPY } from '@/i18n/zh';

/**
 * Marketing 顶导 · sticky + backdrop blur
 *
 * 桌面: logo · 中央导航 (产品 ▼ / 案例 / 定价 / 资源 ▼ / 关于) · 右 CTA (登录 + 免费开始)
 * 移动: logo · hamburger → 全屏菜单
 */
export default function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'product' | 'resource' | null>(null);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-bg-root/85 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="/"
            className="text-xl font-bold text-accent font-[family-name:var(--font-outfit)] tracking-tight"
          >
            {COPY.brand.name}
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {/* 产品 dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown('product')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={openDropdown === 'product'}
                className="px-3 py-2 text-[14px] text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
              >
                {COPY.nav.products}
                <span className="text-[10px] opacity-60">⌄</span>
              </button>
              {openDropdown === 'product' && (
                <div className="absolute left-0 top-full pt-2 w-[320px]">
                  <div className="bg-bg-raised border border-border-default rounded-lg shadow-2xl overflow-hidden">
                    {COPY.nav.productItems.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-3 hover:bg-bg-surface transition-colors border-b border-border-subtle last:border-b-0"
                      >
                        <div className="text-[14px] font-semibold text-text-primary">
                          {item.label}
                        </div>
                        <div className="text-[12px] text-text-tertiary mt-0.5">
                          {item.desc}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <a
              href="/cases"
              className="px-3 py-2 text-[14px] text-text-secondary hover:text-text-primary transition-colors"
            >
              {COPY.nav.cases}
            </a>

            <a
              href="/pricing"
              className="px-3 py-2 text-[14px] text-text-secondary hover:text-text-primary transition-colors"
            >
              {COPY.nav.pricing}
            </a>

            {/* 资源 dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown('resource')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={openDropdown === 'resource'}
                className="px-3 py-2 text-[14px] text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
              >
                {COPY.nav.resources}
                <span className="text-[10px] opacity-60">⌄</span>
              </button>
              {openDropdown === 'resource' && (
                <div className="absolute left-0 top-full pt-2 w-[320px]">
                  <div className="bg-bg-raised border border-border-default rounded-lg shadow-2xl overflow-hidden">
                    {COPY.nav.resourceItems.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        className="block px-4 py-3 hover:bg-bg-surface transition-colors border-b border-border-subtle last:border-b-0"
                      >
                        <div className="text-[14px] font-semibold text-text-primary">
                          {item.label}
                        </div>
                        <div className="text-[12px] text-text-tertiary mt-0.5">
                          {item.desc}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <a
              href="/about"
              className="px-3 py-2 text-[14px] text-text-secondary hover:text-text-primary transition-colors"
            >
              {COPY.nav.about}
            </a>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href="/login"
              className="px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              {COPY.nav.login}
            </a>
            <a
              href="/me/skus"
              className="px-4 py-2 text-[13px] font-semibold rounded-md bg-accent text-bg-root hover:bg-accent-hover transition-colors"
            >
              {COPY.nav.cta}
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden text-text-primary text-2xl w-10 h-10 flex items-center justify-center hover:text-accent transition-colors"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile fullscreen menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-bg-root z-40 overflow-y-auto">
          <div className="px-5 py-6 space-y-6">
            {/* 产品 */}
            <div>
              <div className="text-[11px] uppercase tracking-wider text-text-tertiary mb-2 px-3">
                {COPY.nav.products}
              </div>
              <div className="space-y-1">
                {COPY.nav.productItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={closeMobile}
                    className="block px-3 py-3 rounded-md hover:bg-bg-surface transition-colors"
                  >
                    <div className="text-[15px] font-semibold text-text-primary">
                      {item.label}
                    </div>
                    <div className="text-[12px] text-text-tertiary mt-0.5">
                      {item.desc}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* 案例 / 定价 / 关于 */}
            <div className="space-y-1">
              <a
                href="/cases"
                onClick={closeMobile}
                className="block px-3 py-3 rounded-md hover:bg-bg-surface text-[15px] font-semibold text-text-primary transition-colors"
              >
                {COPY.nav.cases}
              </a>
              <a
                href="/pricing"
                onClick={closeMobile}
                className="block px-3 py-3 rounded-md hover:bg-bg-surface text-[15px] font-semibold text-text-primary transition-colors"
              >
                {COPY.nav.pricing}
              </a>
              <a
                href="/about"
                onClick={closeMobile}
                className="block px-3 py-3 rounded-md hover:bg-bg-surface text-[15px] font-semibold text-text-primary transition-colors"
              >
                {COPY.nav.about}
              </a>
            </div>

            {/* 资源 */}
            <div>
              <div className="text-[11px] uppercase tracking-wider text-text-tertiary mb-2 px-3">
                {COPY.nav.resources}
              </div>
              <div className="space-y-1">
                {COPY.nav.resourceItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={closeMobile}
                    className="block px-3 py-3 rounded-md hover:bg-bg-surface transition-colors"
                  >
                    <div className="text-[15px] font-semibold text-text-primary">
                      {item.label}
                    </div>
                    <div className="text-[12px] text-text-tertiary mt-0.5">
                      {item.desc}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 border-t border-border-subtle space-y-3">
              <a
                href="/login"
                onClick={closeMobile}
                className="block w-full text-center px-5 py-3 rounded-md border border-border-default text-text-primary font-semibold text-[14px] hover:border-accent hover:text-accent transition-colors"
              >
                {COPY.nav.login}
              </a>
              <a
                href="/me/skus"
                onClick={closeMobile}
                className="block w-full text-center px-5 py-3 rounded-md bg-accent text-bg-root font-semibold text-[14px] hover:bg-accent-hover transition-colors"
              >
                {COPY.nav.cta}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
