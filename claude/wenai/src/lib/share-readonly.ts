import { Redis } from '@upstash/redis';

export interface ShareData {
  moduleId: string;
  title: string;
  content: string;
  source: string;
  createdAt: string;
}

type ShareGlobal = typeof globalThis & {
  __wenaiMemoryShareStore?: Map<string, ShareData>;
};

function getMemoryShareStore() {
  const target = globalThis as ShareGlobal;
  if (!target.__wenaiMemoryShareStore) target.__wenaiMemoryShareStore = new Map<string, ShareData>();
  return target.__wenaiMemoryShareStore;
}

export function setMemoryShare(id: string, payload: ShareData, ttlSeconds = 7 * 24 * 60 * 60) {
  const memoryShareStore = getMemoryShareStore();
  memoryShareStore.set(id, payload);
  setTimeout(() => memoryShareStore.delete(id), ttlSeconds * 1000);
}

export const SHARE_LABELS: Record<string, string> = {
  'pipeline-01': 'New listing pipeline',
  'pipeline-02': 'Influencer outbound pipeline',
  'pipeline-03': 'AI ecommerce image pipeline',
  'poc-report': 'POC acceptance report',
  module: 'Standard module output',
};

export async function getShare(id: string): Promise<ShareData | null> {
  const memoryShare = getMemoryShareStore().get(id);
  if (memoryShare) return memoryShare;

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    const raw = await redis.hgetall(`wenai:share:${id}`);
    if (!raw || Object.keys(raw).length === 0) return null;
    return raw as unknown as ShareData;
  } catch {
    return null;
  }
}

export function excerpt(markdown: string, maxLength: number): string {
  return markdown.replace(/[#*`>\-|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function readBulletValue(markdown: string, label: string): string {
  const pattern = new RegExp(`^-\\s*${escapeRegExp(label)}:\\s*(.+)$`, 'im');
  return markdown.match(pattern)?.[1]?.trim() || '';
}

function readSectionBullets(markdown: string, title: string, limit = 4): string[] {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex(line => line.trim().toLowerCase() === `## ${title.toLowerCase()}`);
  if (start < 0) return [];
  const items: string[] = [];
  for (const line of lines.slice(start + 1)) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) break;
    if (trimmed.startsWith('- ')) items.push(trimmed.slice(2).trim());
    if (items.length >= limit) break;
  }
  return items;
}

export function readCommercialBriefing(markdown: string) {
  const commercialBullets = readSectionBullets(markdown, 'Commercial briefing', 6);
  const commercialValue = (label: string) => {
    const item = commercialBullets.find(line => line.toLowerCase().startsWith(`${label.toLowerCase()}:`));
    return item?.slice(label.length + 1).trim() || '';
  };

  return {
    acceptanceScore: readBulletValue(markdown, 'Acceptance score'),
    commercialScore: readBulletValue(markdown, 'Commercial score'),
    decision: readBulletValue(markdown, 'Decision'),
    contractStatus: readBulletValue(markdown, 'Contract status'),
    commercialMotion: readBulletValue(markdown, 'Commercial motion'),
    priceSignal: readBulletValue(markdown, 'Price signal') || commercialValue('Price signal'),
    packageRecommendation: readBulletValue(markdown, 'Package recommendation') || commercialValue('Package recommendation'),
    ownerMessage: readBulletValue(markdown, 'Owner message') || commercialValue('Owner message'),
    proofPoints: readSectionBullets(markdown, 'Strengths', 4),
    conversionRisks: readSectionBullets(markdown, 'Blockers', 4),
    nextActions: readSectionBullets(markdown, 'Commercial next actions', 4),
  };
}

export type CommercialBriefingSnapshot = ReturnType<typeof readCommercialBriefing>;

export function buildExecutiveRecap(title: string, brief: CommercialBriefingSnapshot): string {
  const lines = [
    title,
    `Commercial motion: ${brief.commercialMotion || 'not specified'}`,
    `Contract status: ${brief.contractStatus || 'not specified'}`,
    `Acceptance score: ${brief.acceptanceScore || '--'}`,
    `Commercial score: ${brief.commercialScore || '--'}`,
    `Price signal: ${brief.priceSignal || 'not specified'}`,
    `Package recommendation: ${brief.packageRecommendation || 'not specified'}`,
    `Owner message: ${brief.ownerMessage || 'not specified'}`,
  ];

  if (brief.nextActions[0]) lines.push(`Next action: ${brief.nextActions[0]}`);
  if (brief.proofPoints[0]) lines.push(`Proof point: ${brief.proofPoints[0]}`);
  if (brief.conversionRisks[0]) lines.push(`Risk: ${brief.conversionRisks[0]}`);

  return lines.join('\n');
}
