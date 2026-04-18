import { NextRequest, NextResponse } from 'next/server';
import { getInvitesAsync, setInvite, deleteInvite, type Invite } from '@/lib/invite-roster';

/**
 * /admin/invites 后端 · CRUD 邀请码
 *
 * 简易口令: 要求 header x-admin-key 含合法口令
 *   - 生产: 从 env var ADMIN_KEY 读
 *   - 未配置: 直接放行 (单人开发)
 */

function authed(req: NextRequest): boolean {
  const required = process.env.ADMIN_KEY;
  if (!required) return true;
  return req.headers.get('x-admin-key') === required;
}

export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const invites = await getInvitesAsync();
  return NextResponse.json({ invites });
}

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.code || !body?.name || !body?.expiresAt) {
    return NextResponse.json({ error: 'code/name/expiresAt 必填' }, { status: 400 });
  }
  const invite: Invite = {
    name: body.name,
    expiresAt: body.expiresAt,
    tenantId: body.tenantId || 'default',
    tier: body.tier || 'free',
  };
  const r = await setInvite(body.code, invite);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json({ ok: true, code: body.code, invite });
}

export async function DELETE(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'code 必填' }, { status: 400 });
  const r = await deleteInvite(code);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
