import { Worker, Job } from 'bullmq'
import { connection } from './lib/redis.js'
import './stalled-poller.js'  // starts interval-based stalled job detection
import { runAnalysis } from './workers/analysis.worker.js'
import { runFrameGeneration } from './workers/frame-generation.worker.js'
import { runVideoSynthesis } from './workers/video-synthesis.worker.js'
import { runPostProcessing } from './workers/post-processing.worker.js'

console.log('[worker] starting clico pipeline workers...')

// QUEUE-01: Four named workers for each pipeline stage
// QUEUE-06: lockDuration exceeds max expected job duration per stage
const analysisWorker = new Worker('video-analysis', runAnalysis, {
  connection, concurrency: 3, lockDuration: 20 * 60 * 1000,  // 20 min (Gemini + file upload)
})
const frameWorker = new Worker('frame-generation', runFrameGeneration, {
  connection, concurrency: 5, lockDuration: 10 * 60 * 1000,  // 10 min (Flux polling)
})
const synthesisWorker = new Worker('video-synthesis', runVideoSynthesis, {
  connection, concurrency: 2, lockDuration: 5 * 60 * 1000,   // 5 min (just submits to Kling)
})
const postWorker = new Worker('post-processing', runPostProcessing, {
  connection, concurrency: 1, lockDuration: 20 * 60 * 1000,  // 20 min (FFmpeg, concurrency: 1 per research)
})

const ALL_WORKERS = [analysisWorker, frameWorker, synthesisWorker, postWorker]

for (const w of ALL_WORKERS) {
  w.on('completed', (job) => console.log(`[worker] ${w.name} job ${job?.id} completed`))
  w.on('failed', (job, err) => console.error(`[worker] ${w.name} job ${job?.id} failed:`, err.message))
  w.on('error', (err) => console.error(`[worker] ${w.name} error:`, err.message))
}

// INFRA-05: Graceful shutdown on SIGTERM
const shutdown = async (signal: string) => {
  console.log(`[worker] received ${signal}, shutting down gracefully...`)
  await Promise.all(ALL_WORKERS.map(w => w.close()))
  console.log('[worker] all workers closed, exiting')
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

console.log('[worker] listening on queues: video-analysis, frame-generation, video-synthesis, post-processing')
