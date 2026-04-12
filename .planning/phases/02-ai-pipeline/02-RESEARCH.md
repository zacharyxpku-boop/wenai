# Phase 2: AI Pipeline — Research

**Researched:** 2026-04-12
**Domain:** BullMQ job chaining + Gemini 2.5 Flash video analysis + Flux Pro image generation + Kling 3.0 video synthesis + FFmpeg post-processing
**Confidence:** HIGH (core API endpoints and patterns verified against official docs)

---

## Summary

Phase 2 connects the scaffold built in Phase 1 (4 BullMQ queues, Redis, Railway worker, Supabase schema) into a full end-to-end video production pipeline. The pipeline has four sequential stages: Gemini 2.5 Flash extracts a structured storyboard from the reference TikTok, Flux Pro generates keyframe images per scene, Kling 3.0 synthesizes video clips from those keyframes, and FFmpeg concatenates + subtitles + outputs the final 9:16 MP4.

The key architectural constraint for this phase: **every AI call is async**. Gemini and Flux use polling with exponential backoff. Kling uses webhook callbacks via `webhookUrl` in `fal.queue.submit()`. The BullMQ worker submits to Kling and returns immediately; the webhook receiver re-enqueues to post-processing. SSE to the browser is driven by Supabase Realtime Broadcast — the worker writes to a Supabase channel, the Next.js SSE route forwards events to the browser `ReadableStream`.

The two hardest failure modes to address are: (1) missed Kling webhooks (15-second delivery timeout, 10 retries over 2 hours) requiring a stuck-job poller at 15-minute intervals; and (2) BullMQ stalled jobs on deploy (SIGTERM in Phase 1 handles graceful shutdown, but `lockDuration` must be longer than max job duration). Both are covered by the patterns below.

**Primary recommendation:** Do not use BullMQ FlowProducer for this pipeline. Each stage is separated by external async waits (webhook, polling). Instead, use the simpler step-by-step enqueue pattern: each worker step enqueues the next queue when done, and stores state in `job_steps.metadata` (JSONB) for resumability.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| QUEUE-01 | Four BullMQ queues: video-analysis, frame-generation, video-synthesis, post-processing | Already defined in Phase 1 `worker/queues/definitions.ts` — workers need to be wired |
| QUEUE-02 | Job submission API returns 202 + jobId immediately | Route handler enqueue pattern — verified |
| QUEUE-03 | SSE endpoint streams real-time step updates via Supabase Realtime | Supabase Realtime Broadcast + Next.js ReadableStream SSE pattern — verified |
| QUEUE-04 | Per-user concurrent job cap (max 3) at queue insertion | Check active job count in BullMQ before enqueue |
| QUEUE-05 | Global queue depth limit returns 429 with Retry-After | BullMQ `queue.getJobCounts()` — verified |
| QUEUE-06 | `lockDuration` set longer than maximum expected job duration | `lockDuration: 20 * 60 * 1000` already in Phase 1 scaffold — verify 20 min is enough |
| AI-01 | Gemini 2.5 Flash analyzes reference video → storyboard JSON | Files API upload + `generateContent` + `responseSchema` — verified with SDK v1.49.0 |
| AI-02 | Flux Pro generates keyframe images per scene; polling with exp backoff | `fal.queue.submit("fal-ai/flux-pro/v1.1", ...)` + status polling — verified |
| AI-03 | Kling 3.0 via fal.ai synthesizes video; webhook callback, not polling | `fal.queue.submit("fal-ai/kling-video/v3/pro/image-to-video", { webhookUrl })` — verified |
| AI-04 | FFmpeg concat + subtitle burn + optional watermark → 9:16 1080×1920 MP4 | fluent-ffmpeg + ffmpeg-static — verified pattern |
| AI-05 | Webhook handler idempotent; validates webhook signature | fal.ai JWKS ED25519 signature — verified |
| AI-06 | Stalled job fallback: >15 min processing triggers direct API check | BullMQ stalled detection + direct `fal.queue.status()` poll — verified |
| AI-07 | Gemini analysis results cached in Supabase (same URL = no re-analysis) | Check `job_steps` or separate `analysis_cache` table before calling Gemini |
| AI-08 | Hook variant engine: 3–5 hook variants per run (different first-3-second scripts) | Gemini multi-output prompt pattern — generate N variant scripts, each becomes its own clip chain |
| AI-09 | Video generation ≤10s per Kling request; multi-clip sequences chained | Kling `duration: "10"` cap + concat demuxer — verified |
| AI-10 | Gemini token usage logged per job; video input capped at 90s | `usageMetadata.promptTokenCount` in response + pre-flight duration check |
| QC-01 | Output validation: non-zero file, duration matches spec, correct resolution | `ffprobe` (bundled with ffmpeg-static) + auto-retry up to 2x |
| QC-02 | Generation params (prompt, seed, model version) logged per job | Write to `job_steps.metadata` JSONB before API call |
| QC-05 | Job-level API cost logged (input tokens, output tokens, video seconds) | Log at each step: Gemini `usageMetadata`, fal.ai pricing * seconds |
</phase_requirements>

---

## Standard Stack

### Core (Phase 2 additions to Phase 1 base)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@google/genai` | 1.49.0 | Gemini 2.5 Flash video analysis | Official Google SDK; supports Files API, structured output via `responseSchema` |
| `@fal-ai/client` | 1.9.5 | Flux Pro + Kling 3.0 via fal.ai | Already installed in Phase 1; `fal.queue.submit()` + `webhookUrl` is the required async pattern |
| `fluent-ffmpeg` | 2.1.3 | Node.js FFmpeg wrapper | Type-safe chainable API; supports complexFilter, subtitle burning, concat |
| `ffmpeg-static` | 5.3.0 | Self-contained FFmpeg binary | Zero system dependency in Docker; set `ffmpeg.setFfmpegPath(ffmpegStatic)` |
| `@types/fluent-ffmpeg` | 2.1.28 | TypeScript types | Official community types |
| `libsodium-wrappers` | latest | ED25519 signature verification | Required by fal.ai webhook signature verification (JWKS-based) |

