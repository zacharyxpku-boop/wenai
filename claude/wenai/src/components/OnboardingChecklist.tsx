'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getStats } from '@/lib/local-analytics';

type ChecklistStep = {
  id: string;
  label: string;
  done: boolean;
};

const DISMISS_KEY = 'wenai_onboarding_checklist_collapsed_v1';

export default function OnboardingChecklist({ projectCount }: { projectCount: number }) {
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.localStorage.getItem(DISMISS_KEY) === 'true');
  const [toast, setToast] = useState('');
  const stats = useMemo(() => (typeof window === 'undefined' ? null : getStats()), []);
  const steps: ChecklistStep[] = [
    { id: 'project', label: '创建第一个项目', done: projectCount > 0 },
    { id: 'csv', label: '导入 CSV 数据', done: (stats?.totals.csv_import || 0) > 0 },
    { id: 'decision', label: '查看决策摘要', done: (stats?.totals.decision_generated || 0) > 0 },
    { id: 'report', label: '导出脱敏报告', done: (stats?.events.some(event => event.event_name === 'report_exported' && event.properties.type === 'decision') || false) },
    { id: 'share', label: '复制模板或分享给同事', done: (stats?.totals.template_copied || 0) > 0 },
  ];
  const doneCount = steps.filter(step => step.done).length;
  const lastDoneRef = useRef(doneCount);

  useEffect(() => {
    if (doneCount > lastDoneRef.current) {
      const remaining = steps.length - doneCount;
      window.setTimeout(() => {
        setToast(remaining > 0 ? `完成第 ${doneCount} 步，还差 ${remaining} 步解锁完整体验` : '你现在已经可以像专业投手一样复盘内容实验了');
        window.setTimeout(() => setToast(''), 2600);
      }, 0);
    }
    lastDoneRef.current = doneCount;
  }, [doneCount, steps.length]);

  useEffect(() => {
    if (doneCount === steps.length) {
      const timer = window.setTimeout(() => {
        setCollapsed(true);
        window.localStorage.setItem(DISMISS_KEY, 'true');
      }, 1600);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [doneCount, steps.length]);

  if (collapsed) {
    return (
      <section className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
        <div className="text-[13px] font-black text-emerald-800">已完成新手引导</div>
        <p className="mt-1 text-[12px] leading-5 text-emerald-700">你现在已经可以像专业投手一样复盘内容实验了。</p>
      </section>
    );
  }

  return (
    <section className="relative rounded-md border border-amber-200 bg-amber-50 p-5">
      {toast && <div className="absolute right-4 top-4 rounded-md bg-slate-950 px-3 py-2 text-[12px] font-bold text-white">{toast}</div>}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="text-[12px] font-black uppercase tracking-wide text-amber-700">新手引导</div>
          <h2 className="mt-1 text-xl font-black text-slate-950">还剩 {steps.length - doneCount} 步完成完整体验</h2>
          <p className="mt-1 text-[12px] leading-5 text-slate-700">按顺序完成项目、导入、决策、报告和模板复制，Wenai 会沉淀成你的内容实验工作台。</p>
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
