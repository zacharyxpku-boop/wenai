---
phase: 01-foundation
plan: "01"
subsystem: foundation
tags: [nextjs, supabase, rls, multi-tenant, dependencies]
dependency_graph:
  requires: []
  provides: [nextjs-project, supabase-migration, supabase-clients]
  affects: [01-02, 01-03]
tech_stack:
  added: [next@15.5.15, "@supabase/ssr@0.10.2", "@supabase/supabase-js@2.103.0", bullmq@5.73.4, "@upstash/redis@1.37.0", "@upstash/ratelimit", "@fal-ai/client@1.9.5", "@fal-ai/server-proxy", zod, ioredis, vitest]
  patterns: [app-router, cookie-based-ssr-auth, org-id-rls, atomic-credit-deduction]
key_files:
  created:
    - package.json
    - tsconfig.json
    - next.config.ts
    - src/app/layout.tsx
    - src/app/page.tsx
    - .env.local.example
    - supabase/migrations/001_foundation.sql
    - src/lib/supabase/server.ts
    - src/lib/supabase/client.ts
  modified:
    - .gitignore
decisions:
  - "tsconfig exclude claude/, .planning/, .claude/ to prevent cross-project type errors from worktree setup"
  - "next.config.ts kept minimal — no customizations needed at foundation stage"
  - "layout.tsx drops Google Fonts (Geist) to keep layout clean; Tailwind antialiased class retained"
metrics:
  duration: "10 minutes"
  completed: "2026-04-12"
  tasks_completed: 3
  files_created: 9
  files_modified: 1
---

# Phase 1 Plan 1: Project Initialization + DB Schema Summary

Next.js 15 project scaffold with full Phase 1 dependency set, Supabase multi-tenant schema (4 tables, RLS enabled on all, org_id tenant isolation), and typed @supabase/ssr client utilities.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Initialize Next.js 15 + install Phase 1 deps | 954ac78 | package.json, tsconfig.json, src/app/layout.tsx, src/app/page.tsx, .env.local.example |
| 2 | Supabase migration with full schema and RLS | 31cf16b | supabase/migrations/001_foundation.sql |
| 3 | Supabase server and browser client utilities | d87c00e | src/lib/supabase/server.ts, src/lib/supabase/client.ts |

## Verification

- `npx next build` exits 0 — build clean
- `supabase/migrations/001_foundation.sql` has 4 tables, 4 RLS enables (verified: `grep -c "ENABLE ROW LEVEL SECURITY"` returns 4), 4 tenant_isolation policies
- Both Supabase client files use `@supabase/ssr`, server uses `await cookies()`, no deprecated imports
- `.env.local.example` has FAL_KEY and SUPABASE_SERVICE_ROLE_KEY without NEXT_PUBLIC_ prefix

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] tsconfig cross-project type error**
- **Found during:** Task 1 verification (next build)
- **Issue:** tsconfig `include: ["**/*.ts"]` picked up `claude/wenai/src/app/api/ai/route.ts` — a separate project in the worktree — causing TypeScript errors for missing modules
- **Fix:** Added `"claude", ".planning", ".claude"` to tsconfig `exclude` array
- **Files modified:** tsconfig.json
- **Commit:** 954ac78

None beyond the above auto-fix.

## Known Stubs

None — this plan creates infrastructure, not UI/data rendering components.

## Self-Check: PASSED
