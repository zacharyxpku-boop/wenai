'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminHeader from '@/components/AdminHeader';

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
  const [saveOk, setSaveOk] = useState(true);

  const adminHeaders = useCallback((): Record<string, string> => {
    const saved = sessionStorage.getItem('wenai_admin_key') || key;
    return saved ? { 'x-admin-key': saved } : {};
  }, [key]);

  useEffect(() => {
    const saved = sessionStorage.getItem('wenai_admin_key');
    if (saved && saved.length >= 6) setAuthed(true);
  }, []);

  const fetchInvites = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/invites', { headers: adminHeaders() });
      if (!res.ok) {
        setInvites({});
        return;
      }
      const data = await res.json();
      setInvites(data.invites || {});
    } finally {
      setLoading(false);
    }
  }, [adminHeaders]);

  useEffect(() => {
    if (authed) fetchInvites();
  }, [authed, fetchInvites]);

  const flash = (message: string, ok = true) => {
    setSaveMsg(message);
    setSaveOk(ok);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleAuth = () => {
    if (key.length >= 6) {
      sessionStorage.setItem('wenai_admin_key', key);
      setAuthed(true);
    }
  };

  const handleSave = async () => {
    if (!form.code || !form.name || !form.expiresAt) {
      flash('请填写邀请码、显示名称和过期日期。', false);
      return;
    }
    const res = await fetch('/api/admin/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminHeaders() },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      flash(`${form.code} 已${editingCode ? '更新' : '创建'}。`);
      setForm({ ...DEFAULT_NEW });
      setEditingCode(null);
      fetchInvites();
    } else {
      flash(data.error || '保存邀请码失败。', false);
    }
  };

  const handleEdit = (code: string, invite: Invite) => {
    setForm({
      code,
      name: invite.name,
      expiresAt: invite.expiresAt,
      tenantId: invite.tenantId || 'default',
      tier: invite.tier || 'free',
    });
    setEditingCode(code);
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`确认删除邀请码 "${code}"？删除后邀请链接会失效。`)) return;
    const res = await fetch(`/api/admin/invites?code=${encodeURIComponent(code)}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    });
    const data = await res.json();
    if (res.ok) {
      flash(`${code} 已删除。`);
      fetchInvites();
    } else {
      flash(data.error || '删除邀请码失败。', false);
    }
  };

  const handleCopyLink = (code: string) => {
    const url = `${window.location.origin}/invite?code=${code}`;
    navigator.clipboard.writeText(url);
    flash(`已复制 ${url}`);
  };

  if (!authed) {
    return (
      <div className="max-w-md mx-auto py-20 px-6">
        <h1 className="text-lg font-semibold mb-6">后台 / 邀请码</h1>
        <p className="text-[12px] text-text-secondary mb-4">
          使用共享后台口令管理客户邀请码。
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

  const sorted = Object.entries(invites).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="max-w-[1000px] mx-auto py-8 px-6">
      <AdminHeader
        subtitle={`已合并 Redis、环境变量和内置默认值。当前 ${sorted.length} 个有效邀请码。`}
        onLogout={() => { sessionStorage.removeItem('wenai_admin_key'); setAuthed(false); }}
      />

      <div className="mb-6 p-4 border border-border-subtle rounded-md bg-bg-surface">
        <div className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
          {editingCode ? `编辑 ${editingCode}` : '创建邀请码'}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
          <input
            type="text"
            placeholder="code (2-32 chars)"
            value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value })}
            disabled={!!editingCode}
            className="px-2 py-1.5 bg-bg-raised border border-border-default rounded text-[12px] disabled:opacity-50"
          />
          <input
            type="text"
            placeholder="display name"
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
            <option value="enterprise">企业版</option>
          </select>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-bg-root text-[12px] font-semibold rounded"
          >
            {editingCode ? '更新' : '创建'}
          </button>
        </div>
        {editingCode && (
          <button
            onClick={() => { setForm({ ...DEFAULT_NEW }); setEditingCode(null); }}
            className="text-[10px] font-mono text-text-tertiary hover:text-accent"
          >
            Cancel edit
          </button>
        )}
        {saveMsg && (
          <div className={`mt-2 text-[11px] font-mono ${saveOk ? 'text-success' : 'text-error'}`}>
            {saveMsg}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-tertiary font-mono text-[12px]">正在加载邀请码...</div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 border border-border-subtle rounded-md text-text-tertiary text-[13px]">
          No invite codes yet.
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(([code, invite]) => (
            <div key={code} className="border border-border-subtle rounded-md p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-[14px] font-bold text-accent">{code}</span>
                  <span className="text-[10px] font-mono text-text-tertiary px-1.5 py-0.5 border border-border-subtle rounded">
                    {invite.tier || 'free'}
                  </span>
                  <span className="text-[10px] font-mono text-text-tertiary">
                    tenant: {invite.tenantId || 'default'}
                  </span>
                </div>
                <div className="text-[13px] text-text-primary">{invite.name}</div>
                <div className="text-[11px] font-mono text-text-tertiary mt-1">
                  Expires {invite.expiresAt}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleCopyLink(code)}
                  className="px-2 py-1 text-[11px] font-mono text-accent border border-accent/30 rounded hover:bg-accent/10"
                >
                        复制链接
                </button>
                <button
                  onClick={() => handleEdit(code, invite)}
                  className="px-2 py-1 text-[11px] font-mono text-text-secondary border border-border-subtle rounded hover:border-accent/40"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(code)}
                  className="px-2 py-1 text-[11px] font-mono text-error border border-error/30 rounded hover:bg-error/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
