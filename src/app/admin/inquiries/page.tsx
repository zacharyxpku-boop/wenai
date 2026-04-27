'use client';

import { useEffect, useState } from 'react';
import AdminHeader from '@/components/AdminHeader';

interface Inquiry {
  id: string;
  company: string;
  contact: string;
  channel: string;
  scale: string;
  category: string;
  painPoint: string;
  budget?: string;
  timeline?: string;
  source?: string;
  ip?: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'converted' | 'dropped';
  updatedAt?: string;
}

const STATUS_LABEL: Record<string, { txt: string; cls: string }> = {
  new: { txt: '🆕 新', cls: 'bg-accent/15 text-accent border-accent/40' },
  contacted: { txt: '📞 已联系', cls: 'bg-cat-content/15 text-cat-content border-cat-content/40' },
  converted: { txt: '✅ 转化', cls: 'bg-success/15 text-success border-success/40' },
  dropped: { txt: '✗ 放弃', cls: 'bg-text-tertiary/15 text-text-tertiary border-text-tertiary/40' },
};

const SCALE_LABEL: Record<string, string> = {
  '<50': '< 50 人',
  '50-200': '50-200 人',
  '200-1000': '200-1000 人',
  '1000+': '1000+ 人',
};

const CATEGORY_LABEL: Record<string, string> = {
  home: '家居',
  auto: '汽摩',
  digital: '数码',
  tool: '工具',
  living: '生活',
  mixed: '混合多品类',
  other: '其他',
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [key, setKey] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'converted' | 'dropped'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('wenai_admin_key');
    if (saved && saved.length >= 6) setAuthed(true);
  }, []);

  const load = () => {
    setLoading(true);
    fetch('/api/sales/inquiry')
      .then(r => r.json())
      .then(d => {
        setInquiries((d.inquiries || []) as Inquiry[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  const handleAuth = () => {
    if (key.length >= 6) {
      sessionStorage.setItem('wenai_admin_key', key);
      setAuthed(true);
    }
  };

  const updateStatus = async (id: string, status: Inquiry['status']) => {
    setUpdating(id);
    try {
      const res = await fetch('/api/sales/inquiry', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setInquiries(prev =>
          prev.map(it => (it.id === id ? { ...it, status, updatedAt: new Date().toISOString() } : it))
        );
      }
    } finally {
      setUpdating(null);
    }
  };

  const exportCSV = () => {
    const rows: string[] = [
      'id,company,contact,channel,scale,category,painPoint,budget,timeline,source,createdAt,status',
    ];
    const esc = (s: string) => `"${(s || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    for (const i of inquiries) {
      rows.push(
        [
          i.id,
          esc(i.company),
          esc(i.contact),
          esc(i.channel),
          esc(SCALE_LABEL[i.scale] || ''),
          esc(CATEGORY_LABEL[i.category] || ''),
          esc(i.painPoint),
          esc(i.budget || ''),
          esc(i.timeline || ''),
          esc(i.source || ''),
          esc(i.createdAt),
          i.status,
        ].join(',')
      );
    }
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wenai-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authed) {
    return (
      <div className="max-w-md mx-auto py-20 px-6">
        <h1 className="text-lg font-semibold mb-6">管理员 · 询盘面板</h1>
        <p className="text-[12px] text-text-secondary mb-4">仅作者本人查看 ToB 客户提交的询盘。</p>
        <input
          type="password"
          placeholder="输入 6 位以上口令"
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAuth()}
          className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-md text-[13px] mb-3"
        />
        <button
          onClick={handleAuth}
          disabled={key.length < 6}
          className="w-full py-2 bg-accent hover:bg-accent-hover disabled:bg-border-subtle text-bg-root text-[13px] font-semibold rounded-md transition-colors"
        >
          进入
        </button>
      </div>
    );
  }

  const filtered = filter === 'all' ? inquiries : inquiries.filter(i => i.status === filter);
  const counts = {
    all: inquiries.length,
    new: inquiries.filter(i => !i.status || i.status === 'new').length,
    contacted: inquiries.filter(i => i.status === 'contacted').length,
    converted: inquiries.filter(i => i.status === 'converted').length,
    dropped: inquiries.filter(i => i.status === 'dropped').length,
  };

  // 来源聚合 · 30 天内分布 (含转化率)
  const cutoff30d = Date.now() - 30 * 24 * 3600 * 1000;
  const recent = inquiries.filter(i => new Date(i.createdAt).getTime() > cutoff30d);
  const sourceMap = new Map<string, { total: number; converted: number }>();
  for (const i of recent) {
    const s = i.source || 'direct';
    const cur = sourceMap.get(s) ?? { total: 0, converted: 0 };
    cur.total++;
    if (i.status === 'converted') cur.converted++;
    sourceMap.set(s, cur);
  }
  const sourceRows = Array.from(sourceMap.entries())
    .map(([source, v]) => ({ source, total: v.total, converted: v.converted, rate: v.total > 0 ? v.converted / v.total : 0 }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="max-w-[1100px] mx-auto py-8 px-6">
      <AdminHeader
        subtitle="ToB 企业询盘 · /api/sales/inquiry · Redis hash + LIST"
        onLogout={() => {
          sessionStorage.removeItem('wenai_admin_key');
          setAuthed(false);
        }}
      />

      {/* 来源聚合 · 看 SEO/share/hero 哪条转化最高 */}
      {sourceRows.length > 0 && (
        <section className="mb-5 border border-border-subtle rounded-lg p-4 bg-bg-surface/30">
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
            近 30 天来源分布 (n={recent.length})
          </div>
          <table className="w-full text-[11px]">
            <thead className="text-[10px] font-mono text-text-tertiary border-b border-border-subtle">
              <tr>
                <th className="text-left py-1">source</th>
                <th className="text-right py-1">询盘数</th>
                <th className="text-right py-1">转化数</th>
                <th className="text-right py-1">转化率</th>
              </tr>
            </thead>
            <tbody>
              {sourceRows.map(r => (
                <tr key={r.source} className="border-b border-border-subtle/40">
                  <td className="py-1 font-mono text-text-primary">{r.source}</td>
                  <td className="py-1 text-right tabular-nums">{r.total}</td>
                  <td className="py-1 text-right tabular-nums text-success">{r.converted}</td>
                  <td className="py-1 text-right tabular-nums text-accent">
                    {(r.rate * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'new', 'contacted', 'converted', 'dropped'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[11px] font-mono px-2.5 py-1 rounded border ${
                filter === f
                  ? 'border-accent text-accent bg-accent/10'
                  : 'border-border-subtle text-text-secondary hover:border-accent/40'
              }`}
            >
              {f === 'all' ? '全部' : STATUS_LABEL[f].txt} ({counts[f]})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="text-[11px] font-mono text-text-secondary hover:text-accent border border-border-subtle rounded px-2.5 py-1"
          >
            ↻ 刷新
          </button>
          {inquiries.length > 0 && (
            <button
              onClick={exportCSV}
              className="text-[11px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded px-2.5 py-1"
            >
              导出 CSV
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-tertiary font-mono text-[12px]">加载中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 border border-border-subtle rounded-md">
          <p className="text-text-tertiary text-[13px] mb-2">暂无{filter === 'all' ? '' : STATUS_LABEL[filter]?.txt + ' '}询盘</p>
          <p className="text-text-tertiary text-[11px] font-mono">
            把 /inquire 链接发给目标客户,提交后会出现在这里
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(i => {
            const status = (i.status || 'new') as Inquiry['status'];
            const lab = STATUS_LABEL[status];
            const isOpen = expanded === i.id;
            return (
              <div key={i.id} className="border border-border-subtle rounded-md overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : i.id)}
                  className="w-full text-left p-4 hover:bg-bg-surface/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-semibold text-text-primary">{i.company}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${lab.cls}`}>
                        {lab.txt}
                      </span>
                      {i.scale && (
                        <span className="text-[10px] font-mono text-text-tertiary border border-border-subtle px-1.5 py-0.5 rounded">
                          {SCALE_LABEL[i.scale] || i.scale}
                        </span>
                      )}
                      {i.category && (
                        <span className="text-[10px] font-mono text-text-tertiary border border-border-subtle px-1.5 py-0.5 rounded">
                          {CATEGORY_LABEL[i.category] || i.category}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-text-tertiary tabular-nums">
                      {new Date(i.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <p className="text-[12px] text-text-secondary line-clamp-2 leading-relaxed">
                    {i.painPoint}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-text-tertiary mt-2 flex-wrap">
                    <span>{i.channel} · {i.contact}</span>
                    {i.budget && <span>预算 {i.budget}</span>}
                    {i.timeline && <span>节奏 {i.timeline}</span>}
                    {i.source && <span>from {i.source}</span>}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-border-subtle bg-bg-surface/30 p-4 space-y-3">
                    <div>
                      <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
                        痛点全文
                      </div>
                      <p className="text-[12px] text-text-primary leading-relaxed whitespace-pre-wrap">
                        {i.painPoint}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border-subtle">
                      <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                        改状态:
                      </span>
                      {(['new', 'contacted', 'converted', 'dropped'] as const).map(s => (
                        <button
                          key={s}
                          disabled={updating === i.id || status === s}
                          onClick={() => updateStatus(i.id, s)}
                          className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
                            status === s
                              ? 'border-accent text-accent bg-accent/10 cursor-default'
                              : 'border-border-subtle text-text-secondary hover:border-accent/40'
                          } disabled:opacity-50`}
                        >
                          {STATUS_LABEL[s].txt}
                        </button>
                      ))}
                      <span className="ml-auto text-[10px] font-mono text-text-tertiary">
                        {i.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-border-subtle flex-wrap">
                      {i.channel === 'email' && (
                        <a
                          href={`mailto:${i.contact}?subject=Wenai%20%E8%AF%A2%E7%9B%98%E5%9B%9E%E5%A4%8D%20·%20${encodeURIComponent(i.company)}`}
                          className="text-[10px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded px-2 py-1"
                        >
                          📧 发邮件
                        </a>
                      )}
                      {i.channel === 'phone' && (
                        <a
                          href={`tel:${i.contact}`}
                          className="text-[10px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded px-2 py-1"
                        >
                          📞 拨号
                        </a>
                      )}
                      <button
                        onClick={() => navigator.clipboard.writeText(i.contact)}
                        className="text-[10px] font-mono text-text-secondary border border-border-subtle hover:border-accent/40 rounded px-2 py-1"
                      >
                        复制联系方式
                      </button>
                      {i.ip && (
                        <span className="ml-auto text-[10px] font-mono text-text-tertiary">
                          IP {i.ip}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
