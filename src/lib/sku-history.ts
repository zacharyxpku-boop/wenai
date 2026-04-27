/**
 * 用户级别 SKU 历史持久化 · 解 STRATEGY_DEEP L7 风险 #6
 *
 * 让决策层(选品/测款/数据洞察)从"空壳"变"飞轮":
 *   - 商家在 wenai 跑过的 SKU 自动沉淀
 *   - 跨会话保留 + 跨模块复用
 *   - 用得越深越锁定 (MOAT-05 retention 真实生效的前提)
 *
 * 存储:
 *   Redis hash: wenai:sku:<orgId>:<skuId> = JSON SkuRecord
 *   Redis list: wenai:sku:list:<orgId>    = [skuId, skuId, ...] (最近 200)
 *   降级: 内存 Map (serverless cold start 会丢 · 防滥用底线)
 */

import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const memStore = new Map<string, SkuRecord>();
const memList = new Map<string, string[]>();

export type SkuStatus = 'idea' | 'discovery-done' | 'photoshoot-done' | 'abtest-done' | 'launched' | 'paused' | 'killed';

export interface StatusEvent {
  status: SkuStatus;
  at: string;             // ISO
  fromModule?: string;    // 是哪个模块触发的状态变更 (例: 'data-insights')
  reason?: string;        // 变更原因 (例: AI 推断 / 手动)
}

export interface SkuRecord {
  id: string;
  orgId: string;
  name: string;
  category: string;       // 例: 服装-连衣裙
  platform?: string;      // 例: tmall / amazon-us
  priceCny?: string;      // 例: ¥199-299
  status: SkuStatus;
  notes?: string;
  performance?: {
    ctr?: number;
    convRate?: number;
    roi?: number;
    sales7d?: number;
    [k: string]: unknown;
  };
  addedAt: string;        // ISO
  updatedAt: string;
  modules?: string[];     // 跑过的 wenai 模块 id
  statusHistory?: StatusEvent[]; // 状态变迁轨迹 (老数据可能缺, UI 要兼容)
}

const STATUS_LABELS: Record<SkuRecord['status'], string> = {
  idea: '💡 想法',
  'discovery-done': '🎯 已选品',
  'photoshoot-done': '🎬 已出图',
  'abtest-done': '⚗️ 已测款',
  launched: '🚀 已上架',
  paused: '⏸ 暂停',
  killed: '🛑 已 kill',
};

export function statusLabel(s: SkuRecord['status']): string {
  return STATUS_LABELS[s];
}

