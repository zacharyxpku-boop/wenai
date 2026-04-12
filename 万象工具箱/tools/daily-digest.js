import { chat } from './deepseek.js';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createInterface } from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'output', '日报');

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

console.log('');
console.log('╔══════════════════════════════════════╗');
console.log('║     万象工具箱 · AI行业日报           ║');
console.log('║  DeepSeek 生成 · 每日速览              ║');
console.log('╚══════════════════════════════════════╝');
console.log('');

console.log('选择日报类型:');
console.log('  1. AI行业动态（大模型/应用/融资）');
console.log('  2. 竞品动态（你的赛道）');
console.log('  3. 营销热点（可蹭的热点话题）');
console.log('  4. 自定义主题');
console.log('');

const type = await ask('选择 (1-4): ');
let topic = '';

if (type === '4') {
  topic = await ask('自定义主题: ');
} else {
  const topics = {
    '1': 'AI行业最新动态，包括大模型发布、AI应用上线、融资新闻、政策变化',
    '2': 'AI教育、玄学AI、个人效率工具赛道的最新动态',
    '3': '今天中文互联网最热的话题，适合做内容营销的热点',
  };
  topic = topics[type] || topics['1'];
}

console.log('');
console.log('正在生成日报...');
console.log('');

try {
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const digest = await chat(
    `今天是${today}。请生成一份关于"${topic}"的行业日报。`,
    {
      system: `你是一个行业分析师，每天为创业者生成简洁有力的行业日报。

格式要求：
1. 标题：一句话总结今日最重要的事
2. 头条（1条）：最重要的新闻，200字详细解读 + "对你的影响"
3. 快讯（3-5条）：每条50字以内
4. 机会点（1-2个）：基于今日信息，创业者可以抓的机会
5. 一句话总结

风格：
- 像写给朋友的消息，不要官方腔
- 用"你"称呼读者
- 每条新闻说清楚"so what"——对一人企业有什么影响
- 标注信息的可靠程度（已确认/传闻/推测）`,
      temperature: 0.7,
      maxTokens: 3000,
    }
  );

  console.log(digest);
  console.log('');

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `日报_${timestamp}.txt`;
  writeFileSync(join(OUTPUT_DIR, filename), digest, 'utf-8');
  console.log(`保存到: ${join(OUTPUT_DIR, filename)}`);

  // Ask if want to format for WeChat
  console.log('');
  const wechat = await ask('要转成公众号格式吗？(y/n): ');

  if (wechat.toLowerCase() === 'y') {
    console.log('正在转换...');
    const wechatVersion = await chat(
      `把以下内容转换成微信公众号文章格式，加入emoji和排版：\n\n${digest}`,
      {
        system: '你是一个公众号排版专家。输出HTML格式，使用内联样式，适合微信编辑器粘贴。',
        temperature: 0.5,
      }
    );

    const htmlFile = `日报_${timestamp}_公众号.html`;
    writeFileSync(join(OUTPUT_DIR, htmlFile), wechatVersion, 'utf-8');
    console.log(`公众号版本保存到: ${join(OUTPUT_DIR, htmlFile)}`);
  }

} catch (err) {
  console.error('生成失败:', err.message);
}

rl.close();
