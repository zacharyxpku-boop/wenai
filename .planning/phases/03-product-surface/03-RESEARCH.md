# Phase 3: Product Surface - Research

**Researched:** 2026-04-12
**Domain:** Stripe credit billing, Next.js dashboard UI, admin Kanban, SSE consumption, video preview
**Confidence:** HIGH (stack verified; patterns sourced from official docs and npm registry)

---

## Summary

Phase 3 wraps the AI pipeline in the product's user-facing surface: a client portal for job submission and video delivery, an admin ops dashboard for managing the production queue, and Stripe credit billing to gate access. The stack is already decided — Next.js 15 + Supabase + Stripe + Tailwind — so research here targets the specific integration patterns within that stack.

The three hardest problems are: (1) Stripe webhook idempotency for credit packs, which requires storing the Stripe event ID before writing credits; (2) consuming the existing SSE stream in React without EventSource leaking on unmount; and (3) the admin SOP Kanban, which should use `@dnd-kit` (already a first-class library in the ecosystem) rather than a heavier alternative.

The storage cleanup requirement (STOR-05) is the simplest task in the phase — it's a Supabase `storage.from(bucket).remove([paths])` call triggered after confirmed delivery.

**Primary recommendation:** Use Stripe Checkout in `mode: "payment"` for credit packs (not subscriptions). Use `@dnd-kit/core` + `@dnd-kit/sortable` for Kanban. Consume SSE with a plain `useEffect` + `EventSource` cleanup pattern — no additional library needed. Use native `<video>` element for inline preview of presigned URLs.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STOR-05 | Intermediate files (keyframes, raw clips) cleaned up after delivery | Supabase `storage.from().remove([paths])` — call from post-delivery job step or webhook handler |
| BILL-01 | Stripe credit-based billing: user purchases credit packs; each job deducts N credits at job creation | Stripe Checkout `mode: "payment"` with `metadata.credits`; deduction at job submission time |
| BILL-02 | Credit deduction atomic: single Postgres UPDATE with balance check; `rowsAffected === 0` = insufficient | Supabase RPC with `UPDATE ... WHERE balance >= cost RETURNING balance`; check affected rows |
| BILL-03 | Stripe webhook stores `stripe_event_id` with UNIQUE; duplicate events ignored via ON CONFLICT DO NOTHING | Store event ID in `stripe_events` table before any credit write; idempotency at DB level |
| BILL-04 | Stripe handles: `checkout.session.completed`, `customer.subscription.updated/.deleted`, `invoice.payment_failed` | Route handler with `stripe.webhooks.constructEvent()` before any writes |
| BILL-05 | Failed job refunds credits; on confirmed failure, not webhook timeout | Trigger credit refund from BullMQ job failure handler after job transitions to `failed` state |
| BILL-06 | Daily API spend cap kills generation at 80% of budget threshold | Supabase function or cron reading `job_steps.cost_usd` aggregate; write to config table |
| CLI-01 | Client submits job: product URL/images, reference TikTok URL, hook variant count | Form in client component; Server Action calls `/api/jobs` POST after balance check |
| CLI-02 | Client sees real-time job status with per-step progress | SSE consumer hook with `EventSource`; reads from existing `/api/status/[jobId]` endpoint |
| CLI-03 | Client has video library showing past generations with thumbnails, status, creation date | Server Component fetches from Supabase; paginates with React Query for "load more" |
| CLI-04 | Client can download final MP4 via presigned Supabase Storage URL | Server Action calls `supabase.storage.createSignedUrl()`; returns URL to trigger browser download |
| CLI-05 | Client can trigger regeneration on failed/poor-quality output | Button calls `/api/jobs` POST with same inputs, sets `parent_job_id` for lineage tracking |
| ADMIN-01 | Admin creates and manages client accounts (CRUD) | Server Actions with admin Supabase client (service role); orgs + users tables |
| ADMIN-02 | Admin views all jobs: client, status, current step, created time | Server Component with Supabase join on `jobs` + `orgs` + `job_steps`; sortable table |
| ADMIN-03 | Admin manually retries a failed job step without restarting full job | API route that re-enqueues specific BullMQ queue for that step; does not reset prior steps |
| ADMIN-04 | Admin sees per-job cost tracking (Gemini tokens + fal.ai spend) | Read from `job_steps.cost_usd` + `jobs.total_cost_usd`; already logged by Phase 2 workers |
| ADMIN-05 | Admin views BullMQ queue health (active, waiting, failed counts per queue) | BullMQ `Queue.getJobCounts()` called from admin API route; display as status tiles |
| ADMIN-06 | Internal SOP dashboard: Kanban view with columns client→brief→generation→QC→delivered | `@dnd-kit/core` + `@dnd-kit/sortable`; drag updates `jobs.sop_stage` column in DB |
| QC-03 | Quality failure rate tracked per model/prompt type; surfaced in admin dashboard | Aggregate query on `jobs` table grouped by `model_version` and `status='failed'`; display as chart |
| QC-04 | Credit meter visible to client at all times (current balance, cost of next generation) | Credit balance in layout header via Supabase Realtime subscription or React Query polling (5s) |
| QC-06 | Stripe reconciliation job (nightly): compare payment records with credit events; alert on mismatch | Vercel Cron at `0 2 * * *`; compares `stripe_events` table vs `credit_transactions` table |
</phase_requirements>

