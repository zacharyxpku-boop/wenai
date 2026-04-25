import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { checkRateLimit } from '@/lib/ratelimit';

/**
 * 企业询盘 · ToB inbound channel
 * POST /api/sales/inquiry
 *
 * 客户填表 → 存 Redis hash + LIST · admin /admin/inquiries 看
 * 防 spam: 同 IP 每天 5 次
 */

interface Inquiry {
  company: string;
  contact: string;
  channel: string; // 邮箱/微信/手机
  scale: string;   // 规模档位
  category: string;
  painPoint: string;
  budget?: string;
  timeline?: string;
  source?: string; // 哪个页面来的
}

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const SCALE_ALLOWED = new Set(['<50', '50-200', '200-1000', '1000+']);
const CATEGORY_ALLOWED = new Set(['home', 'auto', 'digital', 'tool', 'living', 'mixed', 'other']);

function genId(): string {
  return `inq_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function getIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'anon';
}

export async function POST(req: NextRequest) {
  let body: Inquiry;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  // 必填校验
  if (!body.company?.trim() || !body.contact?.trim() || !body.painPoint?.trim()) {
    return NextResponse.json({ error: '公司名 / 联系方式 / 主要痛点 必填' }, { status: 400 });
  }
  if (body.painPoint.length > 2000) {
    return NextResponse.json({ error: '痛点描述过长 (>2000 字)' }, { status: 400 });
  }
  if (body.scale && !SCALE_ALLOWED.has(body.scale)) {
    return NextResponse.json({ error: '规模档位非法' }, { status: 400 });
  }
  if (body.category && !CATEGORY_ALLOWED.has(body.category)) {
    return NextResponse.json({ error: '品类档位非法' }, { status: 400 });
  }

  // 防 spam: 同 IP 每天 5 次
  const ip = getIp(req);
  const limit = await checkRateLimit('inquiry', `ip:${ip}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: '提交过于频繁,请稍后再试或直接邮件 zachary.x.pku@gmail.com' },
      { status: 429 }
    );
  }

  const id = genId();
  const payload = {
    id,
    company: body.company.slice(0, 120),
    contact: body.contact.slice(0, 120),
    channel: body.channel?.slice(0, 30) || '未指定',
    scale: body.scale || '',
    category: body.category || '',
    painPoint: body.painPoint.slice(0, 2000),
    budget: body.budget?.slice(0, 100) || '',
    timeline: body.timeline?.slice(0, 100) || '',
    source: body.source?.slice(0, 60) || '',
    ip,
    createdAt: new Date().toISOString(),
    status: 'new', // new / contacted / converted / dropped
  };

  if (redis) {
    try {
      await redis.hset(`wenai:inquiry:${id}`, payload);
      await redis.lpush('wenai:inquiries:list', id);
      await redis.ltrim('wenai:inquiries:list', 0, 499);
    } catch (e) {
      console.warn('[INQUIRY] Redis write failed', e);
    }
  }

  return NextResponse.json({ ok: true, id, message: '已收到 · 作者会在 24 小时内主动联系' });
}

export async function GET(req: NextRequest) {
  // Admin 列表 · 不做 admin auth header (复用 sessionStorage UI 端控制),仅按需暴露
  if (!redis) {
    return NextResponse.json({ inquiries: [], notice: 'Redis 未配置 · 询盘只在前端 alert 不持久化' });
  }
  try {
    const ids = await redis.lrange('wenai:inquiries:list', 0, 99);
    const inquiries = await Promise.all(
      ids.map(async (id) => {
        try {
          const raw = await redis!.hgetall(`wenai:inquiry:${id}`);
          return raw && Object.keys(raw).length > 0 ? raw : null;
        } catch { return null; }
      })
    );
    return NextResponse.json({ inquiries: inquiries.filter(Boolean) });
  } catch (e) {
    console.warn('[INQUIRY] Redis read fail', e);
    return NextResponse.json({ inquiries: [], error: 'read failed' }, { status: 500 });
  }
}

// 状态更新
export async function PATCH(req: NextRequest) {
  if (!redis) return NextResponse.json({ error: 'Redis 未配置' }, { status: 503 });
  const { id, status } = await req.json().catch(() => ({}));
  if (!id || !['new', 'contacted', 'converted', 'dropped'].includes(status)) {
    return NextResponse.json({ error: 'id + status (new/contacted/converted/dropped) 必填' }, { status: 400 });
  }
  try {
    await redis.hset(`wenai:inquiry:${id}`, { status, updatedAt: new Date().toISOString() });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'update fail' }, { status: 500 });
  }
}
