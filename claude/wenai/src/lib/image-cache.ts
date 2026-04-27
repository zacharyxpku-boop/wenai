/**
 * AI 影棚生图结果缓存 · 同 prompt+refs+尺寸/质量 复用上次生成的图
 *
 * 价值场景:
 *   - 团队多人对同一 SKU 出同一 prompt (一人跑过别人就免费拿)
 *   - 商家测试 prompt 微调 (基线版本被反复跑)
 *   - Demo / 培训重演
 *   - 网络抖动重试 (前端无脑重试不再多扣 ¥0.5)
 *
 * 缓存 key: wenai:imgcache:<orgId>:<sha256>
 *   sha256 输入 = JSON({ prompt, mode, scenario, size, quality, refHashes })
 *   refHashes 是每张垫图 base64 / URL 的 SHA-256 前 16 位
 *
 * TTL: 7 天 (HappyHorse URL 自身存活期 ~30 天, 7 天是留 margin 的安全值)
 *
 * 为什么不缓存图片本体:
 *   HappyHorse 返回的是 https URL, 我们直接缓存 URL 文字, 前端 <img> 自取
 *   省 Redis 存储 (一张图 url 100 字节 vs 一张图 base64 1MB)
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
const TTL_SEC = 7 * 24 * 3600;

export interface ImageCacheKey {
  prompt: string;
  mode: string;
  scenario: string;
  size: string;
  quality: string;
  refs: string[];     // dataURL 或 https URL
}

/** 把每张垫图压成 16 位 SHA hash (前缀截断, 防 Redis key 过长) */
function hashRef(ref: string): string {
  return createHash('sha256').update(ref).digest('hex').slice(0, 16);
}

export function buildImageCacheKey(input: ImageCacheKey): string {
  const refHashes = input.refs.map(hashRef).sort(); // 排序保证 ref 顺序无关
  const composite = JSON.stringify({
    p: input.prompt.trim(),
    m: input.mode,
    s: input.scenario,
    sz: input.size,
    q: input.quality,
    r: refHashes,
  });
  return createHash('sha256').update(composite).digest('hex').slice(0, 32);
}

export async function getImageCache(orgId: string, hash: string): Promise<unknown | null> {
  const key = `wenai:imgcache:${orgId}:${hash}`;
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

export async function setImageCache(orgId: string, hash: string, value: unknown): Promise<void> {
  const key = `wenai:imgcache:${orgId}:${hash}`;
  if (redis) {
    try {
      await redis.set(key, JSON.stringify(value), { ex: TTL_SEC });
      return;
    } catch {
      /* fallthrough */
    }
  }
  memCache.set(key, { value, until: Date.now() + TTL_SEC * 1000 });
}