### Already Installed in Phase 1 (no re-install needed)

| Library | Purpose |
|---------|---------|
| `bullmq` 5.73.x | Queue workers already scaffolded |
| `ioredis` | Redis connection (`worker/lib/redis.ts`) |
| `@supabase/supabase-js` 2.x | DB writes, Realtime broadcast |
| `zod` | Storyboard JSON schema validation |

**Installation (worker package):**
```bash
cd worker && npm install @google/genai fluent-ffmpeg ffmpeg-static libsodium-wrappers
npm install -D @types/fluent-ffmpeg @types/libsodium-wrappers
```

**Installation (Next.js app, for webhook handler):**
```bash
npm install libsodium-wrappers
npm install -D @types/libsodium-wrappers
```

**Version verification (confirmed 2026-04-12):**
```bash
npm view @google/genai version    # 1.49.0
npm view ffmpeg-static version    # 5.3.0
npm view fluent-ffmpeg version    # 2.1.3
```

---

## Architecture Patterns

### Recommended Worker File Structure

```
worker/
├── index.ts                        # Entry point (Phase 1 scaffold — extend, don't replace)
├── lib/
│   ├── redis.ts                    # IORedis connection (Phase 1)
│   ├── supabase.ts                 # Service-role Supabase client (new in Phase 2)
│   └── ffmpeg.ts                   # FFmpeg path config + helpers
├── queues/
│   └── definitions.ts              # Queue definitions (Phase 1)
├── workers/
│   ├── analysis.worker.ts          # Step 1: Gemini analysis
│   ├── frame-generation.worker.ts  # Step 2: Flux Pro polling
│   ├── video-synthesis.worker.ts   # Step 3: Kling submission + webhook wait
│   └── post-processing.worker.ts   # Step 4: FFmpeg concat + subtitle
├── webhooks/                       # Called by Next.js route handler
│   └── kling.handler.ts            # Webhook receiver logic (enqueues post-processing)
└── stalled-poller.ts               # Detects jobs stuck >15 min, polls fal.ai status
```

```
src/app/api/
├── jobs/
│   └── route.ts                    # POST: submit job → enqueue, return 202
├── status/
│   └── [jobId]/route.ts            # GET: SSE stream via Supabase Realtime
└── webhooks/
    └── kling/route.ts              # POST: fal.ai callback receiver
```

---

### Pattern 1: Gemini 2.5 Flash Video Analysis (AI-01, AI-10)

**What:** Upload reference TikTok video via Files API, call `generateContent` with `responseSchema` for structured storyboard JSON.

**Token cost:** ~300 tokens/second at default resolution (258 tokens/frame at 1 FPS + 32 tokens/second audio). A 90-second video = ~27,000 input tokens. Gemini 2.5 Flash pricing: $0.30/1M input tokens → ~$0.008 per 90s video analysis.

**Cap enforcement (AI-10):** Download video, check duration before upload. If `duration > 90`, reject with error message. Store `usageMetadata.promptTokenCount + candidatesTokenCount` in `job_steps.metadata` after each call.

**Source:** Official Google AI docs (`ai.google.dev/gemini-api/docs/video-understanding`), `@google/genai` SDK v1.49.0

```typescript
// worker/workers/analysis.worker.ts
// Source: https://ai.google.dev/gemini-api/docs/video-understanding
import { GoogleGenAI, createUserContent, createPartFromUri } from '@google/genai'
import { StoryboardSchema } from '../schemas/storyboard.js'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function analyzeVideo(videoUrl: string, jobId: string) {
  // Step 1: Upload to Files API
  const uploadedFile = await ai.files.upload({
    file: videoUrl,      // can be a URL or local path
    config: { mimeType: 'video/mp4' },
  })

  // Step 2: Wait for processing state = ACTIVE
  let file = await ai.files.get(uploadedFile.name)
  while (file.state === 'PROCESSING') {
    await new Promise(r => setTimeout(r, 5000))
    file = await ai.files.get(uploadedFile.name)
  }
  if (file.state === 'FAILED') throw new Error('Gemini file processing failed')

  // Step 3: Analyze with structured output
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: createUserContent([
      createPartFromUri(file.uri!, file.mimeType!),
      STORYBOARD_PROMPT,
    ]),
    config: {
      responseSchema: StoryboardSchema,  // zod schema → JSON schema
      temperature: 0.2,
    },
  })

  // Step 4: Log token usage (AI-10, QC-05)
  const usage = response.usageMetadata
  await logCost(jobId, {
    inputTokens: usage?.promptTokenCount ?? 0,
    outputTokens: usage?.candidatesTokenCount ?? 0,
    model: 'gemini-2.5-flash',
  })

  return JSON.parse(response.text!)
}

const STORYBOARD_PROMPT = `Analyze this TikTok video and return a structured storyboard JSON.
Extract:
- hook_type: "question" | "statement" | "demo" | "story" | "shock"
- scene_count: number of distinct scenes (max 6)
- pacing: "fast" (<3s/scene) | "medium" (3-6s) | "slow" (>6s)
- cta_position: "early" | "middle" | "end"
- emotional_arc: array of emotions per scene
- scenes: array of {index, description, duration_seconds, caption_text}
Return ONLY valid JSON matching the schema.`
```

