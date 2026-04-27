/**
 * 商家 API key 系统 · 让自动化系统 / ERP / 自家脚本 接 wenai
 *
 * Key 格式: wn_<32 hex>  (wn_ 前缀让 logs/截图一眼识别)
 * Storage:
 *   wenai:apikey:<keyHash>  → orgId  (反向查 · 验证用)
 *   wenai:apikey:org:<orgId> → keyHash + createdAt + lastUsedAt + label
 *
 * keyHash 走 SHA-256 防泄漏 (Redis 进了别人手里也能读不到原 key)
 *
 * 一个 org 同时只能持一个 key (再生成会失效旧的) · 简化先这样, 多 key 是 v2
 */

import { Redis } from '@upstash/redis';
import { createHash, randomBytes } from 'crypto';

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const TTL_SEC = 365 * 24 * 3600; // 一年, 长期凭证

export interface ApiKeyMeta {
  orgId: string;
  keyHash: string;
  prefix: string;       // wn_xxxx... 前 12 位用于 UI 显示 (后面遮码)
  createdAt: string;
  lastUsedAt?: string;
  label?: string;
}

function hashKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}

export function generateRawKey(): string {
  return 'wn_' + randomBytes(16).toString('hex');
}

export interface IssueResult {
  rawKey: string;       // 完整 key, 只在签发时返回一次
  meta: ApiKeyMeta;
}

/**
 * 给 org 签发新 key (替换旧的)
 *
 * 返回 rawKey 只这一次, 商家自己保管, 后续只能看 prefix
 */
export async function issueApiKey(orgId: string, label?: string): Promise<IssueResult> {
  const rawKey = generateRawKey();
  const keyHash = hashKey(rawKey);
  const meta: ApiKeyMeta = {
    orgId,
    keyHash,
    prefix: rawKey.slice(0, 12),
    createdAt: new Date().toISOString(),
    label: label?.slice(0, 80),
  };

  if (redis) {
    try {
      // 拿到旧 keyHash 后清掉反查 (避免老 key 残留可用)
      const oldMeta = await getApiKeyMetaByOrg(orgId);
      if (oldMeta) {
        await redis.del(`wenai:apikey:${oldMeta.keyHash}`);
      }
      await redis.set(`wenai:apikey:${keyHash}`, orgId, { ex: TTL_SEC });
      await redis.set(`wenai:apikey:org:${orgId}`, JSON.stringify(meta), { ex: TTL_SEC });
    } catch {
      // 即便 Redis 写失败, 也返回 raw 让商家拿到 (后续可重发)
    }
  }
  return { rawKey, meta };
}

export async function getApiKeyMetaByOrg(orgId: string): Promise<ApiKeyMeta | null> {
  if (!redis) return null;
  try {
    const raw = await redis.get(`wenai:apikey:org:${orgId}`);
    if (!raw) return null;
    return typeof raw === 'string' ? JSON.parse(raw) : (raw as ApiKeyMeta);
  } catch {
    return null;
  }
}

export async function revokeApiKey(orgId: string): Promise<boolean> {
  if (!redis) return false;
  try {
    const meta = await getApiKeyMetaByOrg(orgId);
    if (!meta) return false;
    await redis.del(`wenai:apikey:${meta.keyHash}`);
    await redis.del(`wenai:apikey:org:${orgId}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证 raw key, 返回归属 orgId (失败返 null)
 *
 * 同步更新 lastUsedAt, fire-and-forget 不阻塞
 */
export async function verifyApiKey(rawKey: string): Promise<string | null> {
  if (!rawKey || !rawKey.startsWith('wn_')) return null;
  if (!redis) return null;
  const keyHash = hashKey(rawKey);
  try {
    const orgId = await redis.get(`wenai:apikey:${keyHash}`);
    if (!orgId || typeof orgId !== 'string') return null;
    // 更新 lastUsedAt (异步, 不挡校验)
    (async () => {
      try {
        const meta = await getApiKeyMetaByOrg(orgId);
        if (meta) {
          meta.lastUsedAt = new Date().toISOString();
          await redis!.set(`wenai:apikey:org:${orgId}`, JSON.stringify(meta), { ex: TTL_SEC });
        }
      } catch { /* skip */ }
    })();
    return orgId;
  } catch {
    return null;
  }
}
