# Roadmap: Clico

## Overview

Three phases deliver the MVP: Phase 1 builds the secure, multi-tenant foundation (auth, storage, schema, worker separation) so data can flow safely. Phase 2 constructs the AI generation pipeline end-to-end (queue, worker, Gemini → Flux → Kling → FFmpeg) so a job actually runs. Phase 3 wraps everything in usable interfaces (client portal, admin ops dashboard, billing) so the product can serve paying merchants.

## Phases

- [ ] **Phase 1: Foundation** - Supabase schema, auth, RLS, storage, and Railway worker scaffold — the secure base everything else runs on
- [ ] **Phase 2: AI Pipeline** - BullMQ queue + worker executing the full Gemini → Flux → Kling → FFmpeg chain with webhook reliability and QC gate
- [ ] **Phase 3: Product Surface** - Client portal, admin ops dashboard, Stripe credit billing, and observability — the product users actually touch

## Phase Details

### Phase 1: Foundation
**Goal**: Secure, multi-tenant infrastructure is running — data persists, auth works, files upload, worker process runs on Railway
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06, INFRA-07, AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, STOR-01, STOR-02, STOR-03, STOR-04
**Success Criteria** (what must be TRUE):
  1. User can sign up, sign in (magic link + Google), and stay logged in across browser refreshes
  2. Unauthenticated requests to `/dashboard/**` redirect to login; authenticated requests proceed
  3. A product asset or reference video can be uploaded directly from the browser to Supabase Storage via presigned token — no file data touches the Next.js layer
  4. Client A cannot read or modify any database row belonging to Client B (RLS enforced at DB level)
  5. BullMQ worker process runs on Railway, connects to Upstash Redis (Fixed plan, noeviction), and starts without errors
**Plans**: TBD
**UI hint**: yes

### Phase 2: AI Pipeline
**Goal**: A job submitted with a product and reference TikTok URL runs the full 4-step pipeline and produces a delivered MP4 with hook variants
**Depends on**: Phase 1
**Requirements**: QUEUE-01, QUEUE-02, QUEUE-03, QUEUE-04, QUEUE-05, QUEUE-06, AI-01, AI-02, AI-03, AI-04, AI-05, AI-06, AI-07, AI-08, AI-09, AI-10, QC-01, QC-02, QC-05
**Success Criteria** (what must be TRUE):
  1. Submitting a job returns 202 + jobId in under 2 seconds; the browser receives real-time step updates via SSE without polling
  2. Gemini 2.5 Flash extracts a structured storyboard JSON (hook type, scene count, CTA position) from a reference TikTok URL
  3. Flux Pro generates keyframe images for each storyboard scene; Kling 3.0 synthesizes a 9:16 video clip from those keyframes
  4. FFmpeg concatenates clips, burns subtitles, and outputs a downloadable 1080×1920 MP4
  5. 3–5 hook variants are generated per run, each differing in the opening 3 seconds
  6. A job stuck in processing for >15 minutes is automatically detected and re-queued; worker restarts do not produce duplicate upstream API calls
**Plans**: TBD

### Phase 3: Product Surface
**Goal**: Paying clients can submit jobs, track status, download results, and be billed correctly; admins can manage the production queue and client accounts
**Depends on**: Phase 2
**Requirements**: STOR-05, BILL-01, BILL-02, BILL-03, BILL-04, BILL-05, BILL-06, CLI-01, CLI-02, CLI-03, CLI-04, CLI-05, ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, ADMIN-06, QC-03, QC-04, QC-06
**Success Criteria** (what must be TRUE):
  1. Client can submit a job (product URL + reference video + hook count), see per-step progress in real time, and download the final MP4
  2. Client sees their credit balance at all times; submitting a job with insufficient credits is blocked at the UI before the API call
  3. Purchasing a credit pack via Stripe checkout adds credits to the account exactly once, even if the webhook is delivered multiple times
  4. Admin can view all client accounts, all jobs with current step status, and retry any failed job step from the failed step — not from scratch
  5. Admin ops SOP dashboard shows each job moving through client → brief → generation → QC → delivered stages
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/TBD | Not started | - |
| 2. AI Pipeline | 0/TBD | Not started | - |
| 3. Product Surface | 0/TBD | Not started | - |
