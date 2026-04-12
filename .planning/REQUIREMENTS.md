# Requirements: Clico AI Video Dashboard

**Defined:** 2026-04-12
**Core Value:** Merchants get high-performing TikTok videos by cloning proven viral structures onto their products — no filming, no creators, no guesswork.

## v1 Requirements

### Authentication (AUTH)

- [x] **AUTH-01**: User can sign up with email/password
- [x] **AUTH-02**: User can sign up/login with Google OAuth
- [x] **AUTH-03**: User receives email verification after signup
- [x] **AUTH-04**: User can reset password via email link
- [x] **AUTH-05**: User session persists across browser refresh
- [ ] **AUTH-06**: Role-based access: client vs operator vs admin

### Product Management (PROD)

- [ ] **PROD-01**: Client can input product URL (Shopify/Amazon/TikTok Shop) and system auto-scrapes title, images, price, description
- [ ] **PROD-02**: Client can manually upload product photos (multi-angle, up to 10 images)
- [ ] **PROD-03**: Client can fill product details (name, category, key selling points, target audience)
- [ ] **PROD-04**: Products are stored in client's library for reuse across orders

### Viral Structure Analyzer (VIRAL)

- [ ] **VIRAL-01**: System accepts a TikTok/Reels URL as reference video input
- [ ] **VIRAL-02**: System downloads reference video automatically (yt-dlp)
- [ ] **VIRAL-03**: Gemini multimodal API analyzes video and outputs structured brief: hook type, shot count, pacing, scene sequence, transition style, CTA position, audio pattern
- [ ] **VIRAL-04**: Structured brief is stored and displayed to user before generation
- [ ] **VIRAL-05**: System can auto-suggest reference videos from curated viral library based on product category (stretch goal)

### Video Generation Pipeline (GEN)

- [ ] **GEN-01**: Pipeline stage 1 — Gemini analysis produces shot-by-shot storyboard document from reference video structure + product info
- [ ] **GEN-02**: Pipeline stage 2 — Flux Pro (fal.ai) generates multi-panel storyboard images from storyboard document + product photos
- [ ] **GEN-03**: Pipeline stage 3 — Kling 3.0 (fal.ai) synthesizes 4-15s video clips from storyboard images + video prompt
- [ ] **GEN-04**: Pipeline stage 4 — FFmpeg stitches clips, burns subtitles, normalizes audio, exports 9:16 1080x1920 MP4
- [ ] **GEN-05**: Each pipeline stage runs as independent BullMQ job with retry on failure
- [ ] **GEN-06**: Pipeline supports Seedance 2.0 as manual fallback when Kling fails or quality is insufficient
- [ ] **GEN-07**: Video prompt assembly is automated (structure brief + product context → Kling-compatible prompt)

### Hook Variant Engine (HOOK)

- [ ] **HOOK-01**: System generates 3-5 hook variants for each video concept (different first 3 seconds)
- [ ] **HOOK-02**: Hook variants share the same video body, only opening differs
- [ ] **HOOK-03**: Client can select which hook variants to keep after preview

### Client Self-Serve (CLIENT)

- [ ] **CLIENT-01**: Client can create a new video order by inputting product URL or uploading photos
- [ ] **CLIENT-02**: Client can optionally paste a reference TikTok URL (or let system auto-select)
- [ ] **CLIENT-03**: Client sees real-time progress of their order (queued → analyzing → generating → reviewing → delivered)
- [ ] **CLIENT-04**: Client can preview generated videos before downloading
- [ ] **CLIENT-05**: Client can download finished videos as MP4 (no watermark on paid tier)
- [ ] **CLIENT-06**: Client can request regeneration if quality is poor
- [ ] **CLIENT-07**: Client has a video library dashboard showing all past orders and videos
- [ ] **CLIENT-08**: Client can view usage/credit balance and purchase history

### Credits & Billing (BILL)