**Storyboard schema (Zod, for both validation and responseSchema):**
```typescript
// worker/schemas/storyboard.ts
import { z } from 'zod'
export const StoryboardSchema = z.object({
  hook_type: z.enum(['question', 'statement', 'demo', 'story', 'shock']),
  scene_count: z.number().min(1).max(6),
  pacing: z.enum(['fast', 'medium', 'slow']),
  cta_position: z.enum(['early', 'middle', 'end']),
  emotional_arc: z.array(z.string()),
  scenes: z.array(z.object({
    index: z.number(),
    description: z.string(),
    duration_seconds: z.number(),
    caption_text: z.string(),
    prompt: z.string(),    // image generation prompt for this scene
  })),
})
export type Storyboard = z.infer<typeof StoryboardSchema>
```

---

### Pattern 2: Flux Pro Frame Generation — Queue + Exponential Backoff Polling (AI-02)

**Endpoint:** `fal-ai/flux-pro/v1.1`
**Input:** `prompt`, `image_size: "portrait_16_9"` (maps to 9:16), `seed`, `output_format: "jpeg"`
**Output:** `{ images: [{ url, width, height }], seed }`

**Source:** `fal.ai/models/fal-ai/flux-pro/v1.1/api` (verified 2026-04-12)

```typescript
// worker/workers/frame-generation.worker.ts
import { fal } from '@fal-ai/client'

const BACKOFF_SEQUENCE_MS = [5000, 10000, 20000, 40000, 60000]

export async function generateKeyframe(scene: StoryboardScene, jobId: string) {
  // Submit (returns immediately with request_id)
  const { request_id } = await fal.queue.submit('fal-ai/flux-pro/v1.1', {
    input: {
      prompt: scene.prompt,
      image_size: 'portrait_16_9',   // 9:16 vertical format
      seed: generateSeed(jobId, scene.index),
      output_format: 'jpeg',
      num_images: 1,
      safety_tolerance: '2',
    },
  })

  // Log for QC-02 reproducibility
  await logGenerationParams(jobId, scene.index, {
    model: 'fal-ai/flux-pro/v1.1',
    request_id,
    prompt: scene.prompt,
    seed: generateSeed(jobId, scene.index),
  })

  // Poll with exponential backoff (AI-02)
  for (const delay of BACKOFF_SEQUENCE_MS) {
    await new Promise(r => setTimeout(r, delay))
    const status = await fal.queue.status('fal-ai/flux-pro/v1.1', {
      requestId: request_id,
      logs: false,
    })
    if (status.status === 'COMPLETED') {
      const result = await fal.queue.result('fal-ai/flux-pro/v1.1', {
        requestId: request_id,
      })
      return result.data.images[0].url
    }
    if (status.status === 'FAILED') throw new Error(`Flux failed: ${request_id}`)
  }
  throw new Error(`Flux polling timeout after ${BACKOFF_SEQUENCE_MS.length} attempts`)
}
```

---

### Pattern 3: Kling 3.0 Video Synthesis — Webhook-First (AI-03, AI-05, AI-09)

**Endpoint:** `fal-ai/kling-video/v3/pro/image-to-video` (Pro tier, $0.112/second without audio)
**Standard tier:** `fal-ai/kling-video/v3/standard/image-to-video` ($0.084/second — use this for cost control)
**Input:** `start_image_url`, `prompt`, `duration: "5"` or `"10"`, `aspect_ratio: "9:16"`
**Output:** `{ video: { url, content_type, file_name, file_size } }`
**Max clip:** 10 seconds per request (AI-09)

**Source:** `fal.ai/models/fal-ai/kling-video/v3/pro/image-to-video` (verified 2026-04-12)

```typescript
// worker/workers/video-synthesis.worker.ts
import { fal } from '@fal-ai/client'

export async function submitKlingJob(
  imageUrl: string,
  prompt: string,
  jobId: string,
  sceneIndex: number,
) {
  // Check idempotency: if we already submitted this scene, return existing task_id
  const existing = await getExternalTaskId(jobId, sceneIndex)
  if (existing) return existing  // AI-06: don't double-submit

  const { request_id } = await fal.queue.submit(
    'fal-ai/kling-video/v3/standard/image-to-video',
    {
      input: {
        start_image_url: imageUrl,
        prompt,
        duration: '10',           // max 10s per clip (AI-09)
        aspect_ratio: '9:16',
        generate_audio: false,    // audio = 1.5x cost; disable until needed
        negative_prompt: 'blur, distort, low quality, shaky camera, text, watermark',
        cfg_scale: 0.5,
      },
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/kling`,
    }
  )

  // Store task_id for idempotency checks + stuck job detection (AI-05, AI-06)
  await storeExternalTaskId(jobId, sceneIndex, request_id)

  // Log generation params (QC-02)
  await logGenerationParams(jobId, sceneIndex, {
    model: 'fal-ai/kling-video/v3/standard/image-to-video',
    request_id,
    prompt,
    duration: 10,
  })

  // Worker returns here — webhook will advance to post-processing
  return request_id
}
```

---

### Pattern 4: fal.ai Webhook Handler — Signature Verification + Idempotency (AI-05)

**Webhook headers:**
- `X-Fal-Webhook-Request-Id` — unique request ID
- `X-Fal-Webhook-User-Id` — your fal.ai user ID
- `X-Fal-Webhook-Timestamp` — Unix epoch seconds
- `X-Fal-Webhook-Signature` — hex-encoded ED25519 signature

**JWKS endpoint:** `https://rest.fal.ai/.well-known/jwks.json` (cache up to 24 hours)

**Payload format:**
```json
{
  "request_id": "uuid",
  "gateway_request_id": "uuid",
  "status": "OK",
  "payload": { "video": { "url": "...", "content_type": "video/mp4", "file_size": 123 } }
}
```

**Delivery guarantee:** 15-second timeout per attempt, retries 10 times over 2 hours.

**Source:** `fal.ai/docs/model-apis/model-endpoints/webhooks` (verified 2026-04-12)

