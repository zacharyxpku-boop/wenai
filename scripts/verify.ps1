$ErrorActionPreference = "Stop"

function Invoke-Step {
  param(
    [Parameter(Mandatory = $true)]
    [string] $Name,
    [Parameter(Mandatory = $true)]
    [scriptblock] $Command
  )

  Write-Host ""
  Write-Host "==> $Name" -ForegroundColor Cyan
  & $Command
  if ($LASTEXITCODE -ne 0) {
    throw "$Name failed with exit code $LASTEXITCODE"
  }
}

Invoke-Step "Vitest focused suite" {
  npm.cmd run test -- __tests__/standard-pack-routing.test.ts __tests__/sop-workflows.test.ts __tests__/poc-launch-check.test.ts __tests__/poc-report-evaluator.test.ts __tests__/poc-report-generator.test.ts __tests__/inquiry-activity.test.ts __tests__/ratelimit.test.ts __tests__/case-library.test.ts __tests__/ecommerce-guardrails.test.ts __tests__/content-marketing-pack.test.ts __tests__/brand-iq.test.ts __tests__/crm-pipeline.test.ts __tests__/share-readonly.test.ts
}

Invoke-Step "TypeScript noEmit" {
  npx.cmd tsc --noEmit
}

Invoke-Step "ESLint" {
  npm.cmd run lint -- `
    src/lib/standard-pack-routing.ts `
    src/lib/sop-workflows.ts `
    src/lib/poc-case-studies.ts `
    src/lib/case-study-details.ts `
    src/lib/case-library.ts `
    src/lib/ecommerce-guardrails.ts `
    src/lib/content-marketing-pack.ts `
    src/lib/brand-iq.ts `
    src/lib/crm-pipeline.ts `
    src/lib/share-readonly.ts `
    src/lib/inquiry-activity.ts `
    src/lib/poc-launch-check.ts `
    src/lib/poc-report-evaluator.ts `
    src/i18n/zh.ts `
    __tests__/standard-pack-routing.test.ts `
    __tests__/sop-workflows.test.ts `
    __tests__/poc-launch-check.test.ts `
    __tests__/poc-report-evaluator.test.ts `
    __tests__/poc-report-generator.test.ts `
    __tests__/inquiry-activity.test.ts `
    __tests__/case-library.test.ts `
    __tests__/ecommerce-guardrails.test.ts `
    __tests__/content-marketing-pack.test.ts `
    __tests__/brand-iq.test.ts `
    __tests__/crm-pipeline.test.ts `
    __tests__/share-readonly.test.ts `
    src/components/CaseLibraryExplorer.tsx `
    src/components/FiveMinutePocOnboarding.tsx `
    src/components/ContentMarketingPackWorkspace.tsx `
    src/components/StandardPackWorkspace.tsx `
    src/components/PocLaunchChecklist.tsx `
    src/components/PocReportGenerator.tsx `
    src/components/SharePageActions.tsx `
    src/components/AdminInquiryCommercialEditor.tsx `
    src/components/marketing/TopNav.tsx `
    src/components/marketing/MarketingFooter.tsx `
    src/components/marketing/Hero.tsx `
    src/components/marketing/TrustWall.tsx `
    src/components/marketing/ThreeStepPipeline.tsx `
    src/components/marketing/RoiCalculator.tsx `
    src/components/marketing/BeforeAfter.tsx `
    src/components/marketing/CaseCards.tsx `
    src/components/marketing/ComplianceStrip.tsx `
    src/components/marketing/PricingTiers.tsx `
    src/components/marketing/Faq.tsx `
    src/components/marketing/FinalCta.tsx `
    src/app/pipelines/product-image/page.tsx `
    src/app/pipelines/product-discovery/page.tsx `
    src/app/pipelines/batch-launch/page.tsx `
    src/app/pipelines/ai-photoshoot/page.tsx `
    src/app/pipelines/ai-video/page.tsx `
    src/app/pipelines/ab-test/page.tsx `
    src/app/pipelines/data-insights/page.tsx `
    src/app/pipelines/intent-mining/page.tsx `
    src/app/pipelines/new-listing/page.tsx `
    src/app/pipelines/customer-service/page.tsx `
    src/app/pipelines/influencer-outbound/page.tsx `
    src/app/pipelines/video-teardown/page.tsx `
    src/app/pipelines/marketing-campaign/page.tsx `
    src/app/about/page.tsx `
    src/app/docs/page.tsx `
    src/app/roadmap/page.tsx `
    src/app/enterprise/page.tsx `
    src/app/tools/page.tsx `
    src/app/changelog/page.tsx `
    src/app/product/photoshoot/page.tsx `
    src/app/product/pipeline/page.tsx `
    src/app/product/video/page.tsx `
    src/app/inquire/page.tsx `
    src/app/poc/page.tsx `
    src/app/poc/report/page.tsx `
    src/app/share/[id]/page.tsx `
    src/app/share/[id]/executive/page.tsx `
    src/app/cases/page.tsx `
    src/app/cases/[slug]/page.tsx `
    src/app/admin/inquiries/page.tsx `
    src/app/admin/inquiries/[id]/page.tsx `
    src/app/admin/metrics/page.tsx `
    src/app/api/sales/inquiry/route.ts
}

Invoke-Step "Next build" {
  npm.cmd run build
}

Write-Host ""
Write-Host "Verification passed." -ForegroundColor Green
