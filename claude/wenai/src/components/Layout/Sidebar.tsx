'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// SVG icon components — clean geometric style, no emojis
function IconGrid() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>;
}
function IconSettings() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>;
}
function IconFile() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 1.5h5l3 3V14a.5.5 0 0 1-.5.5h-7A.5.5 0 0 1 4 14z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M9 1.5v3h3M6 8h4M6 10.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>;
}
function IconUpload() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 10V2.5M5 5.5l3-3 3 3M3 11.5V13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

const iconMap: Record<string, () => React.ReactNode> = {
  translate: () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1 3h8M5 1v2M3 3c0 2.5 1 5 4 7M7 3c0 2 .5 3.5 2 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M8 14l2.5-6L13 14M9 12h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  mail: () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="3" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 4.5l6.5 4 6.5-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  star: () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5l1.8 3.7 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  video: () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="3" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M10 6l4-2v7l-4-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  pencil: () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10.5 2.5l2 2-8 8H2.5v-2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M8.5 4.5l2 2" stroke="currentColor" strokeWidth="1.3"/></svg>,
  sparkles: () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1l1.2 4.3L13 6.5l-4.3 1.2L7.5 12l-1.2-4.3L2 6.5l4.3-1.2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  image: () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="2" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="5" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 10.5l3-3 2 2 3-3 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  mic: () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="5" y="1" width="5" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M3 7c0 2.5 2 4.5 4.5 4.5S12 9.5 12 7M7.5 11.5V14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  search: () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  chart: () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 13V6M5.5 13V4M9 13V8M12.5 13V2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  calendar: () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 6.5h13M4.5 1v3M10.5 1v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  headset: () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 8V7a4.5 4.5 0 019 0v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><rect x="1" y="8" width="3" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="11" y="8" width="3" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>,
  target: () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3"/><circle cx="7.5" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.3"/><circle cx="7.5" cy="7.5" r="0.8" fill="currentColor"/></svg>,
  shield: () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5L2 4v4c0 3.5 2.5 5.5 5.5 6.5 3-1 5.5-3 5.5-6.5V4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5.5 7.5l1.5 1.5 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

interface NavItem {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  category: string;
  categoryLabel: string;
}

interface SidebarProps {
  modules: NavItem[];
  categories: { id: string; label: string; color: string }[];
  clientName: string;
  userRole?: string;
}

export default function Sidebar({ modules, categories, clientName, userRole }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  const [me, setMe] = useState<{ displayName?: string; daysLeft?: number; tier?: string; expiresAt?: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setMe(d); })
      .catch(() => {});
  }, []);

  // Close mobile sidebar on navigation (avoid setState in effect pattern)
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 w-9 h-9 bg-bg-surface border border-border-subtle rounded-md flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
        aria-label="Toggle menu"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          {mobileOpen
            ? <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            : <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          }
        </svg>
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`w-[240px] h-screen bg-bg-surface flex flex-col border-r border-border-default fixed left-0 top-0 z-40 shadow-[2px_0_12px_rgba(0,0,0,0.4)] transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      {/* Brand */}
      <div className="px-4 py-4 border-b border-border-default">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-8 h-8 bg-accent/15 border border-accent/40 rounded-md flex items-center justify-center group-hover:bg-accent/25 group-hover:border-accent/60 group-hover:shadow-[0_0_12px_rgba(200,151,90,0.2)] transition-all duration-200">
            <span className="text-accent font-mono text-[12px] font-bold">W</span>
          </div>
          <div>
            <h1 className="text-[14px] font-bold text-text-primary tracking-tight font-[family-name:var(--font-outfit)] group-hover:text-accent transition-colors">
              Wenai
            </h1>
            <p className="text-[8px] font-mono text-text-tertiary tracking-[0.14em] uppercase">
              CONTENT DECISION OS
            </p>
          </div>
        </div>
      </div>

      {/* Client badge */}
      <div className="mx-3.5 mt-4 px-3 py-2.5 bg-bg-raised/80 border border-border-subtle rounded-md backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot shadow-[0_0_4px_rgba(74,222,128,0.6)]" />
          <span className="text-[10px] font-mono text-text-primary font-medium truncate">{clientName}</span>
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex-1 h-px bg-success/20" />
          <span className="text-[7px] font-mono text-success/80 uppercase tracking-wide">online</span>
        </div>
      </div>

      <Link
        href="/dashboard"
        className={`mx-3.5 mt-4 flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[12px] transition-all duration-200 ${
          pathname === '/dashboard'
            ? 'bg-accent text-bg-root border border-accent shadow-[0_2px_8px_rgba(200,151,90,0.3)] font-semibold'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-transparent hover:border-border-subtle'
        }`}
      >
        <span className="w-4 flex-shrink-0 opacity-90"><IconGrid /></span>
        <span className="font-[family-name:var(--font-outfit)] font-semibold">工作台</span>
      </Link>

      {/* 快捷键提示 */}
      <div className="mx-3.5 mt-2 px-3 py-1.5 rounded-md border border-dashed border-border-subtle text-[10px] font-mono text-text-tertiary space-y-1">
        <div className="flex items-center gap-2">
          <kbd className="text-[9px] px-1 py-0.5 border border-border-default rounded bg-bg-surface text-text-secondary font-mono">⌘K</kbd>
          <span>打开核心动作</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="text-[9px] px-1 py-0.5 border border-border-default rounded bg-bg-surface text-text-secondary font-mono">?</kbd>
          <span>查看快捷键</span>
        </div>
      </div>

      {/* 核心闭环入口 */}
      <div className="mx-3.5 mt-2 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2 px-2.5 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_4px_currentColor]" />
          <p className="label-mono text-[9px] font-semibold text-accent">CORE WORKFLOW</p>
          <div className="flex-1 h-px bg-accent/20" />
          <span className="text-[7px] font-mono text-accent/60">5</span>
        </div>
        <div className="space-y-1">
          {[
            { href: '/dashboard', label: '实验项目', badge: '01', tone: '开始' },
            { href: '/factory', label: '导入 CSV', badge: '02', tone: '数据' },
            { href: '/poc/report', label: '报告模板', badge: '03', tone: '分享' },
            { href: '/pricing', label: '订阅方案', badge: '04', tone: '权益' },
            { href: '/settings/kuaizi', label: '生产工具设置', badge: '05', tone: '可选' },
          ].map(p => {
            const active = pathname === p.href;
            return (
              <Link
                key={p.href}
                href={p.href}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-md text-[12px] transition-all group ${
                  active
                    ? 'bg-accent/15 text-accent border border-accent/30 font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-transparent hover:border-border-subtle'
                }`}
              >
                <span className="text-[9px] font-mono text-accent/70 tabular-nums w-4">{p.badge}</span>
                <span className="flex-1 font-[family-name:var(--font-outfit)]">{p.label}</span>
                <span className="text-[8px] font-mono uppercase tracking-wider text-accent/70">{p.tone}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Module navigation · admin-only legacy access */}
      <nav className="flex-1 overflow-y-auto mt-3 px-3.5 pb-4">
        <div className="rounded-md border border-border-subtle bg-bg-root/40 p-3 text-[11px] leading-5 text-text-secondary">
          当前版本聚焦项目、导入、决策、报告和模板复用。更多辅助工具由管理员统一配置后开放。
        </div>
        {userRole === 'admin' && categories.map(cat => {
          const catModules = modules.filter(m => m.category === cat.id);
          if (catModules.length === 0) return null;
          return (
            <div key={cat.id} className="mt-5 first:mt-3">
              <div className="flex items-center gap-2 px-2.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
                <p className="label-mono text-[9px] font-semibold">{cat.label}</p>
                <div className="flex-1 h-px bg-border-subtle/50" />
                <span className="text-[7px] font-mono text-text-tertiary/60 tabular-nums">{catModules.length}</span>
              </div>
              <div className="space-y-0.5">
                {catModules.map(mod => {
                  const isActive = pathname === `/modules/${mod.id}`;
                  const IconFn = iconMap[mod.icon];
                  return (
                    <Link
                      key={mod.id}
                      href={`/modules/${mod.id}`}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] transition-all duration-200 group ${
                        isActive
                          ? 'bg-accent/20 text-accent border border-accent/40 shadow-[0_2px_8px_rgba(200,151,90,0.15)] font-semibold'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-transparent hover:border-border-subtle'
                      }`}
                    >
                      <span className={`w-4 flex-shrink-0 transition-all ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                        {IconFn ? IconFn() : <IconFile />}
                      </span>
                      <span className="truncate font-[family-name:var(--font-outfit)] font-medium">{mod.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Beta 剩余天数 + 接入入口 */}
      <div className="px-3.5 pt-2 pb-1 space-y-1.5">
        {/* 剩余天数卡 (仅邀请用户显示) */}
        {me && typeof me.daysLeft === 'number' && me.daysLeft < 3650 && (
          <div className={`px-3 py-2 rounded-md border ${
            me.daysLeft < 0
              ? 'border-error/40 bg-error/10'
              : me.daysLeft <= 3
              ? 'border-error/40 bg-error/5'
              : me.daysLeft <= 7
              ? 'border-accent/40 bg-accent/5'
              : 'border-border-subtle bg-bg-surface/50'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider">
                {me.tier === 'team' ? '试跑' : me.tier === 'enterprise' ? '企业' : '内测'}
              </span>
              <span className={`text-[10px] font-mono tabular-nums font-semibold ${
                me.daysLeft < 0 ? 'text-error'
                : me.daysLeft <= 3 ? 'text-error'
                : me.daysLeft <= 7 ? 'text-accent'
                : 'text-text-secondary'
              }`}>
                {me.daysLeft < 0 ? '已过期' : `剩 ${me.daysLeft} 天`}
              </span>
            </div>
            {me.displayName && (
              <div className="text-[10px] text-text-secondary truncate font-[family-name:var(--font-outfit)]">
                Hi {me.displayName}
              </div>
            )}
            {me.daysLeft <= 7 && me.tier !== 'enterprise' && (
              <Link
                href="/pricing"
                className="block mt-1.5 text-[10px] font-mono text-accent hover:underline"
              >
                {me.daysLeft < 0 ? '联系作者续期 →' : '提交 POC 需求 →'}
              </Link>
            )}
          </div>
        )}

        {/* Pricing · 接入入口 */}
        <Link
          href="/pricing"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[11px] transition-all group ${
            pathname === '/pricing'
              ? 'bg-accent/10 text-accent border border-accent/30'
              : 'text-text-tertiary hover:text-accent border border-transparent hover:border-accent/20 hover:bg-accent/5'
          }`}
        >
          <span className="w-3 h-3 rounded-sm border border-accent/60 bg-accent/15" aria-hidden="true" />
          <span className="font-[family-name:var(--font-outfit)] font-semibold">定价</span>
          <span className="ml-auto text-[9px] font-mono opacity-60">Free / Starter</span>
        </Link>
      </div>

      {/* Settings — admin only */}
      <div className="px-3.5 py-3.5 border-t border-border-default bg-bg-surface/50">
        {userRole === 'admin' && (
          <Link
            href="/settings"
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[12px] transition-all duration-200 group ${
              pathname === '/settings'
                ? 'bg-accent/20 text-accent border border-accent/40 shadow-[0_2px_8px_rgba(200,151,90,0.15)] font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-transparent hover:border-border-subtle'
            }`}
          >
            <span className={`w-4 flex-shrink-0 transition-all ${pathname === '/settings' ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
              <IconSettings />
            </span>
            <span className="font-[family-name:var(--font-outfit)] font-semibold">配置</span>
            {pathname === '/settings' && (
              <div className="ml-auto w-1 h-1 rounded-full bg-accent animate-pulse-dot" />
            )}
          </Link>
        )}
        <Link
          href="/factory"
          className="mt-2 flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[12px] transition-all duration-200 text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-transparent hover:border-border-subtle"
        >
          <span className="w-4 flex-shrink-0 opacity-70"><IconUpload /></span>
          <span className="font-[family-name:var(--font-outfit)] font-semibold">导入 CSV</span>
        </Link>
        {/* Role badge */}
        {userRole && (
          <div className="flex items-center gap-2 px-3 mt-2">
            <div className={`w-1.5 h-1.5 rounded-full ${userRole === 'admin' ? 'bg-accent' : userRole === 'editor' ? 'bg-success' : 'bg-text-tertiary'}`} />
            <span className="text-[9px] font-mono text-text-tertiary uppercase">{userRole}</span>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
