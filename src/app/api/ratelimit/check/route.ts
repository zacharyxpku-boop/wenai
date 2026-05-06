import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/ratelimit';
import { verifyToken, getCookieName } from '@/lib/auth';
import { inferPlanFromUser } from '@/lib/entitlements';

/**
 * Pipeline 级别配额检查
 * 用法：POST /api/ratelimit/check  body: { kind: 'pipeline:new-listing' }
 * 返回：{ allowed, remaining, resetAt }
 * 调用一次只消耗 1 次配额，Pipeline 页在触发 3 路并发前调用此接口预占。
 */
export async function POST(request: NextRequest) {
  const { kind } = await request.json().catch(() => ({ kind: '' }));
  if (!kind || typeof kind !== 'string') {
    return NextResponse.json({ error: 'kind 参数必需' }, { status: 400 });
  }

  // 按 JWT 用户名隔离
  let rateKey = request.headers.get('x-tenant-id') || 'default';
  let plan = 'free';
  try {
    const token = request.cookies.get(getCookieName())?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.username) {
        rateKey = payload.username;
        plan = inferPlanFromUser(payload.role);
      }
    }
  } catch {}

  const limit = await checkRateLimit(kind, rateKey, plan);
  return NextResponse.json({
    allowed: limit.allowed,
    remaining: limit.remaining,
    resetAt: limit.resetAt,
    resetAtText: new Date(limit.resetAt).toLocaleString('zh-CN'),
  }, { status: limit.allowed ? 200 : 429 });
}
