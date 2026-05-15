'use client';

import Link from 'next/link';
import { useState } from 'react';

const NAV = [
  { label: '工作台', href: '/dashboard' },
  { label: '产品', href: '/#flow' },
  { label: '定价', href: '/pricing' },
  { label: '报告模板', href: '/poc/report' },
];

export default function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-root/90 backdrop-blur-md">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="shrink-0 text-xl font-bold tracking-tight text-accent font-[family-name:var(--font-outfit)]"
          >
            wenai
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-[14px] text-text-secondary transition-colors hover:text-text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/dashboard"
              className="rounded-md bg-accent px-4 py-2 text-[13px] font-semibold text-bg-root transition-colors hover:bg-accent-hover"
            >
              免费开始第一轮实验
            </Link>
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(value => !value)}
            className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border-subtle text-lg font-mono text-text-primary transition-colors hover:border-accent hover:text-accent md:hidden"
          >
            {mobileOpen ? 'x' : '='}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-x-0 top-16 z-40 border-b border-border-subtle bg-bg-root md:hidden">
          <div className="space-y-2 px-5 py-5">
            {[...NAV, { label: '免费开始第一轮实验', href: '/dashboard' }].map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md border border-border-subtle bg-bg-surface px-4 py-3 text-[15px] font-semibold text-text-primary"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
