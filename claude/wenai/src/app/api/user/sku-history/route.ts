import { NextRequest, NextResponse } from 'next/server';
import { addSku, listSkus, updateSku, deleteSku, type SkuRecord } from '@/lib/sku-history';
import { verifyToken, getCookieName } from '@/lib/auth';

/**
 * /api/user/sku-history
 *   GET    返回当前用户的 SKU 列表 (最近 50)
 *   POST   新增一个 SKU
 *   PATCH  ?id=xxx  更新
 *   DELETE ?id=xxx  删除
 *
 * orgId 解析:
 *   - 优先 cookie token 里的 username
 *   - 否则 x-tenant-id header
 *   - 否则 IP (匿名)
 */

function getIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  return fwd?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'anon';
}

async function resolveOrgId(req: NextRequest): Promise<string> {
  try {
    const token = req.cookies.get(getCookieName())?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.username) return payload.username;
    }
  } catch {}
  return req.headers.get('x-tenant-id') || `ip:${getIp(req)}`;
}

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
