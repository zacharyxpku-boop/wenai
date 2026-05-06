'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type TabKey = 'metrics' | 'feedback' | 'payments' | 'invites' | 'inquiries' | 'cost' | 'cache' | 'alerts';

interface Tab {
  key: TabKey;
  href: string;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { key: 'metrics', href: '/admin/metrics', label: '总览', icon: '总览' },
  { key: 'feedback', href: '/admin/feedback', label: '反馈', icon: '反馈' },
  { key: 'payments', href: '/admin/payments', label: '付款', icon: '付款' },
  { key: 'invites', href: '/admin/invites', label: '邀请', icon: '邀请' },
  { key: 'inquiries', href: '/admin/inquiries', label: 'CRM', icon: '商机' },
  { key: 'cost', href: '/admin/cost', label: '成本', icon: '成本' },
  { key: 'cache', href: '/admin/cache', label: '缓存', icon: '缓存' },
  { key: 'alerts', href: '/admin/alerts', label: '告警', icon: '告警' },
];

interface Notifications {
  paymentsTotal?: number;
  feedback24h?: number;
  invitesExpiringSoon?: number;
  inquiriesNew?: number;
}

interface Props {
  onLogout?: () => void;
  subtitle?: string;
}

export default function AdminHeader({ onLogout, subtitle }: Props) {
  const pathname = usePathname();
  const [notif, setNotif] = useState<Notifications>({});
  const [paymentProcessed] = useState(() => {
    if (typeof window === 'undefined') return 0;
    try {
      return (JSON.parse(localStorage.getItem('wenai_payment_processed') || '[]') as string[]).length;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    fetch('/api/admin/notifications')
      .then(response => response.json())
      .then(setNotif)
      .catch(() => {});
  }, [pathname]);

  const getBadge = (key: TabKey): number | null => {
    if (key === 'payments') {
      const pending = (notif.paymentsTotal || 0) - paymentProcessed;
      return pending > 0 ? pending : null;
    }
    if (key === 'feedback') return notif.feedback24h && notif.feedback24h > 0 ? notif.feedback24h : null;
    if (key === 'invites') return notif.invitesExpiringSoon && notif.invitesExpiringSoon > 0 ? notif.invitesExpiringSoon : null;
    if (key === 'inquiries') return notif.inquiriesNew && notif.inquiriesNew > 0 ? notif.inquiriesNew : null;
    return null;
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <div className="text-[10px] font-mono text-accent uppercase tracking-[0.15em]">
            WENAI 后台
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
            退出
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 border-b border-border-subtle overflow-x-auto">
        {TABS.map(tab => {
          const active = pathname === tab.href;
          const badge = getBadge(tab.key);
          const isUrgent = tab.key === 'payments' || (tab.key === 'invites' && badge) || (tab.key === 'inquiries' && badge);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-mono border-b-2 transition-all flex-shrink-0 ${
                active
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-default'
              }`}
            >
              <span className="text-[9px] uppercase tracking-wider opacity-70">{tab.icon}</span>
              <span>{tab.label}</span>
              {badge !== null && (
                <span className={`text-[9px] font-mono font-semibold tabular-nums px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                  isUrgent ? 'bg-error/20 text-error' : 'bg-accent/20 text-accent'
                }`}>
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