function genId(): string {
  return `sku_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

const LIST_KEY = (orgId: string) => `wenai:sku:list:${orgId}`;
const SKU_KEY = (orgId: string, skuId: string) => `wenai:sku:${orgId}:${skuId}`;

/** 添加一个新 SKU (返回完整记录) */
export async function addSku(orgId: string, input: Partial<SkuRecord>): Promise<SkuRecord> {
  const id = input.id || genId();
  const now = new Date().toISOString();
  const status: SkuStatus = input.status || 'idea';
  const fromModule = input.modules?.[0];
  const record: SkuRecord = {
    id,
    orgId,
    name: input.name?.slice(0, 200) || '未命名 SKU',
    category: input.category?.slice(0, 100) || '未分类',
    platform: input.platform?.slice(0, 50),
    priceCny: input.priceCny?.slice(0, 50),
    status,
    notes: input.notes?.slice(0, 2000),
    performance: input.performance,
    addedAt: now,
    updatedAt: now,
    modules: input.modules || [],
    statusHistory: [{
      status,
      at: now,
      fromModule,
      reason: fromModule ? `通过 ${fromModule} 入库` : '手动创建',
    }],
  };

  if (redis) {
    try {
      await redis.hset(SKU_KEY(orgId, id), record as unknown as Record<string, unknown>);
      await redis.lpush(LIST_KEY(orgId), id);
      await redis.ltrim(LIST_KEY(orgId), 0, 199); // 最近 200 个
    } catch (e) {
      console.warn('[sku-history] redis add failed', e);
    }
  } else {
    memStore.set(`${orgId}:${id}`, record);
    const list = memList.get(orgId) ?? [];
    list.unshift(id);
    memList.set(orgId, list.slice(0, 200));
  }

  return record;
}

/** 列出某 org 最近 N 个 SKU */
export async function listSkus(orgId: string, limit = 50): Promise<SkuRecord[]> {
  if (redis) {
    try {
      const ids = await redis.lrange(LIST_KEY(orgId), 0, limit - 1);
      const records = await Promise.all(
        ids.map(async id => {
          try {
            const raw = await redis!.hgetall(SKU_KEY(orgId, id));
            if (!raw || Object.keys(raw).length === 0) return null;
            return raw as unknown as SkuRecord;
          } catch {
            return null;
          }
        })
      );
      return records.filter(Boolean) as SkuRecord[];
    } catch (e) {
      console.warn('[sku-history] redis list failed', e);
      return [];
    }
  }
  const ids = memList.get(orgId) ?? [];
  return ids.slice(0, limit).map(id => memStore.get(`${orgId}:${id}`)!).filter(Boolean);
}

/** 更新一个 SKU (合并字段, status 变更时自动追加 statusHistory) */
export async function updateSku(
  orgId: string,
  id: string,
  patch: Partial<SkuRecord>,
  meta?: { fromModule?: string; reason?: string }
): Promise<SkuRecord | null> {
  const now = new Date().toISOString();

  function appendHistory(prev: SkuRecord, next: Partial<SkuRecord>): StatusEvent[] {
    const history = prev.statusHistory || [];
    if (next.status && next.status !== prev.status) {
      return [
        ...history,
        {
          status: next.status,
          at: now,
          fromModule: meta?.fromModule,
          reason: meta?.reason || (meta?.fromModule ? `${meta.fromModule} 触发` : '手动切换'),
        },
      ];
    }
    return history;
  }

  if (redis) {
    try {
      const existing = await redis.hgetall(SKU_KEY(orgId, id));
      if (!existing || Object.keys(existing).length === 0) return null;
      const prev = existing as unknown as SkuRecord;
      const merged: SkuRecord = {
        ...prev,
        ...patch,
        id,
        orgId,
        updatedAt: now,
        statusHistory: appendHistory(prev, patch),
      };
      await redis.hset(SKU_KEY(orgId, id), merged as unknown as Record<string, unknown>);
      return merged;
    } catch (e) {
      console.warn('[sku-history] redis update failed', e);
      return null;
    }
  }
  const key = `${orgId}:${id}`;
  const existing = memStore.get(key);
  if (!existing) return null;
  const merged: SkuRecord = {
    ...existing,
    ...patch,
    id,
    orgId,
    updatedAt: now,
    statusHistory: appendHistory(existing, patch),
  };
  memStore.set(key, merged);
  return merged;
}

/** 删除一个 SKU */
export async function deleteSku(orgId: string, id: string): Promise<boolean> {
  if (redis) {
    try {
      await redis.del(SKU_KEY(orgId, id));
      await redis.lrem(LIST_KEY(orgId), 0, id);
      return true;
    } catch {
      return false;
    }
  }
  memStore.delete(`${orgId}:${id}`);
  const list = memList.get(orgId);
  if (list) memList.set(orgId, list.filter(x => x !== id));
  return true;
}

/** 给一个 SKU 标记跑过哪个 wenai 模块 (累积) */
export async function markModuleRan(orgId: string, skuId: string, moduleId: string): Promise<void> {
  if (redis) {
    try {
      const existing = await redis.hgetall(SKU_KEY(orgId, skuId));
      if (!existing || Object.keys(existing).length === 0) return;
      const record = existing as unknown as SkuRecord;
      const modules = Array.from(new Set([...(record.modules || []), moduleId]));
      await redis.hset(SKU_KEY(orgId, skuId), { modules, updatedAt: new Date().toISOString() });
    } catch {}
    return;
  }
  const r = memStore.get(`${orgId}:${skuId}`);
  if (!r) return;
  r.modules = Array.from(new Set([...(r.modules || []), moduleId]));
  r.updatedAt = new Date().toISOString();
}