```typescript
// src/app/api/webhooks/kling/route.ts
import { NextRequest, NextResponse } from 'next/server'
import sodium from 'libsodium-wrappers'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const rawBody = await req.arrayBuffer()
  const body = Buffer.from(rawBody)

  // 1. Verify signature (AI-05)
  const requestId = req.headers.get('x-fal-webhook-request-id')!
  const userId = req.headers.get('x-fal-webhook-user-id')!
  const timestamp = req.headers.get('x-fal-webhook-timestamp')!
  const signatureHex = req.headers.get('x-fal-webhook-signature')!

  const isValid = await verifyFalWebhookSignature(requestId, userId, timestamp, signatureHex, body)
  if (!isValid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

  const payload = JSON.parse(body.toString())
  if (payload.status !== 'OK') {
    // Mark job_steps as failed, trigger refund
    await handleKlingFailure(payload.request_id)
    return NextResponse.json({ ok: true })
  }

  // 2. Idempotency check (AI-05): ON CONFLICT DO NOTHING
  const inserted = await upsertWebhookDelivery(payload.request_id)
  if (!inserted) return NextResponse.json({ ok: true })  // duplicate — already processed

  // 3. Download video from fal temp URL, upload to Supabase Storage
  const videoUrl = payload.payload.video.url
  await downloadAndStoreVideo(payload.request_id, videoUrl)

  // 4. Advance pipeline: enqueue post-processing
  await postProcessingQueue.add('post-process', { falRequestId: payload.request_id })

  return NextResponse.json({ ok: true })
}

// Cached JWKS to avoid fetching on every request
let jwksCache: { keys: any[]; fetchedAt: number } | null = null

async function verifyFalWebhookSignature(
  requestId: string, userId: string, timestamp: string,
  signatureHex: string, body: Buffer
): Promise<boolean> {
  await sodium.ready

  // Reject stale timestamps (±5 min tolerance)
  const ts = parseInt(timestamp)
  if (Math.abs(Date.now() / 1000 - ts) > 300) return false

  const bodyHash = crypto.createHash('sha256').update(body).digest('hex')
  const message = Buffer.from([requestId, userId, timestamp, bodyHash].join('\n'))
  const sig = Buffer.from(signatureHex, 'hex')

  // Refresh JWKS if >1 hour old
  if (!jwksCache || Date.now() - jwksCache.fetchedAt > 3600_000) {
    const r = await fetch('https://rest.fal.ai/.well-known/jwks.json')
    const { keys } = await r.json()
    jwksCache = { keys, fetchedAt: Date.now() }
  }

  for (const key of jwksCache.keys) {
    try {
      const pubKey = Buffer.from(key.x, 'base64url')
      if (sodium.crypto_sign_verify_detached(sig, message, pubKey)) return true
    } catch { continue }
  }
  return false
}
```

---

### Pattern 5: SSE Job Status Streaming (QUEUE-03)

**Architecture:** Worker writes to Supabase Realtime Broadcast channel `job:{jobId}`. Next.js SSE route subscribes to that channel and forwards events to browser via `ReadableStream`.

**Critical header:** `X-Accel-Buffering: no` prevents NGINX/Vercel from buffering the stream.

```typescript
// src/app/api/status/[jobId]/route.ts
// Source: https://nextjslaunchpad.com/article/nextjs-server-sent-events-real-time-notifications-progress-tracking-live-dashboards
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: { jobId: string } }) {
  const { jobId } = await params
  const supabase = await createClient()

  const stream = new ReadableStream({
    start(controller) {
      const channel = supabase
        .channel(`job:${jobId}`)
        .on('broadcast', { event: 'step_update' }, ({ payload }) => {
          const data = `data: ${JSON.stringify(payload)}\n\n`
          controller.enqueue(new TextEncoder().encode(data))
        })
        .subscribe()

      // Cleanup when client disconnects
      req.signal.addEventListener('abort', () => {
        channel.unsubscribe()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',  // CRITICAL: prevents NGINX buffering
    },
  })
}
```

**Worker broadcasts progress:**
```typescript
// Inside any worker step, after updating job_steps:
await supabase.channel(`job:${jobId}`).send({
  type: 'broadcast',
  event: 'step_update',
  payload: {
    step: 'frame_generation',
    status: 'running',
    progress: 3,      // scenes completed
    total: 6,
  },
})
```

---

### Pattern 6: FFmpeg Post-Processing (AI-04, QC-01)

**Setup in Dockerfile (worker):**
```dockerfile
# No system ffmpeg needed — ffmpeg-static provides the binary
```

```typescript
// worker/lib/ffmpeg.ts
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'

ffmpeg.setFfmpegPath(ffmpegStatic as string)
export { ffmpeg }
```

**Concat + subtitle burn + 9:16 output:**
```typescript
// worker/workers/post-processing.worker.ts
import { ffmpeg } from '../lib/ffmpeg.js'
import { promises as fs } from 'fs'
import path from 'path'

export async function postProcessVideo(
  clipPaths: string[],  // local temp paths, downloaded from Supabase Storage
  subtitleSrtPath: string,
  outputPath: string,
): Promise<void> {
  // Step 1: Write concat list file
  const concatFile = path.join(path.dirname(outputPath), 'concat.txt')
  const lines = clipPaths.map(p => `file '${p}'`).join('\n')
  await fs.writeFile(concatFile, lines)

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatFile)
      .inputOptions(['-f concat', '-safe 0'])
      .input(subtitleSrtPath)
      .videoFilters([
        // Scale to 1080x1920 (9:16), pad if needed
        'scale=1080:1920:force_original_aspect_ratio=increase',
        'crop=1080:1920',
        // Burn subtitles (ass filter for styled subtitles)
        `subtitles=${subtitleSrtPath}:force_style='FontSize=48,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2'`,
      ])
      .videoCodec('libx264')
      .outputOptions([
        '-preset fast',
        '-crf 23',
        '-pix_fmt yuv420p',    // ensures broad compatibility
        '-movflags +faststart', // enables streaming playback
      ])
      .audioCodec('aac')
      .audioBitrate('128k')
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run()
  })
}
```

