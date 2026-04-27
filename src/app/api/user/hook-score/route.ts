import { NextRequest, NextResponse } from 'next/server';
import { resolveOrgId } from '@/lib/org-id';
import { scoreHook, type HookKind } from '@/lib/hook-score';

/**
 * POST /api/user/hook-score
 * Body: { hookLine: string, category?: string, hookKind?: HookKind }
 *
 * 跑前先打分 · 0 LLM 调用, 0 cost-cap 占用 · 商家随便点
 *
 * Returns HookScoreResult (lib/hook-score.ts)
 */
export async function POST(req: NextRequest) {
  // 鉴权目的: 防止直接外部 spam (走 cookie session, 不用 Bearer)
  await resolveOrgId(req);

  let body: { hookLine?: string; category?: string; hookKind?: HookKind };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体非 JSON' }, { status: 400 });
  }
  if (!body.hookLine || typeof body.hookLine !== 'string') {
    return NextResponse.json({ error: 'hookLine 必填' }, { status: 400 });
  }
  if (body.hookLine.length > 200) {
    return NextResponse.json({ error: 'hookLine 过长 (>200 字)' }, { status: 400 });
  }
  const result = await scoreHook({
    hookLine: body.hookLine,
    category: body.category?.trim(),
    hookKind: body.hookKind,
  });
  return NextResponse.json(result);
}
