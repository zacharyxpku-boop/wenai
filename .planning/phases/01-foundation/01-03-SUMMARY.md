---
phase: 01-foundation
plan: "03"
subsystem: auth-and-storage
tags: [auth, middleware, oauth, presigned-upload, fal-proxy, supabase]
dependency_graph:
  requires: [01-01, 01-02]
  provides: [auth-middleware, login-page, oauth-callback, upload-token-api, download-url-api, fal-proxy]
  affects: [all-protected-routes, file-upload-flow, video-generation-flow]
tech_stack:
  added: ["@supabase/ssr cookie-based middleware auth", "@fal-ai/server-proxy/nextjs route handler"]
  patterns: ["getUser() not getSession() — validates server-side", "Route groups (auth)/(client)/(admin)", "Presigned URL — browser-to-storage bypass", "Server proxy — API key never client-side"]
key_files:
  created:
    - src/middleware.ts
    - src/app/(auth)/login/page.tsx
    - src/app/(auth)/auth/callback/route.ts
    - src/app/(client)/dashboard/page.tsx
    - src/app/(admin)/admin/page.tsx
    - src/app/api/upload-token/route.ts
    - src/app/api/download/[path]/route.ts
    - src/app/api/fal/proxy/route.ts
  modified: []
decisions:
  - "Use getUser() not getSession() in middleware — server validates token, prevents cookie forgery"
  - "Route groups (auth)/(client)/(admin) — logical grouping without URL impact"
  - "Admin gated by app_metadata.role (set server-side only, not user-writable)"
  - "Upload token returns path + signedUrl, browser does TUS upload directly to Supabase"
  - "fal.ai proxy via createRouteHandler — zero-config, reads FAL_KEY from process.env automatically"
metrics:
  duration: "6 minutes"
  completed_date: "2026-04-12"
  tasks_completed: 2
  files_created: 8
  files_modified: 0
---

# Phase 01 Plan 03: Auth, Route Protection, Storage, and fal.ai Proxy Summary

Cookie-based auth middleware with getUser() server validation, magic link + Google OAuth login, presigned direct-to-Supabase upload, and fal.ai key proxy — all protected routes secure before Phase 2 builds on them.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Auth middleware, login page, OAuth callback | 62604f3 | 5 files |
| 2 | Presigned upload token, download URL, fal.ai proxy | 8b7940a | 3 files |

## What Was Built

**Task 1 — Auth Flow (AUTH-01, AUTH-02, AUTH-04, AUTH-05)**

- `src/middleware.ts` — Intercepts `/dashboard/*` and `/admin/*` requests. Uses `createServerClient` with cookie passthrough pattern from `@supabase/ssr`. Calls `getUser()` (not `getSession()`) for server-validated auth. Unauthenticated users redirect to `/login`. Authenticated non-admins hitting `/admin` redirect to `/dashboard` — role read from `user.app_metadata.role`.
- `src/app/(auth)/login/page.tsx` — Client Component. Magic link via `signInWithOtp` with `emailRedirectTo`. Google OAuth via `signInWithOAuth` with `redirectTo`. Both point to `/auth/callback`.
- `src/app/(auth)/auth/callback/route.ts` — Server Route Handler. Extracts `code` from query params, calls `exchangeCodeForSession`, redirects to `/dashboard` (or `?next=` param) on success, `/login?error=auth_failed` on failure.
- `src/app/(client)/dashboard/page.tsx` — Placeholder Server Component. Double-checks auth server-side as defense-in-depth.
- `src/app/(admin)/admin/page.tsx` — Placeholder Server Component. Double-checks both auth and role server-side.

**Task 2 — Storage and fal.ai (STOR-01, STOR-02, STOR-03, INFRA-07)**

- `src/app/api/upload-token/route.ts` — POST endpoint. Auth via `getUser()`. Zod validation: `fileName` (1-255 chars), `contentType`, `bucket` enum (`assets`/`references`). Generates `uploads/{userId}/{timestamp}-{fileName}` path. Calls `createSignedUploadUrl` — returns `signedUrl`, `token`, `path` for browser TUS upload. File bytes never pass through Next.js.
- `src/app/api/download/[path]/route.ts` — GET endpoint. Auth via `getUser()`. Decodes path param, calls `createSignedUrl` on `deliveries` bucket with 3600s expiry. Returns `{ url }`.
- `src/app/api/fal/proxy/route.ts` — Single-line proxy via `createRouteHandler()`. Exports `GET`, `POST`, `PUT`. `FAL_KEY` injected server-side by SDK — zero string literal.

## Requirements Fulfilled

- AUTH-01: Magic link + Google OAuth implemented
- AUTH-02: Unauthenticated /dashboard and /admin redirect to /login
- AUTH-04: Admin route gated by app_metadata.role
- AUTH-05: Session persistence via cookie-based auth (SSR cookie pattern)
- STOR-01: createSignedUploadUrl returns presigned upload token
- STOR-02: Browser uploads directly to Supabase — no file data through Next.js
- STOR-03: Download served via time-limited presigned URL (1h)
- STOR-04: Bucket policy config documented for user setup (dashboard config, not code)
- INFRA-07: FAL_KEY stays server-side via proxy route

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Merge Required

**Found during:** Pre-execution setup
**Issue:** Wave 1 plan 01-01 (Next.js project init) was committed on `worktree-agent-a36673ea` branch, not present in this worktree. This plan depends on those files (package.json, src/lib/supabase/, etc.).
**Fix:** Merged `worktree-agent-a36673ea` into `worktree-agent-abb311b9`. Resolved 3 conflicts: `.gitignore` (kept), `STATE.md` (combined both agents' updates), `REQUIREMENTS.md` (merged both sets of checkmarks).
**Commit:** 621f222

## Known Stubs

- `src/app/(client)/dashboard/page.tsx` — Placeholder showing only user email. Will be replaced in Phase 2 with full product library + order UI.
- `src/app/(admin)/admin/page.tsx` — Placeholder showing "Operations dashboard". Will be replaced in Phase 2 with queue monitor + client management UI.

Both stubs are intentional: this plan's goal is auth/storage plumbing, not dashboard UI. Phase 2 plans will wire data to these routes.

## User Setup Required

The following must be configured manually in dashboards (cannot be done in code):

1. **Google OAuth** — Create OAuth 2.0 Client ID in Google Cloud Console. Add authorized redirect URI: `{SUPABASE_URL}/auth/v1/callback`. Paste Client ID and Secret into Supabase Dashboard -> Authentication -> Providers -> Google.

2. **Supabase Storage buckets** — Create 3 buckets in Supabase Dashboard -> Storage:
   - `assets` — 500MB max file size (product videos/images)
   - `deliveries` — 500MB max file size (generated MP4s)
   - `references` — 100MB max file size (reference TikTok uploads)

3. **Environment variables** — Set in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
   - `FAL_KEY` — from fal.ai dashboard (server-only, no NEXT_PUBLIC_ prefix)

## Self-Check: PASSED

Files exist:
- FOUND: src/middleware.ts
- FOUND: src/app/(auth)/login/page.tsx
- FOUND: src/app/(auth)/auth/callback/route.ts
- FOUND: src/app/(client)/dashboard/page.tsx
- FOUND: src/app/(admin)/admin/page.tsx
- FOUND: src/app/api/upload-token/route.ts
- FOUND: src/app/api/download/[path]/route.ts
- FOUND: src/app/api/fal/proxy/route.ts

Commits verified:
- FOUND: 62604f3 (Task 1)
- FOUND: 8b7940a (Task 2)

TypeScript: tsc --noEmit exits 0, no type errors.
