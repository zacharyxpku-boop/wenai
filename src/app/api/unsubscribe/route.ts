import { NextRequest, NextResponse } from 'next/server';
import { verifyUnsubscribeToken } from '@/lib/unsubscribe';
import { setUserSettings } from '@/lib/user-settings';

/**
 * GET /api/unsubscribe?token=xxx
 *   验证 token, 关掉 digestEmailEnabled, 302 跳 /unsubscribed?status=ok
 *   失败 (token 过期/伪造) 跳 /unsubscribed?status=invalid&reason=xxx
 *
 * 设计为 GET (邮件客户端只渲染 GET, 不发 POST)
 *   即使 token 被预取也只是把开关关掉, 不会泄漏任何信息
 *   被恶意复制 token 也只能关同一商家邮件 (持有 token 即获该 orgId 写权)
 *   secret 轮换可以让所有老 token 失效
 */

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token') || '';
  const result = verifyUnsubscribeToken(token);

  const base = url.origin;

  if (!result.ok) {
    return NextResponse.redirect(`${base}/unsubscribed?status=invalid&reason=${encodeURIComponent(result.reason || 'unknown')}`);
  }

  try {
    await setUserSettings(result.orgId!, { digestEmailEnabled: false });
  } catch {
    return NextResponse.redirect(`${base}/unsubscribed?status=error`);
  }

  return NextResponse.redirect(`${base}/unsubscribed?status=ok`);
}
