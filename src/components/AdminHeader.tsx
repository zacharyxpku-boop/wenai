'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Tab {
  href: string;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { href: '/admin/metrics', label: '总览', icon: '📊' },
  { href: '/admin/feedback', label: '反馈', icon: '💬' },
  { href: '/admin/payments', label: '付款', icon: '💰' },
  { href: '/admin/invites', label: '邀请码', icon: '🎟️' },
];

interface Props {
  onLogout?: () => void;
  subtitle?: string;
}

export default function AdminHeader({ onLogout, subtitle }: Props) {
  const pathname = usePathname();
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <div className="text-[10px] font-mono text-accent uppercase tracking-[0.15em]">
            WENAI ADMIN
          </div>
          {subtitle && (
            <div className="text-[11px] font-mono text-text-tertiary mt-0.5">{subtitle}</div>
          )}
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="text-[11px] font-mono text-text-tertiary hover:text-accent border border-border-subtle rounded px-3 py-1.5"
          >
            登出
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border-subtle overflow-x-auto">
        {TABS.map(t => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-mono border-b-2 transition-all flex-shrink-0 ${
                active
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-default'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
