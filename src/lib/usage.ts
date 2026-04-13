import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const USAGE_FILE = join(DATA_DIR, 'usage.json');

// In-memory fallback for serverless (read-only filesystem)
let memoryStore: UsageData = { entries: [] };
let useMemoryFallback = false;

export interface UsageEntry {
  moduleId: string;
  tenantId: string;
  userId?: string;
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
  data.entries = data.entries.slice(-10000);
  if (useMemoryFallback) {
    memoryStore = data;
    return;
  }
  try {
    await ensureDataDir();
    await writeFile(USAGE_FILE, JSON.stringify(data, null, 2));
  } catch {
    useMemoryFallback = true;
    memoryStore = data;
  }
}

export async function logUsageEntry(
  moduleId: string,
  tokens: number,
  rating?: number,
  tenantId: string = 'default',
  userId?: string
) {
  try {
    const data = await readUsage();
    data.entries.push({
      moduleId,
      tenantId,
      userId,
      timestamp: Date.now(),
      tokens: tokens || 0,
      rating,
    });
    await writeUsage(data);
  } catch { /* non-critical */ }
}

/**
 * Get usage stats filtered by tenant
 */
export async function getTenantUsage(tenantId: string) {
  const data = await readUsage();
  const tenantEntries = data.entries.filter(e => e.tenantId === tenantId);
  const now = Date.now();
  const today = now - 24 * 60 * 60 * 1000;
  const week = now - 7 * 24 * 60 * 60 * 1000;
  const month = now - 30 * 24 * 60 * 60 * 1000;

  return {
    today: tenantEntries.filter(e => e.timestamp > today).length,
    week: tenantEntries.filter(e => e.timestamp > week).length,
    month: tenantEntries.filter(e => e.timestamp > month).length,
    totalTokens: tenantEntries.filter(e => e.timestamp > month).reduce((s, e) => s + e.tokens, 0),
  };
}
