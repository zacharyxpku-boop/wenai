export const DEFAULT_LARGE_FILE_BYTES = 5 * 1024 * 1024;
export const DEFAULT_HARD_FILE_BYTES = 12 * 1024 * 1024;

export type FileGuardKind = 'image' | 'video' | 'csv' | 'document';

export interface FileGuardResult {
  ok: boolean;
  shouldOptimize: boolean;
  message: string;
}

export function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0MB';
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export function assessClientFile(
  file: File,
  options: {
    kind?: FileGuardKind;
    largeBytes?: number;
    hardBytes?: number;
    allowedTypes?: string[];
  } = {},
): FileGuardResult {
  const largeBytes = options.largeBytes ?? DEFAULT_LARGE_FILE_BYTES;
  const hardBytes = options.hardBytes ?? DEFAULT_HARD_FILE_BYTES;
  const kind = options.kind ?? 'document';

  if (options.allowedTypes?.length && file.type && !options.allowedTypes.includes(file.type)) {
    return {
      ok: false,
      shouldOptimize: false,
      message: kind === 'csv' ? '请上传 CSV 文件。' : '文件格式不支持，请换成页面提示的格式后重新上传。',
    };
  }

  if (file.size > hardBytes) {
    return {
      ok: false,
      shouldOptimize: false,
      message: `建议压缩后重新上传，保证识别速度。当前文件 ${formatFileSize(file.size)}，建议不超过 ${formatFileSize(hardBytes)}。`,
    };
  }

  if (file.size > largeBytes) {
    return {
      ok: true,
      shouldOptimize: true,
      message: '文件较大，读取可能稍慢，请保持页面打开。',
    };
  }

  return { ok: true, shouldOptimize: false, message: '' };
}

export async function readClientTextFile(file: File, timeoutMs = 10_000) {
  return Promise.race([
    file.text(),
    new Promise<string>((_, reject) => {
      window.setTimeout(() => reject(new Error('READ_TIMEOUT')), timeoutMs);
    }),
  ]);
}
