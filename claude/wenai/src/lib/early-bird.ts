export type EarlyBirdTier = 'Starter' | 'Growth';

export interface EarlyBirdLead {
  id: string;
  tier: EarlyBirdTier;
  email: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveEarlyBirdLeadInput {
  tier: EarlyBirdTier;
  email: string;
  source: string;
}

const EARLY_BIRD_KEY = 'wenai_early_bird_emails';
const MAX_LEADS = 200;
const memoryLeads = new Map<string, string>();

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readRaw() {
  if (!canUseStorage()) return memoryLeads.get(EARLY_BIRD_KEY) || '[]';
  try {
    return window.localStorage.getItem(EARLY_BIRD_KEY) || '[]';
  } catch {
    return memoryLeads.get(EARLY_BIRD_KEY) || '[]';
  }
}

function writeRaw(value: string) {
  memoryLeads.set(EARLY_BIRD_KEY, value);
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(EARLY_BIRD_KEY, value);
  } catch {
    memoryLeads.set(EARLY_BIRD_KEY, value);
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEarlyBirdEmail(email: string) {
  const normalized = normalizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized);
}

function normalizeLead(raw: Partial<EarlyBirdLead> & { createdAt?: string }, index: number): EarlyBirdLead | null {
  const tier = raw.tier === 'Growth' ? 'Growth' : raw.tier === 'Starter' ? 'Starter' : null;
  const email = typeof raw.email === 'string' ? normalizeEmail(raw.email) : '';
  if (!tier || !isValidEarlyBirdEmail(email)) return null;
  const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : new Date(0).toISOString();
  return {
    id: typeof raw.id === 'string' ? raw.id : `lead-${index}-${email}-${tier}`,
    tier,
    email,
    source: typeof raw.source === 'string' && raw.source.trim() ? raw.source.trim() : 'unknown',
    createdAt,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : createdAt,
  };
}

export function loadEarlyBirdLeads(): EarlyBirdLead[] {
  try {
    const parsed = JSON.parse(readRaw()) as Array<Partial<EarlyBirdLead>>;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item, index) => normalizeLead(item, index))
      .filter((item): item is EarlyBirdLead => Boolean(item))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

export function saveEarlyBirdLead(input: SaveEarlyBirdLeadInput) {
  const email = normalizeEmail(input.email);
  if (!isValidEarlyBirdEmail(email)) {
    return { ok: false as const, error: '请输入有效的工作邮箱。' };
  }

  const now = new Date().toISOString();
  const current = loadEarlyBirdLeads();
  const existingIndex = current.findIndex(lead => lead.email === email && lead.tier === input.tier);
  const nextLead: EarlyBirdLead = existingIndex >= 0
    ? { ...current[existingIndex], source: input.source, updatedAt: now }
    : {
        id: `lead-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        tier: input.tier,
        email,
        source: input.source,
        createdAt: now,
        updatedAt: now,
      };
  const withoutDuplicate = current.filter((_, index) => index !== existingIndex);
  const next = [nextLead, ...withoutDuplicate].slice(0, MAX_LEADS);
  writeRaw(JSON.stringify(next));
  return { ok: true as const, lead: nextLead };
}

function escapeCsvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export function exportEarlyBirdLeads(range: 'all' | '7d' | '30d' = 'all') {
  const cutoff = range === 'all' ? 0 : Date.now() - (range === '7d' ? 7 : 30) * 24 * 60 * 60 * 1000;
  const leads = loadEarlyBirdLeads().filter(lead => new Date(lead.updatedAt).getTime() >= cutoff);
  const header = ['email', 'tier', 'source', 'created_at', 'updated_at'];
  const rows = leads.map(lead => [lead.email, lead.tier, lead.source, lead.createdAt, lead.updatedAt]);
  return {
    leads,
    json: JSON.stringify(leads, null, 2),
    csv: [header.join(','), ...rows.map(row => row.map(escapeCsvCell).join(','))].join('\n'),
  };
}

export function getEarlyBirdStats() {
  const leads = loadEarlyBirdLeads();
  const starter = leads.filter(lead => lead.tier === 'Starter').length;
  const growth = leads.filter(lead => lead.tier === 'Growth').length;
  const bySource = leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {});
  return { total: leads.length, starter, growth, bySource, leads };
}
