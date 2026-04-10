'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// SVG icon components — clean geometric style, no emojis
function IconGrid() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>;
}
function IconSettings() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>;
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
}

const catColors: Record<string, string> = {
  execute: 'bg-cat-execute',
  content: 'bg-cat-content',
  intel: 'bg-cat-intel',
  service: 'bg-cat-service',
};

export default function Sidebar({ modules, categories, clientName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-[248px] h-screen bg-bg-surface flex flex-col border-r border-border-subtle fixed left-0 top-0 z-40">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent/15 border border-accent/30 rounded-md flex items-center justify-center">
            <span className="text-accent font-mono text-xs font-medium">W</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary tracking-tight font-[family-name:var(--font-outfit)]">
              Wenai
            </h1>
            <p className="text-[10px] font-mono text-text-tertiary tracking-wide">
              AI电商员工系统
            </p>
          </div>
        </div>
      </div>

      {/* Client badge */}
      <div className="mx-4 mt-4 px-3 py-2 bg-bg-raised border border-border-subtle rounded-md">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
          <span className="text-[11px] font-mono text-text-secondary truncate">{clientName}</span>
        </div>
      </div>

      {/* Dashboard link */}
      <Link
        href="/"
        className={`mx-4 mt-3 flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-all duration-150 ${
          pathname === '/'
            ? 'bg-accent-dim text-accent border border-accent/20'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-transparent'
        }`}
      >
        <IconGrid />
        <span>工作台总览</span>
      </Link>

      {/* Module navigation */}
      <nav className="flex-1 overflow-y-auto mt-1 px-4 pb-4">
        {categories.map(cat => {
          const catModules = modules.filter(m => m.category === cat.id);
          if (catModules.length === 0) return null;
          return (
            <div key={cat.id} className="mt-5">
              <div className="flex items-center gap-2 px-3 mb-1.5">
                <div className={`w-1 h-1 rounded-full ${catColors[cat.id] || 'bg-text-tertiary'}`} />
                <p className="text-[10px] font-mono font-medium text-text-tertiary uppercase tracking-widest">
                  {cat.label}
                </p>
              </div>
              {catModules.map(mod => {
                const isActive = pathname === `/modules/${mod.id}`;
                const IconFn = iconMap[mod.icon];
                return (
                  <Link
                    key={mod.id}
                    href={`/modules/${mod.id}`}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] transition-all duration-150 ${
                      isActive
                        ? 'bg-accent-dim text-accent border border-accent/20'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-transparent'
                    }`}
                  >
                    <span className="w-4 flex-shrink-0">{IconFn ? IconFn() : null}</span>
                    <span className="truncate">{mod.name}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-4 py-3 border-t border-border-subtle">
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-all duration-150 ${
            pathname === '/settings'
              ? 'bg-accent-dim text-accent border border-accent/20'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-transparent'
          }`}
        >
          <IconSettings />
          <span>客户配置</span>
        </Link>
      </div>
    </aside>
  );
}
