import { NextRequest, NextResponse } from 'next/server';
import { resolveOrgId } from '@/lib/org-id';
import { listWebhooks, addWebhook, removeWebhook } from '@/lib/webhook-config';

/**
 * 商家 webhook 列表管理
 *
 * GET    /api/user/webhooks                         列出当前 org 的全部 webhook (kind 已识别)
 * POST   /api/user/webhooks    { url, label? }      新增一条
 * DELETE /api/user/webhooks?id=wh_xxx               删一条
 *
 * 测试 ping 走 /api/user/webhooks/test (单独路由, body 携带 id)
 */

export async function GET(req: NextRequest) {
  const orgId = await resolveOrgId(req);
  const hooks = await listWebhooks(orgId);
  return NextResponse.json({
    count: hooks.length,
    webhooks: hooks.map(h => ({
      id: h.id,
      // 不返完整 url, 截前 60 字符防泄漏 (token 一般在末尾)
      urlPreview: h.url.slice(0, 60) + (h.url.length > 60 ? '…' : ''),
      kind: h.kind,
      label: h.label ?? null,
      createdAt: h.createdAt,
      lastFireAt: h.lastFireAt ?? null,
      lastError: h.lastError ?? null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const orgId = await resolveOrgId(req);
  let body: { url?: string; label?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体非 JSON' }, { status: 400 });
  }
  if (!body.url || typeof body.url !== 'string') {
    return NextResponse.json({ error: 'url 必填' }, { status: 400 });
  }
  const r = await addWebhook(orgId, body.url.trim(), body.label?.trim());
  if (!r.ok) {
    return NextResponse.json({ error: r.error }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    webhook: {
      id: r.entry!.id,
      kind: r.entry!.kind,
      label: r.entry!.label ?? null,
      createdAt: r.entry!.createdAt,
    },
  }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const orgId = await resolveOrgId(req);
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: '?id= 必填' }, { status: 400 });
  const ok = await removeWebhook(orgId, id);
  return NextResponse.json({ ok });
}
