import { Job } from 'bullmq'
import { ffmpeg } from '../lib/ffmpeg.js'
import { generateSrt } from '../lib/generate-srt.js'
import { validateOutput, type ValidationResult } from '../lib/validate-output.js'
import { supabase } from '../lib/supabase.js'
import { updateStepStatus, broadcastProgress } from '../lib/step-helpers.js'
import { logCost } from '../lib/cost-logger.js'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

const MAX_RETRIES = 2  // QC-01: auto-retry up to 2x on validation failure

interface PostProcJobData {
  jobId: string
  orgId: string
  falVideoUrl?: string       // single clip from webhook
  falRequestId?: string
}

export async function runPostProcessing(job: Job<PostProcJobData>) {
  const { jobId, orgId } = job.data

  await updateStepStatus(jobId, orgId, 'post_processing', 'running')
  await broadcastProgress(jobId, 'post_processing', 'running')

  // Use UUID-based temp dir (Pitfall 4: no spaces/colons in path)
  const tempDir = path.join(os.tmpdir(), `clico-pp-${jobId}`)
  await fs.mkdir(tempDir, { recursive: true })

  try {
    // Load storyboard and hook variants from analysis step output
    const { data: analysisStep } = await supabase
      .from('job_steps')
      .select('output')
      .eq('job_id', jobId)
      .eq('step', 'analysis')
      .single()

    const storyboard = (analysisStep?.output as any)?.storyboard
    const hookVariants = (analysisStep?.output as any)?.hookVariants ?? []

    if (!storyboard) throw new Error('No storyboard found in analysis step output')

    // Load video synthesis step for clip request IDs
    const { data: synStep } = await supabase
      .from('job_steps')
      .select('metadata, output')
      .eq('job_id', jobId)
      .eq('step', 'video_synthesis')
      .single()

    const requestIds = (synStep?.metadata as any)?.fal_request_ids ?? []

    // Download all clips from fal.ai temp URLs to local temp dir
    const clipPaths: Map<string, string> = new Map()
    for (const entry of requestIds) {
      const clipUrl = await getClipUrl(entry.requestId, jobId)
      if (!clipUrl) {
        throw new Error(`No video URL found for clip ${entry.type}-${entry.index}`)
      }
      const localPath = path.join(tempDir, `${entry.type}-${entry.index}.mp4`)
      await downloadFile(clipUrl, localPath)
      clipPaths.set(`${entry.type}-${entry.index}`, localPath)
    }

    // Generate SRT subtitles from storyboard scenes
    const srtContent = generateSrt(storyboard.scenes)
    const srtPath = path.join(tempDir, 'subtitles.srt')
    await fs.writeFile(srtPath, srtContent)

    // Produce one MP4 per hook variant
    const deliveryUrls: string[] = []
    for (let v = 0; v < hookVariants.length; v++) {
      const hookClipPath = clipPaths.get(`hook-${v}`)
      if (!hookClipPath) throw new Error(`Missing hook clip for variant ${v}`)

      // Assemble clip order: hook-v, then body-1, body-2, ... body-N
      const bodyScenes = storyboard.scenes.slice(1)
      const orderedClips = [hookClipPath]
      for (const scene of bodyScenes) {
        const bodyPath = clipPaths.get(`body-${scene.index}`)
        if (!bodyPath) throw new Error(`Missing body clip for scene ${scene.index}`)
        orderedClips.push(bodyPath)
      }

      const outputPath = path.join(tempDir, `variant-${v}.mp4`)

      // AI-04: FFmpeg concat + subtitle burn + 9:16 output with QC retry loop
      let retryCount = 0
      let validation: ValidationResult = { valid: false }

      while (retryCount <= MAX_RETRIES) {
        await concatAndBurnSubtitles(orderedClips, srtPath, outputPath)
        validation = await validateOutput(outputPath)

        if (validation.valid) break

        retryCount++
        if (retryCount <= MAX_RETRIES) {
          console.log(`[post-proc] QC failed (attempt ${retryCount}/${MAX_RETRIES}): ${validation.error}`)
          await broadcastProgress(jobId, 'post_processing', 'retrying', retryCount, MAX_RETRIES)
        }
      }

      if (!validation.valid) {
        throw new Error(`QC validation failed after ${MAX_RETRIES} retries: ${validation.error}`)
      }

      // Upload to Supabase Storage
      const storagePath = `deliveries/${orgId}/${jobId}/variant-${v}.mp4`
      const fileBuffer = await fs.readFile(outputPath)
      const { error: uploadError } = await supabase.storage
        .from('deliveries')
        .upload(storagePath, fileBuffer, { contentType: 'video/mp4', upsert: true })

      if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

      deliveryUrls.push(storagePath)
      await broadcastProgress(jobId, 'post_processing', 'running', v + 1, hookVariants.length)
    }

    // Mark job as delivered
    await supabase
      .from('jobs')
      .update({ status: 'delivered', delivery_url: deliveryUrls[0] })
      .eq('id', jobId)

    await updateStepStatus(jobId, orgId, 'post_processing', 'complete', {
      output: { deliveryUrls, variantCount: hookVariants.length },
    })

    await broadcastProgress(jobId, 'post_processing', 'complete')

    // Log FFmpeg processing cost (local compute, no API cost)
    await logCost(jobId, 'post_processing', {
      model: 'ffmpeg-local',
      estimatedCostUsd: 0,
    })

  } catch (err: any) {
    await updateStepStatus(jobId, orgId, 'post_processing', 'failed', { error: err.message })
    await broadcastProgress(jobId, 'post_processing', 'failed')

    await supabase
      .from('jobs')
      .update({ status: 'failed' })
      .eq('id', jobId)

    throw err
  } finally {
    // Cleanup temp directory
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {})
  }
}

