# Delivery Index

This index is the release-facing map for the current wenai closeout. It separates customer-ready work from legacy working-tree noise so the product can be reviewed, staged, and shipped without treating the whole Desktop git root as one release.

## Release Slice 1: Customer POC Entry

- `src/app/poc/page.tsx`
- `src/components/FiveMinutePocOnboarding.tsx`
- `src/components/PocLaunchChecklist.tsx`
- `src/components/PocReportGenerator.tsx`
- `src/app/inquire/page.tsx`

Review goal: a customer can move from category selection to SKU input, standard pack, report, and POC submission without needing operator explanation.

## Release Slice 2: Executive Share And Delivery Evidence

- `src/app/share/[id]/page.tsx`
- `src/app/share/[id]/executive/page.tsx`
- `src/components/SharePageActions.tsx`
- `src/lib/share-readonly.ts`

Review goal: sales can send a read-only customer or executive report that feels like a real SaaS handoff, not a raw AI transcript.

## Release Slice 3: Brand IQ And SOP Moat

- `src/lib/brand-iq.ts`
- `src/lib/ecommerce-guardrails.ts`
- `src/lib/sop-workflows.ts`
- `src/lib/standard-pack-routing.ts`
- `src/components/StandardPackWorkspace.tsx`

Review goal: wenai is positioned as an ecommerce commercial delivery system with category rules, brand constraints, reusable SOPs, and acceptance checks.

## Release Slice 4: CRM-Lite Commercial Loop

- `src/app/admin/inquiries/page.tsx`
- `src/app/admin/inquiries/[id]/page.tsx`
- `src/app/admin/metrics/page.tsx`
- `src/components/AdminInquiryCommercialEditor.tsx`
- `src/components/AdminHeader.tsx`
- `src/lib/crm-pipeline.ts`
- `src/lib/inquiry-activity.ts`
- `src/app/api/sales/inquiry/route.ts`

Review goal: the operator can see POC status, owner, SLA, recap notes, quote/payment state, next action, and contract readiness.

## Release Slice 5: Commercial Admin Hygiene

- `src/app/admin/invites/page.tsx`
- `src/app/admin/payments/page.tsx`

Review goal: invite and payment review screens no longer expose garbled copy in the highest-trust admin surfaces.

## Release Slice 6: Marketing Workflow

- `src/app/pipelines/marketing-campaign/page.tsx`
- `src/components/ContentMarketingPackWorkspace.tsx`
- `src/lib/content-marketing-pack.ts`
- `docs/CONTENT_BENCHMARK_SOP.md`
- `docs/CREATIVE_PRODUCTION_PACK.md`

Review goal: TikTok/INS benchmark, hook matrix, slideshow/reel brief, and recap report are framed as a delivery pack, not a loose generator.

## Release Slice 7: Launch And Ops Documents

- `.env.example`
- `docs/LAUNCH_READINESS_CHECKLIST.md`
- `docs/DEMO_ROOM.md`
- `docs/PRODUCT_STATUS.md`
- `docs/WENAI_OPERATING_SYSTEM.md`
- `docs/DELIVERABLE_GROUPS_V2.md`
- `scripts/release-scope.ps1`
- `scripts/repo-status.ps1`
- `scripts/verify.ps1`

Review goal: a release reviewer can understand what is launchable, what needs environment setup, and what should be ignored as historical Desktop-level dirt.

## Explicitly Out Of This Release Slice

- Desktop-level deleted files and office-document temp files outside `C:\Users\86136\Desktop\claude\wenai`.
- Old Claude worktrees, unrelated sibling projects, generated outputs, and personal documents.
- Legacy admin pages not listed above, unless they block build or verification.

Do not use whole-working-tree dirtiness as the release signal. Use this index, `scripts/release-scope.ps1`, and `scripts/verify.ps1`.
