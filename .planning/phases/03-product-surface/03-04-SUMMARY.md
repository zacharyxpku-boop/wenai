---
phase: 03-product-surface
plan: 04
subsystem: admin-dashboard
tags: [admin, kanban, dnd-kit, bullmq, queue-health, client-management]

requires:
  - phase: 03-01
    provides: Supabase client, auth middleware, BullMQ queues
provides:
  - admin portal with job monitor, client CRUD, SOP Kanban, queue health
  - API routes for queue health monitoring, step retry, sop stage update
  - dnd-kit drag-and-drop Kanban board across 5 SOP columns
affects: [jobs table, orgs table, job_steps table, admin ops workflow]

tech-stack:
  added: ["@dnd-kit/core@6.3.1", "@dnd-kit/sortable@10.0.0", "@dnd-kit/utilities@3.2.2"]
  patterns: [server-component-data-fetch, optimistic-update, droppable-column-prefixed-ids, bullmq-getJobCounts, admin-role-gate-app_metadata]

key-files:
  created:
    - src/app/(admin)/admin/layout.tsx
    - src/app/(admin)/admin/page.tsx
    - src/app/(admin)/admin/clients/page.tsx
    - src/app/(admin)/admin/sop/page.tsx
    - src/app/(admin)/admin/queue-health/page.tsx
    - src/components/admin/JobTable.tsx
    - src/components/admin/ClientManager.tsx
    - src/components/admin/SopKanban.tsx
    - src/components/admin/QueueHealthTiles.tsx
    - src/app/api/admin/queue-health/route.ts
    - src/app/api/admin/retry-step/route.ts
    - src/app/api/admin/jobs/[jobId]/stage/route.ts
    - src/app/api/admin/orgs/route.ts
    - src/app/api/admin/orgs/[orgId]/credits/route.ts
  modified:
    - package.json

key-decisions:
  - "Used @dnd-kit/core not react-beautiful-dnd — rbd is unmaintained/deprecated since 2022"
  - "Kanban column droppable IDs prefixed col-{stage} to avoid collision with job UUID IDs"
  - "SortableContext receives primitive string[] of job IDs not objects (Pitfall 4 from research)"
  - "Optimistic update on drag end, state reverts on API failure"
  - "Admin role gated via app_metadata.role — server-side only, not user-writable"
  - "Admin orgs CRUD API added as Rule 2 deviation — ClientManager required POST/PATCH endpoints not in plan"

patterns-established:
  - "Pattern: Server Component fetches data, passes to Client Component — all 4 admin pages"
  - "Pattern: BullMQ queue health via getJobCounts('active','waiting','failed','completed') on each queue"
  - "Pattern: Step retry resets only the failed step_steps row, re-enqueues without touching pipeline state"

requirements-completed: [ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, ADMIN-06]

duration: 12min
completed: 2026-04-13
---

# Phase 3 Plan 4: Admin Ops Dashboard Summary

Admin portal with job cost tracking, client CRUD, dnd-kit SOP Kanban across 5 columns, and BullMQ queue health tiles with 15s auto-refresh — all ADMIN requirements fulfilled.

## Performance

- **Duration:** 12 min
- **Completed:** 2026-04-13
- **Tasks:** 3/3 (Task 3 was human-verify checkpoint, approved)
- **Files modified:** 15

## Accomplishments

### API Routes (3 core + 2 deviation)
- `GET /api/admin/queue-health` — BullMQ `getJobCounts` for all 4 queues (ADMIN-05)
- `POST /api/admin/retry-step` — resets specific job_step to pending, re-enqueues to correct BullMQ queue (ADMIN-03)
- `PATCH /api/admin/jobs/[jobId]/stage` — updates `sop_stage` enum, validates 5 stages (ADMIN-06)
- `GET /POST /api/admin/orgs` — list/create orgs (deviation Rule 2)
- `PATCH /api/admin/orgs/[orgId]/credits` — manual credit balance adjustment (deviation Rule 2)

### Components
- `JobTable.tsx` — sortable table: client name, product, status badge, current step, cost_usd (sum from job_steps), created_at. Retry button for failed jobs (ADMIN-02, ADMIN-04)
- `ClientManager.tsx` — org list with job counts, add client inline form, credit balance adjustment (ADMIN-01)
- `SopKanban.tsx` — dnd-kit DndContext with 5 droppable columns (client/brief/generation/qc/delivered). Optimistic moves, PATCH on drag end (ADMIN-06)
- `QueueHealthTiles.tsx` — 4 tiles with active (amber) / waiting (gray) / failed (red) / completed (emerald) counts, 15s React Query auto-refresh (ADMIN-05)

### Pages
- `/admin` — job monitor (all jobs, Server Component)
- `/admin/clients` — client management
- `/admin/sop` — SOP Kanban board
- `/admin/queue-health` — queue status tiles
- Admin sidebar layout with nav links + "Admin" role badge

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install dnd-kit + admin API routes + layout | bddbbfb | queue-health, retry-step, stage PATCH, admin layout |
| 2 | Admin dashboard pages and components | 04a7b6a | 4 pages, 4 components, 2 deviation orgs API routes |
| 3 | Verify admin dashboard UI (human-verify) | approved | Human confirmed functional + DESIGN.md compliant |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Admin orgs CRUD API endpoints**
- **Found during:** Task 2
- **Issue:** `ClientManager.tsx` needs to fetch orgs list and create new orgs, but no `/api/admin/orgs` route was in the plan
- **Fix:** Created `GET /POST /api/admin/orgs` and `PATCH /api/admin/orgs/[orgId]/credits` routes
- **Files modified:** `src/app/api/admin/orgs/route.ts`, `src/app/api/admin/orgs/[orgId]/credits/route.ts`
- **Commit:** 04a7b6a

## Known Stubs

None — all components are wired to real API data sources.

## Self-Check: PASSED

- Commits bddbbfb and 04a7b6a confirmed present in git history
- Task 3 checkpoint approved by user
- All 6 ADMIN requirements covered: ADMIN-01 through ADMIN-06
- dnd-kit installed (not react-beautiful-dnd)
- All admin routes enforce `app_metadata.role !== 'admin'` guard
