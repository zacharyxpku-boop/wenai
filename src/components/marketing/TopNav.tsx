'use client';

import Link from 'next/link';
import { useState } from 'react';

const PRODUCT_ITEMS = [
  { label: '试点流程', desc: '选类目、填商品、生成交付包', href: '/poc' },
  { label: '商品上新', desc: '标题、卖点、详情页和合规提示', href: '/pipelines/new-listing' },
  { label: '内容营销', desc: '短视频脚本、图文结构和发布复盘', href: '/pipelines/marketing-campaign' },
];

const RESOURCE_ITEMS = [
  { label: '交付样例', desc: '看客户最终能拿到什么', href: '/cases' },
  { label: '产品说明', desc: '适合谁、怎么试、怎么验收', href: '/docs' },
  { label: '企业接入', desc: '品牌规则、团队权限和系统集成', href: '/enterprise' },
];

export default function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'product' | 'resource' | null>(null);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-root/95">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="font-[family-name:var(--font-outfit)] text-xl font-semibold text-text-primary">wenai</span>
          <span className="hidden rounded-full border border-border-default px-2.5 py-1 text-[12px] text-text-tertiary lg:inline-flex">
            电商交付台
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Dropdown
            label="产品"
            open={openDropdown === 'product'}
            onOpen={() => setOpenDropdown('product')}
            onClose={() => setOpenDropdown(null)}
            items={PRODUCT_ITEMS}
          />
          <NavLink href="/cases">样例</NavLink>
          <NavLink href="/pricing">价格</NavLink>
          <Dropdown
            label="资料"
            open={openDropdown === 'resource'}
            onOpen={() => setOpenDropdown('resource')}
            onClose={() => setOpenDropdown(null)}
            items={RESOURCE_ITEMS}
          />
          <NavLink href="/about">关于</NavLink>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-md border border-border-subtle px-4 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:border-border-default hover:text-text-primary"
          >
            登录
          </Link>
          <Link
            href="/poc"
            className="rounded-md bg-accent px-4 py-2 text-[13px] font-semibold text-bg-root transition-colors hover:bg-accent-hover"
          >
            免费试一轮
          </Link>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? '关闭导航' : '打开导航'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((value) => !value)}
          className="flex size-10 items-center justify-center rounded-md border border-border-subtle text-text-primary md:hidden"
        >
          <span className="flex flex-col gap-1">
            <span className="h-px w-4 bg-current" />
            <span className="h-px w-4 bg-current" />
            <span className="h-px w-4 bg-current" />
          </span>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border-subtle bg-bg-root md:hidden">
          <div className="mx-auto max-w-[1200px] space-y-6 px-5 py-6 sm:px-6">
            <MobileGroup label="产品" items={PRODUCT_ITEMS} onClick={closeMobile} />
            <div className="space-y-1">
              <MobileNavLink href="/cases" onClick={closeMobile}>样例</MobileNavLink>
              <MobileNavLink href="/pricing" onClick={closeMobile}>价格</MobileNavLink>
              <MobileNavLink href="/about" onClick={closeMobile}>关于</MobileNavLink>
            </div>
            <MobileGroup label="资料" items={RESOURCE_ITEMS} onClick={closeMobile} />
            <div className="grid gap-3 border-t border-border-subtle pt-4">
              <Link
                href="/login"
                onClick={closeMobile}
                className="rounded-md border border-border-default px-4 py-3 text-center text-[14px] font-medium text-text-primary"
              >
                登录
              </Link>
              <Link
                href="/poc"
                onClick={closeMobile}
                className="rounded-md bg-accent px-4 py-3 text-center text-[14px] font-semibold text-bg-root"
              >
                免费试一轮
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Dropdown({
  label,
  open,
  onOpen,
  onClose,
  items,
}: {
  label: string;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  items: readonly { label: string; desc: string; href: string }[];
}) {
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-[14px] text-text-secondary transition-colors hover:text-text-primary"
      >
        {label}
        <span aria-hidden className="text-[10px] text-text-tertiary">v</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full w-[320px] pt-2">
          <div className="overflow-hidden rounded-md border border-border-default bg-bg-surface">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block border-b border-border-subtle px-4 py-3 transition-colors last:border-b-0 hover:bg-bg-raised"
              >
                <div className="text-[14px] font-medium text-text-primary">{item.label}</div>
                <div className="mt-1 text-[12px] leading-5 text-text-tertiary">{item.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-md px-3 py-2 text-[14px] text-text-secondary transition-colors hover:text-text-primary">
      {children}
    </Link>
  );
}

function MobileGroup({
  label,
  items,
  onClick,
}: {
  label: string;
  items: readonly { label: string; desc: string; href: string }[];
  onClick: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-[12px] text-text-tertiary">{label}</div>
      <div className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className="block rounded-md border border-border-subtle bg-bg-surface px-4 py-3"
          >
            <div className="text-[15px] font-medium text-text-primary">{item.label}</div>
            <div className="mt-1 text-[12px] leading-5 text-text-tertiary">{item.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-md border border-border-subtle bg-bg-surface px-4 py-3 text-[15px] font-medium text-text-primary"
    >
      {children}
    </Link>
  );
}
