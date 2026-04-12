# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-12)

**Core value:** Analyze the structural DNA of viral TikToks and reproduce it with a merchant's product — delivering ready-to-publish 9:16 video variants
**Current focus:** Phase 1 — Foundation

## Current Position

Phase: 1 of 3 (Foundation)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-04-12 — Roadmap created; all planning artifacts initialized

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: -
- Trend: -

## Accumulated Context

### Decisions

- Foundation: BullMQ workers on Railway (not Vercel) — serverless timeout kills multi-minute video generation
- Foundation: Upstash Redis Fixed plan — BullMQ polls constantly, PAYG 10-100x cost inflation
- Foundation: Presigned upload pattern — bypasses Vercel 4.5MB and Supabase 6MB limits
- Pipeline: fal.ai for Kling routing — avoids $1,400 direct API deposit
- Pipeline: Webhook-first for Kling; polling (exp backoff) for Flux/Gemini — no persistent polling in workers
- Pipeline: Gemini Flash not Pro — avoid 2x pricing at >200K context
- Billing: Credit deduction must be a single atomic Postgres UPDATE with balance check

### Pending Todos

None yet.

### Blockers/Concerns

- TikAPI (TikTok scraping) has LOW confidence — unofficial API with ToS risk. Design viral analyzer to degrade gracefully if unavailable.
- Kling 3.0 endpoint IDs on fal.ai are MEDIUM confidence — verify exact endpoint strings before Phase 2 implementation.
- Supabase Storage bandwidth: budget for Pro tier from day 1 (free tier = 2GB/month total, one active user exhausts this).

## Session Continuity

Last session: 2026-04-12
Stopped at: Roadmap created, no execution yet
Resume file: None