---

## Standard Stack

### Core (already installed in project)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| stripe (Node SDK) | 22.0.1 | Checkout sessions, webhook verification, customer management | Only official Stripe SDK; API version `2026-03-25` pinned |
| @stripe/stripe-js | 9.1.0 | Client-side redirect to Stripe Checkout | Lazy-loads Stripe.js; keeps PCI scope minimal |
| @supabase/supabase-js | 2.103.0 | Supabase client for all DB/storage/auth ops | Already in project |
| @supabase/ssr | latest | Server Component + Route Handler auth | Already in project |
| @tanstack/react-query | 5.99.0 | Client-side data fetching, polling credit balance | Already in project |
| zustand | 5.0.12 | Client UI state (job submission form, optimistic status) | Already in project |
| tailwindcss | 4.x | Styling | Already in project |

### New Dependencies for Phase 3

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| @dnd-kit/core | 6.3.1 | Drag-and-drop primitives for Kanban | Lightweight, accessible, maintained; no full-DOM re-render on drag |
| @dnd-kit/sortable | 10.0.0 | Sortable items within Kanban columns | Companion to @dnd-kit/core; handles sort order |
| @dnd-kit/utilities | 3.2.2 | CSS transform helpers for drag | Required utility peer for sortable |

**Note:** `react-beautiful-dnd` is deprecated (Atlassian abandoned it). Do NOT use it. `@dnd-kit` is the standard replacement.

**Note:** No additional video player library needed. Native `<video>` element with Supabase presigned URL is sufficient for 9:16 MP4 preview. `video.js` (8.23.7) and `react-player` (3.4.0) add bundle weight for no meaningful gain over native HTML5.

### Installation (new packages only)

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Version verification (ran 2026-04-12):**
- `@dnd-kit/core`: 6.3.1
- `@dnd-kit/sortable`: 10.0.0
- `@dnd-kit/utilities`: 3.2.2
- `stripe`: 22.0.1
- `@stripe/stripe-js`: 9.1.0
- `@tanstack/react-query`: 5.99.0
- `recharts`: 2.15.1 (if used for QC-03 failure rate chart — optional)

---

## Architecture Patterns

### Recommended Project Structure (Phase 3 additions)

