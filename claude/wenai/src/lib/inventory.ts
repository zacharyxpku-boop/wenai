/**
 * SKU 库存状态 · 商家从 ERP/抖店脚本 push 数量, wenai 监测断货风险
 *
 * Storage:
 *   wenai:inv:org:<orgId>          hash skuId → JSON { qty, threshold, updatedAt }
 *
 * 不存历史 series (避免 Redis 膨胀), 只存当前快照
 * 商家若要时间序列, 自己 ERP 留底; wenai 只做「现在告诉我 SKU 是不是要断」
 *
 * 阈值缺省: max(qty * 0.2, 10) · 即 20% 库存或 10 件 (谁更高用谁)
 */

import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const TTL_SEC = 90 * 24 * 3600;  // 90 天没更新自动过期 (SKU 已死或 ERP 断了)

export interface InventoryRecord {
  skuId: string;
  qty: number;
  threshold: number;
  updatedAt: string;
  // 衍生字段, 不入 store, 读时算
  status?: 'healthy' | 'low' | 'out';
}

function key(orgId: string) {
  return `wenai:inv:org:${orgId}`;
}

function deriveStatus(qty: number, threshold: number): 'healthy' | 'low' | 'out' {
  if (qty <= 0) return 'out';
  if (qty <= threshold) return 'low';
  return 'healthy';
}

export async function setInventory(
  orgId: string,
  skuId: string,
  qty: number,
  threshold?: number,
): Promise<{ ok: boolean; record?: InventoryRecord; error?: string }> {
  if (!redis) return { ok: false, error: '当前为本地试用模式，库存数据不会跨环境持久化。' };
  if (!skuId || skuId.length > 100) return { ok: false, error: 'skuId 必填且 ≤100 字' };
  if (typeof qty !== 'number' || qty < 0 || qty > 1e9 || !Number.isFinite(qty)) {
    return { ok: false, error: 'qty 必须是 ≥0 的有限数' };
  }

  // 阈值: 用户给优先, 否则取上次 threshold, 再否则 20%/10 件 默认
  let finalThreshold = threshold;
  if (typeof finalThreshold !== 'number' || finalThreshold < 0) {
    try {
      const prev = await redis.hget(key(orgId), skuId);
      if (prev) {
        const parsed = typeof prev === 'string' ? JSON.parse(prev) : prev;
        finalThreshold = parsed?.threshold;
      }
    } catch { /* skip */ }
  }
  if (typeof finalThreshold !== 'number' || finalThreshold < 0) {
    finalThreshold = Math.max(Math.floor(qty * 0.2), 10);
  }

  const record: InventoryRecord = {
    skuId,
    qty,
    threshold: finalThreshold,
    updatedAt: new Date().toISOString(),
  };
  try {
    await redis.hset(key(orgId), { [skuId]: JSON.stringify(record) });
    await redis.expire(key(orgId), TTL_SEC);
    return { ok: true, record: { ...record, status: deriveStatus(qty, finalThreshold) } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'redis fail' };
  }
}

export async function getInventory(orgId: string, skuId: string): Promise<InventoryRecord | null> {
  if (!redis) return null;
  try {
    const raw = await redis.hget(key(orgId), skuId);
    if (!raw) return null;
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!parsed?.skuId) return null;
    return { ...parsed, status: deriveStatus(parsed.qty, parsed.threshold) };
  } catch {
    return null;
  }
}

export async function listInventory(orgId: string): Promise<InventoryRecord[]> {
  if (!redis) return [];
  try {
    const all = await redis.hgetall<Record<string, string>>(key(orgId));
    if (!all) return [];
    const out: InventoryRecord[] = [];
    for (const [skuId, val] of Object.entries(all)) {
      try {
        const parsed = typeof val === 'string' ? JSON.parse(val) : val;
        out.push({ ...parsed, skuId, status: deriveStatus(parsed.qty, parsed.threshold) });
      } catch { /* skip bad rows */ }
    }
    return out.sort((a, b) => {
      // out > low > healthy, 然后按 updatedAt desc
      const rank: Record<string, number> = { out: 0, low: 1, healthy: 2 };
      const ra = rank[a.status || 'healthy'];
      const rb = rank[b.status || 'healthy'];
      if (ra !== rb) return ra - rb;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  } catch {
    return [];
  }
}

export async function deleteInventory(orgId: string, skuId: string): Promise<boolean> {
  if (!redis) return false;
  try {
    const r = await redis.hdel(key(orgId), skuId);
    return r > 0;
  } catch {
    return false;
  }
}

/**
 * 仅返出问题的 (low + out) · 给 alerts/digest 用 · 比 listInventory 轻
 */
export async function listLowOrOut(orgId: string): Promise<InventoryRecord[]> {
  const all = await listInventory(orgId);
  return all.filter(r => r.status === 'low' || r.status === 'out');
}
