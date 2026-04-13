import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // These headers are injected by middleware after JWT verification
  const username = request.headers.get('x-username');
  const tenantId = request.headers.get('x-tenant-id');
  const role = request.headers.get('x-user-role');

  if (!username) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  return NextResponse.json({ username, tenantId, role });
}
