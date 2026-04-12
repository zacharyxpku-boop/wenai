import { createInterface } from 'readline';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

const TOOLS = [
  { key: '1', name: '下载视频', desc: 'B站/抖音/YouTube/小红书/视频号', script: 'video-downloader.js', icon: '▶' },
  { key: '2', name: '爬小红书', desc: '搜索/单篇/博主主页爬取', script: 'xhs-scraper.js', icon: '📕' },
  { key: '3', name: '生成内容', desc: '小红书/公众号/抖音/知乎文案', script: 'content-generator.js', icon: '✍' },
  { key: '4', name: '去AI味', desc: '把AI文字改成真人风格', script: 'humanizer.js', icon: '🔄' },
  { key: '5', name: '批量去AI味', desc: '整个文件夹批量改写', script: 'batch-humanizer.js', icon: '📦' },
  { key: '6', name: '监控竞品', desc: '截图+AI分析竞品变化', script: 'competitor-monitor.js', icon: '🔍' },
  { key: '7', name: 'AI日报', desc: 'AI行业/竞品/热点日报', script: 'daily-digest.js', icon: '📰' },
];

function showMenu() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║                                               ║');
  console.log('║           万 象 工 具 箱  v1.0                 ║');
  console.log('║           一人企业自动化流水线                   ║');
  console.log('║                                               ║');
  console.log('╠═══════════════════════════════════════════════╣');
  console.log('║                                               ║');
  TOOLS.forEach(t => {
    const line = `  ${t.icon}  ${t.key}. ${t.name}  —  ${t.desc}`;
    console.log(`║${line.padEnd(46)}║`);
  });
  console.log('║                                               ║');
  console.log('║      0. 退出                                   ║');
  console.log('║                                               ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');
}

async function main() {
  while (true) {
    showMenu();
    const choice = await ask('选择工具 (0-7): ');

    if (choice === '0' || choice === 'q') {
      console.log('再见!');
      break;
    }

    const tool = TOOLS.find(t => t.key === choice);
    if (!tool) {
      console.log('无效选择');
      continue;
    }

    console.log(`\n启动: ${tool.name}...\n`);

    try {
      execSync(`node "${join(__dirname, tool.script)}"`, {
        stdio: 'inherit',
        cwd: join(__dirname, '..'),
      });
    } catch {
      // Tool exited, return to menu
    }

    console.log('\n--- 返回主菜单 ---');
  }

  rl.close();
}

main();
