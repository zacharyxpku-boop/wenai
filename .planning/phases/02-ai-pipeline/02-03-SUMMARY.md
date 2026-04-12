---
phase: 02-ai-pipeline
plan: 03
subsystem: worker/analysis
tags: [gemini, video-analysis, hook-variants, bullmq, caching]
dependency_graph:
  requires: [02-01, 02-02]
  provides: [storyboard-json, hook-variants, frame-generation-enqueue]
  affects: [worker/workers/analysis.worker.ts, worker/index.ts]
tech_stack:
  added: ["@google/genai v1.49.0 (Files API + generateContent)"]
  patterns: ["Gemini Files API upload+poll pattern", "responseSchema structured output", "BullMQ step-enqueue chain"]
key_files:
  created: ["worker/workers/analysis.worker.ts"]
  modified: ["worker/index.ts"]
decisions:
  - "Parse Gemini response with StoryboardSchema.parse(JSON.parse(result.text!)) — not result.json() — for explicit Zod validation"
  - "File size heuristic (>100MB) as pre-flight 90s duration guard before upload"
  - "variantCount clamped to 3-5 range regardless of job input"
metrics:
  duration_minutes: 8
  completed_date: "2026-04-12T17:55:52Z"
  tasks_completed: 1
  files_changed: 2
---

# Phase 02 Plan 03: Gemini Analysis Worker Summary

Gemini 2.5 Flash video analysis with structured storyboard extraction, analysis caching, hook variant generation, and token usage logging.

## What Was Built

`worker/workers/analysis.worker.ts` — the pipeline entry point. Receives a BullMQ job, downloads the reference video, uploads to Gemini Files API, polls until ACTIVE, extracts a structured storyboard via `responseSchema`, generates 3-5 hook variants with a separate Gemini call, logs token costs, and enqueues the next pipeline stage (frame-generation).

`worker/index.ts` — replaced placeholder `runAnalysis` function with the real import from `./workers/analysis.worker.js`.

## Behaviors Implemented

| Requirement | Implementation |
|---|---|
| AI-01 | `ai.models.generateContent` with `responseSchema: StoryboardSchema`, validated with `StoryboardSchema.parse()` |
| AI-07 | Cache check in `job_steps` table — same `source_video_url` in metadata skips Gemini entirely |
| AI-08 | `generateHookVariants()` call with `HookVariantsSchema` responseSchema, temperature 0.8, variant count 3-5 |
| AI-10 | `logCost()` called after both analysis and hook generation with `usageMetadata.promptTokenCount + candidatesTokenCount` |
| QC-02 | `logGenerationParams()` records model, temperature, file_uri, file_state, cache_hit flag |

## Deviations from Plan

**1. [Rule 2 - Security] Added file size guard before Gemini upload**

- **Found during:** Task 1 implementation
- **Issue:** Plan had a comment "check duration after Gemini upload" which creates unnecessary API spend on oversized videos
- **Fix:** Added `stat.size > 100MB` pre-flight check with descriptive error before uploading to Files API
- **Files modified:** worker/workers/analysis.worker.ts
- **Commit:** 78ba0eb

**2. [Rule 2 - Correctness] Clamped variantCount to 3-5 range**

- **Found during:** Task 1 implementation
- **Issue:** `hookVariantCount` comes from job data — if caller sends 0 or 10, `HookVariantsSchema` (min 1 max 5) would reject the output
- **Fix:** `Math.min(Math.max(hookVariantCount ?? 3, 3), 5)` before passing to `generateHookVariants`
- **Files modified:** worker/workers/analysis.worker.ts
- **Commit:** 78ba0eb

## Self-Check

**File exists:**
- worker/workers/analysis.worker.ts: FOUND (235 lines, >80 minimum)
- worker/index.ts: FOUND (updated)

**Commit exists:**
- 78ba0eb: feat(02-03): implement Gemini 2.5 Flash analysis worker — FOUND

## Self-Check: PASSED
