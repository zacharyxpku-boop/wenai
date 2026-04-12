import { chromium } from 'playwright';
import { createInterface } from 'readline';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'output', '小红书');

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

console.log('');
console.log('╔══════════════════════════════════════╗');
console.log('║     万象工具箱 · 小红书爬虫           ║');
console.log('║  爬取笔记标题/内容/点赞/评论          ║');
console.log('╚══════════════════════════════════════╝');
console.log('');

console.log('选择模式:');
console.log('  1. 搜索关键词 → 爬取搜索结果');
console.log('  2. 输入笔记链接 → 爬取单篇笔记');
console.log('  3. 输入博主主页 → 爬取所有笔记');
console.log('');

const mode = await ask('选择 (1/2/3): ');
const keyword = await ask(mode === '1' ? '搜索关键词: ' : '链接: ');

console.log('');
console.log('启动浏览器...');

let browser;
try {
  browser = await chromium.launch({
    headless: false, // 可见模式，方便登录
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  if (mode === '1') {
    // Search mode
    const searchUrl = `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(keyword.trim())}&source=web_search_result_notes`;
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });

    console.log('');
    console.log('如果需要登录，请在浏览器中手动登录');
    console.log('登录后按回车继续...');
    await ask('');

    // Wait for notes to load
    await page.waitForSelector('.note-item, .feeds-container section', { timeout: 15000 }).catch(() => {});

    // Scroll to load more
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, 1000));
      await page.waitForTimeout(1500);
    }

    // Extract notes
    const notes = await page.evaluate(() => {
      const items = document.querySelectorAll('.note-item, .feeds-container section a');
      return Array.from(items).slice(0, 20).map((item) => ({
        title: item.querySelector('.title, .note-title, span')?.textContent?.trim() || '',
        link: item.href || item.querySelector('a')?.href || '',
        likes: item.querySelector('.like-wrapper span, .count')?.textContent?.trim() || '0',
      }));
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `搜索_${keyword.trim()}_${timestamp}.json`;
    writeFileSync(join(OUTPUT_DIR, filename), JSON.stringify(notes, null, 2), 'utf-8');

    console.log(`爬取到 ${notes.length} 条笔记`);
    console.log(`保存到: ${join(OUTPUT_DIR, filename)}`);

  } else if (mode === '2') {
    // Single note mode
    await page.goto(keyword.trim(), { waitUntil: 'networkidle', timeout: 30000 });

    console.log('如果需要登录，请在浏览器中手动登录');
    console.log('登录后按回车继续...');
    await ask('');

    await page.waitForTimeout(3000);

    const note = await page.evaluate(() => {
      return {
        title: document.querySelector('#detail-title, .title')?.textContent?.trim() || '',
        content: document.querySelector('#detail-desc, .desc, .content')?.textContent?.trim() || '',
        likes: document.querySelector('.like-wrapper span, .like-count')?.textContent?.trim() || '0',
        collects: document.querySelector('.collect-wrapper span, .collect-count')?.textContent?.trim() || '0',
        comments: document.querySelector('.chat-wrapper span, .comment-count')?.textContent?.trim() || '0',
        author: document.querySelector('.username, .author-name')?.textContent?.trim() || '',
        images: Array.from(document.querySelectorAll('.swiper-slide img, .note-image img')).map(img => img.src),
      };
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `笔记_${timestamp}_${Date.now()}.json`;
    writeFileSync(join(OUTPUT_DIR, filename), JSON.stringify(note, null, 2), 'utf-8');

    console.log('');
    console.log(`标题: ${note.title}`);
    console.log(`点赞: ${note.likes} | 收藏: ${note.collects} | 评论: ${note.comments}`);
    console.log(`保存到: ${join(OUTPUT_DIR, filename)}`);

  } else {
    // Profile mode
    await page.goto(keyword.trim(), { waitUntil: 'networkidle', timeout: 30000 });

    console.log('如果需要登录，请在浏览器中手动登录');
    console.log('登录后按回车继续...');
    await ask('');

    // Scroll to load notes
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 1000));
      await page.waitForTimeout(2000);
    }

    const notes = await page.evaluate(() => {
      const items = document.querySelectorAll('.note-item a, section a[href*="/explore/"]');
      return Array.from(items).slice(0, 30).map((item) => ({
        title: item.querySelector('.title, .footer span')?.textContent?.trim() || '',
        link: item.href || '',
        likes: item.querySelector('.like-wrapper span, .count')?.textContent?.trim() || '0',
      }));
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `博主_${timestamp}_${Date.now()}.json`;
    writeFileSync(join(OUTPUT_DIR, filename), JSON.stringify(notes, null, 2), 'utf-8');

    console.log(`爬取到 ${notes.length} 条笔记`);
    console.log(`保存到: ${join(OUTPUT_DIR, filename)}`);
  }

} catch (err) {
  console.error('爬取失败:', err.message);
} finally {
  if (browser) {
    console.log('');
    await ask('按回车关闭浏览器...');
    await browser.close();
  }
  rl.close();
}
