# Phase 1: Foundation - Research

**Researched:** 2026-04-12
**Domain:** Next.js 15 + Supabase Auth/RLS/Storage + BullMQ/Upstash Redis + Railway worker deployment
**Confidence:** HIGH (stack decisions locked; patterns verified via official docs and STACK/ARCHITECTURE research)

---

## Summary

Phase 1 establishes the three pillars everything else depends on: auth+RLS, file storage, and the Railway worker process. None of the AI pipeline work in Phase 2 can proceed without these foundations being correct — specifically, multi-tenant RLS and the worker process separation must be done right from day one because retrofitting either is a painful migration.

The stack is fully locked: Next.js 15 App Router on Vercel, Supabase (auth + Postgres + Storage), BullMQ on Upstash Redis Fixed plan, and Railway for the persistent worker process. Research confirms this is the right combination and identifies specific implementation gotchas (cookie-based SSR auth, `org_id` RLS pattern, TUS upload token flow, `maxRetriesPerRequest: null` on BullMQ connections).

The single most critical architectural decision — already locked — is running the BullMQ worker as a separate Railway process, not on Vercel. This cannot change.

**Primary recommendation:** Wire the full skeleton end-to-end (auth → DB → storage → worker skeleton) before adding any AI logic. A working hello-world job through BullMQ to Railway proves the hardest infrastructure before any AI spend occurs.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | BullMQ worker runs as persistent Node.js process on Railway, not Vercel | Worker deployment pattern, Railway confirmed as standard approach |
| INFRA-02 | Upstash Redis uses Fixed plan with `maxmemory-policy noeviction` | Pitfall 4 — BullMQ requires noeviction; Fixed plan avoids PAYG 10-100x billing |
| INFRA-03 | All AI API keys server-side only — never shipped to browser | fal.ai proxy route pattern + Pitfall 13 |
| INFRA-04 | Supabase RLS enabled on all tables at creation; default-deny | ARCHITECTURE.md RLS patterns, Pitfall 15 |
| INFRA-05 | Worker implements graceful shutdown (SIGTERM → `worker.close()`) | Pitfall 8 — stalled jobs on deploy |
| INFRA-06 | Separate BullMQ Redis instance from application caching Redis | Pitfall 4 — dedicated Redis for BullMQ |
| INFRA-07 | fal.ai proxy route (`/api/fal/proxy`) keeps FAL_KEY server-side | fal.ai proxy pattern documented in STACK.md |
| AUTH-01 | Magic link + Google OAuth via Supabase Auth | `@supabase/ssr` createServerClient/createBrowserClient pattern |
| AUTH-02 | Middleware protects `/dashboard/**` — unauthenticated → login redirect | Next.js middleware + Supabase session cookie check |
| AUTH-03 | Every DB table has `org_id`; RLS scoped to `auth.jwt() -> 'app_metadata' ->> 'org_id'` | ARCHITECTURE.md SQL patterns verbatim |
| AUTH-04 | Admin role distinct from client role; admin routes gated separately | Route groups `(admin)` vs `(client)` with separate middleware checks |
| AUTH-05 | Session persists across refreshes via Supabase SSR cookie | `@supabase/ssr` package handles this; requires correct middleware setup |
| STOR-01 | TUS resumable upload via presigned token from `/api/upload-token` | Supabase Storage TUS pattern + Pattern 4 from ARCHITECTURE.md |
| STOR-02 | Video files never route through Next.js API layer | Presigned upload pattern — browser → Supabase direct |
| STOR-03 | Generated videos served via presigned download URLs, not direct links | Supabase Storage signed URL API |
| STOR-04 | Storage bucket policy enforces per-file size limit; Supabase Pro provisioned from day 1 | Pitfall 5 — bandwidth and file size exhaustion |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.3.x (pin 15, not 16) | App Router framework | 15 is battle-tested; 16 enforces async Request APIs but is newer. Safer to pin 15.x. |
| TypeScript | 6.0.x | Type safety | Non-negotiable for typed AI API response shapes |
| `@supabase/supabase-js` | 2.103.0 | Supabase client (DB, Storage, Auth) | Official SDK; this exact version verified on npm |
| `@supabase/ssr` | 0.10.2 | Cookie-based auth for App Router | Replaces deprecated `@supabase/auth-helpers-nextjs`; required for SSR sessions |
| `bullmq` | 5.73.4 | Job queue | Redis-backed, DAG job flows, retry semantics, graceful shutdown |
| `@upstash/redis` | 1.37.0 | Redis client for Upstash | Serverless-native HTTP Redis client |
| `@fal-ai/client` | 1.9.5 | fal.ai SDK | Proxy route keeps FAL_KEY server-side |
| `@fal-ai/server-proxy` | latest | fal.ai proxy route for Next.js | `createRouteHandler()` — one import, handles all fal requests |
| `zod` | 3.x | Schema validation | All API inputs, form data, AI response parsing |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@upstash/ratelimit` | latest | Sliding-window rate limiting | Protect upload-token and job submission endpoints |
| `@tanstack/react-query` | 5.x | Client-side async state | Upload progress, job status polling in later phases |
| Tailwind CSS | 4.x | Styling | No config file, CSS-native variables; matches DESIGN.md |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@supabase/ssr` | `@supabase/auth-helpers-nextjs` | auth-helpers is deprecated; ssr is the current package |
| Railway | Fly.io / Render | Railway has simplest Railway-native deploys; Fly adds more ops overhead |
| Upstash Fixed plan | Upstash PAYG | PAYG 10-100x cost inflation from BullMQ's constant Redis polling |

