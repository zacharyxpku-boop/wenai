import { Queue } from 'bullmq'
import IORedis from 'ioredis'

// Lazy singletons — deferred to first use so Next.js build phase (no env vars) doesn't throw
let _connection: IORedis | null = null
let _videoAnalysisQueue: Queue | null = null
let _frameGenerationQueue: Queue | null = null
let _videoSynthesisQueue: Queue | null = null
let _postProcessingQueue: Queue | null = null

function getConnection(): IORedis {
  if (!_connection) {
    if (!process.env.UPSTASH_REDIS_URL) throw new Error('UPSTASH_REDIS_URL required')
    _connection = new IORedis(process.env.UPSTASH_REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      tls: { rejectUnauthorized: false },
    })
  }
  return _connection
}

export function getVideoAnalysisQueue(): Queue {
  if (!_videoAnalysisQueue) {
    _videoAnalysisQueue = new Queue('video-analysis', { connection: getConnection() })
  }
  return _videoAnalysisQueue
}

export function getFrameGenerationQueue(): Queue {
  if (!_frameGenerationQueue) {
    _frameGenerationQueue = new Queue('frame-generation', { connection: getConnection() })
  }
  return _frameGenerationQueue
}

export function getVideoSynthesisQueue(): Queue {
  if (!_videoSynthesisQueue) {
    _videoSynthesisQueue = new Queue('video-synthesis', { connection: getConnection() })
  }
  return _videoSynthesisQueue
}

export function getPostProcessingQueue(): Queue {
  if (!_postProcessingQueue) {
    _postProcessingQueue = new Queue('post-processing', { connection: getConnection() })
  }
  return _postProcessingQueue
}

// Convenience aliases for API routes — call these at request time, not module init
export const videoAnalysisQueue = {
  add: (...args: Parameters<Queue['add']>) => getVideoAnalysisQueue().add(...args),
  getJobCounts: (...args: Parameters<Queue['getJobCounts']>) =>
    getVideoAnalysisQueue().getJobCounts(...args),
} as unknown as Queue

export const frameGenerationQueue = {
  add: (...args: Parameters<Queue['add']>) => getFrameGenerationQueue().add(...args),
} as unknown as Queue

export const videoSynthesisQueue = {
  add: (...args: Parameters<Queue['add']>) => getVideoSynthesisQueue().add(...args),
} as unknown as Queue

export const postProcessingQueue = {
  add: (...args: Parameters<Queue['add']>) => getPostProcessingQueue().add(...args),
} as unknown as Queue

const GLOBAL_QUEUE_LIMIT = 50 // max total waiting + active across all queues

export async function getGlobalQueueDepth(): Promise<number> {
  const counts = await getVideoAnalysisQueue().getJobCounts('active', 'waiting')
  return counts.active + counts.waiting
}

export { GLOBAL_QUEUE_LIMIT }
