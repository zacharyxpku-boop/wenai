# Deliverable Groups V2

This file separates launchable deliverables from unrelated historical repo noise.

## Group A: Customer-facing launchable product
- `src/app/poc/page.tsx`
- `src/components/FiveMinutePocOnboarding.tsx`
- `src/components/PocLaunchChecklist.tsx`
- `src/components/PocReportGenerator.tsx`
- `src/components/SharePageActions.tsx`
- `src/lib/brand-iq.ts`
- `src/lib/ecommerce-guardrails.ts`
- `src/lib/content-marketing-pack.ts`
- `src/lib/standard-pack-routing.ts`
- `src/lib/poc-report-evaluator.ts`

## Group B: Ops / CRM commercial loop
- `src/app/admin/inquiries/page.tsx`
- `src/app/api/sales/inquiry/route.ts`
- `src/lib/crm-pipeline.ts`
- `src/lib/inquiry-activity.ts`

## Group C: Sales / positioning / case evidence
- `src/app/cases/page.tsx`
- `src/app/cases/[slug]/page.tsx`
- `src/lib/case-library.ts`
- `src/lib/case-study-details.ts`
- `docs/WENAI_OPERATING_SYSTEM.md`
- `docs/PRODUCT_STATUS.md`

## Group D: Marketing workflow
- `src/app/pipelines/marketing-campaign/page.tsx`
- `src/components/ContentMarketingPackWorkspace.tsx`
- `src/lib/content-marketing-pack.ts`
- `docs/CONTENT_BENCHMARK_SOP.md`
- `docs/CREATIVE_PRODUCTION_PACK.md`

## Historical dirty changes not grouped here
- large unrelated page edits
- desktop-root history outside project scope
- unrelated legacy content and deleted root files

Do not use working tree dirtiness alone as a release signal.
Use grouped verification plus manual review.