```
src/
├── app/
│   ├── dashboard/                  # CLIENT portal (role: client)
│   │   ├── layout.tsx              # Sidebar nav + credit meter header (Server Component)
│   │   ├── page.tsx                # Job submission form
│   │   ├── jobs/
│   │   │   ├── page.tsx            # Video library (Server Component, paginated)
│   │   │   └── [jobId]/
│   │   │       └── page.tsx        # Job detail + SSE progress + video player
│   │   └── billing/
│   │       └── page.tsx            # Purchase credits UI
│   ├── admin/                      # ADMIN portal (role: admin)
│   │   ├── layout.tsx              # Admin sidebar
│   │   ├── page.tsx                # Queue monitor table (ADMIN-02)
│   │   ├── clients/
│   │   │   └── page.tsx            # Client CRUD (ADMIN-01)
│   │   ├── sop/
│   │   │   └── page.tsx            # Kanban SOP board (ADMIN-06)
│   │   └── queue-health/
│   │       └── page.tsx            # BullMQ health tiles (ADMIN-05)
│   └── api/
│       ├── webhooks/
│       │   └── stripe/
│       │       └── route.ts        # Stripe webhook handler (BILL-03, BILL-04)
│       ├── billing/
│       │   └── checkout/
│       │       └── route.ts        # Create Stripe Checkout session (BILL-01)
│       └── admin/
│           ├── queue-health/
│           │   └── route.ts        # BullMQ Queue.getJobCounts() (ADMIN-05)
│           └── retry-step/
│               └── route.ts        # Re-enqueue specific job step (ADMIN-03)
├── components/
│   ├── dashboard/
│   │   ├── JobSubmitForm.tsx        # CLI-01 — "use client"
│   │   ├── JobProgressSSE.tsx       # CLI-02 — SSE consumer
│   │   ├── VideoLibrary.tsx         # CLI-03
│   │   ├── VideoPlayer.tsx          # Native <video> with presigned URL
│   │   └── CreditMeter.tsx          # QC-04 — header credit display
│   └── admin/
│       ├── SopKanban.tsx            # ADMIN-06 — dnd-kit board
│       ├── QueueHealthTiles.tsx     # ADMIN-05
│       └── JobTable.tsx             # ADMIN-02
└── lib/
    ├── stripe/
    │   ├── client.ts               # stripe SDK init (server-only)
    │   └── webhook.ts              # constructEvent + idempotency logic
    └── credits/
        └── atomic.ts               # deductCredits() + refundCredits() RPCs
```

### Pattern 1: Stripe Credit Pack Checkout (BILL-01, BILL-04)

**What:** Create Stripe Checkout in `mode: "payment"` (not subscription). Each credit pack is a one-time product. The user's `org_id` and credit quantity travel in session `metadata`.

**When to use:** Any time a client clicks "Buy Credits".

**Route Handler pattern:**

```typescript
// app/api/billing/checkout/route.ts
// Source: Stripe official docs + verified Medium article (jsteinb)
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25' })

export async function POST(req: Request) {
  const { orgId, packId } = await req.json()
  const pack = CREDIT_PACKS[packId] // { priceId, credits }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: pack.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing`,
    client_reference_id: orgId,  // identifies org in webhook
    metadata: { orgId, credits: String(pack.credits), packId },
  })
  return Response.json({ url: session.url })
}
```

**Credit pack definitions** live in a server-only constants file, never computed client-side.

### Pattern 2: Stripe Webhook — Idempotent Credit Addition (BILL-03)

**What:** Store the Stripe `event.id` in a `stripe_events` table with a UNIQUE constraint. Attempt the insert first. If conflict (duplicate delivery), skip credit write. Only write credits after successful dedup insert.

```typescript
// lib/stripe/webhook.ts
// Source: Stripe official docs on idempotency
export async function handleCheckoutCompleted(
  event: Stripe.Event,
  supabase: SupabaseClient
) {
  const session = event.data.object as Stripe.Checkout.Session
  const orgId = session.client_reference_id
  const credits = Number(session.metadata?.credits ?? 0)

  // Step 1: dedup — insert event_id; if conflict, bail silently
  const { error: dedupError } = await supabase
    .from('stripe_events')
    .insert({ stripe_event_id: event.id, processed_at: new Date().toISOString() })

  if (dedupError?.code === '23505') {
    // UNIQUE violation = already processed; idempotent return
    return
  }
  if (dedupError) throw dedupError

  // Step 2: add credits atomically
  const { error } = await supabase.rpc('add_credits', { p_org_id: orgId, p_amount: credits })
  if (error) throw error
}
```

**Webhook route** must call `stripe.webhooks.constructEvent(rawBody, sig, secret)` before any of the above. The `rawBody` requires `req.text()` not `req.json()`.

### Pattern 3: Atomic Credit Deduction (BILL-02)

**What:** Single Postgres function prevents race conditions. Two simultaneous job submissions cannot both succeed if only one has sufficient balance.

```sql
-- supabase/migrations/003_credit_functions.sql
CREATE OR REPLACE FUNCTION deduct_credits(p_org_id uuid, p_amount int)
RETURNS int  -- returns new balance, raises exception if insufficient
LANGUAGE plpgsql AS $$
DECLARE
  v_new_balance int;
BEGIN
  UPDATE orgs
  SET credit_balance = credit_balance - p_amount
  WHERE id = p_org_id AND credit_balance >= p_amount
  RETURNING credit_balance INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;

  -- audit log
  INSERT INTO credit_transactions(org_id, delta, reason, created_at)
  VALUES (p_org_id, -p_amount, 'job_submission', now());

  RETURN v_new_balance;
