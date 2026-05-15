import type { Metadata } from 'next';
import Link from 'next/link';
import PageViewTracker from '@/components/analytics/PageViewTracker';
import { AnimatedMetric } from '@/components/marketing/AnimatedMetric';
import LandingDecisionDemo from '@/components/marketing/LandingDecisionDemo';
import TopNav from '@/components/marketing/TopNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { PricingIntentCards } from '@/components/marketing/PricingIntentCards';
import { VisitorRouter } from '@/components/marketing/VisitorRouter';

export const metadata: Metadata = {
  title: 'Wenai | 电商内容实验决策中枢',
  description: '导入平台 CSV，自动生成下一轮内容实验决策、脱敏报告和生产 Brief。',
};

const proof = [
  { value: 5, suffix: ' 大平台', label: '支持 TikTok、Amazon、Shopify、Meta 和 Google CSV' },
  { value: 100, suffix: '% 本地优先', label: '表现数据优先保存在当前浏览器工作台' },
  { value: 4, suffix: ' 类决策', label: '暂停、放大、继续验证和重做承接都有真实阈值' },
];

const steps = [
  { title: '导入 CSV', text: '上传广告或店铺表现数据，自动识别字段并完成导入 QA。' },
  { title: '获取决策', text: '首屏看到暂停、放大、继续验证或重做承接的明确结论。' },
  { title: '导出执行', text: '一键导出脱敏报告、生产 Brief，或复制模板继续跑下一轮。' },
];

export default function HomePage() {
  return (
    <>
      <PageViewTracker page="landing" />
      <TopNav />
      <main className="bg-bg-root text-text-primary">
        <section className="border-b border-border-subtle">
          <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-24">
            <div className="flex flex-col justify-center">
              <div className="text-[10px] font-mono uppercase tracking-widest text-accent">Content Decision OS</div>
              <h1 className="mt-4 max-w-[13ch] text-4xl font-semibold leading-[1.03] tracking-tight text-text-primary sm:text-6xl">
                导入 CSV，决定下一轮该生产什么。
              </h1>
              <p className="mt-5 max-w-xl text-[15px] leading-7 text-text-secondary sm:text-base">
                Wenai 把平台表现数据、内容变量和实验规则连起来，输出商家能执行的下一轮动作：停什么、放大什么、继续测什么，以及交给剪辑师的生产 Brief。
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/dashboard" className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-[13px] font-semibold text-bg-root transition-colors hover:bg-accent-hover">
                  免费开始第一轮实验
                </Link>
                <Link href="/pricing" className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-subtle px-5 text-[13px] font-semibold text-text-primary transition-colors hover:border-accent hover:text-accent">
                  查看定价
                </Link>
              </div>
            </div>

            <LandingDecisionDemo />
          </div>
        </section>

        <VisitorRouter />

        <section className="border-b border-border-subtle py-12">
          <div className="mx-auto grid max-w-[1200px] gap-4 px-5 sm:px-6 md:grid-cols-3 lg:px-8">
            {proof.map(item => <AnimatedMetric key={item.label} value={item.value} suffix={item.suffix} label={item.label} />)}
          </div>
        </section>

        <section className="border-b border-border-subtle py-16" id="flow">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="text-[10px] font-mono uppercase tracking-widest text-accent">3 Step Workflow</div>
              <h2 className="mt-3 text-3xl font-semibold text-text-primary">从数据到执行，不让商家卡在报表里。</h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-md border border-border-subtle bg-bg-surface p-5">
                  <div className="font-mono text-[11px] text-accent">{String(index + 1).padStart(2, '0')}</div>
                  <h3 className="mt-4 text-lg font-semibold text-text-primary">{step.title}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-text-secondary">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16" id="pricing">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-accent">Pricing</div>
                <h2 className="mt-3 text-3xl font-semibold text-text-primary">从免费复盘第一轮开始。</h2>
              </div>
              <Link href="/pricing" className="text-[13px] font-semibold text-accent hover:text-accent-hover">
                查看完整对比
              </Link>
            </div>
            <PricingIntentCards compact />
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
