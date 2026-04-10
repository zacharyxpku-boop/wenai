import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const FEEDBACK_FILE = join(DATA_DIR, 'feedback.json');
const REVIEWS_FILE = join(DATA_DIR, 'reviews.json');

async function ensureDataDir() {
  try { await mkdir(DATA_DIR, { recursive: true }); } catch { /* exists */ }
}

async function readJSON(path: string) {
  try { return JSON.parse(await readFile(path, 'utf-8')); }
  catch { return {}; }
}

async function writeJSON(path: string, data: unknown) {
  await ensureDataDir();
  await writeFile(path, JSON.stringify(data, null, 2));
}

// POST: save feedback or review
export async function POST(request: NextRequest) {
  const { type, moduleId, key, data } = await request.json();

  if (type === 'feedback') {
    const all = await readJSON(FEEDBACK_FILE);
    if (!all[moduleId]) all[moduleId] = [];
    all[moduleId].push(data);
    // Keep last 200 per module
    if (all[moduleId].length > 200) all[moduleId] = all[moduleId].slice(-200);
    await writeJSON(FEEDBACK_FILE, all);
  } else if (type === 'review') {
    const all = await readJSON(REVIEWS_FILE);
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
    const all = await readJSON(FEEDBACK_FILE);
    const entries = all[moduleId] || [];
    const avg = entries.length > 0
      ? Math.round((entries.reduce((s: number, e: { rating: number }) => s + e.rating, 0) / entries.length) * 10) / 10
      : 0;
    return NextResponse.json({ entries, avg, total: entries.length });
  } else if (type === 'review' && key) {
    const all = await readJSON(REVIEWS_FILE);
    return NextResponse.json({ data: all[key] || null });
  }

  return NextResponse.json({ error: 'Missing params' }, { status: 400 });
}