END;
$$;
```

Call via `supabase.rpc('deduct_credits', { p_org_id, p_amount })`. Check for `insufficient_credits` exception and return 402 to client.

**Credit refund on job failure (BILL-05):** Mirror function `add_credits(p_org_id, p_amount)` called from BullMQ job failure handler — NOT from a webhook timeout.

### Pattern 4: SSE Job Progress Consumer (CLI-02)

**What:** React client component subscribes to existing SSE endpoint. Cleanup on unmount is mandatory to avoid leaking connections.

```typescript
// components/dashboard/JobProgressSSE.tsx
// Source: Next.js SSE discussion #48427 + Upstash blog
'use client'
import { useEffect, useState } from 'react'

type StepUpdate = { step: string; status: string; message: string }

export function JobProgressSSE({ jobId }: { jobId: string }) {
  const [steps, setSteps] = useState<StepUpdate[]>([])

  useEffect(() => {
    const es = new EventSource(`/api/status/${jobId}`)

    es.onmessage = (e) => {
      const update: StepUpdate = JSON.parse(e.data)
      setSteps(prev => {
        const idx = prev.findIndex(s => s.step === update.step)
        if (idx >= 0) {
          const next = [...prev]; next[idx] = update; return next
        }
        return [...prev, update]
      })
    }

    es.addEventListener('done', () => es.close())
    es.onerror = () => es.close()

    return () => es.close()  // cleanup on unmount — critical
  }, [jobId])

  return (/* render step progress UI */)
}
```

**Vercel note:** SSE streams on Vercel have the 10s function timeout. The existing `/api/status/[jobId]` should use Supabase Realtime channel push or set `export const dynamic = 'force-dynamic'` with keep-alive pings every 8s.

### Pattern 5: Admin Kanban SOP Board (ADMIN-06)

**What:** Five columns (client → brief → generation → QC → delivered). Drag a job card between columns updates `jobs.sop_stage` in Supabase.

```typescript
// components/admin/SopKanban.tsx
// Source: @dnd-kit official docs + mehrdadrafiee/recursive-dnd-kanban-board
'use client'
import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

const COLUMNS = ['client', 'brief', 'generation', 'qc', 'delivered'] as const

