import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { Redis } from '@upstash/redis';

const DATA_DIR = join(process.cwd(), 'data');
const FEEDBACK_FILE = join(DATA_DIR, 'feedback.json');
const REVIEWS_FILE = join(DATA_DIR, 'reviews.json');

// 存储层优先级：Upstash Redis → 本地文件 → 进程内存
// Vercel serverless 上只有 Redis 能真正持久化跨请求
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// In-memory fallback for serverless (only used when neither Redis nor file works)
let memFeedback: Record<string, unknown[]> = {};
let memReviews: Record<string, unknown> = {};
let useMemory = false;

async function ensureDataDir() {
  try { await mkdir(DATA_DIR, { recursive: true }); }
  catch { useMemory = true; }
}

async function readJSON(path: string) {
  if (useMemory) return path === FEEDBACK_FILE ? memFeedback : memReviews;
  try { return JSON.parse(await readFile(path, 'utf-8')); }
  catch { return {}; }
}

async function writeJSON(path: string, data: Record<string, unknown>) {
  if (useMemory) {
    if (path === FEEDBACK_FILE) memFeedback = data as Record<string, unknown[]>;
    else memReviews = data;
    return;
  }
  try {
    await ensureDataDir();
    await writeFile(path, JSON.stringify(data, null, 2));
  } catch {
    useMemory = true;
    if (path === FEEDBACK_FILE) memFeedback = data as Record<string, unknown[]>;
    else memReviews = data;
  }
}

// POST: save feedback or review
export async function POST(request: NextRequest) {
  let type: string, moduleId: string, key: string, data: unknown;
  try {
    ({ type, moduleId, key, data } = await request.json());
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  // Redis path (production)
  if (redis && type === 'feedback') {
    try {
      // List push, 截断到 200
      const listKey = `wenai:feedback:${moduleId}`;
      await redis.lpush(listKey, JSON.stringify(data));
      await redis.ltrim(listKey, 0, 199);
      return NextResponse.json({ ok: true, store: 'redis' });
    } catch (e) {
      console.error('[FEEDBACK] Redis write failed, falling back', e);
    }
  }
  if (redis && type === 'review') {
    try {
      await redis.hset(`wenai:reviews`, { [key]: JSON.stringify(data) });
      return NextResponse.json({ ok: true, store: 'redis' });
    } catch (e) {
      console.error('[FEEDBACK] Redis write failed, falling back', e);
    }
  }

  // File/memory path (dev)
  if (type === 'feedback') {
    const all = await readJSON(FEEDBACK_FILE) as Record<string, unknown[]>;
    if (!all[moduleId]) all[moduleId] = [];
    all[moduleId].push(data);
    if (all[moduleId].length > 200) all[moduleId] = all[moduleId].slice(-200);
    await writeJSON(FEEDBACK_FILE, all);
  } else if (type === 'review') {
    const all = await readJSON(REVIEWS_FILE) as Record<string, unknown>;
    all[key] = data;
    await writeJSON(REVIEWS_FILE, all);
  }

  return NextResponse.json({ ok: true, store: useMemory ? 'memory' : 'file' });
}

// GET: read feedback or review
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const moduleId = searchParams.get('moduleId');
  const key = searchParams.get('key');

  // Redis path
  if (redis && type === 'feedback' && moduleId) {
    try {
      const raw = await redis.lrange(`wenai:feedback:${moduleId}`, 0, 199);
      const entries = raw.map(r => {
        try { return typeof r === 'string' ? JSON.parse(r) : r; } catch { return null; }
      }).filter(Boolean) as { rating: number }[];
      const avg = entries.length > 0
        ? Math.round((entries.reduce((s, e) => s + e.rating, 0) / entries.length) * 10) / 10
        : 0;
      return NextResponse.json({ entries, avg, total: entries.length, store: 'redis' });
    } catch (e) {
      console.error('[FEEDBACK] Redis read failed, falling back', e);
    }
  }
  if (redis && type === 'review' && key) {
    try {
      const raw = await redis.hget('wenai:reviews', key);
      const data = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
      return NextResponse.json({ data, store: 'redis' });
    } catch (e) {
      console.error('[FEEDBACK] Redis read failed, falling back', e);
    }
  }

  // Summary of all modules (for dashboard)
  if (redis && type === 'summary') {
    try {
      const keys = await redis.keys('wenai:feedback:*');
      const summary: Record<string, { total: number; goodRatio: number }> = {};
      for (const k of keys) {
        const moduleId = k.replace('wenai:feedback:', '');
        const raw = await redis.lrange(k, 0, 199);
        const entries = raw.map(r => {
          try { return typeof r === 'string' ? JSON.parse(r) : r; } catch { return null; }
        }).filter(Boolean) as { verdict?: string; rating: number }[];
        const good = entries.filter(e => e.verdict === 'good' || e.rating >= 4).length;
        summary[moduleId] = {
          total: entries.length,
          goodRatio: entries.length > 0 ? Math.round((good / entries.length) * 100) : 0,
        };
      }
      return NextResponse.json({ summary, store: 'redis' });
    } catch (e) {
      console.error('[FEEDBACK] Redis summary failed', e);
    }
  }

  // File path
  if (type === 'feedback' && moduleId) {
    const all = await readJSON(FEEDBACK_FILE) as Record<string, { rating: number }[]>;
    const entries = all[moduleId] || [];
    const avg = entries.length > 0
      ? Math.round((entries.reduce((s: number, e) => s + e.rating, 0) / entries.length) * 10) / 10
      : 0;
    return NextResponse.json({ entries, avg, total: entries.length });
  } else if (type === 'review' && key) {
    const all = await readJSON(REVIEWS_FILE) as Record<string, unknown>;
    return NextResponse.json({ data: all[key] || null });
  }

  return NextResponse.json({ error: 'Missing params' }, { status: 400 });
}
