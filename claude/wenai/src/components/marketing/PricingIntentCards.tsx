'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { saveEarlyBirdLead } from '@/lib/early-bird';

type Plan = {
  name: 'Free' | 'Starter' | 'Growth';
  price: string;
  cta: string;
  href?: string;
  features: string[];
};

const plans: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    cta: '免费开始',
    href: '/dashboard',
    features: ['1 个项目', '每月 3 次 CSV 导入', '带水印脱敏报告'],
  },
  {
    name: 'Starter',
    price: '$29/月',
    cta: '获取早鸟优惠',
    features: ['3 个项目', '每月 30 次 CSV 导入', '无水印报告 + 生产 Brief'],
  },
  {
    name: 'Growth',
    price: '$99/月',
    cta: '获取团队早鸟',
    features: ['无限项目和导入', '完整跨轮学习搜索', '批量导出和团队协作入口'],
  },
];

export function PricingIntentCards({ compact = false }: { compact?: boolean }) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPlan || !email.trim()) return;
    if (selectedPlan.name === 'Free') return;
    const result = saveEarlyBirdLead({ tier: selectedPlan.name, email, source: 'pricing' });
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage('已记录。Starter/Growth 上线后会优先通知你。当前仍为 Free 试用。');
    setEmail('');
  };

  return (
    <div>
      <div className={compact ? 'grid gap-3 lg:grid-cols-3' : 'grid gap-4 lg:grid-cols-3'}>
        {plans.map(plan => (
          <div key={plan.name} className="rounded-md border border-border-subtle bg-bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[12px] font-semibold text-text-primary">{plan.name}</div>
                <div className="mt-2 text-3xl font-semibold text-text-primary">{plan.price}</div>
              </div>
              {plan.name === 'Starter' && <span className="rounded-md bg-accent-dim px-2 py-1 text-[10px] font-mono text-accent">推荐</span>}
            </div>
            <ul className="mt-5 space-y-2 text-[13px] leading-6 text-text-secondary">
              {plan.features.map(feature => (
                <li key={feature}>- {feature}</li>
              ))}
            </ul>
            {plan.href ? (
              <Link href={plan.href} className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-accent px-4 py-2 text-[12px] font-semibold text-bg-root transition-colors hover:bg-accent-hover">
                {plan.cta}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSelectedPlan(plan);
                  setMessage('即将上线，留下邮箱获取早鸟优惠。');
                }}
                className="mt-5 w-full rounded-md border border-accent/60 px-4 py-2 text-[12px] font-semibold text-accent transition-colors hover:bg-accent-dim"
              >
                {plan.cta}
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedPlan && (
        <form onSubmit={submit} className="mt-4 rounded-md border border-accent/40 bg-accent-dim p-4">
          <div className="text-[13px] font-semibold text-text-primary">{selectedPlan.name} 即将上线，留下邮箱获取早鸟优惠</div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="min-h-10 flex-1 rounded-md border border-border-subtle bg-bg-raised px-3 text-[13px] text-text-primary outline-none focus:border-accent"
            />
            <button type="submit" className="min-h-10 rounded-md bg-accent px-4 text-[12px] font-semibold text-bg-root transition-colors hover:bg-accent-hover">
              提交
            </button>
          </div>
          {message && <p className="mt-2 text-[12px] text-accent">{message}</p>}
        </form>
      )}
    </div>
  );
}
