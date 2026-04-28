import type { Metadata } from 'next';
import TopNav from '@/components/marketing/TopNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { Hero } from '@/components/marketing/Hero';
import { TrustWall } from '@/components/marketing/TrustWall';
import { ThreeStepPipeline } from '@/components/marketing/ThreeStepPipeline';
import { RoiCalculator } from '@/components/marketing/RoiCalculator';
import { BeforeAfter } from '@/components/marketing/BeforeAfter';
import { CaseCards } from '@/components/marketing/CaseCards';
import { ComplianceStrip } from '@/components/marketing/ComplianceStrip';
import { PricingTiers } from '@/components/marketing/PricingTiers';
import { Faq } from '@/components/marketing/Faq';
import { FinalCta } from '@/components/marketing/FinalCta';

/**
 * Marketing 首页 · 销售漏斗
 *
 * 决策路径: Hero (注意) → TrustWall (信任) → ThreeStep (理解)
 *           → RoiCalculator (算账) → BeforeAfter (证据) → CaseCards (社会证明)
 *           → ComplianceStrip (差异化) → PricingTiers (报价) → Faq (打消疑虑) → FinalCta (行动)
 *
 * 不挂 dashboard chrome (sidebar / palette / mobile bar) · layout.tsx 通过 isMarketingRoute 跳过
 * dashboard 视图请去 /me/skus
 */

export const metadata: Metadata = {
  title: 'wenai · 跨境电商内容生产, 便宜 50 倍',
  description:
    '工厂级 AI 流水线, 一晚交付主图、模特图、详情页、短视频、客服话术全套 · 对比真人摄影, 每个 SKU 从 ¥3,500 降到 ¥50',
  openGraph: {
    title: 'wenai · 跨境电商内容生产, 便宜 50 倍',
    description: '工厂级 AI 流水线 · 一晚出 200 SKU 全套上架物料',
    url: 'https://wenai-one.vercel.app',
    siteName: 'wenai',
    images: [{ url: '/api/og', width: 1200, height: 630, alt: 'wenai' }],
    locale: 'zh_CN',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-root text-text-primary">
      <TopNav />
      <main>
        <Hero />
        <TrustWall />
        <ThreeStepPipeline />
        <RoiCalculator />
        <BeforeAfter />
        <CaseCards />
        <ComplianceStrip />
        <PricingTiers />
        <Faq />
        <FinalCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
