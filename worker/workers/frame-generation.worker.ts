import { Job } from 'bullmq'
import { fal } from '@fal-ai/client'
import type { Storyboard, StoryboardScene } from '../schemas/storyboard.js'
import type { HookVariant } from '../schemas/hook-variants.js'
import { videoSynthesisQueue } from '../queues/definitions.js'
import { updateStepStatus, broadcastProgress, logGenerationParams } from '../lib/step-helpers.js'
import { logCost } from '../lib/cost-logger.js'

// AI-02: Exponential backoff sequence for Flux Pro polling
const BACKOFF_SEQUENCE_MS = [5000, 10000, 20000, 40000, 60000]

interface FrameGenJobData {
  jobId: string
  orgId: string
  storyboard: Storyboard
  hookVariants: HookVariant[]
  productName: string
}

export async function runFrameGeneration(job: Job<FrameGenJobData>) {
  const { jobId, orgId, storyboard, hookVariants } = job.data

  await updateStepStatus(jobId, orgId, 'frame_generation', 'running')
  await broadcastProgress(jobId, 'frame_generation', 'running', 0, storyboard.scenes.length + hookVariants.length)

  try {
    // Generate keyframes for body scenes (shared across all variants)
    // Skip scene[0] — hook variants replace the first scene
    const bodyScenes = storyboard.scenes.slice(1)
    const bodyFrameUrls: string[] = []

    for (let i = 0; i < bodyScenes.length; i++) {
      const scene = bodyScenes[i]
      const frameUrl = await generateKeyframe(scene, jobId, `body-${scene.index}`)
      bodyFrameUrls.push(frameUrl)
      await broadcastProgress(
        jobId,
        'frame_generation',
        'running',
        i + 1,
        bodyScenes.length + hookVariants.length,
      )
    }

    // Generate hook variant keyframes (one per variant, for scene[0] replacement)
    const hookFrameUrls: string[] = []
    for (let v = 0; v < hookVariants.length; v++) {
      const variant = hookVariants[v]
      const hookScene: StoryboardScene = {
        index: 0,
        description: variant.hook_script,
        duration_seconds: storyboard.scenes[0]?.duration_seconds ?? 3,
        caption_text: variant.hook_script,
        prompt: variant.hook_prompt,
      }
      const frameUrl = await generateKeyframe(hookScene, jobId, `hook-${v}`)
      hookFrameUrls.push(frameUrl)
      await broadcastProgress(
        jobId,
        'frame_generation',
        'running',
        bodyScenes.length + v + 1,
        bodyScenes.length + hookVariants.length,
      )
    }

    await updateStepStatus(jobId, orgId, 'frame_generation', 'complete', {
      output: { bodyFrameUrls, hookFrameUrls },
    })
    await broadcastProgress(jobId, 'frame_generation', 'complete')

    // Enqueue video synthesis — webhook handler advances post-processing
    await videoSynthesisQueue.add('synthesize-video', {
      jobId,
      orgId,
      storyboard,
      hookVariants,
      bodyFrameUrls,
      hookFrameUrls,
    })
  } catch (err: any) {
    await updateStepStatus(jobId, orgId, 'frame_generation', 'failed', { error: err.message })
    await broadcastProgress(jobId, 'frame_generation', 'failed')
    throw err
  }
}

async function generateKeyframe(
  scene: StoryboardScene,
  jobId: string,
  sceneKey: string,
): Promise<string> {
  // QC-02: Use deterministic seed from jobId + sceneKey for reproducibility
  const seed = hashToSeed(`${jobId}-${sceneKey}`)

  // AI-02: Submit to Flux Pro via fal.ai
  // IMPORTANT: use image_size: 'portrait_16_9' NOT '9:16' (Pitfall 3 — enum format not ratio format)
  const { request_id } = await fal.queue.submit('fal-ai/flux-pro/v1.1', {
    input: {
      prompt: scene.prompt,
      image_size: 'portrait_16_9', // 9:16 vertical — NOT aspect_ratio format
      seed,
      output_format: 'jpeg',
      num_images: 1,
      safety_tolerance: '2',
    },
  })

  // QC-02: Log generation params for reproducibility
  await logGenerationParams(jobId, 'frame_generation', {
    model: 'fal-ai/flux-pro/v1.1',
    request_id,
    scene_key: sceneKey,
    prompt: scene.prompt,
    seed,
  })

  // AI-02: Poll with exponential backoff sequence: 5s, 10s, 20s, 40s, 60s
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
      // QC-05: Log cost (Flux Pro ~$0.05 per image)
      await logCost(jobId, 'frame_generation', {
        model: 'fal-ai/flux-pro/v1.1',
        estimatedCostUsd: 0.05,
      })
      return (result as any).data.images[0].url
    }

    if (status.status === 'FAILED') {
      throw new Error(`Flux Pro failed for ${sceneKey}: request_id=${request_id}`)
    }
  }

  throw new Error(
    `Flux Pro polling timeout for ${sceneKey} after ${BACKOFF_SEQUENCE_MS.length} attempts`,
  )
}

// Deterministic seed from string (for QC-02 reproducibility)
function hashToSeed(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0 // Convert to 32-bit integer
  }
  return Math.abs(hash)
}
