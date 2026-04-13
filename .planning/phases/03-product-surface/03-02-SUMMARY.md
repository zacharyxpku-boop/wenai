---
phase: 03-product-surface
plan: "02"
subsystem: billing
tags: [stripe, webhooks, credits, cron, billing]
dependency_graph:
  requires: [03-01]
  provides: [stripe-checkout, webhook-handler, credit-balance-api, daily-spend-cap]
  affects: [job-submission-api, credit-meter-component]
tech_stack:
  added: [stripe-webhooks, vercel-cron]
  patterns: [idempotent-webhook-via-unique-constraint, service-role-client-for-cron, 80pct-spend-cap-threshold]
key_files:
  created:
    - src/app/api/billing/checkout/route.ts
    - src/app/api/webhooks/stripe/route.ts
    - src/lib/stripe/webhook.ts
    - src/app/api/credits/balance/route.ts
    - src/app/api/cron/daily-spend-cap/route.ts
    - supabase/migrations/004_app_config.sql
    - vercel.json
  modified: []
decisions:
  - "Idempotency via DB UNIQUE constraint (stripe_events.stripe_event_id) — catches duplicate webhooks at insert time, 23505 code = already processed"
  - "Service role Supabase client for webhook and cron — no user session available in these contexts"
  - "app_config key-value table for runtime flags — job submission API reads daily_spend_cap_reached before accepting new jobs"
  - "80% budget threshold for spend cap — leaves headroom for in-flight jobs to complete"
metrics:
  duration_seconds: 263
  completed_date: "2026-04-12"
  tasks_completed: 2
  files_created: 7
  files_modified: 0
---

# Phase 3 Plan 02: Stripe Billing Backend Summary

**One-liner:** Stripe Checkout (mode: payment) + idempotent webhook via UNIQUE constraint + hourly spend cap cron at 80% threshold.

## What Was Built

### Task 1: Stripe Checkout + Webhook Handler

**`src/app/api/billing/checkout/route.ts`** (BILL-01)
POST endpoint that creates Stripe Checkout sessions. Validates auth, reads `packId` from request body, creates session with `mode: 'payment'` (one-time, not subscription). Passes `orgId` and `credits` in session metadata for the webhook to consume.

**`src/lib/stripe/webhook.ts`** (BILL-03)
Idempotent event processing. Before adding credits, inserts `stripe_event_id` into `stripe_events`. UNIQUE constraint on `stripe_event_id` catches duplicate webhook deliveries — error code `23505` = already processed, safe early return. Credits added via `add_credits` RPC after dedup succeeds.

**`src/app/api/webhooks/stripe/route.ts`** (BILL-04)
Webhook route. Uses `req.text()` for raw body (mandatory — `req.json()` breaks Stripe signature verification by altering whitespace). Calls `stripe.webhooks.constructEvent()` for signature verification. Handles `checkout.session.completed` and `invoice.payment_failed`.

### Task 2: Credit Balance API + Daily Spend Cap

**`src/app/api/credits/balance/route.ts`**
GET endpoint returning `{ balance: number }` for the authenticated user's org. Reads `orgs.credit_balance` — used by the CreditMeter component (Plan 03) for polling.

**`src/app/api/cron/daily-spend-cap/route.ts`** (BILL-06)
Vercel Cron route (hourly). Verifies `CRON_SECRET` authorization. Aggregates `job_steps.cost_usd` for the current UTC day. At 80% of `DAILY_AI_BUDGET_USD`, sets `daily_spend_cap_reached = true` in `app_config`. Job submission API checks this flag before accepting new jobs.

**`supabase/migrations/004_app_config.sql`**
New migration adding `app_config` key-value table with RLS enabled (service role only).

**`vercel.json`**
Cron schedule: `0 * * * *` (every hour) for `/api/cron/daily-spend-cap`.

## Decisions Made

1. **UNIQUE constraint idempotency** — DB-level deduplication is more reliable than application-level checks. Postgres error code `23505` is the canonical signal.
2. **Service role client for webhook/cron** — These contexts have no user session. Direct `createClient(url, serviceRoleKey)` bypasses RLS intentionally.
3. **`app_config` table for cap flag** — Avoids in-memory state or Redis dependency. Job submission API reads one row.
4. **80% threshold** — Matches research recommendation. Leaves headroom for jobs that started before the cap was hit.

## Deviations from Plan

**1. [Rule 2 - Missing Critical Functionality] Added orgId null check in checkout route**
- Found during: Task 1
- Issue: Plan code assumed `user.app_metadata?.org_id` always present; missing org would cause Stripe session with null `client_reference_id`, making webhook unable to credit anyone
- Fix: Added explicit `if (!orgId)` guard returning 400
- Files modified: src/app/api/billing/checkout/route.ts

**2. [Rule 2 - Missing Critical Functionality] Added orgId null check in balance route**
- Found during: Task 2
- Issue: Same pattern — user without org would cause Supabase query with undefined org_id
- Fix: Added `if (!orgId)` guard returning 400
- Files modified: src/app/api/credits/balance/route.ts

**3. [Rule 3 - Blocking Issue] Created supabase/migrations/004_app_config.sql**
- Found during: Task 2
- Issue: Plan's cron route upserts to `app_config` table which didn't exist in any migration
- Fix: Created migration 004 with `CREATE TABLE IF NOT EXISTS app_config`
- Files modified: supabase/migrations/004_app_config.sql

## Known Stubs

None — all routes have real data sources wired (Stripe API, Supabase `orgs` table, `job_steps` table).

## Self-Check: PASSED

Files created:
- src/app/api/billing/checkout/route.ts: FOUND
- src/app/api/webhooks/stripe/route.ts: FOUND
- src/lib/stripe/webhook.ts: FOUND
- src/app/api/credits/balance/route.ts: FOUND
- src/app/api/cron/daily-spend-cap/route.ts: FOUND
- supabase/migrations/004_app_config.sql: FOUND
- vercel.json: FOUND

Commits:
- 2ecd09d: feat(03-02): Stripe Checkout session, webhook handler with idempotent credit addition
- 0eaa4c8: feat(03-02): credit balance API, daily spend cap cron, app_config migration
