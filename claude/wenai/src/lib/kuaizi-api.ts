'use client';

import { track } from '@/lib/local-analytics';

export type KuaiziEndpoint = 'production' | 'sandbox';
export type KuaiziTaskStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface KuaiziConfigInput {
  apiKey: string;
  endpoint: KuaiziEndpoint;
}

export interface KuaiziConfig {
  apiKey: string;
  endpoint: KuaiziEndpoint;
  baseUrl: string;
  maskedApiKey: string;
  savedAt: string;
}

export interface KuaiziBriefPayload {
  projectId: string;
  runId: string;
  title: string;
  hook: string;
  angle: string;
  offer: string;
  cta: string;
  format: string;
  sourceBriefMarkdown: string;
}

export interface KuaiziProductionTask {
  taskId: string;
  status: KuaiziTaskStatus;
  assetUrls: string[];
  providerRaw?: unknown;
}

export interface KuaiziConnectionResult {
  ok: boolean;
  message: string;
  status?: number;
}

export interface KuaiziApiErrorDetail {
  status?: number;
  operation: 'health' | 'create_job' | 'poll_job';
  message: string;
}

const CONFIG_KEY = 'wenai_kuaizi_config_v1';
const ENDPOINTS: Record<KuaiziEndpoint, string> = {
  production: 'https://openapi.kuaizi.ai/v1',
  sandbox: 'https://sandbox.openapi.kuaizi.ai/v1',
};

function browserAvailable() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function encode(text: string) {
  const salt = browserAvailable() ? window.location.origin : 'wenai';
  const mixed = Array.from(text).map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ salt.charCodeAt(index % salt.length))).join('');
  return btoa(unescape(encodeURIComponent(mixed)));
}

function decode(text: string) {
  const salt = browserAvailable() ? window.location.origin : 'wenai';
  const mixed = decodeURIComponent(escape(atob(text)));
  return Array.from(mixed).map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ salt.charCodeAt(index % salt.length))).join('');
}

function requestWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  return fetch(input, { ...init, signal: controller.signal }).finally(() => window.clearTimeout(timer));
}

export function maskKuaiziApiKey(apiKey: string) {
  if (!apiKey) return '';
  if (apiKey.length <= 8) return `${apiKey.slice(0, 2)}****`;
  return `${apiKey.slice(0, 4)}****${apiKey.slice(-4)}`;
}

export function saveKuaiziConfig(input: KuaiziConfigInput) {
  if (!browserAvailable()) return;
  const payload = {
    endpoint: input.endpoint,
    encryptedApiKey: encode(input.apiKey.trim()),
    savedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(CONFIG_KEY, JSON.stringify(payload));
}

export function clearKuaiziConfig() {
  if (!browserAvailable()) return;
  window.localStorage.removeItem(CONFIG_KEY);
}

export function getKuaiziConfig(): KuaiziConfig | null {
  if (!browserAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { endpoint?: KuaiziEndpoint; encryptedApiKey?: string; savedAt?: string };
    if (!parsed.endpoint || !parsed.encryptedApiKey) return null;
    const apiKey = decode(parsed.encryptedApiKey);
    return {
      apiKey,
      endpoint: parsed.endpoint,
      baseUrl: ENDPOINTS[parsed.endpoint],
      maskedApiKey: maskKuaiziApiKey(apiKey),
      savedAt: parsed.savedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function hasKuaiziConfig() {
  return Boolean(getKuaiziConfig()?.apiKey);
}

export function kuaiziErrorMessage(status: number) {
  if (status === 401 || status === 403) return '筷子科技 API Key 无效或权限不足，请检查配置';
  if (status === 408) return '连接超时，请检查网络或稍后重试';
  if (status === 402 || status === 429) return '账户额度不足，请联系筷子科技商务充值';
  if (status >= 500) return '筷子科技服务异常，请稍后重试或导出生产规格手动执行';
  return '筷子科技任务创建失败，请稍后重试或导出生产规格手动执行';
}

function recordKuaiziError(detail: KuaiziApiErrorDetail) {
  track('kuaizi_error', detail as unknown as Record<string, unknown>);
}

async function readError(response: Response, operation: KuaiziApiErrorDetail['operation']) {
  const message = kuaiziErrorMessage(response.status);
  const body = await response.text().catch(() => '');
  recordKuaiziError({ status: response.status, operation, message: body ? `${message}: ${body.slice(0, 160)}` : message });
  return new Error(message);
}

export async function testKuaiziConnection(config = getKuaiziConfig()): Promise<KuaiziConnectionResult> {
  if (!config) return { ok: false, message: '请先保存 API Key 和 Endpoint' };
  try {
    const response = await requestWithTimeout(`${config.baseUrl}/health`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      const message = kuaiziErrorMessage(response.status);
      recordKuaiziError({ status: response.status, operation: 'health', message });
      return { ok: false, status: response.status, message };
    }
    return { ok: true, status: response.status, message: '连接成功' };
  } catch (error) {
    const message = error instanceof DOMException && error.name === 'AbortError' ? '连接超时，请检查网络或稍后重试' : '连接失败，请检查 Endpoint 或网络状态';
    recordKuaiziError({ operation: 'health', message });
    return { ok: false, message };
  }
}

export async function createKuaiziProductionTask(payload: KuaiziBriefPayload, config = getKuaiziConfig()): Promise<KuaiziProductionTask> {
  if (!config) throw new Error('请先在设置页配置筷子科技 API');
  try {
    const response = await requestWithTimeout(`${config.baseUrl}/production-tasks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        externalProjectId: payload.projectId,
        externalRunId: payload.runId,
        source: 'wenai-content-decision-os',
        creativeBrief: {
          title: payload.title,
          hook: payload.hook,
          angle: payload.angle,
          offer: payload.offer,
          cta: payload.cta,
          format: payload.format,
          markdown: payload.sourceBriefMarkdown,
        },
      }),
    });
    if (!response.ok) throw await readError(response, 'create_job');
    const data = await response.json() as { taskId?: string; id?: string; status?: KuaiziTaskStatus; assetUrls?: string[]; assets?: Array<{ url?: string }> };
    if (!data.taskId && !data.id) throw new Error('筷子科技任务创建失败，请稍后重试或导出生产规格手动执行');
    const taskId = data.taskId ?? data.id ?? '';
    return {
      taskId,
      status: data.status || 'queued',
      assetUrls: data.assetUrls || data.assets?.map(asset => asset.url || '').filter(Boolean) || [],
      providerRaw: data,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      const message = '连接超时，请检查网络或稍后重试';
      recordKuaiziError({ operation: 'create_job', message });
      throw new Error(message);
    }
    throw error;
  }
}

export async function getKuaiziTaskStatus(taskId: string, config = getKuaiziConfig()): Promise<KuaiziProductionTask> {
  if (!config) throw new Error('请先在设置页配置筷子科技 API');
  try {
    const response = await requestWithTimeout(`${config.baseUrl}/production-tasks/${encodeURIComponent(taskId)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) throw await readError(response, 'poll_job');
    const data = await response.json() as { taskId?: string; id?: string; status?: KuaiziTaskStatus; assetUrls?: string[]; assets?: Array<{ url?: string }> };
    return {
      taskId: data.taskId || data.id || taskId,
      status: data.status || 'queued',
      assetUrls: data.assetUrls || data.assets?.map(asset => asset.url || '').filter(Boolean) || [],
      providerRaw: data,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      const message = '连接超时，请检查网络或稍后重试';
      recordKuaiziError({ operation: 'poll_job', message });
      throw new Error(message);
    }
    throw error;
  }
}
