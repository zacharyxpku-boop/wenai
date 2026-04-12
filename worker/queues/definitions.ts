import { Queue } from 'bullmq'
import { connection } from '../lib/redis.js'

// Phase 2 workers will consume these queues
// Phase 1 only creates the definitions to prove connectivity

export const videoAnalysisQueue = new Queue('video-analysis', { connection })
export const frameGenerationQueue = new Queue('frame-generation', { connection })
export const videoSynthesisQueue = new Queue('video-synthesis', { connection })
export const postProcessingQueue = new Queue('post-processing', { connection })

export const ALL_QUEUES = [
  videoAnalysisQueue,
  frameGenerationQueue,
  videoSynthesisQueue,
  postProcessingQueue,
] as const
