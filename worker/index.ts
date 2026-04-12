import { Worker } from 'bullmq'
import { connection } from './lib/redis.js'

console.log('[worker] starting clico worker process...')

// Phase 1: scaffold worker that logs received jobs
// Phase 2 replaces this handler with actual AI pipeline logic
const worker = new Worker(
  'video-analysis',
  async (job) => {
    console.log(`[worker] received job ${job.id}:`, JSON.stringify(job.data))
    // Phase 2: Gemini analysis, Flux generation, Kling synthesis, FFmpeg post
    return { status: 'processed', jobId: job.id }
  },
  {
    connection,
    concurrency: 2,
    // Lock must exceed maximum expected job duration (15 min for video gen)
    lockDuration: 20 * 60 * 1000, // 20 minutes
  }
)

worker.on('completed', (job) => {
  console.log(`[worker] job ${job?.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`[worker] job ${job?.id} failed:`, err.message)
})

worker.on('error', (err) => {
  console.error('[worker] worker error:', err.message)
})

// INFRA-05: Graceful shutdown on SIGTERM (Railway sends this on deploy/restart)
const shutdown = async (signal: string) => {
  console.log(`[worker] received ${signal}, shutting down gracefully...`)
  await worker.close()
  console.log('[worker] worker closed, exiting')
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

console.log('[worker] listening for jobs on video-analysis queue')
