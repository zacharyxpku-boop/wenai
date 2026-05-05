'use client';

import Link from 'next/link';
import { useState } from 'react';
import { COPY } from '@/i18n/zh';

export default function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'product' | 'resource' | null>(null);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-root/85 backdrop-blur-md">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-accent font-[family-name:var(--font-outfit)]"
          >
            {COPY.brand.name}
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Dropdown
              label={COPY.nav.products}
              open={openDropdown === 'product'}
              onOpen={() => setOpenDropdown('product')}
              onClose={() => setOpenDropdown(null)}
              items={COPY.nav.productItems}
            />

            <NavLink href="/cases">{COPY.nav.cases}</NavLink>
            <NavLink href="/pricing">{COPY.nav.pricing}</NavLink>

            <Dropdown
              label={COPY.nav.resources}
              open={openDropdown === 'resource'}
              onOpen={() => setOpenDropdown('resource')}
              onClose={() => setOpenDropdown(null)}
              items={COPY.nav.resourceItems}
            />

            <NavLink href="/about">{COPY.nav.about}</NavLink>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <a
              href="/login"
              className="px-4 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              {COPY.nav.login}
            </a>
            <a
              href="/demo"
              className="rounded-md bg-accent px-4 py-2 text-[13px] font-semibold text-bg-root transition-colors hover:bg-accent-hover"
            >
              {COPY.nav.cta}
            </a>
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
            className="flex size-10 items-center justify-center text-2xl text-text-primary transition-colors hover:text-accent md:hidden"
          >
            {mobileOpen ? 'x' : '='}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 top-16 z-40 overflow-y-auto bg-bg-root md:hidden">
          <div className="space-y-6 px-5 py-6">
            <MobileGroup label={COPY.nav.products} items={COPY.nav.productItems} onClick={closeMobile} />

            <div className="space-y-1">
              <MobileNavLink href="/cases" onClick={closeMobile}>{COPY.nav.cases}</MobileNavLink>
              <MobileNavLink href="/pricing" onClick={closeMobile}>{COPY.nav.pricing}</MobileNavLink>
              <MobileNavLink href="/about" onClick={closeMobile}>{COPY.nav.about}</MobileNavLink>
            </div>

            <MobileGroup label={COPY.nav.resources} items={COPY.nav.resourceItems} onClick={closeMobile} />

            <div className="space-y-3 border-t border-border-subtle pt-4">
              <a
                href="/login"
                onClick={closeMobile}
                className="block w-full rounded-md border border-border-default px-5 py-3 text-center text-[14px] font-semibold text-text-primary transition-colors hover:border-accent hover:text-accent"
              >
                {COPY.nav.login}
              </a>
              <a
                href="/demo"
                onClick={closeMobile}
                className="block w-full rounded-md bg-accent px-5 py-3 text-center text-[14px] font-semibold text-bg-root transition-colors hover:bg-accent-hover"
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
        className="flex items-center gap-1 px-3 py-2 text-[14px] text-text-secondary transition-colors hover:text-text-primary"
      >
        {label}
        <span className="text-[10px] opacity-60">v</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full w-[320px] pt-2">
          <div className="overflow-hidden rounded-lg border border-border-default bg-bg-raised">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block border-b border-border-subtle px-4 py-3 transition-colors last:border-b-0 hover:bg-bg-surface"
              >
                <div className="text-[14px] font-semibold text-text-primary">{item.label}</div>
                <div className="mt-0.5 text-[12px] text-text-tertiary">{item.desc}</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="px-3 py-2 text-[14px] text-text-secondary transition-colors hover:text-text-primary">
      {children}
    </a>
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
    <div>
      <div className="mb-2 px-3 text-[11px] uppercase tracking-wider text-text-tertiary">{label}</div>
      <div className="space-y-1">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={onClick}
            className="block rounded-md px-3 py-3 transition-colors hover:bg-bg-surface"
          >
            <div className="text-[15px] font-semibold text-text-primary">{item.label}</div>
            <div className="mt-0.5 text-[12px] text-text-tertiary">{item.desc}</div>
          </a>
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
    <a
      href={href}
      onClick={onClick}
      className="block rounded-md px-3 py-3 text-[15px] font-semibold text-text-primary transition-colors hover:bg-bg-surface"
    >
      {children}
    </a>
  );
}
