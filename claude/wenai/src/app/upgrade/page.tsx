import Link from 'next/link';
import type { Metadata } from 'next';
import TopNav from '@/components/marketing/TopNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata: Metadata = {
  title: '功能升级中 · Wenai',
  description: '当前商用版本聚焦内容实验决策闭环：导入 CSV、生成决策、导出报告并复制模板继续跑。',
};

export default function UpgradePage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string }>;
}) {
  void searchParams;

  return (
    <>
      <TopNav />
      <main className="min-h-[72vh] bg-bg-root px-5 py-16 text-text-primary sm:px-6 lg:px-8">
        <section data-testid="upgrade-panel" className="mx-auto max-w-[760px] rounded-md border border-border-subtle bg-bg-surface p-6 sm:p-8">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-accent">
            Feature Upgrade
          </div>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-text-primary sm:text-4xl">
            该功能正在升级，请前往首页体验新功能。
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-text-secondary">
            当前商用版本聚焦内容实验决策闭环：导入 TikTok、Amazon、Shopify、Meta 或 Google CSV，
            生成可信决策，导出脱敏报告或生产需求 Brief，再复制模板继续跑下一轮。
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-subtle px-4 text-[13px] font-semibold text-text-primary transition-colors hover:border-accent hover:text-accent"
            >
              返回首页
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 text-[13px] font-semibold text-bg-root transition-colors hover:bg-accent-hover"
            >
              进入工作台
            </Link>
            <Link
              href="/factory"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-accent/40 px-4 text-[13px] font-semibold text-accent transition-colors hover:bg-accent/10"
            >
              导入 CSV
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
