import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { tier?: string; email?: string };
  return NextResponse.json({
    ok: false,
    status: 'early_bird_only',
    tier: body.tier === 'Growth' ? 'Growth' : body.tier === 'Starter' ? 'Starter' : 'Free',
    message: 'Starter/Growth 支付暂未开放。请在前端留下邮箱获取上线通知，系统不会写入虚假的已升级状态。',
    updatedAt: new Date().toISOString(),
  }, { status: 501 });
}
