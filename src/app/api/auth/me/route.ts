import { NextRequest, NextResponse } from 'next/server';
import { getInviteByUsername, daysUntilExpiry } from '@/lib/invite-roster';

export async function GET(request: NextRequest) {
  // middleware 注入
  const username = request.headers.get('x-username');
  const tenantId = request.headers.get('x-tenant-id');
  const role = request.headers.get('x-user-role');

  if (!username) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // 如果是 beta 邀请用户 (beta_xxx),反查名册拿 expiresAt
  let displayName: string | null = null;
  let expiresAt: string | null = null;
  let daysLeft: number | null = null;
  let tier: string = 'free';

  const invite = await getInviteByUsername(username);
  if (invite) {
    displayName = invite.name;
    expiresAt = invite.expiresAt;
    daysLeft = daysUntilExpiry(invite.expiresAt);
    tier = invite.tier || 'free';
  }

  return NextResponse.json({
    username,
    tenantId,
    role,
    displayName,
    expiresAt,
    daysLeft,
    tier,
  });
}
