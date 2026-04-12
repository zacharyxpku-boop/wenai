import { fal } from '@fal-ai/client'
import { supabase } from './lib/supabase.js'
import { postProcessingQueue } from './queues/definitions.js'
import { updateStepStatus, broadcastProgress } from './lib/step-helpers.js'

const STALLED_THRESHOLD_MS = 15 * 60 * 1000  // 15 minutes
const POLL_INTERVAL_MS = 5 * 60 * 1000        // check every 5 minutes

async function checkStalledJobs() {
  const cutoff = new Date(Date.now() - STALLED_THRESHOLD_MS).toISOString()

  // AI-06: Find jobs stuck in waiting_external for >15 minutes
  const { data: stalledSteps, error } = await supabase
    .from('job_steps')
    .select('id, job_id, org_id, step, metadata')
    .eq('status', 'waiting_external')
    .lt('started_at', cutoff)

  if (error || !stalledSteps?.length) return

  console.log(`[stalled-poller] found ${stalledSteps.length} stalled steps`)

  for (const step of stalledSteps) {
    const requestIds = (step.metadata as any)?.fal_request_ids ?? []
    if (!requestIds.length) continue

    let allComplete = true
    const clipUrls: Record<string, string> = {}

    for (const entry of requestIds) {
      try {
        const status = await fal.queue.status(
          'fal-ai/kling-video/v3/standard/image-to-video',
          { requestId: entry.requestId, logs: false },
        )

        if (status.status === 'COMPLETED') {
          // Webhook was missed — get result directly from fal.ai
          const result = await fal.queue.result(
            'fal-ai/kling-video/v3/standard/image-to-video',
            { requestId: entry.requestId },
          )
          clipUrls[`${entry.type}-${entry.index}`] = (result as any).data?.video?.url
        } else if (status.status === 'FAILED') {
          console.error(`[stalled-poller] clip ${entry.type}-${entry.index} failed upstream`)
          await updateStepStatus(step.job_id, step.org_id, 'video_synthesis', 'failed', {
            error: `Kling clip ${entry.type}-${entry.index} failed (detected by stalled poller)`,
          })
          await broadcastProgress(step.job_id, 'video_synthesis', 'failed')
          allComplete = false
          break
        } else {
          // Still processing — not actually stalled, just slow
          allComplete = false
        }
      } catch (e: any) {
        console.error(`[stalled-poller] error checking ${entry.requestId}:`, e.message)
        allComplete = false
      }
    }

    if (allComplete && Object.keys(clipUrls).length === requestIds.length) {
      console.log(`[stalled-poller] recovering stalled job ${step.job_id} — all clips complete`)

      // Update video_synthesis step to complete
      await updateStepStatus(step.job_id, step.org_id, 'video_synthesis', 'complete', {
        output: { recovered: true, clipUrls },
      })
      await broadcastProgress(step.job_id, 'video_synthesis', 'complete')

      // Enqueue post-processing (same as webhook handler would)
      await postProcessingQueue.add('post-process', {
        jobId: step.job_id,
        orgId: step.org_id,
      })
    }
  }
}

// Start polling on import
const intervalId = setInterval(checkStalledJobs, POLL_INTERVAL_MS)
console.log(`[stalled-poller] running every ${POLL_INTERVAL_MS / 1000}s, threshold: ${STALLED_THRESHOLD_MS / 1000}s`)

// Allow graceful shutdown
process.on('SIGTERM', () => clearInterval(intervalId))
process.on('SIGINT', () => clearInterval(intervalId))

// Run once immediately on startup
checkStalledJobs().catch(err => console.error('[stalled-poller] initial check failed:', err))
