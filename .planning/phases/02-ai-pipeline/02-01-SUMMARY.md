---
phase: 02-ai-pipeline
plan: 01
subsystem: infra
tags: [bullmq, zod, supabase, ffmpeg, gemini, typescript, worker]

requires:
  - phase: 01-foundation
    provides: BullMQ worker scaffold, Redis connection, queue definitions

provides:
  - Phase 2 shared schemas (StoryboardSchema, HookVariantsSchema) for Gemini structured output
  - Worker Supabase service-role client
  - FFmpeg path configuration
  - SRT subtitle generator
  - Cost logger writing to job_steps.metadata
  - Step helpers (updateStepStatus, broadcastProgress, logGenerationParams)
  - 4 BullMQ workers registered with correct concurrency and lockDuration
  - Graceful SIGTERM/SIGINT shutdown
affects: [02-02, 02-03, 02-04, 02-05]

tech-stack:
  added: ["@google/genai@1.49.0", "fluent-ffmpeg@2.1.3", "ffmpeg-static@5.3.0", "libsodium-wrappers", "@supabase/supabase-js@2", "zod"]
  patterns: ["Zod schema-first typed output", "Service-role Supabase client for workers", "BullMQ lockDuration matches stage duration", "Graceful worker shutdown via Promise.all"]

key-files:
  created:
    - worker/schemas/storyboard.ts
    - worker/schemas/hook-variants.ts
    - worker/lib/supabase.ts
    - worker/lib/ffmpeg.ts
    - worker/lib/generate-srt.ts
    - worker/lib/cost-logger.ts
    - worker/lib/step-helpers.ts
    - worker/stalled-poller.ts
  modified:
    - worker/package.json
    - worker/index.ts

key-decisions:
  - "zod added to worker — schemas import z, not included in original plan deps list"
  - "cost-logger uses RPC-first pattern with direct update fallback for append_step_cost"
  - "stalled-poller.ts created as placeholder (full implementation in Plan 05)"

patterns-established:
  - "All worker shared utilities live in worker/lib/, imported with .js extension for ESM"
  - "All Zod schemas live in worker/schemas/, exported as both schema and inferred type"
  - "Step helpers use updateStepStatus + broadcastProgress pair for consistent progress reporting"

requirements-completed: [QUEUE-01, QUEUE-06, QC-02, QC-05]

duration: 15min
completed: 2026-04-12
---

# Phase 2 Plan 01: Worker Infrastructure Summary

**BullMQ pipeline scaffold extended: Zod schemas, service-role Supabase client, FFmpeg config, SRT generator, cost logger, step helpers, and all 4 workers registered with correct concurrency/lock settings**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-12T16:45:00Z
- **Completed:** 2026-04-12T17:00:09Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Installed all Phase 2 npm deps (@google/genai, fluent-ffmpeg, ffmpeg-static, libsodium-wrappers, @supabase/supabase-js, zod)
- Created Zod schemas for Gemini structured output (StoryboardSchema, HookVariantsSchema)
- Created all worker shared utilities: Supabase client, FFmpeg config, SRT generator, cost logger, step helpers
- Replaced Phase 1 single-worker scaffold with 4-worker BullMQ registration (video-analysis, frame-generation, video-synthesis, post-processing)

## Task Commits

1. **Task 1: Install Phase 2 deps and create shared schemas + utilities** - `05bac97` (feat)
2. **Task 2: Rewrite worker index.ts to register all 4 pipeline workers** - `cf88064` (feat)

## Files Created/Modified

- `worker/schemas/storyboard.ts` - StoryboardSchema + StoryboardScene Zod types for Gemini output
- `worker/schemas/hook-variants.ts` - HookVariantsSchema Zod type
- `worker/lib/supabase.ts` - Service-role Supabase client using SUPABASE_SERVICE_ROLE_KEY
- `worker/lib/ffmpeg.ts` - FFmpeg path set via ffmpeg-static
- `worker/lib/generate-srt.ts` - SRT generator from StoryboardScene array
- `worker/lib/cost-logger.ts` - Logs cost entries to job_steps.metadata with RPC + fallback
- `worker/lib/step-helpers.ts` - updateStepStatus, ensureStepExists, broadcastProgress, logGenerationParams
- `worker/stalled-poller.ts` - Placeholder for Plan 05
- `worker/package.json` - Phase 2 dependencies added
- `worker/index.ts` - 4 workers registered with concurrency/lockDuration/SIGTERM shutdown

## Decisions Made

- Added `zod` to worker dependencies — not in plan's install command but required by schema files
- `cost-logger` uses RPC-first with direct fallback — append_step_cost Postgres function may not exist yet, fallback ensures logging always works
- `stalled-poller.ts` is a console.log placeholder — full implementation deferred to Plan 05 per plan spec

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added zod to npm install command**
- **Found during:** Task 1 (schema creation)
- **Issue:** Plan's npm install command omitted zod but schema files import from 'zod'
- **Fix:** Added `npm install zod` after Phase 2 deps install
- **Files modified:** worker/package.json
- **Verification:** `npm ls zod` shows installed
- **Committed in:** 05bac97 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required for schema files to compile. No scope creep.

## Issues Encountered

None beyond the missing zod dependency.

## User Setup Required

**Gemini API key required before worker runs.** Per plan frontmatter `user_setup`:
- Add `GEMINI_API_KEY` to Railway worker environment variables
- Source: Google AI Studio -> Get API Key -> Create key

## Next Phase Readiness

- All shared infrastructure is in place for Plans 02-05
- Plans 03-05 can import from worker/schemas/ and worker/lib/ immediately
- Placeholder handlers in worker/index.ts will be replaced by Plans 03-05
- stalled-poller.ts placeholder ready for Plan 05 implementation

---
*Phase: 02-ai-pipeline*
*Completed: 2026-04-12*
