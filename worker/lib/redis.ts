import IORedis from 'ioredis'

if (!process.env.UPSTASH_REDIS_URL) {
  throw new Error('UPSTASH_REDIS_URL is required')
}

// CRITICAL: maxRetriesPerRequest must be null for BullMQ
// Default value causes Worker to throw ReplyError on any Redis reconnect
// See: https://docs.bullmq.io/guide/going-to-production
export const connection = new IORedis(process.env.UPSTASH_REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: {
    rejectUnauthorized: false,
  },
})

connection.on('error', (err) => {
  console.error('[redis] connection error:', err.message)
})

connection.on('connect', () => {
  console.log('[redis] connected to Upstash Redis')
})
