import { NextRequest, NextResponse } from 'next/server';
import { resolveOrgId } from '@/lib/org-id';
import { sendTestPing } from '@/lib/webhook-out';

/**
 * POST /api/user/webhooks/test  { id: 'wh_xxx' }
 *
 * 给指定 webhook 发一条假 digest, 验证 URL 是否通
 * 商家在 settings 点"测试"按钮时调
 */
export async function POST(req: NextRequest) {
  const orgId = await resolveOrgId(req);
  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体非 JSON' }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: 'id 必填' }, { status: 400 });
  const r = await sendTestPing(orgId, body.id);
  return NextResponse.json(r);
}
