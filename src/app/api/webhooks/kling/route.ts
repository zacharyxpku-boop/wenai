import { NextRequest, NextResponse } from 'next/server'
import sodium from 'libsodium-wrappers'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { postProcessingQueue } from '@/lib/queues'

// Lazy singleton: defer creation to first request so Next.js build phase (no env vars) doesn't throw
let _supabase: ReturnType<typeof createClient> | null = null
function getSupabase(): ReturnType<typeof createClient> {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
  }
  return _supabase
}

// Explicit result type for job step lookups (avoids Supabase untyped client 'never' issue)
type JobStepResult = {
  id: string
  status: string
  job_id: string
  org_id: string
}

// Module-level JWKS cache (refreshed every hour)
let jwksCache: { keys: Array<{ x: string; [key: string]: unknown }>; fetchedAt: number } | null =
  null

export async function POST(req: NextRequest) {
  const rawBody = await req.arrayBuffer()
  const body = Buffer.from(rawBody)

  // 1. Extract and validate required fal.ai webhook headers
  const requestId = req.headers.get('x-fal-webhook-request-id')
  const userId = req.headers.get('x-fal-webhook-user-id')
  const timestamp = req.headers.get('x-fal-webhook-timestamp')
  const signatureHex = req.headers.get('x-fal-webhook-signature')

  if (!requestId || !userId || !timestamp || !signatureHex) {
    return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400 })
  }

  // 2. Verify ED25519 signature (AI-05)
  const isValid = await verifyFalSignature(requestId, userId, timestamp, signatureHex, body)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(body.toString()) as {
    request_id: string
    status: string
    payload?: { video?: { url: string } }
  }

  // 3. Idempotency: look up the step by fal_request_id stored in metadata (AI-05)
  // Use explicit type narrowing to avoid Supabase untyped client returning 'never'
  const supabase = getSupabase()
  const stepRes = await supabase
    .from('job_steps')
    .select('id, status, job_id, org_id')
    .eq('step', 'video_synthesis')
    .filter('metadata->>fal_request_id', 'eq', payload.request_id)
    .limit(1)

  const existingStep = ((stepRes.data ?? []) as JobStepResult[])[0] ?? null

  if (!existingStep) {
    // Unknown request_id — stale or unrelated delivery, ignore safely
    return NextResponse.json({ ok: true })
  }

  // Already processed — idempotent early return
  if (existingStep.status === 'complete' || existingStep.status === 'failed') {
    return NextResponse.json({ ok: true })
  }

  if (payload.status !== 'OK') {
    // Mark step as failed and return
    // Untyped Supabase client (no generated schema) — update payload typed via cast
    const failUpdate = { status: 'failed', error: `Kling failed: ${payload.status}`, completed_at: new Date().toISOString() }
    await supabase.from('job_steps').update(failUpdate as never).eq('id', existingStep.id)
    return NextResponse.json({ ok: true })
  }

  // 4. Store video URL in step output and mark complete
  const videoUrl = payload.payload?.video?.url
  const successUpdate = { status: 'complete', output: { fal_video_url: videoUrl, fal_request_id: payload.request_id }, completed_at: new Date().toISOString() }
  await supabase.from('job_steps').update(successUpdate as never).eq('id', existingStep.id)

  // 5. Enqueue post-processing — do NOT download video inline (15s deadline)
  await postProcessingQueue.add('post-process', {
    jobId: existingStep.job_id,
    orgId: existingStep.org_id,
    falVideoUrl: videoUrl,
    falRequestId: payload.request_id,
  })

  // Return 200 fast — fal.ai requires response within 15 seconds
  return NextResponse.json({ ok: true })
}

async function verifyFalSignature(
  requestId: string,
  userId: string,
  timestamp: string,
  signatureHex: string,
  body: Buffer,
): Promise<boolean> {
  await sodium.ready

  // Reject stale timestamps (5-minute tolerance)
  const ts = parseInt(timestamp, 10)
  if (Math.abs(Date.now() / 1000 - ts) > 300) return false

  // Build canonical message: requestId + userId + timestamp + sha256(body)
  const bodyHash = crypto.createHash('sha256').update(body).digest('hex')
  const message = Buffer.from([requestId, userId, timestamp, bodyHash].join('\n'))
  const sig = Buffer.from(signatureHex, 'hex')

  // Refresh JWKS if cache is stale (>1 hour)
  if (!jwksCache || Date.now() - jwksCache.fetchedAt > 3_600_000) {
    const r = await fetch('https://rest.fal.ai/.well-known/jwks.json')
    const { keys } = (await r.json()) as {
      keys: Array<{ x: string; [key: string]: unknown }>
    }
    jwksCache = { keys, fetchedAt: Date.now() }
  }

  // Try each public key in the JWKS until one verifies
  for (const key of jwksCache.keys) {
    try {
      const pubKey = Buffer.from(key.x, 'base64url')
      if (sodium.crypto_sign_verify_detached(sig, message, pubKey)) return true
    } catch {
      continue
    }
  }
  return false
}
