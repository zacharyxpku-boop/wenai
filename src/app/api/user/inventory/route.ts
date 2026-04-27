import { NextRequest, NextResponse } from 'next/server';
import { resolveOrgId } from '@/lib/org-id';
import { listInventory, setInventory, deleteInventory } from '@/lib/inventory';

/**
 * Cookie 侧的库存接口 · 给 /me/inventory 前端用
 *
 *   GET    /api/user/inventory                    列表
 *   PATCH  /api/user/inventory  { skuId, threshold, qty }   只改阈值 (qty 必传以保 record 完整)
 *   DELETE /api/user/inventory?skuId=             删一条
 *
 * 跟 /api/v1/inventory 区别: v1 走 API key 给 ERP, 这个走 cookie 给前端
 */

export async function GET(req: NextRequest) {
  const orgId = await resolveOrgId(req);
  const records = await listInventory(orgId);
  return NextResponse.json({
    count: records.length,
    inventory: records,
  });
}

export async function PATCH(req: NextRequest) {
  const orgId = await resolveOrgId(req);
  let body: { skuId?: string; threshold?: number; qty?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体非 JSON' }, { status: 400 });
  }
  if (!body.skuId || typeof body.qty !== 'number') {
    return NextResponse.json({ error: 'skuId + qty 必填' }, { status: 400 });
  }
  const r = await setInventory(orgId, body.skuId, body.qty, body.threshold);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json({ ok: true, record: r.record });
}

export async function DELETE(req: NextRequest) {
  const orgId = await resolveOrgId(req);
  const skuId = new URL(req.url).searchParams.get('skuId');
  if (!skuId) return NextResponse.json({ error: '?skuId= 必填' }, { status: 400 });
  const ok = await deleteInventory(orgId, skuId);
  return NextResponse.json({ ok });
}
