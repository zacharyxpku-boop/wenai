import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { getInvitesAsync, daysUntilExpiry } from '@/lib/invite-roster';

/**
 * Admin 侧顶部徽章聚合
 * GET /api/admin/notifications
 *
 * 返回各 admin tab 的 pending 数字:
 *   payments  · 未标为 processed 的付款声明数
 *   feedback  · 最近 24h 新反馈数
 *   invites   · 将在 7 天内过期的邀请码数
 *
 * 注: payments 的 processed 状态存在 client localStorage,后端不知道,
 *    这里返回 "声明总数",让前端用 localStorage 计算真实 pending。
 */

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export async function GET() {
  let paymentTotal = 0;
  let feedback24h = 0;

  // Payments
  if (redis) {
    try {
      const raw = await redis.lrange('wenai:feedback:payment-claim', 0, 199);
      paymentTotal = raw.length;
    } catch {}
  }

  // Recent 24h feedback across all non-payment modules
  if (redis) {
    try {
      const keys = await redis.keys('wenai:feedback:*');
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      for (const k of keys) {
        if (k.endsWith('payment-claim')) continue;
        const raw = await redis.lrange(k, 0, 199);
        for (const r of raw) {
          try {
            const obj = typeof r === 'string' ? JSON.parse(r) : r;
            if (obj?.timestamp && new Date(obj.timestamp).getTime() > cutoff) {
              feedback24h++;
            }
          } catch {}
        }
      }
    } catch {}
  }

  // Invites expiring within 7 days
  let invitesExpiringSoon = 0;
  try {
    const invites = await getInvitesAsync();
    for (const inv of Object.values(invites)) {
      const d = daysUntilExpiry(inv.expiresAt);
      if (d >= 0 && d <= 7) invitesExpiringSoon++;
    }
  } catch {}

  // 新询盘 (status === 'new')
  let inquiriesNew = 0;
  if (redis) {
    try {
      const ids = await redis.lrange('wenai:inquiries:list', 0, 199);
      for (const id of ids) {
        try {
          const status = await redis.hget(`wenai:inquiry:${id}`, 'status');
          if (!status || status === 'new') inquiriesNew++;
        } catch {}
      }
    } catch {}
  }

  return NextResponse.json({
    paymentsTotal: paymentTotal,
    feedback24h,
    invitesExpiringSoon,
    inquiriesNew,
  });
}
