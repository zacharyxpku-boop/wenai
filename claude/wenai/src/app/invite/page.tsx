'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function InviteInner() {
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get('code') || '';

  const [status, setStatus] = useState<'pending' | 'valid' | 'invalid' | 'activating'>(
    code ? 'pending' : 'invalid'
  );
  const [info, setInfo] = useState<{ name?: string; expiresAt?: string; error?: string }>(
    code ? {} : { error: '链接缺少邀请码' }
  );

  useEffect(() => {
    if (!code) return;
    fetch(`/api/auth/invite?code=${encodeURIComponent(code)}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.valid) {
          setStatus('valid');
          setInfo({ name: data.name, expiresAt: data.expiresAt });
        } else {
          setStatus('invalid');
          setInfo({ error: data.error || '邀请码无效或已过期' });
        }
      })
      .catch(() => {
        setStatus('invalid');
        setInfo({ error: '网络错误，请重试' });
      });
  }, [code]);

  const handleActivate = async () => {
    setStatus('activating');
    const res = await fetch('/api/auth/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (data.success) {
      router.push('/');
    } else {
      setStatus('invalid');
      setInfo({ error: data.error });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-root">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-outfit)] mb-2">
            wenai 内测邀请
          </h1>
          <p className="text-[13px] text-text-secondary">
            跨境电商 AI 工作台 · 封闭内测中
          </p>
        </div>

        {status === 'pending' && (
          <div className="p-8 border border-border-subtle rounded-md bg-bg-surface text-center">
            <div className="text-[12px] font-mono text-text-tertiary">正在验证邀请码...</div>
          </div>
        )}

        {status === 'valid' && (
          <div className="p-8 border border-accent/40 rounded-md bg-bg-surface">
            <div className="mb-5 pb-4 border-b border-border-subtle">
              <div className="text-[10px] font-mono text-accent mb-2">
                邀请已就绪
              </div>
              <p className="text-[16px] text-text-primary font-semibold mb-1">
                你好，{info.name}
              </p>
              <p className="text-[12px] text-text-secondary">
                你的 7 天内测已激活 · 有效期至 <span className="font-mono">{info.expiresAt}</span>
              </p>
            </div>

            <div className="space-y-2 text-[12px] text-text-secondary mb-6">
              <div className="flex items-start gap-2">
                <span className="text-accent flex-shrink-0">·</span>
                <span><strong className="text-text-primary">新品上新流水线</strong>：翻译、文案、合规一次跑完</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent flex-shrink-0">·</span>
                <span>五大品类专属调教（家居 / 汽摩 / 数码 / 工具 / 生活百货）</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent flex-shrink-0">·</span>
                <span>每日 50 次调用独立到邀请码 · 不会被别人占用</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent flex-shrink-0">·</span>
                <span>输入不落库（<a href="/privacy" className="text-accent underline">看承诺</a>）· 作者看每一条吐槽</span>
              </div>
            </div>

            <button
              onClick={handleActivate}
              className="w-full py-3 bg-accent hover:bg-accent-hover text-bg-root font-semibold text-[13px] rounded-md transition-colors"
            >
              开始使用 →
            </button>
          </div>
        )}

        {status === 'activating' && (
          <div className="p-8 border border-border-subtle rounded-md bg-bg-surface text-center">
            <div className="text-[12px] font-mono text-accent">正在激活...</div>
          </div>
        )}

        {status === 'invalid' && (
          <div className="p-8 border border-border-subtle rounded-md bg-bg-surface">
            <div className="text-[10px] font-mono text-text-tertiary mb-3">
              邀请未激活
            </div>
            <p className="text-[14px] text-text-primary mb-4">
              {info.error}
            </p>
            <p className="text-[12px] text-text-secondary mb-6">
              wenai 目前处于封闭内测阶段。如需加入，请联系作者：
            </p>
            <div className="p-3 bg-bg-raised rounded font-mono text-[12px] text-accent mb-4">
              zachary.x.pku@gmail.com
            </div>
            <a
              href="/demo"
              className="block w-full py-2.5 border border-border-default hover:border-accent/40 text-center text-[12px] font-mono text-text-secondary hover:text-accent rounded-md transition-colors"
            >
              或先看 2 小时演示 →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-text-tertiary">...</div>}>
      <InviteInner />
    </Suspense>
  );
}
