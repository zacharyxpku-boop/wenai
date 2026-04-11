import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const USAGE_FILE = join(DATA_DIR, 'usage.json');

// In-memory fallback for serverless (read-only filesystem)
let memoryStore: UsageData = { entries: [] };
let useMemoryFallback = false;

export interface UsageEntry {
  moduleId: string;
  timestamp: number;
  tokens: number;
  rating?: number;
}

export interface UsageData {
  entries: UsageEntry[];
}

async function ensureDataDir() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
  } catch {
    useMemoryFallback = true;
  }
}

export async function readUsage(): Promise<UsageData> {
  if (useMemoryFallback) return memoryStore;
  try {
    const raw = await readFile(USAGE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { entries: [] };
  }
}

export async function writeUsage(data: UsageData) {
  data.entries = data.entries.slice(-5000);
  if (useMemoryFallback) {
    memoryStore = data;
    return;
  }
  try {
    await ensureDataDir();
    await writeFile(USAGE_FILE, JSON.stringify(data, null, 2));
  } catch {
    // Serverless read-only FS — fall back to memory
    useMemoryFallback = true;
    memoryStore = data;
  }
}

export async function logUsageEntry(moduleId: string, tokens: number, rating?: number) {
  try {
    const data = await readUsage();
    data.entries.push({
      moduleId,
      timestamp: Date.now(),
      tokens: tokens || 0,
      rating,
    });
    await writeUsage(data);
  } catch { /* non-critical */ }
}
