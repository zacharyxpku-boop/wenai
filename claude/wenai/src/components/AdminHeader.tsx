'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type TabKey = 'metrics' | 'feedback' | 'payments' | 'invites' | 'inquiries';
interface Tab {
  key: TabKey;
  href: string;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { key: 'metrics', href: '/admin/metrics', label: '总览', icon: '📊' },
  { key: 'feedback', href: '/admin/feedback', label: '反馈', icon: '💬' },
  { key: 'payments', href: '/admin/payments', label: '付款', icon: '💰' },
  { key: 'invites', href: '/admin/invites', label: '邀请码', icon: '🎟️' },
  { key: 'inquiries', href: '/admin/inquiries', label: '询盘', icon: '📨' },
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
  const [paymentProcessed, setPaymentProcessed] = useState(0);

  useEffect(() => {
    fetch('/api/admin/notifications')
      .then(r => r.json())
      .then(setNotif)
      .catch(() => {});
    try {
      const p = JSON.parse(localStorage.getItem('wenai_payment_processed') || '[]') as string[];
      setPaymentProcessed(p.length);
    } catch {}
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
          const badge = getBadge(t.key);
          const isUrgent = t.key === 'payments' || (t.key === 'invites' && badge) || (t.key === 'inquiries' && badge);
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
