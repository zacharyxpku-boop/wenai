import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { videoAnalysisQueue, getGlobalQueueDepth, GLOBAL_QUEUE_LIMIT } from '@/lib/queues'
import { z } from 'zod'

const jobRequestSchema = z.object({
  productName: z.string().min(1).max(200),
  referenceVideoUrl: z.string().url(),
  hookVariantCount: z.number().min(1).max(5).default(3),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = jobRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { productName, referenceVideoUrl, hookVariantCount } = parsed.data
  const orgId = user.app_metadata?.org_id

  // QUEUE-04: Per-user concurrent job cap (max 3)
  const { count } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .in('status', ['queued', 'processing'])

  if ((count ?? 0) >= 3) {
    return NextResponse.json(
      { error: 'Max 3 concurrent jobs. Wait for current jobs to finish.' },
      { status: 429 },
    )
  }

  // QUEUE-05: Global queue depth limit
  const depth = await getGlobalQueueDepth()
  if (depth >= GLOBAL_QUEUE_LIMIT) {
    return NextResponse.json(
      { error: 'System at capacity. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': '300' } },
    )
  }

  // Create job record in DB
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .insert({
      org_id: orgId,
      status: 'queued',
      product_name: productName,
      reference_video_url: referenceVideoUrl,
    })
    .select('id')
    .single()

  if (jobError || !job) {
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }

  // Create initial job_steps records for all 4 pipeline stages
  await supabase.from('job_steps').insert([
    { job_id: job.id, org_id: orgId, step: 'analysis', status: 'pending' },
    { job_id: job.id, org_id: orgId, step: 'frame_generation', status: 'pending' },
    { job_id: job.id, org_id: orgId, step: 'video_synthesis', status: 'pending' },
    { job_id: job.id, org_id: orgId, step: 'post_processing', status: 'pending' },
  ])

  // QUEUE-02: Enqueue and return 202 immediately (non-blocking)
  await videoAnalysisQueue.add('analyze', {
    jobId: job.id,
    orgId,
    referenceVideoUrl,
    productName,
    hookVariantCount,
  })

  return NextResponse.json({ jobId: job.id }, { status: 202 })
}
