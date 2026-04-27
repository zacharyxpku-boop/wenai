import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey } from '@/lib/api-key';
import { setInventory, listInventory, deleteInventory } from '@/lib/inventory';

/**
 * 公开 API v1 · SKU 库存
 *
 *   GET    /api/v1/inventory                       拉本 org 全部库存快照 (按风险排序)
 *   POST   /api/v1/inventory  { skuId, qty, threshold? }   设/更 一条
 *   DELETE /api/v1/inventory?skuId=xxx             删一条 (SKU 下架, 不再监控)
 *
 * 鉴权: Authorization: Bearer wn_xxx · 与 /api/v1/skus 同套
 *
 * 推荐工作流:
 *   ERP 每 10 分钟 cron 把所有在售 SKU qty POST 到这里
 *   阈值默认 max(qty*20%, 10), 商家可一次性带 threshold 锁死自家逻辑
 *   断货风险会同步出现在 /me/alerts 列表 · 并被 09:00 daily-digest 推到飞书/邮件
 */

async function authenticate(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('authorization');
  let rawKey: string | null = null;
  if (auth?.startsWith('Bearer ')) {
    rawKey = auth.slice(7);
  } else {
    rawKey = new URL(req.url).searchParams.get('apiKey');
  }
  if (!rawKey) return null;
  return await verifyApiKey(rawKey);
}

export async function GET(req: NextRequest) {
  const orgId = await authenticate(req);
  if (!orgId) {
    return NextResponse.json({ error: '需要 Authorization: Bearer wn_xxx' }, { status: 401 });
  }
  const records = await listInventory(orgId);
  return NextResponse.json({
    orgId,
    count: records.length,
    outCount: records.filter(r => r.status === 'out').length,
    lowCount: records.filter(r => r.status === 'low').length,
    inventory: records,
  });
}

interface PostBody {
  skuId?: string;
  qty?: number;
  threshold?: number;
  // 批量场景: items[] 优先, 单点 skuId/qty 为兼容
  items?: Array<{ skuId: string; qty: number; threshold?: number }>;
}

export async function POST(req: NextRequest) {
  const orgId = await authenticate(req);
  if (!orgId) {
    return NextResponse.json({ error: '需要 Authorization: Bearer wn_xxx' }, { status: 401 });
  }
  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体非 JSON' }, { status: 400 });
  }

  // 批量分支: 一次最多 100 条 (避免 Redis 单 hash 写入过载)
  if (Array.isArray(body.items) && body.items.length > 0) {
    if (body.items.length > 100) {
      return NextResponse.json({ error: '单次最多 100 条, 拆批发' }, { status: 400 });
    }
    const results = await Promise.all(body.items.map(async (it) => {
      const r = await setInventory(orgId, it.skuId, it.qty, it.threshold);
      return { skuId: it.skuId, ok: r.ok, error: r.error, status: r.record?.status };
    }));
    return NextResponse.json({
      ok: true,
      written: results.filter(r => r.ok).length,
      failed: results.filter(r => !r.ok).length,
      results,
    });
  }

  // 单点
  if (!body.skuId || typeof body.qty !== 'number') {
    return NextResponse.json({ error: 'skuId + qty 必填 (或传 items[])' }, { status: 400 });
  }
  const r = await setInventory(orgId, body.skuId, body.qty, body.threshold);
  if (!r.ok) {
    return NextResponse.json({ error: r.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, record: r.record }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const orgId = await authenticate(req);
  if (!orgId) {
    return NextResponse.json({ error: '需要 Authorization: Bearer wn_xxx' }, { status: 401 });
  }
  const skuId = new URL(req.url).searchParams.get('skuId');
  if (!skuId) return NextResponse.json({ error: '?skuId= 必填' }, { status: 400 });
  const ok = await deleteInventory(orgId, skuId);
  return NextResponse.json({ ok });
}
