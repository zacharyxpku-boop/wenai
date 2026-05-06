import type { Metadata } from 'next';
import TopNav from '@/components/marketing/TopNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { Hero } from '@/components/marketing/Hero';
import { TrustWall } from '@/components/marketing/TrustWall';
import { WhyFocused } from '@/components/marketing/WhyFocused';
import { ThreeStepPipeline } from '@/components/marketing/ThreeStepPipeline';
import { MarketingGrowthLayer } from '@/components/marketing/MarketingGrowthLayer';
import { RoiCalculator } from '@/components/marketing/RoiCalculator';
import { BeforeAfter } from '@/components/marketing/BeforeAfter';
import { CaseCards } from '@/components/marketing/CaseCards';
import { ComplianceStrip } from '@/components/marketing/ComplianceStrip';
import { PricingTiers } from '@/components/marketing/PricingTiers';
import { Faq } from '@/components/marketing/Faq';
import { FinalCta } from '@/components/marketing/FinalCta';

export const metadata: Metadata = {
  title: 'wenai | 给电商团队的 AI 商业交付系统',
  description:
    '从 SKU 输入、类目规则、Brand IQ、内容营销到 POC 报告和合同推进，wenai 把电商交付压缩成一条可验收的商业流程。',
  openGraph: {
    title: 'wenai | 电商 AI 商业交付系统',
    description:
      '从 SKU 输入到 Brand IQ、内容营销、老板版报告和 CRM 合同推进，一条线跑完。',
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
        <WhyFocused />
        <TrustWall />
        <ThreeStepPipeline />
        <MarketingGrowthLayer />
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
