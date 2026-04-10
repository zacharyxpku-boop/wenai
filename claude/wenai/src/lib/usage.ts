import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const USAGE_FILE = join(DATA_DIR, 'usage.json');

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
  } catch { /* exists */ }
}

export async function readUsage(): Promise<UsageData> {
  try {
    const raw = await readFile(USAGE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { entries: [] };
  }
}

export async function writeUsage(data: UsageData) {
  await ensureDataDir();
  data.entries = data.entries.slice(-5000);
  await writeFile(USAGE_FILE, JSON.stringify(data, null, 2));
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
