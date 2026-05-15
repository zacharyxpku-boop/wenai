'use client';

import { useEffect, useState } from 'react';
import modulesConfig from '@/config/modules.json';
import AdminHeader from '@/components/AdminHeader';

interface FeedbackEntry {
  rating: number;
  verdict?: 'good' | 'bad' | 'rant';
  comment?: string;
  inputSample?: string;
  timestamp?: string;
}

interface ModuleSummary {
  total: number;
  goodRatio: number;
}

export default function AdminFeedbackPage() {
  const [summary, setSummary] = useState<Record<string, ModuleSummary>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = sessionStorage.getItem('wenai_admin_key');
    return Boolean(saved && saved.length >= 6);
  });
  const [key, setKey] = useState('');

  useEffect(() => {
    if (!authed) return;
    fetch('/api/feedback?type=summary')
      .then(r => r.json())
      .then(d => {
        setSummary(d.summary || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authed]);

  useEffect(() => {
    if (!selected) return;
    fetch(`/api/feedback?type=feedback&moduleId=${selected}`)
      .then(r => r.json())
      .then(d => setEntries(d.entries || []));
  }, [selected]);

  const handleAuth = () => {
    if (key.length >= 6) {
      sessionStorage.setItem('wenai_admin_key', key);
      setAuthed(true);
    }
  };

  if (!authed) {
    return (
      <div className="max-w-md mx-auto py-20 px-6">
        <h1 className="text-lg font-semibold mb-6">管理员 · 反馈面板</h1>
        <p className="text-[12px] text-text-secondary mb-4">
          此页面仅供作者和 coworker 查看内测反馈。
        </p>
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

  const moduleNameMap: Record<string, string> = {};
  for (const m of modulesConfig.modules) moduleNameMap[m.id] = m.name;

  const verdictColor = (v?: string) => {
    if (v === 'good') return 'text-success';
    if (v === 'bad') return 'text-error';
    if (v === 'rant') return 'text-accent';
    return 'text-text-tertiary';
  };
  const verdictLabel = (v?: string) => {
    if (v === 'good') return '有用';
    if (v === 'bad') return '不准';
    if (v === 'rant') return '吐槽';
    return v || '-';
  };

  return (
    <div className="max-w-[1000px] mx-auto py-8 px-6">
      <AdminHeader
        subtitle="来自 /api/feedback (Redis / File / Memory 三级存储)"
        onLogout={() => { sessionStorage.removeItem('wenai_admin_key'); setAuthed(false); }}
      />

      {/* Export all feedback as CSV */}
      {Object.keys(summary).length > 0 && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={async () => {
              const rows: string[] = ['module,verdict,rating,comment,inputSample,timestamp'];
              for (const mid of Object.keys(summary)) {
                const r = await fetch(`/api/feedback?type=feedback&moduleId=${mid}`).then(r => r.json());
                for (const e of (r.entries || []) as FeedbackEntry[]) {
                  const esc = (s: string) => `"${(s || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
                  rows.push([
                    esc(moduleNameMap[mid] || mid),
                    esc(e.verdict || ''),
                    String(e.rating || ''),
                    esc(e.comment || ''),
                    esc(e.inputSample || ''),
                    esc(e.timestamp || ''),
                  ].join(','));
                }
              }
              const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `wenai-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="text-[11px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded-md px-3 py-1.5"
          >
            导出全部 CSV
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-text-tertiary font-mono text-[12px]">加载中...</div>
      ) : Object.keys(summary).length === 0 ? (
        <div className="text-center py-12 border border-border-subtle rounded-md">
          <p className="text-text-tertiary text-[13px] mb-2">还没有收到任何反馈</p>
          <p className="text-text-tertiary text-[11px] font-mono">
            朋友用模块后点底部的 👍/👎/💬 就会出现在这里
          </p>
        </div>
      ) : (
        <>
          {/* Module grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-6">
            {Object.entries(summary)
              .sort((a, b) => b[1].total - a[1].total)
              .map(([mid, s]) => (
                <button
                  key={mid}
                  onClick={() => setSelected(mid)}
                  className={`text-left p-3 border rounded-md transition-all ${
                    selected === mid
                      ? 'border-accent bg-accent/10'
                      : 'border-border-subtle hover:border-accent/40 hover:bg-bg-surface'
                  }`}
                >
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-[13px] font-semibold text-text-primary truncate">
                      {moduleNameMap[mid] || mid}
                    </span>
                    <span className="text-[10px] font-mono text-text-tertiary tabular-nums">{s.total}</span>
                  </div>
                  <div className="h-1 bg-bg-raised rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-success/60 rounded-full"
                      style={{ width: `${s.goodRatio}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-text-tertiary">
                    {s.goodRatio}% 好评
                  </div>
                </button>
              ))}
          </div>

          {/* Selected module entries */}
          {selected && (
            <div className="border border-border-subtle rounded-md overflow-hidden">
              <div className="px-4 py-3 bg-bg-surface border-b border-border-subtle flex items-center justify-between">
                <span className="text-[13px] font-semibold">
                  {moduleNameMap[selected] || selected} · 反馈明细
                </span>
                <span className="text-[10px] font-mono text-text-tertiary">{entries.length} 条</span>
              </div>
              <div className="divide-y divide-border-subtle max-h-[600px] overflow-y-auto">
                {entries.length === 0 ? (
                  <div className="p-6 text-center text-text-tertiary text-[12px]">暂无明细</div>
                ) : (
                  entries.map((e, i) => (
                    <div key={i} className="p-4 hover:bg-bg-surface/50">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[12px] font-semibold ${verdictColor(e.verdict)}`}>
                          {verdictLabel(e.verdict)}
                        </span>
                        {e.timestamp && (
                          <span className="text-[10px] font-mono text-text-tertiary">
                            {new Date(e.timestamp).toLocaleString('zh-CN')}
                          </span>
                        )}
                      </div>
                      {e.comment && (
                        <p className="text-[13px] text-text-primary mb-1.5 font-medium">
                          &ldquo;{e.comment}&rdquo;
                        </p>
                      )}
                      {e.inputSample && (
                        <p className="text-[11px] text-text-tertiary font-mono leading-relaxed">
                          输入样本：{e.inputSample.slice(0, 200)}{e.inputSample.length > 200 ? '...' : ''}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
