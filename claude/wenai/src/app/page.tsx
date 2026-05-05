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
  title: 'wenai | AI commercial delivery system for ecommerce teams',
  description:
    'SKU intake, category rules, Brand IQ, content marketing, POC report, and contract motion in one operating line.',
  openGraph: {
    title: 'wenai | Ecommerce AI commercial delivery system',
    description:
      'From SKU intake to Brand IQ, content marketing, POC report, and contract motion.',
    url: 'https://wenai-one.vercel.app',
    siteName: 'wenai',
    images: [{ url: '/api/og', width: 1200, height: 630, alt: 'wenai' }],
    locale: 'en_US',
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
