/**
 * video-teardown 内容哈希缓存
 *
 * 老路: 每次商家上传同一段视频, 都重新调 Gemini Vision (~4 cents/次)
 * 新路: 用 SHA-256 base64 哈希识别同一视频, Redis 缓存 storyboard 14 天
 *
 * 价值:
 *   - 同视频 + 不同 productHint 也可以共享原始 storyboard 拆解 (省钱省时间)
 *   - 单 orgId 限定缓存 key, 防止隐私泄漏
 *   - 14 天 TTL · 商家想测最新算法可手动加 ?fresh=1 跳缓存
 *
 * Key 设计: wenai:teardown:<orgId>:<sha256-hex>
 */

import { Redis } from '@upstash/redis';
import { createHash } from 'crypto';

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const memCache = new Map<string, { value: unknown; until: number }>();
const TTL_SEC = 14 * 24 * 3600;

/** 计算 base64 内容的 SHA-256 (取前 32 位 hex 节省存储) */
export function hashVideoBase64(base64: string): string {
  return createHash('sha256').update(base64).digest('hex').slice(0, 32);
}

export async function getTeardownCache(orgId: string, contentHash: string): Promise<unknown | null> {
  const key = `wenai:teardown:${orgId}:${contentHash}`;
  if (redis) {
    try {
      const v = await redis.get(key);
      if (v) return v;
    } catch {
      /* fallthrough */
    }
  }
  const m = memCache.get(key);
  if (m && m.until > Date.now()) return m.value;
  return null;
}

export async function setTeardownCache(
  orgId: string,
  contentHash: string,
  value: unknown
): Promise<void> {
  const key = `wenai:teardown:${orgId}:${contentHash}`;
  if (redis) {
    try {
      // upstash redis set with EX
      await redis.set(key, JSON.stringify(value), { ex: TTL_SEC });
      return;
    } catch {
      /* fallthrough to mem */
    }
  }
  memCache.set(key, { value, until: Date.now() + TTL_SEC * 1000 });
}
