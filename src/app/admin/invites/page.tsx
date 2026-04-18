'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Invite {
  name: string;
  expiresAt: string;
  tenantId?: string;
  tier?: 'free' | 'team' | 'enterprise';
}

const DEFAULT_NEW: Invite & { code: string } = {
  code: '',
  name: '',
  expiresAt: '',
  tenantId: 'default',
  tier: 'free',
};

export default function AdminInvitesPage() {
  const [authed, setAuthed] = useState(false);
  const [key, setKey] = useState('');
  const [invites, setInvites] = useState<Record<string, Invite>>({});
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...DEFAULT_NEW });
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('wenai_admin_key');
    if (saved && saved.length >= 6) setAuthed(true);
  }, []);

  const fetchInvites = async () => {
    try {
      const res = await fetch('/api/admin/invites');
      if (!res.ok) {
        setInvites({});
        return;
      }
      const d = await res.json();
      setInvites(d.invites || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) fetchInvites();
  }, [authed]);

  const handleAuth = () => {
    if (key.length >= 6) {
      sessionStorage.setItem('wenai_admin_key', key);
      setAuthed(true);
    }
  };

  const handleSave = async () => {
    if (!form.code || !form.name || !form.expiresAt) {
      setSaveMsg('code/name/到期日 必填');
      return;
    }
    const res = await fetch('/api/admin/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const d = await res.json();
    if (res.ok) {
      setSaveMsg(`✓ ${form.code} 已${editingCode ? '更新' : '新增'}`);
      setForm({ ...DEFAULT_NEW });
      setEditingCode(null);
      fetchInvites();
    } else {
      setSaveMsg(`✗ ${d.error}`);
    }
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleEdit = (code: string, inv: Invite) => {
    setForm({
      code,
      name: inv.name,
      expiresAt: inv.expiresAt,
      tenantId: inv.tenantId || 'default',
      tier: inv.tier || 'free',
    });
    setEditingCode(code);
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`删除邀请码 "${code}"? 用户将无法登录`)) return;
    const res = await fetch(`/api/admin/invites?code=${encodeURIComponent(code)}`, { method: 'DELETE' });
    const d = await res.json();
    if (res.ok) {
      setSaveMsg(`✓ ${code} 已删除`);
      fetchInvites();
    } else {
      setSaveMsg(`✗ ${d.error}`);
    }
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleCopyLink = (code: string) => {
    const url = `${window.location.origin}/invite?code=${code}`;
    navigator.clipboard.writeText(url);
    setSaveMsg(`✓ 复制 ${url}`);
    setTimeout(() => setSaveMsg(''), 2000);
  };

  if (!authed) {
    return (
      <div className="max-w-md mx-auto py-20 px-6">
        <h1 className="text-lg font-semibold mb-6">管理员 · 邀请码面板</h1>
        <p className="text-[12px] text-text-secondary mb-4">
          共享 /admin 口令 (6 位+)
        </p>
        <input
          type="password"
          placeholder="口令"
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

  const sorted = Object.entries(invites).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="max-w-[1000px] mx-auto py-8 px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">邀请码管理</h1>
          <p className="text-[11px] font-mono text-text-tertiary mt-1">
            Redis (可改) + env (静态) + 内置 三级合并 · 共 {sorted.length}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/metrics" className="text-[11px] font-mono text-text-tertiary hover:text-accent border border-border-subtle rounded px-3 py-1.5">
            ← Metrics
          </Link>
          <button
            onClick={() => { sessionStorage.removeItem('wenai_admin_key'); setAuthed(false); }}
            className="text-[11px] text-text-tertiary hover:text-accent"
          >
            登出
          </button>
        </div>
      </div>

      {/* 新增/编辑表单 */}
      <div className="mb-6 p-4 border border-border-subtle rounded-md bg-bg-surface">
        <div className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
          {editingCode ? `编辑 · ${editingCode}` : '新增邀请码'}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
          <input
            type="text"
            placeholder="code (2-32 位字母/数字/-_)"
            value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value })}
            disabled={!!editingCode}
            className="px-2 py-1.5 bg-bg-raised border border-border-default rounded text-[12px] disabled:opacity-50"
          />
          <input
            type="text"
            placeholder="显示名"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="px-2 py-1.5 bg-bg-raised border border-border-default rounded text-[12px]"
          />
          <input
            type="date"
            value={form.expiresAt}
            onChange={e => setForm({ ...form, expiresAt: e.target.value })}
            className="px-2 py-1.5 bg-bg-raised border border-border-default rounded text-[12px] font-mono"
          />
          <select
            value={form.tier}
            onChange={e => setForm({ ...form, tier: e.target.value as 'free' | 'team' | 'enterprise' })}
            className="px-2 py-1.5 bg-bg-raised border border-border-default rounded text-[12px]"
          >
            <option value="free">Free</option>
            <option value="team">Team</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-bg-root text-[12px] font-semibold rounded"
          >
            {editingCode ? '更新' : '新增'}
          </button>
        </div>
        {editingCode && (
          <button
            onClick={() => { setForm({ ...DEFAULT_NEW }); setEditingCode(null); }}
            className="text-[10px] font-mono text-text-tertiary hover:text-accent"
          >
            取消编辑
          </button>
        )}
        {saveMsg && (
          <div className={`mt-2 text-[11px] font-mono ${saveMsg.startsWith('✓') ? 'text-success' : 'text-error'}`}>
            {saveMsg}
          </div>
        )}
      </div>

      {/* 名册列表 */}
      {loading ? (
        <div className="text-center py-12 text-text-tertiary font-mono text-[12px]">加载中...</div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 border border-border-subtle rounded-md text-text-tertiary text-[13px]">
          暂无邀请码
        </div>
      ) : (
        <div className="border border-border-subtle rounded-md overflow-hidden">
          <div className="px-3 py-2 bg-bg-raised/50 border-b border-border-subtle grid grid-cols-12 gap-2 text-[9px] font-mono text-text-tertiary uppercase">
            <div className="col-span-3">Code</div>
            <div className="col-span-3">Name</div>
            <div className="col-span-2">到期</div>
            <div className="col-span-1">Tier</div>
            <div className="col-span-3 text-right">操作</div>
          </div>
          <div className="divide-y divide-border-subtle">
            {sorted.map(([code, inv]) => {
              const daysLeft = Math.ceil((new Date(inv.expiresAt + 'T23:59:59').getTime() - Date.now()) / 86400000);
              const expired = daysLeft < 0;
              return (
                <div key={code} className="px-3 py-2.5 grid grid-cols-12 gap-2 items-center text-[12px] hover:bg-bg-surface/50">
                  <div className="col-span-3 font-mono text-accent truncate">{code}</div>
                  <div className="col-span-3 truncate">{inv.name}</div>
                  <div className={`col-span-2 font-mono text-[11px] ${expired ? 'text-error' : daysLeft <= 7 ? 'text-accent' : 'text-text-secondary'}`}>
                    {inv.expiresAt}
                    <span className="block text-[9px] opacity-60">
                      {expired ? '已过期' : `剩 ${daysLeft} 天`}
                    </span>
                  </div>
                  <div className="col-span-1 font-mono text-[10px] text-text-tertiary">{inv.tier || 'free'}</div>
                  <div className="col-span-3 flex justify-end gap-1.5">
                    <button
                      onClick={() => handleCopyLink(code)}
                      className="text-[10px] font-mono text-text-tertiary hover:text-accent px-2 py-1"
                    >
                      复制链接
                    </button>
                    <button
                      onClick={() => handleEdit(code, inv)}
                      className="text-[10px] font-mono text-text-tertiary hover:text-accent px-2 py-1"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(code)}
                      className="text-[10px] font-mono text-text-tertiary hover:text-error px-2 py-1"
                    >
                      删除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 text-[10px] font-mono text-text-tertiary">
        内置名册 (alice/bob/charlie/demo/wzqfriend) 不可删除,修改需改 env INVITE_ROSTER
      </div>
    </div>
  );
}
