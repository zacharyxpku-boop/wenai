import { NextResponse } from 'next/server';
import { createToken, getCookieName } from '@/lib/auth';

export async function POST() {
  const token = await createToken({
    username: 'demo',
    tenantId: 'default',
    role: 'viewer',
  });

  const response = NextResponse.json({ success: true, mode: 'demo' });

  response.cookies.set(getCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 2, // 2 hours for demo
    path: '/',
  });

  return response;
}
