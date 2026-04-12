---
phase: 02-ai-pipeline
plan: 04
subsystem: api
tags: [fal-ai, flux-pro, kling, bullmq, webhooks, polling, image-generation, video-synthesis]

# Dependency graph
requires:
  - phase: 02-ai-pipeline
    provides: worker/lib/step-helpers.ts, worker/lib/supabase.ts, worker/lib/cost-logger.ts, worker/queues/definitions.ts
provides:
  - Flux Pro keyframe generation worker with exponential backoff polling
  - Kling 3.0 video synthesis worker with webhook-based submission
  - worker/index.ts wired to real implementations (not placeholders)
affects: [02-ai-pipeline-05, post-processing, kling-webhook-handler]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Flux Pro polling: fal.queue.submit + status loop with 5s/10s/20s/40s/60s backoff"
    - "Kling webhook: fal.queue.submit with webhookUrl, worker returns immediately after submission"
    - "Idempotency guard: check job_steps.metadata.fal_request_ids before re-submitting"
    - "Deterministic seed: hashToSeed(jobId+sceneKey) for QC-02 reproducibility"
    - "Duration cap: Math.min(scene.duration_seconds, 10) then '5'/'10' string for Kling API"

key-files:
  created:
    - worker/workers/frame-generation.worker.ts
    - worker/workers/video-synthesis.worker.ts
  modified:
    - worker/index.ts

key-decisions:
  - "Flux Pro image_size uses 'portrait_16_9' enum (not '9:16' aspect ratio format) — API pitfall"
  - "Kling aspect_ratio uses '9:16' string (opposite convention from Flux image_size)"
  - "Video synthesis status set to 'waiting_external' (not 'complete') until webhook confirms all clips done"
  - "Body scenes (index 1+) and hook variant frames (index 0 replacements) submitted as separate clip batches"

patterns-established:
  - "frame-generation.worker.ts: one generateKeyframe() call per scene, sequential for progress tracking"
  - "video-synthesis.worker.ts: collect all request_ids then bulk-update metadata, return immediately"

requirements-completed: [AI-02, AI-03, AI-09]

# Metrics
duration: 15min
completed: 2026-04-12
---

# Phase 02 Plan 04: Frame Generation + Video Synthesis Workers Summary

**Flux Pro keyframe generation with 5-step exponential backoff polling and Kling 3.0 video synthesis with webhook submission — both workers wired into BullMQ pipeline**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-12T00:00:00Z
- **Completed:** 2026-04-12T00:15:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Frame generation worker submits to fal-ai/flux-pro/v1.1 with correct portrait_16_9 image_size enum, polls with 5s/10s/20s/40s/60s backoff, generates both body scene frames and hook variant frames
- Video synthesis worker submits all clips to fal-ai/kling-video/v3/standard/image-to-video with webhookUrl, sets status to waiting_external with stored request IDs for webhook matching, returns immediately
- worker/index.ts updated to import real handlers from both worker files (placeholders removed for these two stages)

## Task Commits

1. **Task 1: Flux Pro frame generation worker** - `4d94433` (feat)
2. **Task 2: Kling 3.0 video synthesis worker** - `7f491c5` (feat)

## Files Created/Modified

- `worker/workers/frame-generation.worker.ts` - Flux Pro keyframe generation with exponential backoff, deterministic seeds, progress broadcasting, enqueues videoSynthesisQueue on completion
- `worker/workers/video-synthesis.worker.ts` - Kling 3.0 clip submission via webhook, idempotency guard, body + hook variant batches, waiting_external status
- `worker/index.ts` - Imports runFrameGeneration and runVideoSynthesis from real worker files

## Decisions Made

- Flux Pro uses `image_size: 'portrait_16_9'` (enum) not `'9:16'` (ratio format) — these are different input types for the fal.ai API
- Kling uses `aspect_ratio: '9:16'` (ratio string) not an enum — opposite convention
- Clip duration string values are `'5'` or `'10'` per Kling API requirement; source `duration_seconds` is capped at 10 then rounded down to nearest supported value
- `waiting_external` status (not `complete`) signals that webhook handler owns the transition to post-processing

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required beyond what Phase 02 earlier plans established (FAL_KEY, NEXT_PUBLIC_APP_URL env vars).

## Next Phase Readiness

- Frame generation and video synthesis workers are production-ready
- Kling webhook handler (src/app/api/webhooks/kling/route.ts from plan 02-02) already exists and will receive callbacks
- Post-processing worker (plan 02-05) can now access completed clip URLs via job_steps metadata
- No blockers

---
*Phase: 02-ai-pipeline*
*Completed: 2026-04-12*