async function concatAndBurnSubtitles(
  clipPaths: string[],
  srtPath: string,
  outputPath: string,
): Promise<void> {
  // Write concat list file for -f concat demuxer
  const concatFile = path.join(path.dirname(outputPath), 'concat.txt')
  const lines = clipPaths.map(p => `file '${p.replace(/\\/g, '/')}'`).join('\n')
  await fs.writeFile(concatFile, lines)

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatFile)
      .inputOptions(['-f concat', '-safe 0'])
      .videoFilters([
        // Scale to 1080x1920 (9:16), pad if needed
        'scale=1080:1920:force_original_aspect_ratio=increase',
        'crop=1080:1920',
        // Burn subtitles — escape colons in Windows paths (Pitfall 4)
        `subtitles=${srtPath.replace(/\\/g, '/').replace(/:/g, '\\\\:')}:force_style='FontSize=48,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2'`,
      ])
      .videoCodec('libx264')
      .outputOptions([
        '-preset fast',
        '-crf 23',
        '-pix_fmt yuv420p',       // broad compatibility
        '-movflags +faststart',    // streaming playback
      ])
      .audioCodec('aac')
      .audioBitrate('128k')
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run()
  })
}

async function downloadFile(url: string, localPath: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Download failed: ${response.status} for ${url}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  await fs.writeFile(localPath, buffer)
}

async function getClipUrl(requestId: string, jobId: string): Promise<string | null> {
  // Check job_steps output for completed webhook deliveries
  const { data: step } = await supabase
    .from('job_steps')
    .select('output')
    .eq('job_id', jobId)
    .eq('step', 'video_synthesis')
    .single()

  // Output may contain fal_video_url from the webhook handler
  const output = step?.output as any
  if (output?.fal_video_url) return output.fal_video_url

  // Fallback: fetch result directly from fal.ai (for stalled jobs recovered by poller)
  try {
    const { fal } = await import('@fal-ai/client')
    const result = await fal.queue.result('fal-ai/kling-video/v3/standard/image-to-video', {
      requestId,
    })
    return (result as any).data?.video?.url ?? null
  } catch {
    return null
  }
}
