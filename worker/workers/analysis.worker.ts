import { Job } from 'bullmq'
import { GoogleGenAI, createUserContent, createPartFromUri } from '@google/genai'
import { StoryboardSchema, type Storyboard } from '../schemas/storyboard.js'
import { HookVariantsSchema, type HookVariant } from '../schemas/hook-variants.js'
import { supabase } from '../lib/supabase.js'
import { frameGenerationQueue } from '../queues/definitions.js'
import { updateStepStatus, broadcastProgress, logGenerationParams } from '../lib/step-helpers.js'
import { logCost } from '../lib/cost-logger.js'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

// AI-10: 90-second cap — Gemini charges ~300 tokens/sec for video input
const MAX_VIDEO_DURATION_SECONDS = 90

interface AnalysisJobData {
  jobId: string
  orgId: string
  referenceVideoUrl: string
  productName: string
  hookVariantCount: number
}

export async function runAnalysis(job: Job<AnalysisJobData>) {
  const { jobId, orgId, referenceVideoUrl, productName, hookVariantCount } = job.data

  await updateStepStatus(jobId, orgId, 'analysis', 'running')
  await broadcastProgress(jobId, 'analysis', 'running')

  try {
    // AI-07: Check cache — same reference URL analyzed before?
    const storyboard = await getOrAnalyzeVideo(referenceVideoUrl, jobId, orgId)

    // AI-08: Generate hook variants (3-5 different opening scripts)
    const variantCount = Math.min(Math.max(hookVariantCount ?? 3, 3), 5)
    const hookVariants = await generateHookVariants(storyboard, variantCount, productName, jobId)

    // Store storyboard + variants in job_steps output
    await updateStepStatus(jobId, orgId, 'analysis', 'complete', {
      output: { storyboard, hookVariants },
      metadata: { source_video_url: referenceVideoUrl },
    })

    // Also update the job record with the storyboard
    await supabase
      .from('jobs')
      .update({ storyboard, status: 'processing' })
      .eq('id', jobId)

    await broadcastProgress(jobId, 'analysis', 'complete')

    // Enqueue next step: frame generation for each variant
    await frameGenerationQueue.add('generate-frames', {
      jobId,
      orgId,
      storyboard,
      hookVariants,
      productName,
    })

  } catch (err: any) {
    await updateStepStatus(jobId, orgId, 'analysis', 'failed', { error: err.message })
    await broadcastProgress(jobId, 'analysis', 'failed')
    throw err  // let BullMQ handle retry
  }
}

async function getOrAnalyzeVideo(
  videoUrl: string,
  jobId: string,
  orgId: string,
): Promise<Storyboard> {
  // AI-07: Check cache in job_steps — same URL already analyzed?
  const { data: cached } = await supabase
    .from('job_steps')
    .select('output')
    .eq('step', 'analysis')
    .eq('status', 'complete')
    .contains('metadata', { source_video_url: videoUrl })
    .limit(1)
    .single()

  if (cached?.output?.storyboard) {
    console.log(`[analysis] cache hit for ${videoUrl}`)
    await logGenerationParams(jobId, 'analysis', { model: 'gemini-2.5-flash', cache_hit: true })
    return cached.output.storyboard as Storyboard
  }

  return analyzeVideo(videoUrl, jobId)
}

