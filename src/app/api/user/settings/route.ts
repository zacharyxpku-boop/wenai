import { NextRequest, NextResponse } from 'next/server';
import { resolveOrgId } from '@/lib/org-id';
import { getUserSettings, setUserSettings, isValidEmail, type UserSettings } from '@/lib/user-settings';

/**
 * GET  /api/user/settings        当前 orgId 的设置
 * PATCH /api/user/settings       合并更新 (email/digestEmailEnabled/digestSeverityMin/industry)
 *
 * email 改动会做 isValidEmail 校验, 拒绝明显格式错误
 * digestSeverityMin 限定枚举, 其他值忽略
 */

export async function GET(req: NextRequest) {
  const orgId = await resolveOrgId(req);
  const settings = await getUserSettings(orgId);
  return NextResponse.json({ orgId, settings });
}

export async function PATCH(req: NextRequest) {
  const orgId = await resolveOrgId(req);
  let body: UserSettings;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  const patch: UserSettings = {};
  if (body.email !== undefined) {
    const trimmed = String(body.email).trim();
    if (trimmed && !isValidEmail(trimmed)) {
      return NextResponse.json({ error: 'email 格式不对' }, { status: 400 });
    }
    patch.email = trimmed || undefined;
  }
  if (typeof body.digestEmailEnabled === 'boolean') {
    patch.digestEmailEnabled = body.digestEmailEnabled;
  }
  if (body.digestSeverityMin) {
    if (['critical', 'warning', 'info'].includes(body.digestSeverityMin)) {
      patch.digestSeverityMin = body.digestSeverityMin;
    }
  }
  if (body.industry !== undefined) {
    patch.industry = String(body.industry).trim().slice(0, 80) || undefined;
  }

  const merged = await setUserSettings(orgId, patch);
  return NextResponse.json({ ok: true, settings: merged });
}
