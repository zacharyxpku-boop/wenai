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
      <div className="w-full max-w-[380px] animate-fade-up">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-accent-dim border border-border-subtle mb-4">
            <span className="text-accent font-[family-name:var(--font-outfit)] font-semibold text-xl">
              W
            </span>
          </div>
          <h1 className="text-text-primary font-[family-name:var(--font-outfit)] font-semibold text-2xl tracking-tight">
            Wenai
          </h1>
          <p className="text-text-tertiary text-sm mt-1 font-mono">
            AI电商员工系统
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-bg-surface border border-border-subtle rounded-md p-6 space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-text-tertiary text-xs font-mono uppercase tracking-wider mb-2"
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
                className="w-full bg-bg-root border border-border-subtle rounded-md px-3 py-2.5 text-text-primary text-sm placeholder:text-text-tertiary focus:border-accent transition-colors"
                placeholder="请输入用户名"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-text-tertiary text-xs font-mono uppercase tracking-wider mb-2"
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
                className="w-full bg-bg-root border border-border-subtle rounded-md px-3 py-2.5 text-text-primary text-sm placeholder:text-text-tertiary focus:border-accent transition-colors"
                placeholder="请输入密码"
              />
            </div>

            {error && (
              <p className="text-error text-sm font-mono">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-bg-root font-medium text-sm py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

        <p className="text-text-tertiary text-xs text-center mt-6 font-mono">
          仅限授权访问
        </p>
      </div>
    </div>
  );
}
