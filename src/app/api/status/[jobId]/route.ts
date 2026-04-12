import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Verify job belongs to user's org
  const { data: job } = await supabase
    .from('jobs')
    .select('id')
    .eq('id', jobId)
    .eq('org_id', user.app_metadata?.org_id)
    .single()

  if (!job) {
    return new Response('Job not found', { status: 404 })
  }

  // Fetch initial state (all current step statuses)
  const { data: steps } = await supabase
    .from('job_steps')
    .select('step, status, started_at, completed_at')
    .eq('job_id', jobId)

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send initial snapshot so client doesn't wait for first update
      const initial = `data: ${JSON.stringify({ type: 'snapshot', steps })}\n\n`
      controller.enqueue(encoder.encode(initial))

      // Subscribe to live step updates via Supabase Realtime Broadcast
      const channel = supabase
        .channel(`job:${jobId}`)
        .on('broadcast', { event: 'step_update' }, ({ payload }) => {
          const data = `data: ${JSON.stringify({ type: 'update', ...payload })}\n\n`
          controller.enqueue(encoder.encode(data))
        })
        .subscribe()

      // Cleanup on client disconnect
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
      'X-Accel-Buffering': 'no', // prevents NGINX/Vercel from buffering SSE
    },
  })
}