- [ ] **BILL-01**: Credit-based pricing system — each video generation consumes credits
- [ ] **BILL-02**: Stripe integration for credit package purchases and subscriptions
- [ ] **BILL-03**: Free tier with limited credits (e.g., 3 free videos with watermark)
- [ ] **BILL-04**: Credit balance displayed prominently in UI
- [ ] **BILL-05**: Credit deduction is atomic (Postgres single-statement, no race conditions)
- [ ] **BILL-06**: Failed generations refund credits automatically
- [ ] **BILL-07**: Usage history shows per-video cost breakdown

### Internal Operations (OPS)

- [ ] **OPS-01**: Operator Kanban board showing all orders: client → brief → generation → QC → delivered
- [ ] **OPS-02**: Operator can review generated videos and approve/reject before client delivery
- [ ] **OPS-03**: Operator can manually trigger regeneration or adjust prompts
- [ ] **OPS-04**: Admin can manage client accounts, view aggregate stats, monitor API costs
- [ ] **OPS-05**: Admin dashboard shows real-time queue status, job success/failure rates, API spend

### Infrastructure (INFRA)

- [x] **INFRA-01**: Supabase Postgres with RLS policies on all tables (tenant isolation)
- [x] **INFRA-02**: Supabase Storage for product images and generated videos (presigned upload)
- [x] **INFRA-03**: BullMQ on Upstash Redis (Fixed plan, noeviction policy) for async job queue
- [x] **INFRA-04**: Dedicated Railway worker process for long-running AI pipeline jobs
- [ ] **INFRA-05**: Webhook receivers for Kling/fal.ai completion callbacks with idempotency keys
- [x] **INFRA-06**: API key management for Gemini, fal.ai, TikAPI stored as env vars (never client-side)

## v2 Requirements

### Viral Video Library (deferred)

- **LIB-01**: Auto-crawl TikTok for high-performing videos by product category via TikAPI
- **LIB-02**: Score and rank crawled videos by engagement metrics
- **LIB-03**: Pre-analyze structural formulas of top videos and store as templates

### Performance Feedback Loop (deferred)

- **PERF-01**: Client connects TikTok account to track video performance
- **PERF-02**: System correlates view/like/share data back to structural formula used
- **PERF-03**: Performance data improves template recommendations over time

### Advanced Features (deferred)

- **ADV-01**: Per-client brand profile (colors, tone, product library, preferred formulas)
- **ADV-02**: Batch brief generator — plan N videos across M structures automatically
- **ADV-03**: QC automation — auto-flag aspect ratio issues, missing product shots, no CTA
- **ADV-04**: Multi-platform export presets (Reels 1:1, YouTube Shorts)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Avatar/talking head generation | HeyGen/Arcads 2-3 years ahead, $50M+ invested. Use API integration if needed. |
| Full video editor (timeline) | CapCut/Premiere exist. 12+ months engineering debt for inferior product. |
| Social scheduling/posting | Buffer/Later do this better. Scope creep with no moat. |
| Image ad generation | Different format, different optimization. Dilutes video-first identity. |
| SSO/enterprise features | Wrong focus for early traction. Add when revenue justifies. |
| Auto-publish to TikTok | Compliance risk, TikTok API approval slow. Deliver MP4 files instead. |
| Mobile app | Web responsive is sufficient for MVP. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 to AUTH-06 | TBD | Pending |
| PROD-01 to PROD-04 | TBD | Pending |
| VIRAL-01 to VIRAL-05 | TBD | Pending |
| GEN-01 to GEN-07 | TBD | Pending |
| HOOK-01 to HOOK-03 | TBD | Pending |
| CLIENT-01 to CLIENT-08 | TBD | Pending |
| BILL-01 to BILL-07 | TBD | Pending |
| OPS-01 to OPS-05 | TBD | Pending |
| INFRA-01 to INFRA-06 | TBD | Pending |

**Coverage:**
- v1 requirements: 46 total
- Mapped to phases: 0
- Unmapped: 46

---
*Requirements defined: 2026-04-12*
*Last updated: 2026-04-12 after initialization*
