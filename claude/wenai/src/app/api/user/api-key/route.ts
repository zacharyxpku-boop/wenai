import { NextRequest, NextResponse } from 'next/server';
import { resolveOrgId } from '@/lib/org-id';
import { issueApiKey, getApiKeyMetaByOrg, revokeApiKey } from '@/lib/api-key';

/**
 * 商家 API key 管理
 *
 * GET    /api/user/api-key      返回当前 key meta (不返完整 raw, 只 prefix)
 * POST   /api/user/api-key      签发新 key (replaces old) · 一次性返完整 raw
 * DELETE /api/user/api-key      撤销当前 key
 *
 * Body for POST: { label?: string } 可选 label 帮商家区分 ("生产 ERP" / "测试")
 */

export async function GET(req: NextRequest) {
  const orgId = await resolveOrgId(req);
  const meta = await getApiKeyMetaByOrg(orgId);
  if (!meta) {
    return NextResponse.json({ key: null });
  }
  return NextResponse.json({
    key: {
      prefix: meta.prefix,
      createdAt: meta.createdAt,
      lastUsedAt: meta.lastUsedAt ?? null,
      label: meta.label ?? null,
    },
  });
}

export async function POST(req: NextRequest) {
  const orgId = await resolveOrgId(req);
  let label: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    if (typeof body?.label === 'string') label = body.label;
  } catch { /* ignore */ }
  const result = await issueApiKey(orgId, label);
  return NextResponse.json({
    rawKey: result.rawKey,        // 只这次返
    prefix: result.meta.prefix,
    createdAt: result.meta.createdAt,
    label: result.meta.label ?? null,
    note: '请立即复制保存. 关页后无法再看完整 key, 只能重新签发 (会让旧 key 失效).',
  });
}

export async function DELETE(req: NextRequest) {
  const orgId = await resolveOrgId(req);
  const ok = await revokeApiKey(orgId);
  return NextResponse.json({ ok });
}
