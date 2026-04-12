import { chat } from './deepseek.js';
import { createInterface } from 'readline';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'output', '去AI味');

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

const SYSTEM_PROMPT = `你是一个"去AI味"专家。用户会给你一段AI生成的文字，你需要改写成真人写的风格。

改写规则：
1. 删除所有AI套话：赋能、一站式、高效、智能洞察、AI驱动、Powered by AI、精准分析
2. 删除过度结构化：不要"首先/其次/最后"、不要编号列表（除非原文就需要）
3. 加入口语化表达：嗯、其实、说实话、反正、讲真
4. 加入个人情感：惊讶、吐槽、自嘲、犹豫
5. 句式变化：长短交替，偶尔用省略号、破折号
6. 加入具体细节：时间、地点、品牌名、价格等（可以编合理的）
7. 不完美感：偶尔用词不精确、有点啰嗦是OK的
8. 保持原文的核心信息不变

输出要求：
- 只输出改写后的文字
- 不要说"改写如下"之类的话
- 不要加引号`;

console.log('');
console.log('╔══════════════════════════════════════╗');
console.log('║     万象工具箱 · 去AI味               ║');
console.log('║  把AI文字改成真人写的                  ║');
console.log('╚══════════════════════════════════════╝');
console.log('');

console.log('选择输入方式:');
console.log('  1. 直接粘贴文字');
console.log('  2. 读取文件');
console.log('');

const mode = await ask('选择 (1/2): ');

let inputText = '';

if (mode === '2') {
  const filePath = await ask('文件路径: ');
  try {
    inputText = readFileSync(filePath.trim().replace(/"/g, ''), 'utf-8');
    console.log(`读取了 ${inputText.length} 个字符`);
  } catch (err) {
    console.error('读取文件失败:', err.message);
    rl.close();
    process.exit(1);
  }
} else {
  console.log('粘贴文字（输入空行结束）:');
  const lines = [];
  for await (const line of rl) {
    if (line === '') break;
    lines.push(line);
  }
  inputText = lines.join('\n');
}

if (!inputText.trim()) {
  console.log('没有输入内容，退出');
  rl.close();
  process.exit(0);
}

console.log('');
console.log('正在去AI味...');
console.log('');

try {
  const result = await chat(inputText, { system: SYSTEM_PROMPT, temperature: 0.8 });

  console.log('═══ 改写结果 ═══');
  console.log('');
  console.log(result);
  console.log('');

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  const filename = `去AI味_${timestamp}.txt`;
  writeFileSync(join(OUTPUT_DIR, filename), `=== 原文 ===\n${inputText}\n\n=== 改写后 ===\n${result}`, 'utf-8');
  console.log(`保存到: ${join(OUTPUT_DIR, filename)}`);
} catch (err) {
  console.error('改写失败:', err.message);
}

rl.close();
