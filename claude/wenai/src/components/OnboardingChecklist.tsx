'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { readBrowserStorage, writeBrowserStorage } from '@/lib/browser-storage';
import { getStats } from '@/lib/local-analytics';

type ChecklistStep = {
  id: string;
  label: string;
  done: boolean;
};

const DISMISS_KEY = 'wenai_onboarding_checklist_collapsed_v1';
const emptySubscribe = () => () => {};

function useClientReady() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export default function OnboardingChecklist({ projectCount }: { projectCount: number }) {
  const mounted = useClientReady();
  const dismissed = mounted && readBrowserStorage(DISMISS_KEY, '') === 'true';
  const stats = mounted ? getStats() : null;

  const steps: ChecklistStep[] = [
    { id: 'project', label: '创建第一个项目', done: projectCount > 0 },
    { id: 'csv', label: '导入 CSV 数据', done: (stats?.totals.csv_import || 0) > 0 },
    { id: 'decision', label: '查看决策摘要', done: (stats?.totals.decision_generated || 0) > 0 },
    { id: 'report', label: '导出脱敏报告', done: (stats?.events.some(event => event.event_name === 'report_exported' && event.properties.type === 'decision') || false) },
    { id: 'share', label: '复制模板或分享给同事', done: (stats?.totals.template_copied || 0) > 0 },
  ];

  const doneCount = steps.filter(step => step.done).length;
  const completed = doneCount === steps.length;
  const wroteCompletedRef = useRef(false);

  useEffect(() => {
    if (!mounted || !completed || wroteCompletedRef.current) return;
    wroteCompletedRef.current = true;
    const timer = window.setTimeout(() => {
      writeBrowserStorage(DISMISS_KEY, 'true');
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [completed, mounted]);

  if (!mounted) {
    return (
      <section className="rounded-md border border-amber-200 bg-amber-50 p-5">
        <div className="h-6 w-40 rounded bg-amber-100" />
        <div className="mt-3 h-4 w-72 max-w-full rounded bg-amber-100" />
        <div className="mt-4 grid gap-2 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="rounded-md border border-amber-100 bg-white/70 p-3">
              <div className="h-3 w-8 rounded bg-amber-100" />
              <div className="mt-3 h-8 rounded bg-amber-50" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (dismissed || completed) {
    return (
      <section className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
        <div className="text-[13px] font-black text-emerald-800">已完成新手引导</div>
        <p className="mt-1 text-[12px] leading-5 text-emerald-700">你现在已经可以像专业投手一样复盘内容实验了。</p>
      </section>
    );
  }

  return (
    <section className="relative rounded-md border border-amber-200 bg-amber-50 p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="text-[12px] font-black uppercase tracking-wide text-amber-700">新手引导</div>
          <h2 className="mt-1 text-xl font-black text-slate-950">还剩 {steps.length - doneCount} 步完成完整体验</h2>
          <p className="mt-1 text-[12px] leading-5 text-slate-700">按顺序完成项目、CSV、决策、报告和模板复制，Wenai 会把你的内容实验沉淀成可复用流程。</p>
        </div>
        <div className="rounded-md bg-white px-3 py-2 text-[12px] font-black text-slate-900">{doneCount}/{steps.length}</div>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step.id} className={step.done ? 'rounded-md border border-emerald-200 bg-white p-3' : 'rounded-md border border-amber-200 bg-white/70 p-3'}>
            <div className={step.done ? 'text-[12px] font-black text-emerald-700' : 'text-[12px] font-black text-slate-500'}>
              {step.done ? '✓' : String(index + 1).padStart(2, '0')}
            </div>
            <div className="mt-2 text-[12px] font-bold leading-5 text-slate-900">{step.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
