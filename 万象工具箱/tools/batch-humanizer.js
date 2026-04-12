import { chat } from './deepseek.js';
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { createInterface } from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'output', '去AI味');

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

const SYSTEM_PROMPT = `你是一个"去AI味"专家。改写规则：
1. 删除AI套话：赋能、一站式、高效、智能洞察、AI驱动
2. 删除过度结构化：不要"首先/其次/最后"
3. 加入口语化表达：嗯、其实、说实话
4. 加入个人情感：惊讶、吐槽、自嘲
5. 句式长短交替
6. 保持核心信息不变
只输出改写后的文字。`;

console.log('');
console.log('╔══════════════════════════════════════╗');
console.log('║     万象工具箱 · 批量去AI味           ║');
console.log('║  拖入文件夹，批量改写                  ║');
console.log('╚══════════════════════════════════════╝');
console.log('');

const dirPath = await ask('文件夹路径（或拖入文件夹）: ');
const cleanPath = dirPath.trim().replace(/"/g, '');

if (!existsSync(cleanPath)) {
  console.log('路径不存在');
  rl.close();
  process.exit(1);
}

const files = readdirSync(cleanPath).filter(f => ['.txt', '.md'].includes(extname(f)));
console.log(`找到 ${files.length} 个文本文件`);

let processed = 0;
for (const file of files) {
  const filePath = join(cleanPath, file);
  const content = readFileSync(filePath, 'utf-8');

  if (content.trim().length < 10) continue;

  console.log(`[${++processed}/${files.length}] 处理: ${file}`);

  try {
    const result = await chat(content, { system: SYSTEM_PROMPT, temperature: 0.8 });
    const outFile = join(OUTPUT_DIR, `去味_${file}`);
    writeFileSync(outFile, result, 'utf-8');
    console.log(`  → 保存: ${outFile}`);
  } catch (err) {
    console.error(`  × 失败: ${err.message}`);
  }

  // Rate limit
  await new Promise(r => setTimeout(r, 1000));
}

console.log('');
console.log(`完成! 处理了 ${processed} 个文件`);

rl.close();