**QC validation gate (QC-01):**
```typescript
// worker/lib/validate-output.ts
import { ffmpeg } from './ffmpeg.js'

export async function validateOutput(videoPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(new Error(`ffprobe failed: ${err.message}`))

      const { size } = require('fs').statSync(videoPath)
      if (size === 0) return reject(new Error('Output file is zero bytes'))

      const videoStream = metadata.streams.find(s => s.codec_type === 'video')
      if (!videoStream) return reject(new Error('No video stream found'))

      const { width, height } = videoStream
      if (width !== 1080 || height !== 1920) {
        return reject(new Error(`Wrong resolution: ${width}x${height}, expected 1080x1920`))
      }

      const duration = parseFloat(metadata.format.duration ?? '0')
      if (duration < 1) return reject(new Error(`Duration too short: ${duration}s`))

      resolve()
    })
  })
}
```

---

### Pattern 7: Stalled Job Detection (AI-06)

BullMQ marks a job stalled if the worker fails to renew its lock within `lockDuration`. The Phase 1 scaffold already sets `lockDuration: 20 * 60 * 1000` (20 minutes). Add a second layer: a polling loop that checks jobs stuck in `waiting_external` state for >15 minutes.

```typescript
// worker/stalled-poller.ts
// Runs on a setInterval (every 5 minutes) alongside the main workers

import { fal } from '@fal-ai/client'

async function checkStalledJobs() {
  const stalledSteps = await supabase
    .from('job_steps')
    .select('*')
    .eq('status', 'waiting_external')
    .lt('started_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())

  for (const step of stalledSteps.data ?? []) {
    const taskId = step.metadata?.fal_request_id
    if (!taskId) continue

    try {
      const status = await fal.queue.status(step.metadata.model_endpoint, {
        requestId: taskId,
        logs: false,
      })
      if (status.status === 'COMPLETED') {
        // Webhook was missed — manually advance pipeline
        await advanceStalledJob(step, status)
      } else if (status.status === 'FAILED') {
        await markStepFailed(step, 'Upstream job failed (detected by stalled poller)')
      }
    } catch (e) {
      console.error(`[stalled-poller] Error checking ${taskId}:`, e)
    }
  }
}

setInterval(checkStalledJobs, 5 * 60 * 1000)
```

---

### Pattern 8: Hook Variant Engine (AI-08)

Generate N different hook scripts (first-3-second narrative), each attached to the same body structure. This is a Gemini prompt design problem, not a separate API call.

```typescript
// In the analysis worker, after extracting storyboard:
async function generateHookVariants(
  storyboard: Storyboard,
  variantCount: number,   // 3-5
  productContext: string,
) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: createUserContent([
      `Generate ${variantCount} different hook variants for this product video.
       Base storyboard hook_type: ${storyboard.hook_type}
       Product context: ${productContext}
       
       Each variant should have a DIFFERENT opening 3-second script (first scene only).
       Keep scenes 2-${storyboard.scene_count} identical.
       
       Return JSON array of ${variantCount} objects, each with:
       - hook_script: string (3-second narration text)
       - hook_prompt: string (image generation prompt for the opening scene)
       - hook_type: one of question|statement|demo|story|shock`,
    ]),
    config: { responseSchema: HookVariantsSchema },
  })
  return JSON.parse(response.text!)
}
```

Each hook variant becomes its own first-scene clip (different `start_image_url` from Flux, same Kling job for remaining scenes). Final FFmpeg step produces N MP4s (one per variant), where variant N = variant_clip_0 + shared_clips_1_through_N.

---

### Pattern 9: Job Submission API (QUEUE-02, QUEUE-04)

```typescript
// src/app/api/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { videoAnalysisQueue } from '@/lib/queues'  // shared Queue instances

export async function POST(req: NextRequest) {
  const { productName, referenceVideoUrl, hookVariantCount } = await req.json()

  // Per-user concurrency check (QUEUE-04)
  const activeCount = await getActiveJobCount(userId)
  if (activeCount >= 3) {
    return NextResponse.json({ error: 'Max concurrent jobs reached' }, { status: 429 })
  }

  // Global depth check (QUEUE-05)
  const counts = await videoAnalysisQueue.getJobCounts('active', 'waiting')
  const total = counts.active + counts.waiting
  if (total >= GLOBAL_QUEUE_LIMIT) {
    return NextResponse.json(
      { error: 'Queue at capacity' },
      {
        status: 429,
        headers: { 'Retry-After': '300' },
      }
    )
  }

  // Write job record
  const { data: job } = await supabase.from('jobs').insert({
    org_id: orgId,
    status: 'queued',
    reference_video_url: referenceVideoUrl,
    product_name: productName,
  }).select().single()

  // Enqueue (QUEUE-02: returns 202 immediately)
  await videoAnalysisQueue.add('analyze', {
    jobId: job.id,
    referenceVideoUrl,
    productName,
    hookVariantCount: hookVariantCount ?? 3,
  })

  return NextResponse.json({ jobId: job.id }, { status: 202 })
}
```

---

### Pattern 10: BullMQ Step-by-Step Enqueue (not FlowProducer)

**Why not FlowProducer:** FlowProducer is designed for jobs where children can run concurrently, then parent waits. Our pipeline is strictly sequential AND separated by external async gaps (webhook waits). Using FlowProducer would require the parent job to hold its lock through an entire Kling generation (3-10 min), which defeats the purpose.

