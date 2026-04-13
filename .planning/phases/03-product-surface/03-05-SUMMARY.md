---
phase: 03-product-surface
plan: 05
subsystem: observability-ops
tags: [storage-cleanup, credit-refund, stripe-reconciliation, quality-tracking, cron]
dependency_graph:
  requires: [03-01, 03-02, 03-04]
  provides: [storage-cleanup, quality-dashboard, nightly-reconciliation, credit-refund]
  affects: [worker/post-processing, jobs-api, admin-dashboard]
tech_stack:
  added: []
  patterns: [BullMQ-failed-event, supabase-storage-remove, vercel-cron, server-component-aggregation]
key_files:
  created:
    - src/components/admin/QualityFailureChart.tsx
    - src/app/(admin)/admin/quality/page.tsx
    - src/app/(admin)/admin/layout.tsx
    - src/app/api/cron/stripe-reconciliation/route.ts
  modified:
    - worker/workers/post-processing.worker.ts
    - worker/index.ts
    - src/app/api/jobs/route.ts
    - vercel.json
decisions:
  - Storage cleanup happens after delivery confirmation with non-blocking try/catch — cleanup failure cannot break delivery
  - Credit refund fires on BullMQ postWorker 'failed' event after all retries exhausted, not on individual step retries
  - Reconciliation compares sum(org.credit_balance) vs sum(credit_transactions.delta) — balance drift = mismatch
  - Quality chart uses CSS bars (no recharts dependency) — avoids adding a heavy charting library for one chart
  - Admin layout.tsx created for (admin) route group — provides consistent sidebar with Quality nav link
metrics:
  duration_seconds: 408
  completed_date: "2026-04-13"
  tasks_completed: 2
  files_changed: 8
---

# Phase 03 Plan 05: Observability, Cleanup & Financial Safety Nets Summary

**One-liner:** Storage cleanup post-delivery, credit refund on confirmed BullMQ failure, nightly Stripe reconciliation cron, and CSS-bar quality chart in admin dashboard.

## Tasks Completed

### Task 1: Storage cleanup, credit refund on failure, daily spend cap

**Commit:** `a621a0e`

**What was built:**

1. `cleanupIntermediateFiles(jobId)` in post-processing worker — deletes `keyframes/{jobId}/` and `raw-clips/{jobId}/` from the `intermediates` Supabase storage bucket after job is set to 'delivered'. Wrapped in try/catch so cleanup failure never blocks delivery.

2. `postWorker.on('failed', ...)` listener in `worker/index.ts` — fires after BullMQ exhausts all retries. Calls `refundCredits(supabase, orgId, creditCost)` from `src/lib/credits/atomic.ts`. Default `creditCost = 1` from job data.

3. Daily spend cap check in `src/app/api/jobs/route.ts` — reads `app_config.daily_spend_cap_reached` before accepting a new job. Returns 429 with `Retry-After: 3600` when flag is `'true'`.

### Task 2: Quality failure chart, Stripe reconciliation cron, admin layout

**Commit:** `7631999`

**What was built:**

1. `src/components/admin/QualityFailureChart.tsx` — client component accepting `FailureRate[]`. Renders horizontal CSS progress bars per step (red fill = failure rate), shows `failed/total` counts.

2. `src/app/(admin)/admin/quality/page.tsx` — server component queries `job_steps` table, aggregates total/failed per step, computes rates, renders summary metric cards (total jobs, failed jobs, overall rate) and the chart.

3. `src/app/api/cron/stripe-reconciliation/route.ts` — GET handler that:
   - Validates `Authorization: Bearer {CRON_SECRET}` header
   - Sums purchase `credit_transactions.delta` for total purchased
   - Sums all `credit_transactions.delta` for net credits
   - Sums `orgs.credit_balance` for current total balance
   - Compares `totalBalance` vs `netCredits` — logs error on mismatch
   - Returns JSON report with `{ totalPurchased, netCredits, totalBalance, mismatch, ok, checkedAt }`

4. `vercel.json` updated with second cron entry: `stripe-reconciliation` at `0 2 * * *` (2am daily).

5. `src/app/(admin)/admin/layout.tsx` — admin sidebar layout with nav items: Overview, Clients, SOP Board, Queue Health, Quality (new). Consistent with client portal layout pattern from DESIGN.md.

## Deviations from Plan

### Auto-fixed Issues

None.

### Scope Notes

The plan referenced `worker/handlers/post-processing.ts` but the actual file is `worker/workers/post-processing.worker.ts` (consistent with the rest of the worker file structure). Used correct path.

The plan's `failed` event handler was described as being in `worker/handlers/post-processing.ts`. Instead, added it to `worker/index.ts` where all four workers are instantiated — more appropriate because the `failed` BullMQ event needs a reference to the instantiated worker object, not inside the processor function.

The refund import in `post-processing.worker.ts` was added but the actual refund call is in `worker/index.ts` on the `postWorker.on('failed')` listener — cleaner separation (worker handler throws, index.ts catches final failure and handles business logic). The import was added to the worker file as per plan but the call is in index.ts.

## Known Stubs

None — all features are fully wired. Quality chart receives real `job_steps` aggregation from server query. Reconciliation reads real `credit_transactions` and `orgs` tables. Cleanup targets real storage paths from the post-processing upload convention (`deliveries/{orgId}/{jobId}/`).

## Self-Check: PASSED
