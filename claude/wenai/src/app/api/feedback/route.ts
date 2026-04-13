import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const FEEDBACK_FILE = join(DATA_DIR, 'feedback.json');
const REVIEWS_FILE = join(DATA_DIR, 'reviews.json');

// In-memory fallback for serverless
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

  return NextResponse.json({ ok: true });
}

// GET: read feedback or review
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const moduleId = searchParams.get('moduleId');
  const key = searchParams.get('key');

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
