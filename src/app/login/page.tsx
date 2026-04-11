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
        setError(data.error || 'Login failed');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-root flex items-center justify-center p-4">
      <div className="w-full max-w-[360px] animate-fade-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-md bg-accent-dim border border-accent/30 mb-3.5">
            <span className="text-accent font-[family-name:var(--font-outfit)] font-semibold text-lg">
              W
            </span>
          </div>
          <h1 className="text-text-primary font-[family-name:var(--font-outfit)] font-semibold text-xl tracking-tight">
            Wenai
          </h1>
          <p className="text-text-tertiary text-[11px] mt-1 font-mono uppercase tracking-wider">
            AI员工系统
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="bg-bg-surface border border-border-subtle rounded-md p-5 space-y-3.5">
            <div>
              <label
                htmlFor="username"
                className="label-mono block mb-1.5"
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
                className="w-full bg-bg-root border border-border-subtle rounded-md px-3 py-2 text-text-primary text-[13px] placeholder:text-text-tertiary transition-all focus:border-accent focus:shadow-[0_0_0_1px_rgba(200,151,90,0.2)]"
                placeholder="请输入用户名"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="label-mono block mb-1.5"
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
                className="w-full bg-bg-root border border-border-subtle rounded-md px-3 py-2 text-text-primary text-[13px] placeholder:text-text-tertiary transition-all focus:border-accent focus:shadow-[0_0_0_1px_rgba(200,151,90,0.2)]"
                placeholder="请输入密码"
              />
            </div>

            {error && (
              <div className="text-[11px] font-mono text-error p-2.5 bg-error/5 border border-error/20 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-bg-root font-medium text-[13px] py-2.5 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed font-[family-name:var(--font-outfit)]"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-bg-root/30 border-t-bg-root rounded-full animate-spin-smooth" />
                  验证中
                </span>
              ) : (
                '登录'
              )}
            </button>
          </div>
        </form>

        <p className="text-text-tertiary text-[10px] text-center mt-5 font-mono opacity-60">
          仅限授权访问
        </p>
      </div>
    </div>
  );
}
