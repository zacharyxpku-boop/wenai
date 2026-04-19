'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'wenai_onboarding_v1_dismissed';

const STEPS = [
  {
    title: '第一次到 wenai?',
    body: '3 条 Pipeline 吃掉代运营日均重复劳动。新品上新 / 达人冷启 / AI 主图。',
    cta: '下一步',
  },
  {
    title: '15 秒看 AI 自己跑',
    body: '点首页 Hero 卡下的 "⚡ 15 秒 demo" 按钮,零输入直接看 3 路并行出。比看视频还快。',
    cta: '下一步',
  },
  {
    title: '跑完试试分享',
    body: '结果页底部有 🔗 分享按钮, 7 天有效公开链接发老板. 不加好友,不注册,打开直接看.',
    cta: '知道了',
  },
];

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 延迟 1.5s 出现,让页面先加载完
    const timer = setTimeout(() => {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) {
          setVisible(true);
        }
      } catch {}
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, new Date().toISOString()); } catch {}
    setVisible(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      dismiss();
    }
  };

  if (!visible) return null;
  const current = STEPS[step];

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[320px] animate-fade-up">
      <div className="p-4 border border-accent/40 bg-bg-raised rounded-md shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-accent uppercase tracking-wider">
              GUIDE · {step + 1} / {STEPS.length}
            </span>
          </div>
          <button
            onClick={dismiss}
            className="text-text-tertiary hover:text-text-primary text-[14px] -mt-1 -mr-1 w-6 h-6 flex items-center justify-center"
            title="跳过"
          >
            ×
          </button>
        </div>
        <h3 className="text-[13px] font-semibold text-text-primary mb-1.5 font-[family-name:var(--font-outfit)]">
          {current.title}
        </h3>
        <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
          {current.body}
        </p>
        {/* 进度点 */}
        <div className="flex items-center gap-1 mb-3">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === step ? 'w-5 bg-accent' : i < step ? 'w-3 bg-accent/40' : 'w-3 bg-border-subtle'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={dismiss}
            className="text-[10px] font-mono text-text-tertiary hover:text-text-secondary"
          >
            跳过
          </button>
          <button
            onClick={next}
            className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-bg-root text-[11px] font-semibold rounded-md"
          >
            {current.cta} →
          </button>
        </div>
      </div>
    </div>
  );
}
