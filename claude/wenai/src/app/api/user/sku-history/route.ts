import { NextRequest, NextResponse } from 'next/server';
import { addSku, listSkus, updateSku, deleteSku, type SkuRecord } from '@/lib/sku-history';
import { resolveOrgId } from '@/lib/org-id';
import { recordBench } from '@/lib/cross-org-benchmark';

/**
 * /api/user/sku-history
 *   GET    返回当前用户的 SKU 列表 (最近 50)
 *   POST   新增一个 SKU
 *   PATCH  ?id=xxx  更新
 *   DELETE ?id=xxx  删除
 *
 * orgId 解析: src/lib/org-id.ts (跨 API 统一口径)
 */

export async function GET(req: NextRequest) {
  const orgId = await resolveOrgId(req);
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);
  const skus = await listSkus(orgId, limit);
  return NextResponse.json({ orgId, count: skus.length, skus });
}

export async function POST(req: NextRequest) {
  const orgId = await resolveOrgId(req);
  let body: Partial<SkuRecord>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name 必填' }, { status: 400 });
  }
  const record = await addSku(orgId, body);
  return NextResponse.json({ ok: true, sku: record });
}

export async function PATCH(req: NextRequest) {
  const orgId = await resolveOrgId(req);
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id 必填' }, { status: 400 });
  let body: Partial<SkuRecord>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }
  const updated = await updateSku(orgId, id, body);
  if (!updated) return NextResponse.json({ error: 'SKU 不存在' }, { status: 404 });

  // 跨 org 匿名 benchmark 写入 (只取数值, 不上传 SKU 名/orgId 实体)
  // 触发条件: 这次 patch 含 performance.ctr 或 .cpc, 且 SKU 有 category
  if (body.performance && updated.category) {
    const bestCtr = body.performance.bestCtr ?? body.performance.ctr;
    const cpc = body.performance.cpc;
    if (typeof bestCtr === 'number' && bestCtr > 0) {
      recordBench({
        orgId, skuId: id, category: updated.category, metric: 'ctr', value: bestCtr,
      }).catch(() => {});
    }
    if (typeof cpc === 'number' && cpc > 0) {
      recordBench({
        orgId, skuId: id, category: updated.category, metric: 'cpc', value: cpc,
      }).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true, sku: updated });
}

export async function DELETE(req: NextRequest) {
  const orgId = await resolveOrgId(req);
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id 必填' }, { status: 400 });
  const ok = await deleteSku(orgId, id);
  return NextResponse.json({ ok });
}