async function analyzeVideo(videoUrl: string, jobId: string): Promise<Storyboard> {
  // Download video to temp file — Gemini Files API requires a local file path
  const tempDir = path.join(os.tmpdir(), `clico-${jobId}`)
  await fs.mkdir(tempDir, { recursive: true })
  const tempPath = path.join(tempDir, 'reference.mp4')

  const response = await fetch(videoUrl)
  if (!response.ok) throw new Error(`Failed to download reference video: ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  await fs.writeFile(tempPath, buffer)

  // AI-10: Check file size as proxy for duration — warn if large
  const stat = await fs.stat(tempPath)
  const fileSizeMb = stat.size / (1024 * 1024)
  if (fileSizeMb > 100) {
    // ~100MB at typical TikTok bitrate ≈ >90s; reject early
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {})
    throw new Error(`Reference video too large (${fileSizeMb.toFixed(1)}MB). Videos must be ≤90 seconds.`)
  }

  let uploadedFile: Awaited<ReturnType<typeof ai.files.upload>>
  try {
    // Step 1: Upload to Gemini Files API
    uploadedFile = await ai.files.upload({
      file: tempPath,
      config: { mimeType: 'video/mp4' },
    })
  } catch (uploadErr: any) {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {})
    throw new Error(`Gemini file upload failed: ${uploadErr.message}`)
  }

  // Step 2: Poll until ACTIVE — Pitfall 2 from research (state starts as PROCESSING)
  let file = await ai.files.get({ name: uploadedFile.name! })
  let pollCount = 0
  while (file.state === 'PROCESSING') {
    if (pollCount++ > 60) {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {})
      throw new Error('Gemini file processing timeout (5 min)')
    }
    await new Promise(r => setTimeout(r, 5000))
    file = await ai.files.get({ name: uploadedFile.name! })
  }
  if (file.state === 'FAILED') {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {})
    throw new Error('Gemini file processing failed')
  }

  // Step 3: Analyze with structured output (AI-01)
  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: createUserContent([
      createPartFromUri(file.uri!, file.mimeType!),
      STORYBOARD_PROMPT,
    ]),
    config: {
      responseSchema: StoryboardSchema,
      temperature: 0.2,
    },
  })

  // AI-10: Log token usage (input includes video tokens ~300/sec)
  const usage = result.usageMetadata
  await logCost(jobId, 'analysis', {
    model: 'gemini-2.5-flash',
    inputTokens: usage?.promptTokenCount ?? 0,
    outputTokens: usage?.candidatesTokenCount ?? 0,
    estimatedCostUsd:
      ((usage?.promptTokenCount ?? 0) * 0.30 + (usage?.candidatesTokenCount ?? 0) * 1.25) /
      1_000_000,
  })

  // QC-02: Log generation params for reproducibility
  await logGenerationParams(jobId, 'analysis', {
    model: 'gemini-2.5-flash',
    temperature: 0.2,
    file_uri: file.uri,
    file_state: file.state,
    cache_hit: false,
  })

  // Clean up temp file
  await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {})

  // Parse and validate with Zod
  const storyboard = StoryboardSchema.parse(JSON.parse(result.text!))
  return storyboard
}

// AI-08: Hook variant engine — generate N different opening scripts from the same storyboard
async function generateHookVariants(
  storyboard: Storyboard,
  variantCount: number,
  productContext: string,
  jobId: string,
): Promise<HookVariant[]> {
  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: createUserContent([
      `Generate ${variantCount} different hook variants for a product video.
Base storyboard hook_type: ${storyboard.hook_type}
Product context: ${productContext}
Scene count: ${storyboard.scene_count}

Each variant MUST have a DIFFERENT opening 3-second script.
The body structure (scenes 2-${storyboard.scene_count}) stays the same across all variants.

Return a JSON array of ${variantCount} objects:
- hook_script: the 3-second narration text for the opening
- hook_prompt: image generation prompt for the opening scene (product-focused, 9:16 vertical, high quality)
- hook_type: one of question|statement|demo|story|shock`,
    ]),
    config: {
      responseSchema: HookVariantsSchema,
      temperature: 0.8,  // higher temperature for creative diversity
    },
  })

  // AI-10: Log token usage for hook generation step
  const usage = result.usageMetadata
  await logCost(jobId, 'analysis', {
    model: 'gemini-2.5-flash',
    inputTokens: usage?.promptTokenCount ?? 0,
    outputTokens: usage?.candidatesTokenCount ?? 0,
    estimatedCostUsd:
      ((usage?.promptTokenCount ?? 0) * 0.30 + (usage?.candidatesTokenCount ?? 0) * 1.25) /
      1_000_000,
  })

  return HookVariantsSchema.parse(JSON.parse(result.text!))
}

const STORYBOARD_PROMPT = `Analyze this TikTok video and return a structured storyboard JSON.
Extract:
- hook_type: "question" | "statement" | "demo" | "story" | "shock"
- scene_count: number of distinct scenes (max 6)
- pacing: "fast" (<3s/scene) | "medium" (3-6s) | "slow" (>6s)
- cta_position: "early" | "middle" | "end"
- emotional_arc: array of emotions per scene
- scenes: array of {index, description, duration_seconds, caption_text, prompt}
  where "prompt" is an image generation prompt that captures the visual essence of that scene.
Return ONLY valid JSON matching the schema.`