**Instead: each worker enqueues the next queue when done:**

```typescript
// In analysis.worker.ts, after successful Gemini analysis:
await job_steps_update(jobId, 'analysis', 'complete', { storyboard })
await frameGenerationQueue.add('generate-frames', { jobId, storyboard })

// In frame-generation.worker.ts, after all keyframes done:
await job_steps_update(jobId, 'frame_generation', 'complete', { frameUrls })
await videoSynthesisQueue.add('synthesize-video', { jobId, frameUrls, storyboard })

// In video-synthesis.worker.ts, after Kling submission:
await job_steps_update(jobId, 'video_synthesis', 'waiting_external', { falRequestIds })
// Worker returns — webhook handler will enqueue post-processing

// In kling webhook handler, after validation:
await postProcessingQueue.add('post-process', { jobId })
```

Each step stores its output in `job_steps.output` (JSONB). Next step reads from `job_steps` by `job_id` + `step` name — no in-memory passing needed, fully resumable.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Webhook signature verification | Custom HMAC logic | `libsodium-wrappers` + fal.ai JWKS | fal.ai uses ED25519 (not HMAC) — wrong algorithm = false positive every time |
| FFmpeg invocation | Raw `exec('ffmpeg ...')` | `fluent-ffmpeg` + `ffmpeg-static` | Handles paths, escaping, streaming, events; `exec` breaks on spaces in temp paths |
| Video analysis schema validation | Manual JSON.parse + if-checks | Zod schema + Gemini `responseSchema` | Gemini will hallucinate field names without schema enforcement; zod catches it |
| Polling with fixed intervals | `setInterval` inside worker | BullMQ `job.moveToDelayed()` or simple exponential backoff array | `setInterval` holds the job lock for the full polling window, wasting Redis commands |
| Webhook deduplication | In-memory Set | `ON CONFLICT DO NOTHING` on `fal_request_id` in DB | In-memory survives only one process restart; DB constraint is durable |
| FFmpeg binary management | System `apt-get install ffmpeg` in Dockerfile | `ffmpeg-static` npm package | `ffmpeg-static` bundles a static binary = reproducible, no OS dependency |

**Key insight:** Every hand-rolled solution in this pipeline introduces a failure surface. The domain (async AI + video processing) has enough inherent complexity — use proven abstractions everywhere.

---

## Common Pitfalls

### Pitfall 1: Kling Webhook 15-Second Delivery Timeout
**What goes wrong:** Your webhook handler does heavy work (downloading video, uploading to Supabase Storage) before returning 200. fal.ai's 15-second delivery window expires. They retry 10 times over 2 hours — but each retry triggers duplicate processing.
**Why it happens:** Developers treat webhook handlers like synchronous API handlers.
**How to avoid:** Return 200 immediately after writing the idempotency key. Then process async. Pattern: insert to a `webhook_queue` table or enqueue a BullMQ job, then return 200.
**Warning signs:** Supabase Storage contains multiple copies of the same video clip.

### Pitfall 2: Gemini Files API — File State Must Be ACTIVE Before generateContent
**What goes wrong:** Upload returns immediately, but the file takes 5-30 seconds to reach `state: "ACTIVE"`. Calling `generateContent` with a `PROCESSING` file returns an error.
**Why it happens:** Developers assume `upload()` = ready. It is not.
**How to avoid:** Poll `ai.files.get(file.name)` until `state === 'ACTIVE'`. See Pattern 1 above.
**Warning signs:** `Error: File is still being processed` from Gemini.

### Pitfall 3: Flux Pro `image_size` Enum vs Custom Object
**What goes wrong:** Passing `image_size: "9:16"` (the aspect_ratio string format) instead of `image_size: "portrait_16_9"` (the enum value). fal.ai returns 400.
**Why it happens:** Kling uses `aspect_ratio: "9:16"` format; Flux uses a named enum. They look similar but are incompatible.
**How to avoid:** For 9:16 vertical output from Flux: `image_size: "portrait_16_9"`. For custom resolution: `image_size: { width: 1080, height: 1920 }`.
**Warning signs:** 400 error on Flux submission with "invalid enum value".

### Pitfall 4: FFmpeg Subtitle Filter Fails If Path Contains Spaces or Colons
**What goes wrong:** `subtitles=/tmp/my job-123/sub.srt` fails because the colon in path prefix confuses the filter parser.
**Why it happens:** FFmpeg filter syntax uses `:` as option separator.
**How to avoid:** Use `job.id` (UUID, no spaces/colons) as the temp directory name. Escape colons: `subtitles=path\\:to\\:file.srt` on some platforms.
**Warning signs:** `Invalid option ... in AVFilter` error from fluent-ffmpeg.

### Pitfall 5: BullMQ Worker `lockDuration` vs Actual Job Time
**What goes wrong:** Post-processing worker downloads clips (10-60s each × 6 clips), runs FFmpeg (30-120s), uploads result. Total: up to 10 minutes. If `lockDuration` is the default 30 seconds, the job is stolen by another worker mid-FFmpeg.
**Why it happens:** Default `lockDuration: 30000` was set for fast jobs.
**How to avoid:** Phase 1 scaffold already sets `lockDuration: 20 * 60 * 1000`. Confirm this covers the worst case. FFmpeg on a 6-clip sequence on Railway 512MB should complete in under 15 minutes.
**Warning signs:** Same video appears in the processing queue twice.

### Pitfall 6: Supabase Realtime Broadcast Requires Auth for Private Channels
**What goes wrong:** SSE route creates a `job:{jobId}` Broadcast channel but the user's Supabase session is service-role (from worker). Browser subscription fails auth check.
**Why it happens:** Broadcast channels can be public or private. Private channels require the user's JWT.
**How to avoid:** Use `schema: 'broadcast'` + `private: false` for job status channels (job IDs are UUIDs, hard to guess). Or pass user JWT to SSE route and subscribe with user credentials.
**Warning signs:** SSE connection opens but no events arrive.

