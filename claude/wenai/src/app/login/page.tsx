'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, set用户名] = useState('');
  const [password, set密码] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '登录失败');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-bg-root flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-[380px] relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-md bg-accent/15 border border-accent/40 mb-4 shadow-[0_0_20px_rgba(200,151,90,0.15)]">
            <span className="text-accent font-[family-name:var(--font-outfit)] font-bold text-xl">
              W
            </span>
          </div>
          <h1 className="text-text-primary font-[family-name:var(--font-outfit)] font-bold text-2xl tracking-tight mb-1.5">
            wenai
          </h1>
          <p className="text-text-tertiary text-[10px] font-mono uppercase tracking-[0.14em]">
            电商 AI 商业交付系统
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <div className="w-1 h-1 rounded-full bg-success animate-pulse-dot" />
            <span className="text-[9px] font-mono text-success/80">系统正常</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-bg-surface border border-border-default rounded-md p-6 space-y-4">
            <div>
              <label
                htmlFor="username"
                className="label-mono block mb-2 text-[9px] font-semibold"
              >
                用户名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => set用户名(e.target.value)}
                autoComplete="username"
                autoFocus
                required
                className="w-full bg-bg-raised border border-border-subtle rounded-md px-4 py-3 text-text-primary text-[13px] placeholder:text-text-tertiary/60 transition-colors focus:border-accent focus:bg-bg-surface"
                placeholder="请输入用户名"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="label-mono block mb-2 text-[9px] font-semibold"
              >
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => set密码(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full bg-bg-raised border border-border-subtle rounded-md px-4 py-3 text-text-primary text-[13px] placeholder:text-text-tertiary/60 transition-colors focus:border-accent focus:bg-bg-surface"
                placeholder="请输入密码"
              />
            </div>

            {error && (
              <div className="text-[11px] font-mono text-error p-3.5 bg-error/5 border border-error/25 rounded-md">
                <div className="flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M6 3v3M6 8v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-bg-root font-semibold text-[13px] py-3 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-[family-name:var(--font-outfit)]"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-bg-root/30 border-t-bg-root rounded-full animate-spin-smooth" />
                  验证中
                </span>
              ) : (
                '登录'
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6 space-y-3">
          <a
            href="/demo"
            className="inline-block text-[11px] font-mono text-accent/80 hover:text-accent transition-colors"
          >
            免登录体验演示 →
          </a>

          <div className="bg-bg-surface/50 border border-border-subtle rounded-md px-4 py-3 text-left">
            <p className="text-[9px] font-mono text-text-tertiary mb-2">演示账号</p>
            <div className="space-y-1.5 text-[10px] font-mono text-text-secondary">
              <div className="flex justify-between"><span>admin / admin123</span><span className="text-accent">管理员</span></div>
              <div className="flex justify-between"><span>editor / editor123</span><span className="text-success">编辑</span></div>
              <div className="flex justify-between"><span>viewer / viewer123</span><span className="text-text-tertiary">只读</span></div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 text-[9px] font-mono text-text-tertiary/50">
            <a href="/terms" className="hover:text-text-tertiary transition-colors">服务条款</a>
            <span>·</span>
            <a href="/privacy" className="hover:text-text-tertiary transition-colors">隐私政策</a>
          </div>
        </div>
      </div>
    </div>
  );
}
