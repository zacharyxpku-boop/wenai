/**
 * 统一导出文件命名 · 让下载夹里的 wenai 文件自解释
 *
 * 格式: wenai-<pipeline>-<slug>-<YYYYMMDD-HHmm>.<ext>
 * 例: wenai-新品上新-家居-20260418-1430.xlsx
 *     wenai-达人冷启-HOMELODY-20260418-1500.xlsx
 *     wenai-主图-家居厨房-20260418-1520.zip
 */

function pad(n: number): string { return String(n).padStart(2, '0'); }

export function nowStamp(): string {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

/**
 * 提取可用作文件名的短 slug (去特殊字符,保留中英文数字,上限 20 字符)
 */
export function toSlug(raw: string, fallback = 'wenai'): string {
  if (!raw) return fallback;
  const cleaned = raw
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '')
    .replace(/[,，。!！?？;；]/g, '-')
    .slice(0, 20);
  return cleaned || fallback;
}

export function exportFilename(
  pipelineLabel: string,
  slug: string | undefined,
  ext: 'xlsx' | 'md' | 'zip' | 'csv' | 'jpg' | 'png' = 'xlsx'
): string {
  const pipe = toSlug(pipelineLabel, 'wenai');
  const s = toSlug(slug || '', '');
  const time = nowStamp();
  const parts = ['wenai', pipe, s, time].filter(Boolean);
  return `${parts.join('-')}.${ext}`;
}