export function SopKanban({ initialJobs }: { initialJobs: Job[] }) {
  const [jobs, setJobs] = useState(initialJobs)

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const newStage = over.id as string  // column id = stage name

    // optimistic update
    setJobs(prev => prev.map(j => j.id === active.id ? { ...j, sop_stage: newStage } : j))

    // persist
    await fetch(`/api/admin/jobs/${active.id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ sop_stage: newStage }),
    })
  }

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex gap-4">
        {COLUMNS.map(col => (
          <SortableContext key={col} items={jobs.filter(j => j.sop_stage === col).map(j => j.id)} strategy={verticalListSortingStrategy}>
            <KanbanColumn column={col} jobs={jobs.filter(j => j.sop_stage === col)} />
          </SortableContext>
        ))}
      </div>
    </DndContext>
  )
}
```

Add `sop_stage` column to `jobs` table in migration: `ALTER TABLE jobs ADD COLUMN sop_stage text DEFAULT 'client'`.

### Pattern 6: Inline Video Preview (CLI-03, CLI-04)

**What:** Native `<video>` with a short-lived presigned URL. Generate the URL server-side via Server Action, pass to client component.

```typescript
// Server Action
'use server'
export async function getVideoUrl(assetPath: string) {
  const supabase = createClient() // service role
  const { data } = await supabase.storage
    .from('generated-videos')
    .createSignedUrl(assetPath, 3600) // 1-hour TTL
  return data?.signedUrl
}

// Client component
<video
  src={signedUrl}
  controls
  playsInline
  className="w-full aspect-[9/16] rounded-lg bg-black"
/>
```

Do NOT expose signed URLs in the DOM before the user needs them. Generate on demand (click to preview or lazy load via Intersection Observer).

### Pattern 7: Storage Cleanup After Delivery (STOR-05)

**What:** After final MP4 is confirmed delivered (asset record marked `delivered`), delete intermediate paths.

```typescript
// Called from post-processing BullMQ worker or after status transitions to 'delivered'
async function cleanupIntermediateFiles(jobId: string, supabase: SupabaseClient) {
  const paths = [
    `keyframes/${jobId}/`,  // Flux-generated frames
    `raw-clips/${jobId}/`,  // Raw Kling output clips
  ]
  // Supabase requires listing objects first, then removing
  for (const prefix of paths) {
    const { data: files } = await supabase.storage.from('intermediates').list(prefix)
    if (files?.length) {
      const toDelete = files.map(f => `${prefix}${f.name}`)
      await supabase.storage.from('intermediates').remove(toDelete)
    }
  }
}
```

**Important:** Supabase Storage has no recursive folder delete. Must list then remove. Store intermediate files in a separate `intermediates` bucket from `generated-videos` to simplify cleanup scope.

### Pattern 8: BullMQ Queue Health Endpoint (ADMIN-05)

```typescript
// app/api/admin/queue-health/route.ts
import { Queue } from 'bullmq'
const QUEUE_NAMES = ['video-analysis', 'frame-generation', 'video-synthesis', 'post-processing']

export async function GET() {
  const connection = { url: process.env.UPSTASH_REDIS_REST_URL }
  const health = await Promise.all(
    QUEUE_NAMES.map(async name => {
      const q = new Queue(name, { connection })
      const counts = await q.getJobCounts('active', 'waiting', 'failed', 'completed')
      await q.close()
      return { name, ...counts }
    })
  )
  return Response.json(health)
}
```

### Pattern 9: Admin Step Retry (ADMIN-03)

**What:** Re-enqueue a specific failed step. Does not restart prior completed steps.

```typescript
// app/api/admin/retry-step/route.ts
export async function POST(req: Request) {
  const { jobId, stepName } = await req.json()
  // Reset step status in DB
  await supabase.from('job_steps')
    .update({ status: 'pending', error: null })
    .eq('job_id', jobId).eq('step_name', stepName)

  // Re-add to appropriate queue
  const queueMap: Record<string, string> = {
    'analysis': 'video-analysis',
    'frame-generation': 'frame-generation',
    'video-synthesis': 'video-synthesis',
    'post-processing': 'post-processing',
  }
  const queue = new Queue(queueMap[stepName], { connection })
  await queue.add('retry', { jobId, stepName }, { jobId: `retry-${jobId}-${stepName}-${Date.now()}` })
  await queue.close()

  return Response.json({ ok: true })
}
```

### Anti-Patterns to Avoid

- **Polling for job status instead of SSE:** Every client polling every 2s will exhaust Vercel function invocations. SSE is already built — use it.
- **Computing credit prices client-side:** Prices must come from server constants. Never allow client to send a price to Stripe.
- **Calling `supabase.storage.createSignedUrl()` inside a Server Component that renders the library:** Creates N signed URL requests per page load. Use on-demand via Server Action instead.
- **Using `react-beautiful-dnd`:** Deprecated, unmaintained. Use `@dnd-kit`.
- **Embedding Stripe public key in a Server Component rendered response:** Use `@stripe/stripe-js` with `loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)` in a client component.
- **Verifying Stripe webhooks with `req.json()`:** Must use `req.text()` to get raw body for signature verification. Using `req.json()` will always fail webhook verification.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop Kanban | Custom mousedown/touch handlers | `@dnd-kit/core` + `@dnd-kit/sortable` | Accessibility, touch support, auto-scroll, sensor abstraction |
| Stripe webhook verification | Manual HMAC comparison | `stripe.webhooks.constructEvent()` | Timing-safe comparison, handles Stripe-specific encoding |
| Atomic credit deduction | Application-level balance check then UPDATE | Postgres RPC with `WHERE balance >= cost RETURNING balance` | Only DB-level atomicity prevents race conditions |
| Video player UI | Custom `<video>` wrapper with custom controls | Native `<video controls>` | Browser provides accessible, keyboard-navigable controls |
| SSE reconnection | Manual `setTimeout` retry logic | EventSource built-in reconnection | EventSource auto-reconnects; use `Last-Event-ID` header for resume |
| Credit pack pricing | Compute prices in API or client | Hard-code in server constants; reference Stripe Price IDs | Prevents price manipulation; Stripe Checkout enforces server prices |
| Nightly reconciliation scheduler | Background process or pm2 job | Vercel Cron (`vercel.json` `"crons"`) | Already on Vercel infrastructure; no extra process |

**Key insight:** The billing layer's correctness depends entirely on the database, not the application layer. Every deduction/refund must be a single atomic SQL operation — multi-step application logic that reads then writes will fail under concurrent load.

---

## Common Pitfalls

### Pitfall 1: Stripe Webhook Raw Body
**What goes wrong:** `stripe.webhooks.constructEvent()` throws `No signatures found matching the expected signature` even when the secret is correct.
**Why it happens:** Next.js App Router route handlers parse the body as JSON by default. The HMAC signature is computed over the raw bytes — any JSON serialization/deserialization changes whitespace and breaks the signature.
**How to avoid:** Always `const rawBody = await req.text()` before calling `constructEvent`. Set `export const dynamic = 'force-dynamic'` on the webhook route.
**Warning signs:** Webhook verification fails only in production, not locally (local uses Stripe CLI which may behave differently).

### Pitfall 2: EventSource Leaking on React Unmount
**What goes wrong:** SSE connection stays open after user navigates away. Accumulates open connections, causes Vercel function timeouts, exhausts Redis connections.
**Why it happens:** `new EventSource()` in `useEffect` without cleanup function.
**How to avoid:** Always `return () => es.close()` in the `useEffect` cleanup.
**Warning signs:** Network tab shows multiple open SSE connections to the same jobId.

### Pitfall 3: Supabase Signed URL in Server Component Render Loop
**What goes wrong:** Video library page with 20 videos makes 20 `createSignedUrl()` calls on every render.
**Why it happens:** Signed URL generation placed inside the Server Component's data fetch.
**How to avoid:** Render thumbnails (static image paths) in the library; generate signed URLs only on demand (play button click or download click) via Server Action.
**Warning signs:** Library page takes >2s to load.

### Pitfall 4: dnd-kit SortableContext Items Array
**What goes wrong:** Drag-and-drop Kanban moves items visually but drops them back on release, or drops fail silently.
**Why it happens:** `items` array passed to `SortableContext` contains objects instead of IDs, or the column droppable ID matches a job card ID.
**How to avoid:** `items` must be an array of primitive IDs (strings/numbers). Column IDs must be distinct from all job IDs.
**Warning signs:** `console.warn` from dnd-kit about missing sortable item contexts.

### Pitfall 5: Credit Deduction Race Condition
**What goes wrong:** User submits two jobs simultaneously; both pass the balance check; both deduct; balance goes negative.
**Why it happens:** Balance check and update are two separate DB operations in application code.
**How to avoid:** Use the Postgres RPC `deduct_credits` with `WHERE balance >= cost` in a single UPDATE. Check `rowsAffected === 0` for insufficient balance.
**Warning signs:** Credit balance goes negative in production.

### Pitfall 6: Missing `sop_stage` Column Migration
**What goes wrong:** Kanban board loads but drag-and-drop patches fail silently; jobs revert to original column.
**Why it happens:** `jobs.sop_stage` column doesn't exist in Phase 1/2 migrations.
**How to avoid:** Phase 3 Wave 0 must include a migration: `ALTER TABLE jobs ADD COLUMN sop_stage text NOT NULL DEFAULT 'client'`.
**Warning signs:** PATCH to `/api/admin/jobs/:id/stage` returns 500 or Supabase RLS violation.

---

## Code Examples

### Stripe Credit Pack Constants (server-only)

```typescript
// lib/stripe/packs.ts  (never imported from client components)
export const CREDIT_PACKS = {
  starter: { priceId: process.env.STRIPE_PRICE_STARTER!, credits: 100, label: '100 credits — $29' },
  pro:     { priceId: process.env.STRIPE_PRICE_PRO!,     credits: 300, label: '300 credits — $79' },
  agency:  { priceId: process.env.STRIPE_PRICE_AGENCY!,  credits: 1000, label: '1000 credits — $199' },
} as const
```

Create these products/prices once in the Stripe dashboard (or via `stripe.products.create()` in a one-time seed script). Use `mode: "payment"` not `mode: "subscription"` since credits are one-time purchases.

### Credit Meter Header Component (QC-04)

```typescript
// components/dashboard/CreditMeter.tsx
'use client'
import { useQuery } from '@tanstack/react-query'

export function CreditMeter({ initialBalance }: { initialBalance: number }) {
  const { data: balance } = useQuery({
    queryKey: ['credit-balance'],
    queryFn: () => fetch('/api/credits/balance').then(r => r.json()).then(d => d.balance),
    initialData: initialBalance,
    refetchInterval: 10_000,  // poll every 10s; not realtime but sufficient
  })

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-mono">{balance}</span>
      <span className="text-muted-foreground">credits</span>
    </div>
  )
}
```

Pass `initialBalance` from a Server Component to hydrate immediately without loading state.

### Vercel Cron for Nightly Reconciliation (QC-06)

```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/stripe-reconciliation",
    "schedule": "0 2 * * *"
  }]
}
```

```typescript
// app/api/cron/stripe-reconciliation/route.ts
export async function GET(req: Request) {
  // Verify cron secret to prevent unauthorized triggers
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  // Compare stripe_events SUM(credits) vs credit_transactions SUM(delta)
  // Alert via Resend email if mismatch > threshold
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `react-beautiful-dnd` | `@dnd-kit` | 2023 (rbd deprecated) | Must migrate; rbd is unmaintained |
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2024 | Auth helpers package deprecated; already addressed in Phase 1 |
| Stripe `apiVersion: '2023-10-16'` | `apiVersion: '2026-03-25'` | March 2026 | Pin to current; old versions emit deprecation warnings |
| Stripe `mode: "subscription"` for credits | `mode: "payment"` | Always correct but commonly misused | One-time packs = payment mode; subscription mode adds unnecessary lifecycle events |
| `getServerSideProps` + `useEffect` polling | Server Components + React Query | Next.js 13+ App Router | Data fetched at render time in Server Components; client polling only for dynamic updates |

---

## Open Questions

1. **BullMQ admin step retry — queue routing**
   - What we know: Each pipeline step (analysis, frame-gen, video-synthesis, post-processing) maps to one of four BullMQ queues defined in Phase 2
   - What's unclear: Whether Phase 2 workers accept a `retry` job type or need a new job name
   - Recommendation: Admin retry API should check Phase 2 worker job handler definitions before implementation; plan a Wave 0 task to verify worker job name contracts

2. **Credit balance Realtime vs polling**
   - What we know: Supabase Realtime can subscribe to row changes; React Query polling at 10s interval is simpler
   - What's unclear: Whether the Supabase Realtime `postgres_changes` event fires reliably for single-row UPDATE on `orgs.credit_balance`
   - Recommendation: Start with 10s polling (React Query `refetchInterval`); upgrade to Realtime if users complain about stale balance after purchase

3. **BILL-06 daily API spend cap mechanism**
   - What we know: Phase 2 workers log `cost_usd` per job step; BILL-06 requires killing generation at 80% of daily budget
   - What's unclear: Whether "kill" means reject new job submissions or actively cancel in-flight jobs
   - Recommendation: Interpret as "reject new job submissions with 429 if aggregate cost today >= 0.8 * daily_budget_usd"; in-flight jobs complete normally

4. **QC-03 failure rate chart library**
   - What we know: Admin dashboard needs a quality failure rate chart; `recharts` (2.15.1) is the standard React chart library
   - What's unclear: Whether recharts is in the project dependencies or needs adding
   - Recommendation: Check `package.json` before planning; if not present, add `recharts` as a dependency

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Stripe account + webhook secret | BILL-01–06 | Needs user setup | — | No fallback — must configure |
| Vercel Cron | QC-06 | ✓ (Vercel Pro feature) | — | Self-hosted cron if not on Vercel Pro |
| `@dnd-kit` packages | ADMIN-06 | Needs install | 6.3.1 / 10.0.0 | Table-based SOP view (no drag) |
| BullMQ `Queue` class (for queue health) | ADMIN-05 | ✓ (already in project) | 5.73.x | — |

**Missing dependencies with no fallback:**
- Stripe account with products/prices configured (manual dashboard setup required before any billing code works)
- `STRIPE_WEBHOOK_SECRET` from Stripe CLI or Dashboard webhook endpoint registration

**Missing dependencies with fallback:**
- `@dnd-kit` packages: if install is blocked, ADMIN-06 can be a sortable table instead of a drag Kanban as a fallback

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Not yet configured (no test config found in repo) |
| Config file | None — Wave 0 gap |
| Quick run command | `npx jest --testPathPattern=billing --passWithNoTests` (after setup) |
| Full suite command | `npx jest --passWithNoTests` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BILL-02 | Atomic deduction rejects when balance < cost | unit | `npx jest tests/credits/atomic.test.ts -x` | Wave 0 |
| BILL-03 | Duplicate Stripe event ignored | unit | `npx jest tests/stripe/webhook.test.ts -x` | Wave 0 |
| BILL-05 | Failed job triggers credit refund | unit | `npx jest tests/credits/refund.test.ts -x` | Wave 0 |
| CLI-01 | Job submission blocked when balance = 0 | unit | `npx jest tests/api/jobs.test.ts -x` | Wave 0 |
| ADMIN-03 | Step retry only re-enqueues target step | unit | `npx jest tests/admin/retry-step.test.ts -x` | Wave 0 |
| ADMIN-05 | Queue health returns counts for all 4 queues | smoke | Manual GET /api/admin/queue-health | manual |
| QC-06 | Reconciliation detects credit mismatch | unit | `npx jest tests/cron/reconciliation.test.ts -x` | Wave 0 |

### Wave 0 Gaps

- [ ] `tests/credits/atomic.test.ts` — covers BILL-02, BILL-05
- [ ] `tests/stripe/webhook.test.ts` — covers BILL-03, BILL-04
- [ ] `tests/api/jobs.test.ts` — covers CLI-01 (insufficient balance path)
- [ ] `tests/admin/retry-step.test.ts` — covers ADMIN-03
- [ ] `tests/cron/reconciliation.test.ts` — covers QC-06
- [ ] `jest.config.ts` + `jest.setup.ts` — test infrastructure baseline
- [ ] Framework install: `npm install -D jest @types/jest ts-jest`

---

## Project Constraints (from CLAUDE.md)

- UI must have a `DESIGN.md` established before writing any UI code. Project does not have one in root — must select or create before starting dashboard components.
- No purple/blue gradients, no `Inter`/`Roboto`/`Poppins` fonts, no `rounded-3xl + shadow-2xl`, no three-column equal-width cards (anti-AI UI rules).
- DeepSeek API calls (if any AI feature calls are made from the frontend layer) must go through `/api/` backend routes — `DEEPSEEK_API_KEY` never in browser.
- All AI API keys server-side only (INFRA-03 — already decided in project).
- Commercial check after every UI feature: does it make users more willing to pay?

**DESIGN.md action required:** Before Wave 1 UI tasks begin, either create a `DESIGN.md` in the project root or copy one from `https://github.com/VoltAgent/awesome-design-md`. The existing `claude/wenai/DESIGN.md` is for a different project and must not be reused.

---

## Sources

### Primary (HIGH confidence)
- Stripe official docs — Checkout, webhooks, fulfillment patterns: https://docs.stripe.com/checkout/fulfillment
- Stripe official docs — Event types: https://docs.stripe.com/api/events/types
- `@dnd-kit` official site: https://dndkit.com/
- Supabase Storage — Delete Objects: https://supabase.com/docs/guides/storage/management/delete-objects
- Supabase Storage — JS remove: https://supabase.com/docs/reference/javascript/storage-from-remove
- npm `@dnd-kit/core` 6.3.1, `@dnd-kit/sortable` 10.0.0, `@dnd-kit/utilities` 3.2.2 — verified 2026-04-12
- npm `stripe` 22.0.1, `@stripe/stripe-js` 9.1.0 — verified 2026-04-12

### Secondary (MEDIUM confidence)
- Stripe credit system in Next.js (jsteinb, Medium) — checkout session + atomic credits pattern: https://medium.com/@jsteinb/nextjs-using-stripe-to-build-a-credit-system-for-your-saas-app-3562e1608c25
- SSE in Next.js App Router — Upstash blog: https://upstash.com/blog/sse-streaming-llm-responses
- Next.js SSE discussion (EventSource App Router): https://github.com/vercel/next.js/discussions/48427
- Recursive dnd-kit Kanban with Next.js + shadcn: https://github.com/mehrdadrafiee/recursive-dnd-kanban-board

### Tertiary (LOW confidence)
- STACK.md Phase 1 research (internal, already researched)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all package versions verified on npm registry 2026-04-12
- Stripe patterns: HIGH — verified against official Stripe docs; webhook idempotency pattern is canonical
- dnd-kit Kanban: HIGH — library is the accepted replacement for react-beautiful-dnd; multiple working examples
- SSE consumption: HIGH — standard browser API; Next.js App Router compatibility verified
- Architecture: HIGH — follows Next.js App Router conventions already established in Phase 1/2
- Pitfalls: HIGH — raw body webhook issue and EventSource cleanup are well-documented failure modes

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (30 days; Stripe and Next.js are stable tracks)
