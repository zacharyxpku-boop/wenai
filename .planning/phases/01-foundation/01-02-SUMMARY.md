---
phase: 01-foundation
plan: 02
subsystem: worker
tags: [bullmq, ioredis, railway, redis, worker, queue]
dependency_graph:
  requires: []
  provides: [worker-scaffold, bullmq-queues, redis-connection]
  affects: [phase-2-pipeline]
tech_stack:
  added: [bullmq@^5.73.0, ioredis@^5.0.0, tsx@^4.0.0]
  patterns: [bullmq-worker-railway, maxRetriesPerRequest-null, graceful-shutdown-sigterm]
key_files:
  created:
    - worker/index.ts
    - worker/lib/redis.ts
    - worker/queues/definitions.ts
    - worker/package.json
    - worker/tsconfig.json
    - worker/Dockerfile
  modified: []
decisions:
  - "lockDuration set to 20 minutes (1,200,000 ms) to cover maximum video generation time"
  - "SIGINT handler added alongside SIGTERM for local development convenience"
  - "Worker package.json scripts reference worker/index.ts path for monorepo deployment"
metrics:
  duration: 85s
  completed: 2026-04-12T06:15:19Z
  tasks_completed: 2
  files_created: 6
  files_modified: 0
---

# Phase 1 Plan 2: BullMQ Worker Scaffold Summary

**One-liner:** BullMQ worker scaffold on Railway with IORedis fixed config (`maxRetriesPerRequest: null`), 4 queue definitions, SIGTERM graceful shutdown, and node:22-slim Dockerfile.

## What Was Built

A self-contained `worker/` directory deployable as a separate Railway service. The worker connects to Upstash Redis via IORedis, listens on the `video-analysis` queue, logs incoming jobs, and shuts down cleanly when Railway sends SIGTERM.

This proves the hardest infrastructure separation before Phase 2 adds real AI logic: a persistent Node.js process on Railway talking to the same Redis instance as the Vercel app.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Redis connection and queue definitions | e177854 | worker/lib/redis.ts, worker/queues/definitions.ts, worker/package.json, worker/tsconfig.json |
| 2 | Worker entry point with graceful shutdown and Dockerfile | a377254 | worker/index.ts, worker/Dockerfile |

## Key Technical Decisions

1. **`maxRetriesPerRequest: null`** — Critical BullMQ requirement. Without this, the IORedis default causes workers to throw `ReplyError` on any Redis reconnect (deploy, network blip, Upstash restart). This surfaces as stalled jobs.

2. **20-minute `lockDuration`** — Video generation (Kling/Seedance) can take 10-15 minutes. Lock must exceed maximum job duration or BullMQ recycles in-progress jobs to other workers, causing duplicate generation runs.

3. **Dedicated Redis instance** — `UPSTASH_REDIS_URL` is separate from any application caching Redis (INFRA-06). BullMQ polls constantly; sharing with app cache on PAYG would inflate costs 10-100x.

4. **`enableReadyCheck: false`** — Paired with `maxRetriesPerRequest: null` for Upstash compatibility. Upstash's serverless Redis may not respond to READY check on cold start.

5. **`tls: { rejectUnauthorized: false }`** — Required for Upstash TLS connections from Railway.

## Artifacts

| Path | Role | Key Export/Feature |
|------|------|-------------------|
| `worker/index.ts` | Railway entry point | Worker + SIGTERM/SIGINT handlers |
| `worker/lib/redis.ts` | Shared IORedis connection | `connection` with BullMQ-safe config |
| `worker/queues/definitions.ts` | Queue registry | `videoAnalysisQueue`, `frameGenerationQueue`, `videoSynthesisQueue`, `postProcessingQueue`, `ALL_QUEUES` |
| `worker/package.json` | Standalone Node.js package | ESM, bullmq + ioredis deps |
| `worker/tsconfig.json` | TypeScript config | ES2022 target, bundler resolution |
| `worker/Dockerfile` | Railway deployment | node:22-slim, npx tsx runner |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

- `worker/index.ts` job handler returns `{ status: 'processed', jobId: job.id }` without real processing. This is intentional — Phase 1 goal is connectivity, not AI logic. Phase 2 plans replace this handler with Gemini analysis → Flux generation → Kling synthesis → FFmpeg pipeline.

## Requirements Addressed

| ID | Description | Status |
|----|-------------|--------|
| INFRA-01 | BullMQ worker runs as persistent Node.js process on Railway | Done |
| INFRA-02 | Upstash Redis Fixed plan (user must configure dashboard) | Scaffold ready |
| INFRA-05 | Worker implements graceful shutdown (SIGTERM → worker.close()) | Done |
| INFRA-06 | Separate BullMQ Redis from application caching Redis | Done |

## User Setup Required

Before deploying to Railway:

1. **Upstash Console:** Create Fixed plan Redis database (not PAYG). Set `maxmemory-policy` to `noeviction`.
2. **Railway service:** Point service root to `worker/` directory. Set env vars:
   - `UPSTASH_REDIS_URL` — from Upstash Console (use ioredis-compatible URL, not REST endpoint)
   - `SUPABASE_SERVICE_ROLE_KEY` — from Supabase Dashboard → Project Settings → API

## Self-Check: PASSED

Files verified:
- worker/index.ts — FOUND
- worker/lib/redis.ts — FOUND
- worker/queues/definitions.ts — FOUND
- worker/package.json — FOUND
- worker/tsconfig.json — FOUND
- worker/Dockerfile — FOUND

Commits verified:
- e177854 — FOUND (feat(01-02): create Redis connection and queue definitions)
- a377254 — FOUND (feat(01-02): create worker entry point with graceful shutdown and Dockerfile)