### Pitfall 7: fal.ai Temp URLs Expire
**What goes wrong:** Kling returns a video at `v3b.fal.media/files/...`. If you store this URL in Supabase and serve it later, it expires within hours.
**Why it happens:** fal.ai temp URLs are not permanent storage.
**How to avoid:** Download from fal temp URL and re-upload to Supabase Storage within the webhook handler (within 15-second window is fine for metadata; actual download in the BullMQ post-processor).
**Warning signs:** Users report "video not found" errors on videos > a few hours old.

---

## Code Examples

### Generate SRT Subtitles from Storyboard
```typescript
// worker/lib/generate-srt.ts
export function generateSrt(scenes: StoryboardScene[]): string {
  let timeOffset = 0
  return scenes.map((scene, i) => {
    const start = formatSrtTime(timeOffset)
    timeOffset += scene.duration_seconds
    const end = formatSrtTime(timeOffset)
    return `${i + 1}\n${start} --> ${end}\n${scene.caption_text}\n`
  }).join('\n')
}

function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`
}

function pad(n: number, width = 2) { return String(n).padStart(width, '0') }
```

### BullMQ Worker Registration (Phase 2 extension of Phase 1 scaffold)
```typescript
// worker/index.ts — extend Phase 1 scaffold
import { Worker } from 'bullmq'
import { connection } from './lib/redis.js'
import { runAnalysis } from './workers/analysis.worker.js'
import { runFrameGeneration } from './workers/frame-generation.worker.js'
import { runVideoSynthesis } from './workers/video-synthesis.worker.js'
import { runPostProcessing } from './workers/post-processing.worker.js'

