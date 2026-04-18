import { NextRequest, NextResponse } from 'next/server';
import { createToken, getCookieName } from '@/lib/auth';
import { getInvitesAsync } from '@/lib/invite-roster';

// 名册支持三级: Redis (动态可改) / env INVITE_ROSTER / 内置默认
// 查询每次走 async 拿到最新 Redis 数据

export async function POST(req: NextRequest) {
  const { code } = await req.json().catch(() => ({ code: '' }));
  const INVITES = await getInvitesAsync();
  const invite = INVITES[String(code || '').toLowerCase().trim()];

  if (!invite) {
    return NextResponse.json(
      { success: false, error: '邀请码无效或已过期' },
      { status: 404 }
    );
  }

  // 过期检查
  if (new Date(invite.expiresAt) < new Date()) {
    return NextResponse.json(
      { success: false, error: `邀请已于 ${invite.expiresAt} 过期，请联系作者续期` },
      { status: 403 }
    );
  }

  const token = await createToken({
    username: `beta_${code}`,
    tenantId: invite.tenantId || 'default',
    role: 'viewer',
  });

  const response = NextResponse.json({
    success: true,
    mode: 'beta',
    name: invite.name,
    expiresAt: invite.expiresAt,
  });

  response.cookies.set(getCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days beta
    path: '/',
  });

  return response;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  if (!code) {
    return NextResponse.json({ success: false, error: '缺少邀请码' }, { status: 400 });
  }
  const INVITES = await getInvitesAsync();
  const invite = INVITES[code.toLowerCase().trim()];
  if (!invite) {
    return NextResponse.json({ success: false, error: '邀请码无效' }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    name: invite.name,
    expiresAt: invite.expiresAt,
    valid: new Date(invite.expiresAt) >= new Date(),
  });
}
