import { execSync } from 'child_process';
import { createInterface } from 'readline';
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'output', '视频');

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

console.log('');
console.log('╔══════════════════════════════════════╗');
console.log('║     万象工具箱 · 视频下载器           ║');
console.log('║  支持: B站 抖音 YouTube 小红书 视频号  ║');
console.log('╚══════════════════════════════════════╝');
console.log('');

const url = await ask('粘贴视频链接: ');

if (!url.trim()) {
  console.log('没有输入链接，退出');
  rl.close();
  process.exit(0);
}

console.log('');
console.log('正在下载...');
console.log(`保存到: ${OUTPUT_DIR}`);
console.log('');

try {
  // Use local yt-dlp.exe first, then fall back to global
  const localYtdlp = join(__dirname, '..', 'yt-dlp.exe');
  const ytdlpCmd = existsSync(localYtdlp) ? `"${localYtdlp}"` : 'yt-dlp';
  const outputTemplate = join(OUTPUT_DIR, '%(title)s.%(ext)s');

  execSync(`${ytdlpCmd} "${url.trim()}" -o "${outputTemplate}" --no-check-certificates --encoding utf-8`, {
    stdio: 'inherit',
    timeout: 600000,
  });

  console.log('');
  console.log('下载完成!');
} catch (err) {
  console.error('下载失败:', err.message);
}

rl.close();
