'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DemoPage() {
  const router = useRouter();
  const [entering, setEntering] = useState(false);

  async function handleEnterDemo() {
    setEntering(true);
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      if (res.ok) {
        router.push('/pipelines/batch-launch?demo=1');
        router.refresh();
      }
    } catch {
      setEntering(false);
    }
  }

  return (
    <div className="min-h-dvh bg-bg-root flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-md bg-accent/15 border border-accent/40 mb-4 shadow-[0_0_20px_rgba(200,151,90,0.15)]">
            <span className="text-accent font-[family-name:var(--font-outfit)] font-bold text-xl">W</span>
          </div>
          <h1 className="text-text-primary font-[family-name:var(--font-outfit)] font-bold text-2xl tracking-tight mb-1.5">
            wenai 演示入口
          </h1>
          <p className="text-text-tertiary text-[11px] font-mono tracking-wide">
            SKU 上新工作流 · 演示模式
          </p>
        </div>

        <div className="bg-bg-surface border border-border-default rounded-md p-6 space-y-5">
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-[12px] text-text-secondary">
              <span className="text-accent mt-0.5">01</span>
              <span>从 5 个演示 SKU 开始，生成批量上新 SOP 和复盘清单</span>
            </div>
            <div className="flex items-start gap-3 text-[12px] text-text-secondary">
              <span className="text-accent mt-0.5">02</span>
              <span>演示数据只用于看输出形态，不作为客户业绩证明</span>
            </div>
            <div className="flex items-start gap-3 text-[12px] text-text-secondary">
              <span className="text-accent mt-0.5">03</span>
              <span>正式收费和合同走独立主站，子站只承接试跑和接入需求</span>
            </div>
          </div>

          <div className="h-px bg-border-subtle" />

          <button
            onClick={handleEnterDemo}
            disabled={entering}
            className="w-full bg-accent hover:bg-accent-hover text-bg-root font-semibold text-[14px] py-3.5 rounded-md transition-colors duration-200 disabled:opacity-50 font-[family-name:var(--font-outfit)]"
          >
            {entering ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-bg-root/30 border-t-bg-root rounded-full animate-spin-smooth" />
                进入中
              </span>
            ) : (
              '立即体验'
            )}
          </button>
        </div>

        <div className="text-center mt-5">
          <a
            href="/login"
            className="text-[10px] font-mono text-text-tertiary hover:text-accent transition-colors"
          >
            已有账号？登录 →
          </a>
        </div>
      </div>
    </div>
  );
}
