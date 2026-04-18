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
  const [authed, setAuthed] = useState(false);
  const [key, setKey] = useState('');
  const [entries, setEntries] = useState<PaymentClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [processed, setProcessed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = sessionStorage.getItem('wenai_admin_key');
    if (saved && saved.length >= 6) setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetch('/api/feedback?type=feedback&moduleId=payment-claim')
      .then(r => r.json())
      .then(d => {
        setEntries(d.entries || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // 加载已处理列表
    const p = localStorage.getItem('wenai_payment_processed');
    if (p) setProcessed(new Set(JSON.parse(p)));
  }, [authed]);

  const handleAuth = () => {
    if (key.length >= 6) {
      sessionStorage.setItem('wenai_admin_key', key);
      setAuthed(true);
    }
  };

  const markProcessed = (id: string) => {
    const newSet = new Set(processed);
    newSet.add(id);
    setProcessed(newSet);
    localStorage.setItem('wenai_payment_processed', JSON.stringify([...newSet]));
  };

  const parseEntry = (e: PaymentClaim): ParsedClaim | null => {
    if (!e.inputSample) return null;
    try {
      const data = JSON.parse(e.inputSample);
      return {
        plan: data.plan || '',
        method: data.method || '',
        contact: data.contact || '',
        amount: data.amount || '',
        time: data.time || '',
        note: data.note || '',
        originalTimestamp: e.timestamp,
      };
    } catch {
      return null;
    }
  };

  if (!authed) {
    return (
      <div className="max-w-md mx-auto py-20 px-6">
        <h1 className="text-lg font-semibold mb-6">管理员 · 付款审核</h1>
        <p className="text-[12px] text-text-secondary mb-4">
          查看所有 &ldquo;付款声明&rdquo; 并手动开通订阅。口令 6 位以上。
        </p>
        <input
          type="password"
          placeholder="输入口令"
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
          进入
        </button>
      </div>
    );
  }

  const parsed = entries.map(e => ({ raw: e, parsed: parseEntry(e) })).filter(p => p.parsed);
  const pending = parsed.filter(p => !processed.has(p.raw.timestamp || ''));
  const done = parsed.filter(p => processed.has(p.raw.timestamp || ''));

  return (
    <div className="max-w-[1000px] mx-auto py-8 px-6">
      <AdminHeader
        subtitle={`付款声明 · 待处理 ${pending.length} / 已处理 ${done.length}`}
        onLogout={() => { sessionStorage.removeItem('wenai_admin_key'); setAuthed(false); }}
      />

      {loading ? (
        <div className="text-center py-12 text-text-tertiary font-mono text-[12px]">加载中...</div>
      ) : parsed.length === 0 ? (
        <div className="text-center py-12 border border-border-subtle rounded-md">
          <p className="text-text-tertiary text-[13px] mb-2">还没有付款声明</p>
          <p className="text-text-tertiary text-[11px] font-mono">
            用户在 /pricing/checkout 提交付款后会出现在这里
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending */}
          {pending.length > 0 && (
            <div>
              <h2 className="text-[13px] font-mono text-accent uppercase tracking-wider mb-3">
                待处理 ({pending.length})
              </h2>
              <div className="space-y-2">
                {pending.map(p => (
                  <div key={p.raw.timestamp} className="border border-accent/30 bg-accent/5 rounded-md p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] font-semibold text-text-primary">
                            订阅 · {p.parsed!.plan.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono text-text-tertiary">
                            {p.parsed!.method}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-text-tertiary">
                          提交于 {p.raw.timestamp ? new Date(p.raw.timestamp).toLocaleString('zh-CN') : '-'}
                        </div>
                      </div>
                      <button
                        onClick={() => markProcessed(p.raw.timestamp || '')}
                        className="px-3 py-1.5 bg-success/10 border border-success/40 text-success text-[11px] font-semibold rounded-md hover:bg-success/20"
                      >
                        ✓ 已核对 → 标记开通
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                      <div>
                        <div className="text-text-tertiary font-mono uppercase text-[9px] mb-0.5">联系</div>
                        <div className="text-text-primary font-mono">{p.parsed!.contact || '-'}</div>
                      </div>
                      <div>
                        <div className="text-text-tertiary font-mono uppercase text-[9px] mb-0.5">金额</div>
                        <div className="text-text-primary font-mono">{p.parsed!.amount || '-'}</div>
                      </div>
                      <div>
                        <div className="text-text-tertiary font-mono uppercase text-[9px] mb-0.5">付款时间</div>
                        <div className="text-text-primary font-mono">{p.parsed!.time || '-'}</div>
                      </div>
                      <div>
                        <div className="text-text-tertiary font-mono uppercase text-[9px] mb-0.5">方式</div>
                        <div className="text-text-primary font-mono">{p.parsed!.method}</div>
                      </div>
                    </div>
                    {p.parsed!.note && (
                      <div className="mt-3 pt-3 border-t border-border-subtle text-[11px]">
                        <div className="text-text-tertiary font-mono uppercase text-[9px] mb-1">备注</div>
                        <div className="text-text-secondary">{p.parsed!.note}</div>
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-border-subtle text-[10px] text-text-tertiary font-mono">
                      下一步手动操作：
                      <br />
                      1. 核对 {p.parsed!.method} 账户是否实到 {p.parsed!.amount || '¥X'}
                      <br />
                      2. 到 Vercel → Environment Variables 改 INVITE_ROSTER，
                      加 <code className="bg-bg-raised px-1">&quot;{p.parsed!.contact}&quot;: {'{'} &quot;name&quot;: &quot;...&quot;, &quot;expiresAt&quot;: &quot;2026-05-18&quot;, &quot;tier&quot;: &quot;{p.parsed!.plan}&quot; {'}'}</code>
                      <br />
                      3. Vercel redeploy，发邮件通知用户
                      <br />
                      4. 回到这里点"已核对"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Done */}
          {done.length > 0 && (
            <div>
              <h2 className="text-[13px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
                已处理 ({done.length})
              </h2>
              <div className="space-y-1">
                {done.map(p => (
                  <div key={p.raw.timestamp} className="border border-border-subtle rounded px-4 py-2 flex items-center justify-between text-[11px] font-mono text-text-tertiary opacity-70">
                    <span>{p.parsed!.plan.toUpperCase()} · {p.parsed!.contact} · {p.parsed!.amount}</span>
                    <span>{p.raw.timestamp ? new Date(p.raw.timestamp).toLocaleDateString('zh-CN') : ''}</span>
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