const analysisWorker = new Worker('video-analysis', runAnalysis, {
  connection, concurrency: 3, lockDuration: 20 * 60 * 1000,
})
const frameWorker = new Worker('frame-generation', runFrameGeneration, {
  connection, concurrency: 5, lockDuration: 10 * 60 * 1000,
})
const synthesisWorker = new Worker('video-synthesis', runVideoSynthesis, {
  connection, concurrency: 2, lockDuration: 5 * 60 * 1000,  // just submits to Kling
})
const postWorker = new Worker('post-processing', runPostProcessing, {
  connection, concurrency: 2, lockDuration: 20 * 60 * 1000,  // FFmpeg can be slow
})
```

### Gemini Analysis Result Cache Check (AI-07)
```typescript
// Before calling Gemini:
async function getOrAnalyzeVideo(videoUrl: string, jobId: string) {
  // Check cache: same URL analyzed before?
  const { data: cached } = await supabase
    .from('job_steps')
    .select('output')
    .eq('step', 'analysis')
    .eq('status', 'complete')
    .contains('metadata', { source_video_url: videoUrl })
    .limit(1)
    .single()

  if (cached?.output) {
    console.log(`[analysis] cache hit for ${videoUrl}`)
    return cached.output  // reuse storyboard
  }

  return analyzeVideo(videoUrl, jobId)
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Direct Kling API ($1,400 deposit) | Kling via fal.ai (PAYG $0.084/s) | fal.ai added Kling 3.0 in 2025 | Accessible without large upfront cost |
| Gemini 1.5 Pro for video | Gemini 2.5 Flash | March 2026 | Cheaper, faster; Flash has same video capability at lower cost |
| `@google/generative-ai` (deprecated) | `@google/genai` v1.49.0 | 2025 | New SDK unifies Gemini + Vertex AI; old package still works but unmaintained |
| Kling 2.1 standard | Kling v3 standard/pro | 2025-2026 | v3 = Kling 3.0; cinematic quality, native audio support |
| Polling for webhook-capable APIs | Webhook-first for Kling | Current best practice | Eliminates persistent Redis poll overhead |
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2024 | Old package deprecated; `@supabase/ssr` is the SSR-native replacement |

**Deprecated/outdated:**
- `@google/generative-ai`: deprecated in favor of `@google/genai`. Do not use in new code.
- Kling 1.x endpoints (`fal-ai/kling-video/v1.6/...`): superseded by v2.1 and v3.
- BullMQ `Bull` (legacy): do not confuse with `BullMQ`. Different package.

---

## Open Questions

1. **Kling Standard vs Pro endpoint for this project**
   - What we know: Standard = $0.084/s, Pro = $0.112/s (33% premium). Both support 9:16, 10s clips, webhooks.
   - What's unclear: Quality difference at 10s clips in real product video tests.
   - Recommendation: Default to Standard in Phase 2 (can be changed per-job later). Hard-code in config; do not expose as user choice yet.

2. **Gemini Files API: URL vs local file upload**
   - What we know: SDK supports both file paths and URLs in `ai.files.upload()`. For reference TikTok URLs, the file must be downloadable.
   - What's unclear: Whether fal.ai-hosted video URLs (no `Content-Disposition`) work directly.
   - Recommendation: Download reference video to worker temp storage first, then upload to Files API. Avoids auth/CORS issues with external URLs.

3. **Supabase Realtime channel billing on free tier**
   - What we know: Supabase Pro includes Realtime. Broadcast is free for message delivery.
   - What's unclear: Max concurrent channel connections on Pro tier.
   - Recommendation: Acceptable for Phase 2; revisit at 50+ concurrent users.

4. **FFmpeg memory on Railway 512MB instance**
   - What we know: A 6-clip concat (6 × 10s MP4 at ~30MB each) = 180MB input. FFmpeg typically uses 1-2x input size in working memory.
   - What's unclear: Whether 512MB Railway instance handles peak load with 2 concurrent post-processing jobs.
   - Recommendation: Set `concurrency: 1` on post-processing worker initially. Upgrade Railway instance if needed.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js 22 | Worker runtime | Verified in Dockerfile | 22-slim | — |
| ffmpeg-static | AI-04 post-processing | npm install (no system dep) | 5.3.0 | — |
| Upstash Redis | BullMQ backend | Configured in Phase 1 | Fixed plan | — |
| Supabase | Auth, DB, Storage, Realtime | Configured in Phase 1 | Pro tier | — |
| fal.ai API key | AI-02, AI-03 | FAL_KEY in env (Phase 1) | — | — |
| Gemini API key | AI-01 | New env var GEMINI_API_KEY | — | — |
| Railway | Worker hosting | Phase 1 Dockerfile ready | — | — |

**Missing dependencies with no fallback:**
- `GEMINI_API_KEY` — must be added to Railway environment variables before Phase 2 deploy

**Missing dependencies with fallback:**
- None blocking in current environment

---

## Validation Architecture

The project uses vitest (installed in Phase 1 as dev dependency). Phase 2 has significant pure-logic functions suitable for unit testing: storyboard schema validation, SRT generation, FFmpeg argument construction, webhook signature verification, and cost calculation.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest (installed in Phase 1 package.json devDependencies) |
| Config file | `vitest.config.ts` — Wave 0 gap (needs creation) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AI-01 | Storyboard schema validates Gemini output | unit | `npx vitest run tests/storyboard.test.ts` | ❌ Wave 0 |
| AI-04 | SRT subtitle generation from storyboard | unit | `npx vitest run tests/srt.test.ts` | ❌ Wave 0 |
| AI-05 | Webhook signature verification rejects invalid sig | unit | `npx vitest run tests/webhook-sig.test.ts` | ❌ Wave 0 |
| AI-08 | Hook variant count respects 3-5 range | unit | `npx vitest run tests/hook-variants.test.ts` | ❌ Wave 0 |
| AI-10 | Token cost calculation correct at 90s | unit | `npx vitest run tests/cost-calc.test.ts` | ❌ Wave 0 |
| QC-01 | Output validator rejects zero-byte file | unit | `npx vitest run tests/validate-output.test.ts` | ❌ Wave 0 |
| QUEUE-02 | Job submission returns 202 with jobId | integration | manual API test | — |
| AI-03 | Kling webhook advances pipeline | integration | manual with ngrok | — |

### Wave 0 Gaps
- [ ] `vitest.config.ts` — base config referencing jsdom environment
- [ ] `tests/storyboard.test.ts` — validates zod schema against sample Gemini outputs
- [ ] `tests/srt.test.ts` — `generateSrt()` produces valid SRT timestamp format
- [ ] `tests/webhook-sig.test.ts` — `verifyFalWebhookSignature()` with known-good and tampered payloads
- [ ] `tests/cost-calc.test.ts` — token math at 300 tokens/second × 90s

---

## Sources

### Primary (HIGH confidence)
- `fal.ai/models/fal-ai/kling-video/v3/pro/image-to-video/api` — Kling v3 Pro endpoint ID, input schema, output schema, queue submission pattern (verified 2026-04-12)
- `fal.ai/models/fal-ai/kling-video/v3/standard/image-to-video` — Standard tier pricing $0.084/s
- `fal.ai/models/fal-ai/flux-pro/v1.1/api` — Flux Pro endpoint ID, `portrait_16_9` image_size enum, queue submission (verified 2026-04-12)
- `fal.ai/docs/model-apis/model-endpoints/webhooks` — Webhook payload structure, X-Fal-Webhook-Signature verification, JWKS endpoint, 15s timeout + 10 retries (verified 2026-04-12)
- `ai.google.dev/gemini-api/docs/video-understanding` — Files API upload flow, 300 tokens/second cost, 1-hour max video, `responseSchema` support (verified 2026-04-12)
- `@google/genai` npm v1.49.0 — current official SDK (verified 2026-04-12)
- `ffmpeg-static` npm v5.3.0, `fluent-ffmpeg` npm v2.1.3 — verified 2026-04-12
- `docs.bullmq.io/patterns/process-step-jobs` — step state machine pattern with `job.updateData()`
- `docs.bullmq.io/guide/workers/stalled-jobs` — `lockDuration`, `stalledInterval` configuration

### Secondary (MEDIUM confidence)
- `nextjslaunchpad.com/article/nextjs-server-sent-events-real-time-notifications-progress-tracking-live-dashboards` — Next.js 15 App Router SSE with `ReadableStream`, `X-Accel-Buffering: no` header
- `oneuptime.com/blog/post/2026-01-21-bullmq-stalled-jobs/view` — stalled job detection patterns (Jan 2026)
- `supabase.com/docs/guides/realtime/broadcast` — Broadcast channel pattern for job status

### Tertiary (LOW confidence — verify before using)
- fal.ai Kling v3 Standard endpoint pricing at $0.084/s — verify against fal.ai pricing page before billing integration (prices change)

---

## Metadata

**Confidence breakdown:**
- Standard stack (library versions): HIGH — all npm versions verified against registry 2026-04-12
- Kling v3 endpoint IDs: HIGH — verified against live fal.ai model pages
- Gemini Files API flow: HIGH — verified against official Google AI docs
- FFmpeg commands: HIGH — standard FFmpeg concat demuxer + subtitle filter; community-verified
- fal.ai webhook signature: HIGH — JWKS endpoint and ED25519 algorithm verified from official docs
- BullMQ step chaining pattern: MEDIUM — step-by-step enqueue is well-documented; FlowProducer alternative is possible but adds complexity
- SSE via Supabase Realtime Broadcast: MEDIUM — pattern works; exact Next.js 15 integration requires testing for abort signal cleanup

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (fal.ai pricing and endpoint IDs can change; verify before billing integration)