**Installation (Phase 1 scope only):**

```bash
npm install next@15 react react-dom typescript
npm install @supabase/supabase-js @supabase/ssr
npm install bullmq
npm install @upstash/redis @upstash/ratelimit
npm install @fal-ai/client @fal-ai/server-proxy
npm install zod
npm install -D tailwindcss @types/node @types/react
```

**Version verification (confirmed 2026-04-12):**
- `@supabase/supabase-js`: 2.103.0
- `@supabase/ssr`: 0.10.2
- `bullmq`: 5.73.4
- `@upstash/redis`: 1.37.0
- `next`: 16.2.3 is npm latest; pin to 15.3.x for stability

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── (auth)/                 # login, signup pages (unprotected)
│   ├── (client)/               # client-facing routes (RLS-filtered)
│   ├── (admin)/                # admin routes (elevated access)
│   └── api/
│       ├── upload-token/       # returns Supabase presigned upload URL
│       └── fal/
│           └── proxy/          # fal.ai key proxy (INFRA-07)
├── lib/
│   ├── supabase/
│   │   ├── server.ts           # createServerClient (RSC, Route Handlers)
│   │   └── client.ts           # createBrowserClient (Client Components)
│   └── utils/
├── middleware.ts                # auth guard for /dashboard/**
└── worker/                     # separate Railway deployment entry
    ├── index.ts                # BullMQ worker process entrypoint
    └── queues/
        └── definitions.ts      # Queue + Worker definitions (Phase 2 uses these)
