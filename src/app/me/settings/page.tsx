'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * /me/settings · 商家偏好 · 邮件 push 开关 / 阈值 / 行业自报
 *
 * 与 /me/alerts inbox 对仗:
 *   alerts = 现在有什么信号
 *   settings = 这些信号怎么找你 (邮件 / 站内)
 */

type Severity = 'critical' | 'warning' | 'info';

interface Settings {
  email?: string;
  digestEmailEnabled?: boolean;
  digestSeverityMin?: Severity;
  industry?: string;
}

const SEV_LABEL: Record<Severity, string> = {
  critical: '只发紧急 (🚨 critical)',
  warning: '紧急 + 警示 (推荐)',
  info: '所有信号 (含提示, 可能噪音多)',
};

export default function SettingsPage() {
  const [s, setS] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/user/settings')
      .then(r => r.json())
      .then(d => {
        setS(d.settings || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setErr('');
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setS(data.settings || s);
      setSavedAt(new Date().toLocaleString('zh-CN'));
    } catch (e) {
      setErr(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-root">
      <div className="max-w-[700px] mx-auto px-6 py-8">
        <div className="mb-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/me/skus" className="text-[10px] font-mono text-text-tertiary hover:text-accent">← SKU 库</Link>
            <span className="text-[10px] font-mono text-text-tertiary">/</span>
            <span className="text-[10px] font-mono text-accent">设置</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-1 font-[family-name:var(--font-outfit)]">
            ⚙️ 设置
          </h1>
          <p className="text-[12px] text-text-secondary">
            邮件推送 / 行业上下文 / 信号阈值 — 让 wenai 主动找你, 而不是等你回页才发现问题
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-text-tertiary font-mono text-[12px]">加载中...</div>
        ) : (
          <div className="space-y-5">
            {/* 邮件推送 */}
            <section className="border border-border-subtle rounded-lg p-5 bg-bg-surface/30 space-y-3">
              <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                📧 每日 digest 邮件
              </div>
              <label className="block">
                <div className="text-[11px] text-text-secondary mb-1">接收邮箱</div>
                <input
                  type="email"
                  value={s.email || ''}
                  onChange={e => setS({ ...s, email: e.target.value })}
                  placeholder="cfo@yourcompany.com"
                  className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[13px] font-mono"
                />
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={s.digestEmailEnabled || false}
                  onChange={e => setS({ ...s, digestEmailEnabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-[12px] text-text-primary">
                  开启每日推送 (北京时间 09:00 自动发, 当天有信号才发)
                </span>
              </label>
              <div>
                <div className="text-[11px] text-text-secondary mb-1.5">最低推送严重度</div>
                <div className="space-y-1.5">
                  {(['critical', 'warning', 'info'] as Severity[]).map(sev => (
                    <label key={sev} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="severity"
                        checked={(s.digestSeverityMin ?? 'warning') === sev}
                        onChange={() => setS({ ...s, digestSeverityMin: sev })}
                        className="w-3.5 h-3.5"
                      />
                      <span className="text-[12px] text-text-primary">
                        {SEV_LABEL[sev]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* Outbound webhook (飞书 / Slack / Discord) */}
            <WebhooksSection />

            {/* API Key */}
            <ApiKeySection />

            {/* 行业 */}
            <section className="border border-border-subtle rounded-lg p-5 bg-bg-surface/30 space-y-3">
              <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                🏷️ 行业上下文
              </div>
              <label className="block">
                <div className="text-[11px] text-text-secondary mb-1">
                  你主要做什么 (会注入到 AI 决策模块的 prompt, 让推荐更贴你的盘子)
                </div>
                <input
                  type="text"
                  value={s.industry || ''}
                  onChange={e => setS({ ...s, industry: e.target.value })}
                  placeholder="例: 跨境女装独立站 主战场美国 客单 $50-150"
                  className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[13px]"
                />
              </label>
            </section>

            {/* 保存 */}
            <div className="flex items-center gap-3">
              <button
                onClick={save}
                disabled={saving}
                className="px-5 py-2 bg-accent text-bg-root text-[12px] font-semibold rounded hover:bg-accent-hover disabled:opacity-40"
              >
                {saving ? '保存中...' : '保存设置'}
              </button>
              {savedAt && (
                <span className="text-[10px] font-mono text-success">✓ 已保存 {savedAt}</span>
              )}
              {err && (
                <span className="text-[10px] font-mono text-error">✗ {err}</span>
              )}
            </div>

            <div className="text-[10px] font-mono text-text-tertiary leading-relaxed pt-3 border-t border-border-subtle">
              邮件实际发送依赖部署环境配 RESEND_API_KEY 或 SENDGRID_API_KEY · 都没配时仅在控制台日志记录 (dev 模式)
              <br />
              邮件 push 不影响站内 /me/alerts 列表, 那个永远在线
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface KeyMeta {
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  label: string | null;
}

function ApiKeySection() {
  const [meta, setMeta] = useState<KeyMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [rawKey, setRawKey] = useState<string | null>(null); // 仅签发时短暂展示
  const [label, setLabel] = useState('');
  const [copied, setCopied] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/user/api-key')
      .then(r => r.json())
      .then(d => { setMeta(d.key); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  const issue = async () => {
    if (!confirm(meta ? '签发新 key 会让旧 key 立即失效, 继续?' : '签发 API key?')) return;
    setIssuing(true);
    try {
      const r = await fetch('/api/user/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label.trim() || undefined }),
      });
      const d = await r.json();
      if (r.ok && d.rawKey) {
        setRawKey(d.rawKey);
        load();
      }
    } finally {
      setIssuing(false);
    }
  };

  const revoke = async () => {
    if (!confirm('⚠️ 撤销当前 API key 后, 所有用它调 wenai 的脚本/系统会失败. 确认?')) return;
    setRevoking(true);
    try {
      await fetch('/api/user/api-key', { method: 'DELETE' });
      setMeta(null);
      setRawKey(null);
    } finally {
      setRevoking(false);
    }
  };

  const copy = async () => {
    if (!rawKey) return;
    await navigator.clipboard.writeText(rawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="border border-border-subtle rounded-lg p-5 bg-bg-surface/30 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
          🔑 API Key · ERP / Webhook / 脚本接入
        </div>
        <a
          href="https://github.com/zacharyxpku-boop/wenai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-mono text-accent hover:underline"
        >
          看 API 文档 →
        </a>
      </div>

      {rawKey && (
        <div className="border border-warning/40 bg-warning/5 rounded p-3 space-y-2">
          <div className="text-[11px] font-bold text-warning">
            ⚠️ 这是你的新 API key · 关页后无法再看, 立即复制保存
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[11px] font-mono bg-bg-root px-2 py-1.5 rounded border border-border-default break-all">
              {rawKey}
            </code>
            <button
              onClick={copy}
              className={`text-[10px] font-mono px-2.5 py-1.5 rounded ${
                copied ? 'bg-success/20 text-success' : 'bg-accent text-bg-root hover:bg-accent-hover'
              }`}
            >
              {copied ? '✓ 已复制' : '📋 复制'}
            </button>
          </div>
          <button
            onClick={() => setRawKey(null)}
            className="text-[10px] font-mono text-text-tertiary hover:text-text-primary"
          >
            我已保存 →
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-[11px] font-mono text-text-tertiary py-3 text-center">加载中...</div>
      ) : meta ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] font-mono">
            <div>
              <div className="text-[9px] text-text-tertiary uppercase mb-0.5">Key 前缀</div>
              <div className="text-text-primary tabular-nums">{meta.prefix}…</div>
            </div>
            <div>
              <div className="text-[9px] text-text-tertiary uppercase mb-0.5">签发于</div>
              <div className="text-text-primary">{new Date(meta.createdAt).toLocaleDateString('zh-CN')}</div>
            </div>
            <div>
              <div className="text-[9px] text-text-tertiary uppercase mb-0.5">最近使用</div>
              <div className="text-text-primary">
                {meta.lastUsedAt ? new Date(meta.lastUsedAt).toLocaleString('zh-CN') : '从未'}
              </div>
            </div>
          </div>
          {meta.label && (
            <div className="text-[10px] font-mono text-text-tertiary">
              标签: <span className="text-text-secondary">{meta.label}</span>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={issue}
              disabled={issuing}
              className="text-[11px] font-mono px-3 py-1.5 border border-accent/40 text-accent hover:bg-accent/10 rounded disabled:opacity-40"
            >
              {issuing ? '签发中...' : '↻ 重新签发 (旧 key 失效)'}
            </button>
            <button
              onClick={revoke}
              disabled={revoking}
              className="text-[11px] font-mono px-3 py-1.5 border border-error/40 text-error hover:bg-error/10 rounded disabled:opacity-40"
            >
              {revoking ? '撤销中...' : '🗑️ 撤销当前 key'}
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <div className="text-[12px] text-text-secondary">
            还没签发 API key. 配上后能从你自己的 ERP / Shopify webhook / 抖店脚本 直接 push 数据进 wenai SKU 库.
          </div>
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="标签 (可选): 例 '生产 ERP' / '测试'"
            className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
            maxLength={80}
          />
          <button
            onClick={issue}
            disabled={issuing}
            className="text-[11px] font-mono px-4 py-1.5 bg-accent text-bg-root rounded hover:bg-accent-hover disabled:opacity-40"
          >
            {issuing ? '签发中...' : '签发 API key'}
          </button>
        </div>
      )}

      <div className="text-[10px] font-mono text-text-tertiary leading-relaxed border-t border-border-subtle pt-2">
        用法示例: <code className="text-text-secondary">curl -H &quot;Authorization: Bearer wn_xxx&quot; https://wenai-one.vercel.app/api/v1/skus</code>
        <br />
        当前可用端点: GET / POST <code className="text-accent">/api/v1/skus</code> · 更多接口逐步开放
      </div>
    </section>
  );
}

interface WebhookMeta {
  id: string;
  urlPreview: string;
  kind: 'feishu' | 'slack' | 'discord' | 'generic';
  label: string | null;
  createdAt: string;
  lastFireAt: string | null;
  lastError: string | null;
}

const KIND_BADGE: Record<WebhookMeta['kind'], { label: string; color: string }> = {
  feishu:  { label: '飞书',    color: 'text-cyan-500 border-cyan-500/40 bg-cyan-500/5' },
  slack:   { label: 'Slack',  color: 'text-purple-500 border-purple-500/40 bg-purple-500/5' },
  discord: { label: 'Discord', color: 'text-indigo-500 border-indigo-500/40 bg-indigo-500/5' },
  generic: { label: '通用',    color: 'text-text-secondary border-border-default bg-bg-surface' },
};

function WebhooksSection() {
  const [hooks, setHooks] = useState<WebhookMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [err, setErr] = useState('');
  const [testing, setTesting] = useState<string | null>(null);
  const [testMsg, setTestMsg] = useState<{ id: string; ok: boolean; text: string } | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/user/webhooks')
      .then(r => r.json())
      .then(d => { setHooks(d.webhooks || []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  const add = async () => {
    setErr('');
    if (!url.trim()) { setErr('URL 必填'); return; }
    setAdding(true);
    try {
      const r = await fetch('/api/user/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), label: label.trim() || undefined }),
      });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || `HTTP ${r.status}`); return; }
      setUrl(''); setLabel('');
      load();
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('删除这条 webhook? 之后不再推送到该地址')) return;
    await fetch(`/api/user/webhooks?id=${id}`, { method: 'DELETE' });
    load();
  };

  const test = async (id: string) => {
    setTesting(id);
    setTestMsg(null);
    try {
      const r = await fetch('/api/user/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const d = await r.json();
      setTestMsg({ id, ok: !!d.ok, text: d.ok ? '✓ 推送成功 · 去群里看消息' : `✗ ${d.error || '失败'}` });
      load();  // refresh lastFireAt / lastError
    } finally {
      setTesting(null);
    }
  };

  return (
    <section className="border border-border-subtle rounded-lg p-5 bg-bg-surface/30 space-y-3">
      <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
        🪝 群推送 · 飞书 / Slack / Discord webhook
      </div>
      <div className="text-[11px] text-text-secondary leading-relaxed">
        把每日 digest 推到你公司群 · 与邮件并行, 互不冲突. 配上 URL 后, 北京 09:00 cron 会自动 fan-out.
      </div>

      {loading ? (
        <div className="text-[11px] font-mono text-text-tertiary py-3 text-center">加载中...</div>
      ) : hooks.length === 0 ? (
        <div className="text-[11px] font-mono text-text-tertiary py-2">还没配 webhook · 在下方添加</div>
      ) : (
        <div className="space-y-2">
          {hooks.map(h => {
            const b = KIND_BADGE[h.kind];
            return (
              <div key={h.id} className="border border-border-subtle rounded p-2.5 bg-bg-root/40 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${b.color}`}>{b.label}</span>
                  {h.label && <span className="text-[11px] text-text-primary font-medium">{h.label}</span>}
                  <code className="text-[10px] font-mono text-text-tertiary truncate flex-1">{h.urlPreview}</code>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono text-text-tertiary flex-wrap">
                  <span>加于 {new Date(h.createdAt).toLocaleDateString('zh-CN')}</span>
                  <span>·</span>
                  <span>
                    {h.lastFireAt ? `最近 ${new Date(h.lastFireAt).toLocaleString('zh-CN')}` : '未发过'}
                  </span>
                  {h.lastError && (
                    <span className="text-error">⚠ {h.lastError.slice(0, 50)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => test(h.id)}
                    disabled={testing === h.id}
                    className="text-[10px] font-mono px-2 py-1 border border-accent/40 text-accent hover:bg-accent/10 rounded disabled:opacity-40"
                  >
                    {testing === h.id ? '推送中...' : '🧪 发测试消息'}
                  </button>
                  <button
                    onClick={() => remove(h.id)}
                    className="text-[10px] font-mono px-2 py-1 border border-error/40 text-error hover:bg-error/10 rounded"
                  >
                    🗑️ 删
                  </button>
                  {testMsg && testMsg.id === h.id && (
                    <span className={`text-[10px] font-mono ${testMsg.ok ? 'text-success' : 'text-error'}`}>
                      {testMsg.text}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hooks.length < 5 && (
        <div className="border-t border-border-subtle pt-3 space-y-2">
          <div className="text-[11px] text-text-secondary">添加新 webhook</div>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/xxx · 或 hooks.slack.com / discord.com 的"
            className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[11px] font-mono"
          />
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="标签 (可选): 例 '运营飞书群' / '老板 Slack DM'"
            className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
            maxLength={60}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={add}
              disabled={adding || !url.trim()}
              className="text-[11px] font-mono px-4 py-1.5 bg-accent text-bg-root rounded hover:bg-accent-hover disabled:opacity-40"
            >
              {adding ? '添加中...' : '+ 添加 webhook'}
            </button>
            {err && <span className="text-[10px] font-mono text-error">✗ {err}</span>}
          </div>
        </div>
      )}

      <div className="text-[10px] font-mono text-text-tertiary leading-relaxed border-t border-border-subtle pt-2">
        飞书机器人配置: 群 → 设置 → 群机器人 → 添加自定义机器人 · 复制 webhook URL 粘到上面
        <br />
        Slack: <code>App → Incoming Webhooks → New Webhook to Workspace</code>
        <br />
        Discord: 频道 → 编辑频道 → 整合 → Webhook → 复制 URL
        <br />
        URL 含密钥, 我们只展示前 60 字符防泄漏
      </div>
    </section>
  );
}
