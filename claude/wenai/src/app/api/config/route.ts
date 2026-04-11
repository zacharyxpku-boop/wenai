import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { verifyToken, getCookieName } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getTenantId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    return payload?.tenantId ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const configPath = join(process.cwd(), 'src/config/tenants', `${tenantId}.json`);
    const data = await readFile(configPath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ error: 'Tenant config not found' }, { status: 404 });
  }
}

export async function POST(request: NextRequest) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const config = await request.json();
    const configPath = join(process.cwd(), 'src/config/tenants', `${tenantId}.json`);
    try {
      await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    } catch {
      return NextResponse.json(
        { error: '当前为云端部署模式，配置修改请通过代码提交' },
        { status: 403 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: `Save failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
