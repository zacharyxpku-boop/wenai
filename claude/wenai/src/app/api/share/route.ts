import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { checkRateLimit } from '@/lib/ratelimit';
import { verifyToken, getCookieName } from '@/lib/auth';
import { getShare, setMemoryShare, type ShareData } from '@/lib/share-readonly';

/**
 * 结果分享 · 朋友跑完 Pipeline 点分享 → 得到公开 /share/<id>
 *
 * 存储:
 *   Redis hash key wenai:share:<id> = {moduleId, title, content, createdAt, source}
 *   TTL 7 天自动过期（避免 Redis 越堆越大）
 *
 * 不走 Redis 的降级（无 UPSTASH）:
 *   使用内存 Map,serverless cold start 会丢,但 share 功能本身是 P2 不致命
 */

interface SharePayload {
  id?: string;
  moduleId: string;
  title: string;
  content: string;
  source?: 'pipeline-01' | 'pipeline-02' | 'pipeline-03' | 'poc-report' | 'module';
}

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

function genId(): string {
  // Base36 时间戳 + 6 字节 random = 读得懂 + 防猜
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}${rand}`;
}

export async function POST(request: NextRequest) {
  let body: SharePayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }
  if (!body.content || body.content.length < 20) {
    return NextResponse.json({ error: '内容过短' }, { status: 400 });
  }
  if (body.content.length > 30000) {
    return NextResponse.json({ error: '内容过长 (>30K · 约 10000 中文字)' }, { status: 413 });
  }

  // Per-user rate limit · 防滥用 30 次/天
  let rateKey = 'anon';
  try {
    const token = request.cookies.get(getCookieName())?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.username) rateKey = payload.username;
    }
  } catch {}
  const limit = await checkRateLimit('share', rateKey);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `分享链接每日 30 次上限已达 · ${new Date(limit.resetAt).toLocaleString('zh-CN')} 重置` },
      { status: 429 }
    );
  }

  const id = typeof body.id === 'string' && body.id.trim().length > 0 ? body.id.trim() : genId();
  const payload: ShareData = {
    moduleId: body.moduleId || 'unknown',
    title: (body.title || '').slice(0, 120),
    content: body.content.slice(0, 30000),
    source: body.source || 'module',
    createdAt: new Date().toISOString(),
  };

  if (redis) {
    try {
      await redis.hset(`wenai:share:${id}`, { ...payload });
      await redis.expire(`wenai:share:${id}`, TTL_SECONDS);
    } catch (e) {
      console.warn('[share] redis fail, fallback memory', e);
      setMemoryShare(id, payload, TTL_SECONDS);
    }
  } else {
    setMemoryShare(id, payload, TTL_SECONDS);
  }

  return NextResponse.json({ id, url: `/share/${id}`, ttlDays: 7 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 });

  if (redis) {
    try {
      const data = await redis.hgetall(`wenai:share:${id}`);
      if (data && Object.keys(data).length > 0) {
        return NextResponse.json({ ok: true, data });
      }
    } catch (e) {
      console.warn('[share] redis read fail', e);
    }
  }

  const mem = await getShare(id);
  if (mem) return NextResponse.json({ ok: true, data: mem });

  return NextResponse.json({ error: '分享已过期或不存在' }, { status: 404 });
}