```

### Pattern 1: Supabase SSR Auth in App Router

**What:** Use `@supabase/ssr` for cookie-based session management. Two clients — server and browser.

**When to use:** All auth checks in Server Components, Route Handlers, and middleware.

```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch { /* middleware handles refresh */ }
        },
      },
    }
  )
}
```

### Pattern 2: Middleware Auth Guard (AUTH-02, AUTH-05)

**What:** Next.js middleware intercepts requests to `/dashboard/**`, checks Supabase session cookie, redirects unauthenticated users.

**Critical:** Middleware must call `supabase.auth.getUser()` (not `getSession()`) — getSession reads from cookie without server validation; getUser validates with Supabase server.

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
```

### Pattern 3: org_id RLS (AUTH-03, INFRA-04)

**What:** Every table gets `org_id UUID NOT NULL`. RLS policy reads `org_id` from JWT app_metadata — set at user creation time by admin, not self-served.

```sql
-- Source: ARCHITECTURE.md verified pattern
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Default deny (no policy = no access)
CREATE POLICY "tenant_isolation" ON jobs
  FOR ALL
  USING (
    org_id = (auth.jwt() -> 'app_metadata' ->> 'org_id')::UUID
  );

-- Admin bypass: use service role key in worker, not anon key
-- Service role key bypasses RLS entirely — never expose to browser
```

**Setting org_id in JWT app_metadata:** Use Supabase Admin API (`supabase.auth.admin.updateUserById`) when admin creates a client account. The JWT then carries `app_metadata.org_id` automatically.

### Pattern 4: Presigned Upload Token (STOR-01, STOR-02)

**What:** Browser requests a short-lived presigned URL from `/api/upload-token`. Uploads directly to Supabase Storage using TUS protocol. File never touches Vercel.

```typescript
// app/api/upload-token/route.ts
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { fileName, contentType } = await req.json()
  const storagePath = `uploads/${user.id}/${Date.now()}-${fileName}`

  // createSignedUploadUrl returns a token for TUS resumable upload
  const { data, error } = await supabase.storage
    .from('assets')
    .createSignedUploadUrl(storagePath)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ signedUrl: data.signedUrl, token: data.token, path: storagePath })
}
```

Client-side: use `supabase.storage.from('assets').uploadToSignedUrl(path, token, file)` — this uses TUS for files >6MB automatically on Pro tier.

### Pattern 5: BullMQ Worker on Railway (INFRA-01, INFRA-05)

**What:** Separate Node.js process that connects to same Upstash Redis. Must implement graceful shutdown.

```typescript
// worker/index.ts — Phase 1 scaffold (no AI logic yet, proves connectivity)
import { Worker, Queue } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis(process.env.UPSTASH_REDIS_URL!, {
  maxRetriesPerRequest: null,   // CRITICAL: default causes Worker to throw on reconnect
  tls: { rejectUnauthorized: false },
})

const worker = new Worker('video-analysis', async (job) => {
  console.log('Job received:', job.id, job.data)
  // Phase 2 fills this in
}, { connection })

// INFRA-05: graceful shutdown
process.on('SIGTERM', async () => {
  await worker.close()
  process.exit(0)
})
```

**Railway config:** `Dockerfile` in `worker/` directory, or monorepo `railway.json` pointing to `worker/index.ts`. Set env vars: `UPSTASH_REDIS_URL`, `SUPABASE_SERVICE_ROLE_KEY`, all AI API keys.

### Pattern 6: fal.ai Proxy Route (INFRA-07)

```typescript
// app/api/fal/proxy/route.ts
import { createRouteHandler } from "@fal-ai/server-proxy/nextjs"
export const { GET, POST, PUT } = createRouteHandler()
```

Set `FAL_KEY` as server-only env var (no `NEXT_PUBLIC_` prefix). The proxy handles all fal.ai requests including streaming.

### Anti-Patterns to Avoid

- **`getSession()` in middleware:** Reads cookie without server validation. Use `getUser()` instead — extra network call but guarantees session freshness.
- **`@supabase/auth-helpers-nextjs`:** Deprecated. Migration path is `@supabase/ssr`.
- **RLS on `jobs` but not `job_steps`/`assets`:** Client A can enumerate Child B's step data via known job UUID. Apply RLS to every table uniformly.
- **Upstash PAYG plan for BullMQ:** BullMQ polls Redis continuously even when idle. PAYG cost is 10-100x Fixed plan at normal queue activity.
- **`maxRetriesPerRequest` default on BullMQ IORedis connection:** Default value causes workers to throw `ReplyError` on any reconnect. Must set to `null`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session cookie management in App Router | Custom JWT cookie logic | `@supabase/ssr` createServerClient | Edge cases around cookie refresh, rotation, and expiry are handled; manual implementations break on tab restore |
| Multi-tenant RLS | Application-level tenant checks | Postgres RLS with `auth.jwt()` claims | DB-level enforcement survives bugs in app code; app-level checks have gaps |
| Resumable uploads | Chunked fetch with manual resume | Supabase Storage TUS (built-in on Pro) | TUS handles network interruptions, partial uploads, checkpointing — weeks of work |
| Job queue | Custom Redis list + polling loop | BullMQ | Dead letter, priority, rate limits, delayed jobs, flow producers — BullMQ covers all |
| API key proxy | Manual fetch forwarding | `@fal-ai/server-proxy/nextjs` createRouteHandler | Handles streaming, multipart, auth header injection — one import |

**Key insight:** The auth + multi-tenancy surface area has enough subtle edge cases (token refresh races, RLS bypass via service role, cookie SameSite on cross-origin) that all three must be delegated to official SDKs.

---

## Common Pitfalls

### Pitfall 1: `getSession()` instead of `getUser()` in middleware

**What goes wrong:** `getSession()` trusts the cookie value without validating against Supabase server. A forged or stale cookie bypasses auth.

**Why it happens:** `getSession()` is faster (no network call) and feels sufficient in dev — where sessions are always fresh.

**How to avoid:** Always `getUser()` in middleware. Accept the extra network call — it's one per request.

**Warning signs:** `auth.getSession()` appears in middleware.ts.

### Pitfall 2: Missing `maxRetriesPerRequest: null` on BullMQ IORedis connection

**What goes wrong:** On any Redis reconnect (deploy, network blip, Upstash restart), the BullMQ Worker throws `ReplyError: ERR max number of clients reached` or similar. Worker crashes. All active jobs stall.

**Why it happens:** BullMQ docs mention this requirement but it's easy to miss in copy-paste setup.

**How to avoid:** Always set `maxRetriesPerRequest: null` in the IORedis connection options passed to BullMQ Worker.

**Warning signs:** Worker crashes under load or after Upstash cold starts; job queue depth grows but nothing is processed.

### Pitfall 3: Using Upstash PAYG plan instead of Fixed

**What goes wrong:** BullMQ's internal heartbeat polls Redis every few hundred milliseconds, even with zero jobs in queue. At PAYG pricing, idle cost alone reaches $50-200/month.

**Why it happens:** PAYG is the default option and looks cheaper at "low usage."

**How to avoid:** Provision Upstash Fixed plan from day one. No cost change at <10M commands/month.

**Warning signs:** Upstash dashboard shows thousands of commands/hour with an empty queue.

### Pitfall 4: RLS only on `jobs`, not child tables

**What goes wrong:** `job_steps` and `assets` tables inherit no RLS. A client who knows a job UUID can directly query `job_steps?job_id=eq.{uuid}` via Supabase REST API and read another client's pipeline data.

**Why it happens:** RLS migration is applied to the obvious tables first.

**How to avoid:** Enable RLS + tenant policy at `CREATE TABLE` time for all tables. Add `org_id` column to every table including `job_steps` and `assets`.

**Warning signs:** Any table missing `org_id` column or RLS enabled flag.

### Pitfall 5: Auth cookies not refreshing in Server Components

**What goes wrong:** User's session expires mid-session. Server Components see stale auth, throw 401. Browser session appears valid.

**Why it happens:** Cookie refresh requires writing new cookies back to the response — only possible in middleware or Route Handlers, not in RSC render.

**How to avoid:** Middleware must always call `supabase.auth.getUser()` and propagate the refreshed cookie via `supabaseResponse`. The exact middleware structure from Pattern 2 handles this correctly.

**Warning signs:** Users randomly logged out after ~1 hour (Supabase default token TTL).

---

## Code Examples

### Presigned Download URL (STOR-03)

```typescript
// For serving generated videos — never expose raw storage paths
const { data } = await supabase.storage
  .from('deliveries')
  .createSignedUrl(storagePath, 3600) // 1-hour expiry
// data.signedUrl is safe to return to client
```

### Setting org_id on new user (AUTH-03 prerequisite)

```typescript
// Called by admin when creating a client account (server-side, service role)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

await supabaseAdmin.auth.admin.updateUserById(userId, {
  app_metadata: { org_id: orgId, role: 'client' }  // role used for AUTH-04
})
```

### Admin route gating (AUTH-04)

```typescript
// middleware.ts — additional check after the base auth guard
const { data: { user } } = await supabase.auth.getUser()
const role = user?.app_metadata?.role

if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

### Atomic credit deduction (BILL-02 prerequisite — set up schema now)

```sql
-- Run this as a Postgres function; call from server action
CREATE OR REPLACE FUNCTION deduct_credits(
  p_org_id UUID, p_cost INT
) RETURNS INT AS $$
DECLARE
  new_balance INT;
BEGIN
  UPDATE clients
  SET credits = credits - p_cost
  WHERE org_id = p_org_id AND credits >= p_cost
  RETURNING credits INTO new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql;
```

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Worker process, Railway | ✓ | (Railway provisions) | — |
| Supabase project | Auth, DB, Storage | Must provision | Pro tier required | No fallback — provision before Wave 1 |
| Upstash Redis (Fixed plan) | BullMQ worker | Must provision | Fixed plan (not PAYG) | No fallback — Fixed plan required |
| Railway account | Worker process | Must provision | — | Fly.io as backup |
| fal.ai API key | INFRA-07 proxy | Must provision | — | No Phase 1 calls; proxy route wired, key added before Phase 2 |
| Google OAuth app | AUTH-01 | Must provision | — | Magic link only as fallback (still satisfies AUTH-01 partially) |

**Missing dependencies with no fallback:**
- Supabase project (Pro tier) — must be provisioned before Phase 1 execution starts
- Upstash Redis Fixed plan — wrong plan causes 10-100x cost inflation
- Railway service — no alternative persistent process host without ops overhead

**Missing dependencies with fallback:**
- Google OAuth app — magic link alone is functional; OAuth can be added in Wave 2 of Phase 1
- fal.ai API key — proxy route can be wired without a live key; INFRA-07 verified at compile time

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — Wave 0 must install |
| Config file | `jest.config.ts` or `vitest.config.ts` — Wave 0 creates |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

Recommendation: Vitest over Jest for Next.js 15 — better ESM support, faster, no transform config needed.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-02 | Unauthenticated request to `/dashboard` redirects to `/login` | Integration (middleware) | `vitest run tests/middleware.test.ts` | Wave 0 |
| AUTH-03 | RLS blocks cross-tenant row access | Integration (DB) | `vitest run tests/rls.test.ts` | Wave 0 |
| AUTH-05 | Session cookie refreshes across server component renders | Integration | `vitest run tests/session.test.ts` | Wave 0 |
| STOR-01 | `/api/upload-token` returns signed URL for authenticated user | Unit (Route Handler) | `vitest run tests/upload-token.test.ts` | Wave 0 |
| STOR-02 | Upload token endpoint rejects unauthenticated requests | Unit | same file | Wave 0 |
| INFRA-02 | Upstash Redis connection has `noeviction` policy | Smoke (manual verify) | manual — check Upstash dashboard | manual |
| INFRA-05 | Worker exits cleanly on SIGTERM | Integration (process) | `vitest run tests/worker-shutdown.test.ts` | Wave 0 |

### Sampling Rate

- Per task commit: `npx vitest run tests/[changed-module].test.ts`
- Per wave merge: `npx vitest run`
- Phase gate: full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `vitest.config.ts` — framework setup with jsdom environment
- [ ] `tests/middleware.test.ts` — covers AUTH-02, AUTH-04
- [ ] `tests/rls.test.ts` — covers AUTH-03, INFRA-04; requires test Supabase project
- [ ] `tests/upload-token.test.ts` — covers STOR-01, STOR-02
- [ ] `tests/worker-shutdown.test.ts` — covers INFRA-05
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react`

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | Late 2024 | Old package deprecated; SSR package has explicit cookie API for App Router |
| `getSession()` in middleware | `getUser()` in middleware | Supabase SSR v0.4+ | Security fix — getSession doesn't validate server-side |
| Next.js pages router `getServerSideProps` | RSC + Server Actions | Next.js 13+ | No client fetch waterfalls; data flows as props from RSC |
| BullMQ on Redis.io free tier | Upstash Fixed plan | BullMQ 4+ (constant polling) | Free tier eviction silently destroys job queue |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: deprecated, replaced by `@supabase/ssr`
- Next.js 16 `sync` Request API (headers/cookies): removed in v16; in v15 sync still works but is warned. Use `await cookies()` from day one.

---

## Open Questions

1. **Google OAuth redirect URI for Railway worker**
   - What we know: Google OAuth requires exact redirect URI allowlist
   - What's unclear: Whether worker process needs its own OAuth callback or only the Next.js app does
   - Recommendation: Only the Next.js app handles OAuth callbacks. Worker uses service role key, not OAuth.

2. **Supabase Pro tier activation timing**
   - What we know: Storage Pro required for TUS >6MB and bucket policies (STOR-04)
   - What's unclear: Whether any Phase 1 tests can run on free tier
   - Recommendation: Auth and DB tests can run on free tier. Provision Pro before STOR-01/STOR-04 tasks execute. Free tier = 2GB/month bandwidth — exhausted in one test session with video files.

3. **Railway monorepo vs separate repo for worker**
   - What we know: Worker is a separate Node.js process; config.json shows single project
   - What's unclear: Whether Railway deploys from a subdirectory of the main repo or needs its own repo
   - Recommendation: Use Railway monorepo support — point service root to `worker/` subdirectory. Single repo, separate Railway service. Confirmed supported by Railway.

---

## Sources

### Primary (HIGH confidence)

- `@supabase/ssr` official docs — `createServerClient`, `createBrowserClient`, middleware pattern: https://supabase.com/docs/guides/auth/server-side/nextjs
- BullMQ production guide — `maxRetriesPerRequest: null`, graceful shutdown: https://docs.bullmq.io/guide/going-to-production
- Upstash Redis + BullMQ integration — Fixed plan requirement: https://upstash.com/docs/redis/integrations/bullmq
- fal.ai Next.js integration — proxy route pattern: https://fal.ai/docs/model-apis/integrations/nextjs
- Supabase Storage resumable uploads — TUS protocol, `createSignedUploadUrl`: https://supabase.com/docs/guides/storage/uploads/resumable-uploads
- .planning/research/STACK.md — versions verified 2026-04-12
- .planning/research/ARCHITECTURE.md — RLS SQL patterns, data model
- .planning/research/PITFALLS.md — all pitfalls verified from official sources

### Secondary (MEDIUM confidence)

- Railway monorepo deployment: Railway docs confirm subdirectory service roots
- Supabase `auth.admin.updateUserById` for `app_metadata`: verified in Supabase Admin API docs

### Tertiary (LOW confidence)

- None for Phase 1 scope — all locked decisions are high-confidence verified patterns

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified via npm on 2026-04-12
- Architecture (auth, RLS, upload patterns): HIGH — verified via official Supabase and BullMQ docs
- Pitfalls: HIGH — cross-referenced against PITFALLS.md which cites official sources
- Railway deployment: MEDIUM — common pattern, Railway pricing/availability confirmed as of 2026

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (stable stack; versions move slowly)
