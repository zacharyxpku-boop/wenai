import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { createToken, getCookieName, verifyPassword } from '@/lib/auth';

interface AuthUserRecord {
  username: string;
  password: string;
  tenantId: string;
  role: string;
}

interface AuthConfig {
  users: AuthUserRecord[];
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    // Read auth config
    const authPath = join(process.cwd(), 'src/config/auth.json');
    const authData = await readFile(authPath, 'utf-8');
    const authConfig: AuthConfig = JSON.parse(authData);

    // Find user by username first, then verify password
    const matchedUser = authConfig.users.find(u => u.username === username);
    const user = matchedUser && await verifyPassword(password, matchedUser.password)
      ? matchedUser
      : null;

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify tenant config exists
    const tenantPath = join(process.cwd(), 'src/config/tenants', `${user.tenantId}.json`);
    try {
      await readFile(tenantPath, 'utf-8');
    } catch {
      return NextResponse.json(
        { error: 'Tenant configuration not found' },
        { status: 500 }
      );
    }

    // Create JWT
    const token = await createToken({
      username: user.username,
      tenantId: user.tenantId,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        username: user.username,
        tenantId: user.tenantId,
        role: user.role,
      },
    });

    response.cookies.set(getCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
