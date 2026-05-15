import type { Metadata } from 'next';
import Link from 'next/link';
import PageViewTracker from '@/components/analytics/PageViewTracker';
import TopNav from '@/components/marketing/TopNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { PricingIntentCards } from '@/components/marketing/PricingIntentCards';

export const metadata: Metadata = {
  title: '定价 | Wenai 内容实验决策中枢',
  description: 'Free、Starter、Growth 三档权益对比：项目数、CSV 导入次数、报告水印、Brief 导出和跨轮学习档案。',
};

const rows = [
  ['项目数', '1 个', '3 个', '无限'],
  ['CSV 导入次数', '每月 3 次', '每月 30 次', '无限'],
  ['报告水印', 'Wenai Free 水印', '无水印', '无水印'],
  ['生产 Brief 导出', '不支持', '支持', '支持批量导出'],
  ['学习档案', '最近 1 轮', '最近 10 轮', '完整保留'],
  ['跨轮搜索', '不支持', '基础搜索', '完整搜索 + 变量级洞察'],
];

const faq = [
  {
    q: '数据安全吗？',
    a: 'Wenai 当前以前端工作台为主，CSV 表现数据优先保存在你的浏览器本地；导出分享前会生成脱敏报告，避免暴露原始账户和素材细节。',
  },
  {
    q: '支持哪些平台？',
    a: '当前支持 TikTok、Amazon、Shopify、Meta 和 Google 的 CSV 字段映射、导入 QA、指标归一化和决策摘要。',
  },
  {
    q: '和内容生产平台是什么关系？',
    a: 'Wenai 不替代剪辑和素材生产工具。Wenai 负责先判断下一轮该生产什么，再把胜出的 Hook、Angle、Offer、CTA 和规格整理成可执行 Brief。',
  },
];

export default function PricingPage() {
  return (
    <>
      <PageViewTracker page="pricing" />
      <TopNav />
      <main className="bg-bg-root text-text-primary">
        <section className="border-b border-border-subtle">
          <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <div className="text-[10px] font-mono uppercase tracking-widest text-accent">Pricing</div>
              <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-text-primary sm:text-5xl">
                先免费跑通第一轮，再为更多复盘和执行协同付费。
              </h1>
              <p className="mt-5 text-[15px] leading-7 text-text-secondary">
                付费点只放在高价值动作上：更多 CSV 导入、无水印报告、生产 Brief、跨轮学习档案和团队协作入口。
              </p>
            </div>
            <div className="mt-10">
              <PricingIntentCards />
            </div>
          </div>
        </section>

        <section className="border-b border-border-subtle py-16">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
            <div className="mb-6">
              <div className="text-[10px] font-mono uppercase tracking-widest text-accent">Plan Compare</div>
              <h2 className="mt-3 text-3xl font-semibold text-text-primary">三档权益对比</h2>
            </div>
            <div className="overflow-x-auto rounded-md border border-border-subtle">
              <table className="w-full min-w-[720px] border-collapse bg-bg-surface text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="px-4 py-3 font-semibold text-text-primary">权益</th>
                    <th className="px-4 py-3 font-semibold text-text-primary">Free</th>
                    <th className="px-4 py-3 font-semibold text-text-primary">Starter</th>
                    <th className="px-4 py-3 font-semibold text-text-primary">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={row[0]} className="border-b border-border-subtle last:border-b-0">
                      {row.map((cell, index) => (
                        <td key={cell} className={index === 0 ? 'px-4 py-3 font-semibold text-text-primary' : 'px-4 py-3 text-text-secondary'}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="border-b border-border-subtle py-16">
          <div className="mx-auto grid max-w-[1200px] gap-4 px-5 sm:px-6 lg:grid-cols-3 lg:px-8">
            {faq.map(item => (
              <div key={item.q} className="rounded-md border border-border-subtle bg-bg-surface p-5">
                <h3 className="text-[14px] font-semibold text-text-primary">{item.q}</h3>
                <p className="mt-3 text-[13px] leading-6 text-text-secondary">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-5 px-5 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-accent">Start Free</div>
              <h2 className="mt-2 text-2xl font-semibold text-text-primary">用一份 CSV 跑出第一份决策报告。</h2>
            </div>
            <Link href="/dashboard" className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-[13px] font-semibold text-bg-root transition-colors hover:bg-accent-hover">
              免费开始
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
