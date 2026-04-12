import { Job } from 'bullmq'
import { fal } from '@fal-ai/client'
import type { Storyboard } from '../schemas/storyboard.js'
import type { HookVariant } from '../schemas/hook-variants.js'
import { supabase } from '../lib/supabase.js'
import { updateStepStatus, broadcastProgress, logGenerationParams } from '../lib/step-helpers.js'
import { logCost } from '../lib/cost-logger.js'

// AI-03: Kling endpoint — Standard tier for cost control per research
const KLING_ENDPOINT = 'fal-ai/kling-video/v3/standard/image-to-video'
// AI-09: Max 10 seconds per clip
const MAX_CLIP_DURATION_S = 10

interface VideoSynJobData {
  jobId: string
  orgId: string
  storyboard: Storyboard
  hookVariants: HookVariant[]
  bodyFrameUrls: string[]  // keyframe URLs for scenes 1+
  hookFrameUrls: string[]  // keyframe URLs for hook variants (scene 0 replacements)
}

export async function runVideoSynthesis(job: Job<VideoSynJobData>) {
  const { jobId, orgId, storyboard, hookVariants, bodyFrameUrls, hookFrameUrls } = job.data

  await updateStepStatus(jobId, orgId, 'video_synthesis', 'running')
  await broadcastProgress(jobId, 'video_synthesis', 'running')

  // Webhook receives callbacks when each Kling clip completes
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/kling`

  try {
    const allRequestIds: Array<{ type: string; index: number; requestId: string; scene_key: string }> = []

    // Submit body scene clips (shared across all hook variants)
    for (let i = 0; i < bodyFrameUrls.length; i++) {
      const scene = storyboard.scenes[i + 1]  // body scenes start at index 1
      const clipDuration = Math.min(scene.duration_seconds, MAX_CLIP_DURATION_S)
      const sceneKey = `body-${scene.index}`

      const requestId = await submitKlingJob(
        bodyFrameUrls[i],
        scene.prompt,
        jobId,
        sceneKey,
        clipDuration,
        webhookUrl,
      )
      allRequestIds.push({ type: 'body', index: scene.index, requestId, scene_key: sceneKey })

      // QC-02: Log generation params
      await logGenerationParams(jobId, 'video_synthesis', {
        model: KLING_ENDPOINT,
        request_id: requestId,
        scene_key: sceneKey,
        prompt: scene.prompt,
        duration: clipDuration,
      })
      // QC-05: Log estimated cost (Standard tier ~$0.084/second)
      await logCost(jobId, 'video_synthesis', {
        model: KLING_ENDPOINT,
        videoSeconds: clipDuration,
        estimatedCostUsd: clipDuration * 0.084,
      })
    }

    // Submit hook variant clips (one per variant — replaces scene[0])
    for (let v = 0; v < hookFrameUrls.length; v++) {
      const variant = hookVariants[v]
      const hookDuration = Math.min(storyboard.scenes[0]?.duration_seconds ?? 3, MAX_CLIP_DURATION_S)
      const sceneKey = `hook-${v}`

      const requestId = await submitKlingJob(
        hookFrameUrls[v],
        variant.hook_prompt,
        jobId,
        sceneKey,
        hookDuration,
        webhookUrl,
      )
      allRequestIds.push({ type: 'hook', index: v, requestId, scene_key: sceneKey })

      await logGenerationParams(jobId, 'video_synthesis', {
        model: KLING_ENDPOINT,
        request_id: requestId,
        scene_key: sceneKey,
        prompt: variant.hook_prompt,
        duration: hookDuration,
      })
      await logCost(jobId, 'video_synthesis', {
        model: KLING_ENDPOINT,
        videoSeconds: hookDuration,
        estimatedCostUsd: hookDuration * 0.084,
      })
    }

    // Store all request IDs — webhook handler uses these to match callbacks
    // and will advance to post-processing when ALL clips are complete
    await updateStepStatus(jobId, orgId, 'video_synthesis', 'waiting_external', {
      metadata: {
        fal_request_ids: allRequestIds,
        total_clips: allRequestIds.length,
        completed_clips: 0,
      },
    })
    await broadcastProgress(jobId, 'video_synthesis', 'waiting_external', 0, allRequestIds.length)

    // Worker returns here — webhook handler advances pipeline to post-processing
  } catch (err: any) {
    await updateStepStatus(jobId, orgId, 'video_synthesis', 'failed', { error: err.message })
    await broadcastProgress(jobId, 'video_synthesis', 'failed')
    throw err
  }
}

async function submitKlingJob(
  imageUrl: string,
  prompt: string,
  jobId: string,
  sceneKey: string,
  durationSeconds: number,
  webhookUrl: string,
): Promise<string> {
  // AI-06: Idempotency check — don't re-submit if request already in flight
  const { data: existing } = await supabase
    .from('job_steps')
    .select('metadata')
    .eq('job_id', jobId)
    .eq('step', 'video_synthesis')
    .single()

  const existingIds = (existing?.metadata as any)?.fal_request_ids ?? []
  const alreadySubmitted = existingIds.find((r: any) => r.scene_key === sceneKey)
  if (alreadySubmitted) {
    console.log(`[video-syn] idempotent skip for ${sceneKey}: ${alreadySubmitted.requestId}`)
    return alreadySubmitted.requestId
  }

  // AI-09: Duration capped at 10s — Kling accepts "5" or "10" string values only
  const duration = durationSeconds <= 5 ? '5' : '10'

  const { request_id } = await fal.queue.submit(KLING_ENDPOINT, {
    input: {
      start_image_url: imageUrl,
      prompt,
      duration,                    // AI-09: "5" or "10" string, never exceeds 10s per clip
      aspect_ratio: '9:16',        // Kling uses aspect_ratio (different from Flux image_size enum)
      generate_audio: false,       // audio = ~1.5x cost penalty
      negative_prompt: 'blur, distort, low quality, shaky camera, text, watermark',
      cfg_scale: 0.5,
    },
    webhookUrl,                    // AI-03: webhook callback, NOT polling
  })

  return request_id
}
