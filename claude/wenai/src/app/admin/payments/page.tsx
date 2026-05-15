'use client';

import { useEffect, useState } from 'react';
import AdminHeader from '@/components/AdminHeader';

interface PaymentClaim {
  comment?: string;
  inputSample?: string;
  timestamp?: string;
  verdict?: string;
}

interface ParsedClaim {
  plan: string;
  method: string;
  contact: string;
  amount: string;
  time: string;
  note: string;
  originalTimestamp?: string;
}

export default function AdminPaymentsPage() {
  const [authed, setAuthed] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = sessionStorage.getItem('wenai_admin_key');
    return Boolean(saved && saved.length >= 6);
  });
  const [key, setKey] = useState('');
  const [entries, setEntries] = useState<PaymentClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [processed, setProcessed] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      return new Set(JSON.parse(localStorage.getItem('wenai_payment_processed') || '[]') as string[]);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    if (!authed) return;
    fetch('/api/feedback?type=feedback&moduleId=payment-claim')
      .then(r => r.json())
      .then(data => {
        setEntries(data.entries || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authed]);

  const handleAuth = () => {
    if (key.length >= 6) {
      sessionStorage.setItem('wenai_admin_key', key);
      setAuthed(true);
    }
  };

  const markProcessed = (id: string) => {
    const next = new Set(processed);
    next.add(id);
    setProcessed(next);
    localStorage.setItem('wenai_payment_processed', JSON.stringify([...next]));
  };

  const parseEntry = (entry: PaymentClaim): ParsedClaim | null => {
    if (!entry.inputSample) return null;
    try {
      const data = JSON.parse(entry.inputSample);
      return {
        plan: data.plan || '',
        method: data.method || '',
        contact: data.contact || '',
        amount: data.amount || '',
        time: data.time || '',
        note: data.note || '',
        originalTimestamp: entry.timestamp,
      };
    } catch {
      return null;
    }
  };

  if (!authed) {
    return (
      <div className="max-w-md mx-auto py-20 px-6">
        <h1 className="text-lg font-semibold mb-6">后台 / 付款审核</h1>
        <p className="text-[12px] text-text-secondary mb-4">
          审核客户付款认领，财务确认后手动开通权限。
        </p>
        <input
          type="password"
          placeholder="输入后台口令"
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAuth()}
          className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-md text-[13px] mb-3"
        />
        <button
          onClick={handleAuth}
          disabled={key.length < 6}
          className="w-full py-2 bg-accent hover:bg-accent-hover disabled:bg-border-subtle text-bg-root text-[13px] font-semibold rounded-md"
        >
          进入后台
        </button>
      </div>
    );
  }

  const parsed = entries.map(entry => ({ raw: entry, parsed: parseEntry(entry) })).filter(item => item.parsed);
  const pending = parsed.filter(item => !processed.has(item.raw.timestamp || ''));
  const done = parsed.filter(item => processed.has(item.raw.timestamp || ''));

  return (
    <div className="max-w-[1000px] mx-auto py-8 px-6">
      <AdminHeader
        subtitle={`付款认领。待处理 ${pending.length} / 已处理 ${done.length}。`}
        onLogout={() => { sessionStorage.removeItem('wenai_admin_key'); setAuthed(false); }}
      />

      {loading ? (
        <div className="text-center py-12 text-text-tertiary font-mono text-[12px]">正在加载付款认领...</div>
      ) : parsed.length === 0 ? (
        <div className="text-center py-12 border border-border-subtle rounded-md">
          <p className="text-text-tertiary text-[13px] mb-2">暂无付款认领。</p>
          <p className="text-text-tertiary text-[11px] font-mono">
            客户从 /pricing/checkout 提交的付款认领会显示在这里。
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h2 className="text-[13px] font-mono text-accent uppercase tracking-wider mb-3">
                Pending ({pending.length})
              </h2>
              <div className="space-y-2">
                {pending.map(item => (
                  <div key={item.raw.timestamp} className="border border-accent/30 bg-accent/5 rounded-md p-4">
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[13px] font-semibold text-text-primary">
                            Subscription / {item.parsed!.plan.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono text-text-tertiary">
                            {item.parsed!.method}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-text-tertiary">
                          Submitted {item.raw.timestamp ? new Date(item.raw.timestamp).toLocaleString('en-US') : '-'}
                        </div>
                      </div>
                      <button
                        onClick={() => markProcessed(item.raw.timestamp || '')}
                        className="px-3 py-1.5 bg-success/10 border border-success/40 text-success text-[11px] font-semibold rounded-md hover:bg-success/20"
                      >
                        Mark verified
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                      <ClaimField label="Contact" value={item.parsed!.contact || '-'} />
                      <ClaimField label="Amount" value={item.parsed!.amount || '-'} />
                      <ClaimField label="Paid at" value={item.parsed!.time || '-'} />
                      <ClaimField label="Method" value={item.parsed!.method || '-'} />
                    </div>
                    {item.parsed!.note && (
                      <div className="mt-3 pt-3 border-t border-border-subtle text-[11px]">
                        <div className="text-text-tertiary font-mono uppercase text-[9px] mb-1">Note</div>
                        <div className="text-text-secondary">{item.parsed!.note}</div>
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-border-subtle text-[10px] text-text-tertiary font-mono leading-relaxed">
                      Manual activation checklist:
                      <br />
                      1. Confirm the payment arrived in the {item.parsed!.method} account for {item.parsed!.amount || 'the claimed amount'}.
                      <br />
                      2. Add or update access in Vercel environment variables or the invite roster for {item.parsed!.contact || 'this customer'}.
                      <br />
                      3. Redeploy if required, notify the customer, then mark this claim verified.
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {done.length > 0 && (
            <div>
              <h2 className="text-[13px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
                Processed ({done.length})
              </h2>
              <div className="space-y-1">
                {done.map(item => (
                  <div key={item.raw.timestamp} className="border border-border-subtle rounded px-4 py-2 flex items-center justify-between gap-3 text-[11px] font-mono text-text-tertiary opacity-70">
                    <span>{item.parsed!.plan.toUpperCase()} / {item.parsed!.contact} / {item.parsed!.amount}</span>
                    <span>{item.raw.timestamp ? new Date(item.raw.timestamp).toLocaleDateString('en-US') : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ClaimField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-text-tertiary font-mono uppercase text-[9px] mb-0.5">{label}</div>
      <div className="text-text-primary font-mono">{value}</div>
    </div>
  );
}
