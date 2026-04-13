---
phase: 03-product-surface
plan: 01
subsystem: foundation
tags: [design-system, billing, stripe, database, migrations]
requirements: [BILL-02, BILL-05]

dependency_graph:
  requires:
    - 01-foundation (supabase clients, jobs/orgs schema)
    - 02-ai-pipeline (job_steps table for cost index)
  provides:
    - DESIGN.md: design system for all Phase 3 UI components
    - supabase/migrations/003_phase3_billing_sop.sql: sop_stage, stripe_events, credit_transactions, credit RPCs
    - src/lib/stripe/client.ts: server-only Stripe SDK
    - src/lib/stripe/packs.ts: credit pack definitions
    - src/lib/credits/atomic.ts: deductCredits + refundCredits
  affects:
    - All Phase 3 UI plans (consume DESIGN.md)
    - 03-02 through 03-05 (consume Stripe client, credit helpers, DB tables)

tech_stack:
  added:
    - stripe@22.0.1 (Stripe Node SDK, server-only)
    - server-only (Next.js guard pattern)
  patterns:
    - SECURITY DEFINER Postgres functions for atomic credit ops
    - server-only import to prevent client bundle leakage
    - Typed error returns instead of throwing on business logic failures

key_files:
  created:
    - DESIGN.md
    - supabase/migrations/003_phase3_billing_sop.sql
    - src/lib/stripe/client.ts
    - src/lib/stripe/packs.ts
    - src/lib/credits/atomic.ts
  modified: []

decisions:
  - "Design system uses system font stack (-apple-system stack), not Inter/Roboto/Poppins — per CLAUDE.md anti-AI-UI rules"
  - "Stripe API version pinned to 2026-03-25 — matches research-verified version"
  - "deductCredits returns { error: 'insufficient_credits' } typed object, not throw — callers can differentiate business vs system errors cleanly"
  - "add_credits RPC is dual-purpose: used for purchases (p_reason='purchase') and refunds (p_reason='refund') — avoids RPC proliferation"
  - "stripe_events dedup at DB level with UNIQUE constraint — idempotency guaranteed even if webhook fires twice before handler completes"

metrics:
  duration: "~8 minutes"
  completed: "2026-04-12"
  tasks_completed: 2
  tasks_total: 2
  files_created: 5
  files_modified: 0
---

# Phase 3 Plan 01: Design System, DB Migration, Stripe Init Summary

**One-liner:** Dark-mode Vercel/Linear design system + atomic Postgres credit RPCs + server-only Stripe SDK, forming the Wave 0 foundation for all Phase 3 billing and UI work.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | DESIGN.md + Phase 3 migration | 7d3cbc2 | DESIGN.md, supabase/migrations/003_phase3_billing_sop.sql |
| 2 | Stripe client, packs, atomic credit helpers | 75c933e | src/lib/stripe/client.ts, src/lib/stripe/packs.ts, src/lib/credits/atomic.ts |

## What Was Built

### DESIGN.md

Full design system for Clico AI Video Dashboard:
- Dark-only color palette: `zinc-950` base, `zinc-900` surface, `emerald-500` accent
- System font stack (no Inter/Roboto/Poppins per CLAUDE.md rules)
- Component patterns: cards, buttons (primary/secondary/destructive/ghost), form inputs, data tables, status badges
- Status badge spec: queued=gray, processing=amber, complete=emerald, failed=red, delivered=blue
- Layout patterns: fixed `w-56` sidebar + scrollable main, Kanban column structure, empty states
- Explicit anti-patterns documented to prevent AI-generated UI drift

### 003_phase3_billing_sop.sql

7 additions to the schema:
1. `sop_stage text NOT NULL DEFAULT 'client'` on `jobs` — powers admin Kanban
2. `stripe_events` table with `stripe_event_id UNIQUE` — Stripe webhook idempotency at DB level
3. `credit_transactions` table — full audit trail for all credit movements
4. `deduct_credits(p_org_id, p_amount)` RPC — atomic UPDATE with `WHERE credit_balance >= p_amount`, raises `insufficient_credits` exception if balance insufficient
5. `add_credits(p_org_id, p_amount, p_reason, p_stripe_event_id)` RPC — atomic credit addition with audit log
6. `parent_job_id uuid REFERENCES jobs(id)` on `jobs` — regeneration lineage tracking
7. `idx_job_steps_created_cost` partial index — efficient daily cost aggregation queries

### Stripe + Credits Layer

- `src/lib/stripe/client.ts`: `import 'server-only'` guard, `Stripe` instance at `apiVersion: '2026-03-25'`
- `src/lib/stripe/packs.ts`: 3 packs (starter $29/100cr, pro $79/300cr, agency $199/1000cr), `PACK_DISPLAY` strips `priceId` for safe client exposure
- `src/lib/credits/atomic.ts`: `deductCredits` returns `{ error: 'insufficient_credits' }` (not throw) for clean caller branching; `refundCredits` wraps `add_credits` RPC with `p_reason: 'refund'`

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — this plan creates infrastructure only (SQL, TypeScript contracts). No UI rendering, no placeholder text.

## Self-Check: PASSED

Verified:
- `DESIGN.md` exists at project root: FOUND
- `supabase/migrations/003_phase3_billing_sop.sql` exists: FOUND
- `src/lib/stripe/client.ts` exists: FOUND
- `src/lib/stripe/packs.ts` exists: FOUND
- `src/lib/credits/atomic.ts` exists: FOUND
- Commit 7d3cbc2: FOUND
- Commit 75c933e: FOUND
