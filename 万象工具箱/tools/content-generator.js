import { chat } from './deepseek.js';
import { createInterface } from 'readline';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'output', '内容');

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

const PLATFORMS = {
  '1': { name: '小红书', system: `你是一个小红书爆款写手。要求：
- 标题带emoji，制造悬念或反差感
- 开头用"你"或"我"开头，讲故事
- 分段短小，每段不超过3行
- 用口语化表达，像朋友聊天
- 结尾引导互动（"你觉得呢？""有同款吗？"）
- 带5-8个相关话题标签
- 绝对禁止：赋能、一站式、高效、AI驱动、智能洞察` },

  '2': { name: '公众号', system: `你是一个公众号10w+写手。要求：
- 标题15字以内，制造好奇心
- 开篇讲一个具体场景或故事
- 用"你"称呼读者
- 段落短，留白多
- 金句要在行文中自然出现，不要单独列出
- 结尾有行动号召
- 绝对禁止：赋能、一站式、高效、AI驱动、智能洞察` },

  '3': { name: '抖音文案', system: `你是一个抖音百万播放量的文案写手。要求：
- 开头3秒必须抓人（用问题或反转）
- 口语化，像对面聊天
- 短句为主，每句不超过15字
- 节奏感强，适合口播
- 结尾留悬念引导评论
- 绝对禁止：赋能、一站式、高效、AI驱动、智能洞察` },

  '4': { name: '知乎回答', system: `你是一个知乎高赞回答者。要求：
- 开头先亮观点，一句话总结
- 用数据和案例支撑
- 逻辑清晰，分点论述
- 适度使用加粗强调
- 语气专业但不学究
- 结尾升华或给出actionable建议
- 绝对禁止：赋能、一站式、高效、AI驱动、智能洞察` },

  '5': { name: '自定义', system: '你是一个专业的内容创作者。请根据用户的要求创作内容。绝对禁止：赋能、一站式、高效、AI驱动、智能洞察' },
};

console.log('');
console.log('╔══════════════════════════════════════╗');
console.log('║     万象工具箱 · 内容生成器           ║');
console.log('║  DeepSeek 驱动 · 自动去AI味           ║');
console.log('╚══════════════════════════════════════╝');
console.log('');

console.log('选择平台:');
Object.entries(PLATFORMS).forEach(([k, v]) => console.log(`  ${k}. ${v.name}`));
console.log('');

const platform = await ask('选择 (1-5): ');
const topic = await ask('主题/关键词: ');
const count = await ask('生成几篇 (默认3): ') || '3';

console.log('');
console.log(`正在为 ${PLATFORMS[platform]?.name || '自定义'} 生成 ${count} 篇内容...`);
console.log('');

const selected = PLATFORMS[platform] || PLATFORMS['5'];
const results = [];

for (let i = 0; i < parseInt(count); i++) {
  console.log(`--- 第 ${i + 1} 篇 ---`);

  try {
    const content = await chat(
      `请围绕"${topic}"创作一篇${selected.name}内容。要求原创、有个人风格、不能有AI味。`,
      { system: selected.system, temperature: 0.9 }
    );

    console.log(content);
    console.log('');
    results.push({ index: i + 1, platform: selected.name, topic, content });
  } catch (err) {
    console.error(`生成失败: ${err.message}`);
  }
}

// Save all
const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
const filename = `${selected.name}_${topic}_${timestamp}.json`;
writeFileSync(join(OUTPUT_DIR, filename), JSON.stringify(results, null, 2), 'utf-8');

// Also save as readable text
const textFile = filename.replace('.json', '.txt');
const textContent = results.map((r) => `=== 第${r.index}篇 ===\n\n${r.content}`).join('\n\n\n');
writeFileSync(join(OUTPUT_DIR, textFile), textContent, 'utf-8');

console.log(`保存到: ${join(OUTPUT_DIR, textFile)}`);

rl.close();
