import { chromium } from 'playwright';
import { chat } from './deepseek.js';
import { createInterface } from 'readline';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'output', '竞品监控');
const CONFIG_FILE = join(__dirname, '..', 'config', 'competitors.json');

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
if (!existsSync(join(__dirname, '..', 'config'))) mkdirSync(join(__dirname, '..', 'config'), { recursive: true });

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

// Load or create competitor list
let competitors = [];
if (existsSync(CONFIG_FILE)) {
  competitors = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
}

console.log('');
console.log('╔══════════════════════════════════════╗');
console.log('║     万象工具箱 · 竞品监控             ║');
console.log('║  自动截图 + AI分析变化                 ║');
console.log('╚══════════════════════════════════════╝');
console.log('');

if (competitors.length === 0) {
  console.log('还没有配置竞品，先添加几个:');
  console.log('（输入空行结束）');
  console.log('');

  while (true) {
    const name = await ask('竞品名称 (空行结束): ');
    if (!name.trim()) break;
    const url = await ask('网址: ');
    competitors.push({ name: name.trim(), url: url.trim() });
  }

  writeFileSync(CONFIG_FILE, JSON.stringify(competitors, null, 2), 'utf-8');
  console.log(`已保存 ${competitors.length} 个竞品到配置文件`);
}

console.log('');
console.log(`即将监控 ${competitors.length} 个竞品:`);
competitors.forEach((c, i) => console.log(`  ${i + 1}. ${c.name} - ${c.url}`));
console.log('');

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  const results = [];

  for (const comp of competitors) {
    console.log(`正在抓取: ${comp.name}...`);

    try {
      const page = await context.newPage();
      await page.goto(comp.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      // Screenshot
      const screenshotPath = join(OUTPUT_DIR, `${comp.name}_${timestamp}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });

      // Extract key info
      const pageData = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content || '',
        h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent?.trim()).filter(Boolean),
        h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent?.trim()).filter(Boolean).slice(0, 10),
        links: Array.from(document.querySelectorAll('nav a, header a')).map(a => ({
          text: a.textContent?.trim(),
          href: a.href,
        })).filter(l => l.text).slice(0, 20),
        pricing: document.body.innerText.match(/[\$¥]\s*\d+[\.\d]*/g) || [],
      }));

      results.push({
        ...comp,
        screenshot: screenshotPath,
        ...pageData,
        crawledAt: new Date().toISOString(),
      });

      console.log(`  截图: ${screenshotPath}`);
      console.log(`  标题: ${pageData.title}`);
      await page.close();
    } catch (err) {
      console.error(`  抓取失败: ${err.message}`);
      results.push({ ...comp, error: err.message });
    }
  }

  // Save raw data
  const dataFile = join(OUTPUT_DIR, `竞品数据_${timestamp}.json`);
  writeFileSync(dataFile, JSON.stringify(results, null, 2), 'utf-8');

  // AI analysis
  console.log('');
  console.log('正在用 DeepSeek 分析竞品变化...');

  const analysisPrompt = `分析以下竞品数据，给出关键发现：

${results.map(r => `
## ${r.name} (${r.url})
- 标题: ${r.title || 'N/A'}
- 描述: ${r.description || 'N/A'}
- 主标题: ${(r.h1 || []).join(', ') || 'N/A'}
- 副标题: ${(r.h2 || []).join(', ') || 'N/A'}
- 定价信息: ${(r.pricing || []).join(', ') || '未发现'}
- 导航: ${(r.links || []).map(l => l.text).join(' | ') || 'N/A'}
`).join('\n')}

请分析：
1. 各竞品的核心卖点和定位
2. 定价策略
3. 值得学习的地方
4. 我们可以差异化的方向`;

  try {
    const analysis = await chat(analysisPrompt, {
      system: '你是一个竞品分析专家，用简洁有力的语言给出分析，重点突出可行动的建议。',
      temperature: 0.5,
    });

    console.log('');
    console.log('═══ 竞品分析报告 ═══');
    console.log('');
    console.log(analysis);

    const reportFile = join(OUTPUT_DIR, `竞品分析_${timestamp}.txt`);
    writeFileSync(reportFile, analysis, 'utf-8');
    console.log('');
    console.log(`报告保存到: ${reportFile}`);
  } catch (err) {
    console.error('AI分析失败:', err.message);
  }

} catch (err) {
  console.error('监控失败:', err.message);
} finally {
  if (browser) await browser.close();
  rl.close();
}
