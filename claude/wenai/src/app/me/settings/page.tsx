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
