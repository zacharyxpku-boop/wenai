import { NextRequest, NextResponse } from 'next/server';
import { createToken, getCookieName } from '@/lib/auth';

// 内测邀请名册。优先读 env var INVITE_ROSTER (JSON 格式)，否则用默认硬编码名册。
// 改名字：Vercel dashboard → env var INVITE_ROSTER 改一行即可，不用 push 代码。
//
// env 格式示例：
//   INVITE_ROSTER={"alice":{"name":"Alice","expiresAt":"2026-04-30"},"bob":{...}}

type Invite = { name: string; expiresAt: string; tenantId?: string };

const DEFAULT_INVITES: Record<string, Invite> = {
  alice: { name: 'Alice', expiresAt: '2026-04-30', tenantId: 'default' },
  bob: { name: 'Bob', expiresAt: '2026-04-30', tenantId: 'default' },
  charlie: { name: 'Charlie', expiresAt: '2026-04-30', tenantId: 'default' },
  demo: { name: '体验用户', expiresAt: '2099-12-31', tenantId: 'default' },
  wzqfriend: { name: '跨境代运营朋友', expiresAt: '2026-05-15', tenantId: 'default' },
};

function getInvites(): Record<string, Invite> {
  const fromEnv = process.env.INVITE_ROSTER;
  if (!fromEnv) return DEFAULT_INVITES;
  try {
    const parsed = JSON.parse(fromEnv) as Record<string, Invite>;
    // 合并：env 覆盖默认
    return { ...DEFAULT_INVITES, ...parsed };
  } catch (e) {
    console.warn('[INVITE] INVITE_ROSTER JSON 解析失败，使用默认名册', e);
    return DEFAULT_INVITES;
  }
}

const INVITES = getInvites();

export async function POST(req: NextRequest) {
  const { code } = await req.json().catch(() => ({ code: '' }));
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
