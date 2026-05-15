import type { Metadata } from 'next';
import Link from 'next/link';
import { PricingIntentCards } from '@/components/marketing/PricingIntentCards';

export const metadata: Metadata = {
  title: '获取上线通知 | Wenai',
  description: 'Starter 和 Growth 付费通道开放前，留下邮箱获取上线通知与早鸟优惠。',
};

export default async function PricingCheckoutPage({
  searchParams,
}: {
  searchParams?: Promise<{ plan?: string }>;
}) {
  const params = await searchParams;
  const requestedPlan = params?.plan === 'growth' ? 'Growth' : params?.plan === 'starter' ? 'Starter' : 'Starter/Growth';

  return (
    <main className="min-h-screen bg-bg-root px-5 py-10 text-text-primary">
      <div className="mx-auto max-w-4xl">
        <Link href="/pricing" className="text-[12px] font-semibold text-accent hover:text-accent-hover">
          返回定价页
        </Link>
        <section className="mt-6 rounded-md border border-border-subtle bg-bg-surface p-6">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent">Early Access</div>
          <h1 className="mt-3 text-3xl font-semibold text-text-primary">
            {requestedPlan} 付费通道即将开放
          </h1>
          <p className="mt-4 max-w-2xl text-[14px] leading-7 text-text-secondary">
            当前不会进行扣款，也不会改变你的 Free 试用档位。留下邮箱后，Starter/Growth 开放时会优先通知你，并保留早鸟优惠资格。
          </p>
        </section>
        <section className="mt-6">
          <PricingIntentCards />
        </section>
      </div>
    </main>
  );
}
