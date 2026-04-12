---
phase: 02-ai-pipeline
plan: 05
subsystem: api
tags: [ffmpeg, fluent-ffmpeg, ffprobe, bullmq, supabase-storage, fal-ai, kling, srt, qc]

requires:
  - phase: 02-ai-pipeline plan 01
    provides: ffmpeg.ts path config, generate-srt.ts, step-helpers.ts, supabase.ts, cost-logger.ts, stalled-poller.ts placeholder
  - phase: 02-ai-pipeline plan 03
    provides: analysis step output with storyboard + hookVariants stored in job_steps.output
  - phase: 02-ai-pipeline plan 04
    provides: video_synthesis step storing fal_request_ids in job_steps.metadata

provides:
  - FFmpeg post-processing worker: concat demuxer, subtitle burn, 9:16 scale, libx264 encode
  - Output QC validation gate with ffprobe (file size, resolution, duration)
  - Auto-retry loop up to 2x on QC failure
  - Supabase Storage upload at deliveries/{orgId}/{jobId}/variant-{v}.mp4
  - Job status update to 'delivered' with delivery_url
  - Stalled job poller: detects waiting_external steps >15min, recovers missed Kling webhooks
  - Phase 2 Postgres migration: UNIQUE constraint, cost RPC, partial index, service-role policies

affects: [03-ui-dashboard, quality-review, client-gallery, billing-reports]

tech-stack:
  added: []
  patterns:
    - FFmpeg concat demuxer pattern (-f concat -safe 0) for multi-clip stitching
    - SRT colon escape pattern for Windows paths in FFmpeg subtitle filter
    - QC retry loop: run FFmpeg -> ffprobe validate -> retry up to MAX_RETRIES
    - Stalled poller: setInterval + fal.queue.status direct check for webhook recovery
    - Partial index on waiting_external for efficient stalled-job queries

key-files:
  created:
    - worker/workers/post-processing.worker.ts
    - worker/lib/validate-output.ts
    - supabase/migrations/002_phase2_additions.sql
  modified:
    - worker/stalled-poller.ts
    - worker/index.ts

key-decisions:
  - "SRT colon escaping uses double-backslash before colon (\\\\:) for FFmpeg filter_complex on Windows"
  - "One MP4 variant per hook (hook-v clip + shared body clips), uploaded as variant-{v}.mp4"
  - "Post-processing concurrency: 1 (FFmpeg memory constraint from research)"

patterns-established:
  - "QC pattern: FFmpeg -> validateOutput -> retry loop (max 2 retries) before throwing"
  - "Stalled poller pattern: setInterval every 5min, SIGTERM/SIGINT clearInterval for graceful shutdown"
  - "Storage path: deliveries/{orgId}/{jobId}/variant-{v}.mp4 for per-org isolation"

requirements-completed: [AI-04, AI-06, QC-01]

duration: 18min
completed: 2026-04-12
---

# Phase 02 Plan 05: Post-Processing Worker Summary

**FFmpeg concat + subtitle burn producing 9:16 1080x1920 MP4 variants with ffprobe QC gate, 2-retry auto-recovery, Supabase Storage upload, and 15-minute stalled webhook poller closing all pipeline reliability gaps**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-04-12T17:57:10Z
- **Completed:** 2026-04-12T18:15:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Post-processing worker runs full FFmpeg pipeline: concat demuxer -> scale 1080x1920 -> subtitle burn -> libx264/aac encode -> upload
- QC gate using ffprobe validates file size, resolution (must be 1080x1920), and duration (>= 1s) with 2-retry loop on failure
- Stalled job poller detects stuck `waiting_external` steps, polls fal.ai status directly, and recovers missed webhooks by enqueueing post-processing
- Phase 2 migration adds UNIQUE constraint on (job_id, step), cost-append RPC, partial index on waiting_external, service-role bypass policies

## Task Commits

1. **Task 1: FFmpeg post-processing worker + QC validation gate** - `c0e88c8` (feat)
2. **Task 2: Stalled job poller + Phase 2 migration** - `491a50f` (feat)

## Files Created/Modified

- `worker/workers/post-processing.worker.ts` - Full FFmpeg concat + subtitle burn + QC retry + Supabase Storage upload
- `worker/lib/validate-output.ts` - ffprobe QC gate: file size, 1080x1920 resolution, duration >= 1s
- `worker/stalled-poller.ts` - 15min stalled detection, fal.queue.status direct check, webhook recovery
- `supabase/migrations/002_phase2_additions.sql` - UNIQUE constraint, append_step_cost RPC, partial index, service-role policies
- `worker/index.ts` - Import runPostProcessing from worker file (replaced inline placeholder)

## Decisions Made

- SRT colon escaping: `\\\\:` required in FFmpeg subtitle filter string on Windows paths — documented as pattern
- One output variant per hook variant (hook-v + shared body clips) — keeps variant count = hookVariants.length
- Post-processing concurrency capped at 1 per research finding (FFmpeg memory constraint)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all files had sufficient prior context from plans 01-04.

## User Setup Required

None - no external service configuration required beyond what plans 01-04 established.

## Next Phase Readiness

- AI pipeline end-to-end complete: analysis -> frame generation -> video synthesis -> post-processing -> delivery
- Phase 03 (UI dashboard) can now wire job status polling and display delivery_url for download
- Supabase Storage `deliveries` bucket needs to be created with appropriate access policies before production use

---
*Phase: 02-ai-pipeline*
*Completed: 2026-04-12*
