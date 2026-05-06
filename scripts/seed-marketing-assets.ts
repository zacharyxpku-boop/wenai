/**
 * 批量生成 marketing 占位资产 · 喂 HappyHorse GPT Image 2
 *
 * 跑法:
 *   cd wenai
 *   npx tsx scripts/seed-marketing-assets.ts
 *
 * 输出:
 *   public/seed/founder.jpg
 *   public/seed/team-1.jpg ... team-6.jpg
 *   public/seed/testimonial-1.jpg ... testimonial-6.jpg
 *   public/seed/before-{home|auto|digital}.jpg
 *   public/seed/after-{home|auto|digital}.jpg
 *   public/seed/manifest.json (列表 + 时间戳)
 *
 * 每张 medium quality 1024×1024 ≈ $0.042, 全套 19 张 ≈ $0.80 = ¥6
 *
 * 已生成的不会重跑 (manifest 检查), 删 manifest.json 强制重跑
 */

import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

async function loadEnvLocal(path = '.env.local') {
  if (!existsSync(path)) return;

  const content = await readFile(path, 'utf-8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const equalsIndex = line.indexOf('=');
    if (equalsIndex === -1) continue;

    const key = line.slice(0, equalsIndex).trim();
    const rawValue = line.slice(equalsIndex + 1).trim();
    if (!key || process.env[key] !== undefined) continue;

    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }
}

await loadEnvLocal();

const HH_BASE = process.env.HAPPYHORSE_BASE_URL || 'https://mm-internal-cn.leonecloud.com';
const HH_KEY = process.env.HAPPYHORSE_API_KEY || process.env.AI_API_KEY;
if (!HH_KEY) {
  console.error('❌ HAPPYHORSE_API_KEY 未配置, 看 .env.local');
  process.exit(1);
}

const OUT_DIR = join(process.cwd(), 'public/seed');
const MANIFEST = join(OUT_DIR, 'manifest.json');

interface JobSpec {
  id: string;
  prompt: string;
  size: '1:1' | '2:3' | '3:2';
}

const JOBS: JobSpec[] = [
  // 创始人 1 张
  {
    id: 'founder',
    prompt: '亚洲男性创始人 35 岁, 半身专业肖像照, 白色简约 T 恤外搭暗灰色西装外套, 极简白灰背景, 自然窗光从左侧 45 度入射, 摄影棚级布光, 神情自信平静,看向镜头略带笑意, 浅景深, 现代科技公司创始人风格, Linear/Stripe 官网创始人照风格',
    size: '1:1',
  },
  // 团队 6 个
  ...['女性 28 岁', '男性 32 岁', '女性 30 岁', '男性 35 岁 戴眼镜', '女性 26 岁', '男性 29 岁'].map((p, i) => ({
    id: `team-${i + 1}`,
    prompt: `亚洲${p}, 半身专业头像, 白衬衣或浅色简约上衣, 白灰渐变背景, 自然棚光, 神情自信亲和, 注视镜头略带笑容, 浅景深 50mm, Linear 官网团队照风格`,
    size: '1:1' as const,
  })),
  // 客户证言 6 个 (不同年龄+性别+穿着, 显得多样)
  ...[
    '内容运营 32 岁女性 干练职业装',
    '跨境运营总监 38 岁男性 商务休闲',
    '法务 30 岁女性 正装',
    '创始人 42 岁男性 商务衬衫',
    '运营经理 28 岁女性 工装风',
    'IT 负责人 35 岁男性 polo 衫',
  ].map((p, i) => ({
    id: `testimonial-${i + 1}`,
    prompt: `亚洲${p}, 中景肖像, 工作场景虚化背景 (办公室或工作室), 自然光, 真实纪实风格, 神情专注或微笑, 35mm 浅景深, 看向镜头, 像 LinkedIn 高质量头像但更具场景感`,
    size: '1:1' as const,
  })),
  // Before · 真人摄影 3 张
  {
    id: 'before-home',
    prompt: '专业棚拍家居场景: 一只北欧风陶瓷杯放在胡桃木餐桌上, 旁边散落 3 颗咖啡豆, 自然窗光从右上方入射, 浅景深 100mm, 阴影柔和真实, 商业产品摄影, 真实棚拍胶片质感',
    size: '3:2',
  },
  {
    id: 'before-auto',
    prompt: '汽车配件特写专业棚拍: 一只哑黑铝合金手机支架装在真车仪表台上, 真皮内饰背景虚化, 黄昏暖色调侧光, 35mm 浅景深, 商业摄影质感, 真实拍摄非渲染',
    size: '3:2',
  },
  {
    id: 'before-digital',
    prompt: '数码产品专业棚拍: 一副无线耳机摆放在木质桌面, 旁边一本笔记本和一杯咖啡, 晨光从左侧窗户透入, 50mm 浅景深, 商业产品摄影, 真实拍摄质感, 编辑摄影风格',
    size: '3:2',
  },
  // After · AI 生成 (同样产品+同样场景, 但更精致)
  {
    id: 'after-home',
    prompt: '极简家居陶瓷杯主图: 同款北欧陶瓷杯放置在大理石桌面, 自然柔和顶光, 极简白色背景, 完美居中, 商业电商主图风格, 干净无瑕疵, 高级感',
    size: '3:2',
  },
  {
    id: 'after-auto',
    prompt: '汽车配件电商主图: 哑黑铝合金手机支架, 干净渐变深灰背景, 戏剧化侧光, 完美无暇产品摄影, 商业电商主图, 微距锐利对焦, 高端质感',
    size: '3:2',
  },
  {
    id: 'after-digital',
    prompt: '无线耳机电商主图: 银白色耳机悬浮在浅灰渐变背景, 戏剧化顶光投射柔和阴影, 商业电商主图, 完美无暇细节, 高端品牌质感',
    size: '3:2',
  },
];

interface Manifest {
  generatedAt: string;
  items: { id: string; file: string; prompt: string }[];
}

async function loadManifest(): Promise<Manifest | null> {
  if (!existsSync(MANIFEST)) return null;
  try {
    return JSON.parse(await readFile(MANIFEST, 'utf-8'));
  } catch { return null; }
}

interface HHTaskCreate {
  code: number; msg: string;
  data?: { taskId: string; status: string };
}
interface HHTaskQuery {
  code: number; msg: string;
  data?: {
    taskId: string;
    status: 'processing' | 'success' | 'failed';
    result?: string[];
    errorMsg?: string;
  };
}

async function generateOne(job: JobSpec): Promise<string> {
  const headers = {
    Authorization: `Bearer ${HH_KEY}`,
    'Content-Type': 'application/json',
  };

  const createBody = {
    prompt: job.prompt,
    aspectRatio: job.size,
  };

  // 1. 创建任务
  const createRes = await fetch(`${HH_BASE}/api/v2/open/aigc/gpt-image`, {
    method: 'POST',
    headers,
    body: JSON.stringify(createBody),
  });
  if (!createRes.ok) {
    throw new Error(`create HTTP ${createRes.status}: ${(await createRes.text()).slice(0, 200)}`);
  }
  const created: HHTaskCreate = await createRes.json();
  if (created.code !== 0 || !created.data?.taskId) {
    throw new Error(`create failed: ${created.msg}`);
  }
  const taskId = created.data.taskId;

  // 2. 轮询
  const start = Date.now();
  const timeoutMs = 180_000;
  let queried: HHTaskQuery | null = null;
  while (Date.now() - start < timeoutMs) {
    await new Promise(r => setTimeout(r, Date.now() - start > 30_000 ? 5000 : 3000));
    const r = await fetch(`${HH_BASE}/api/v2/open/aigc/${taskId}`, {
      headers: { Authorization: `Bearer ${HH_KEY}` },
    });
    if (!r.ok) continue;
    queried = await r.json();
    if (!queried || queried.code !== 0) continue;
    const status = queried.data?.status;
    if (status === 'success' || status === 'failed') break;
  }

  if (!queried?.data) throw new Error('poll timeout');
  if (queried.data.status === 'failed') throw new Error(queried.data.errorMsg || 'failed');
  const url = queried.data.result?.[0];
  if (!url) throw new Error('no result url');
  return url;
}

async function downloadTo(url: string, dest: string): Promise<void> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  await writeFile(dest, buf);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const existing = await loadManifest();
  const doneIds = new Set(existing?.items.map(i => i.id) ?? []);

  const results: Manifest['items'] = existing?.items ?? [];
  let generated = 0;
  let failed = 0;

  for (const job of JOBS) {
    if (doneIds.has(job.id)) {
      console.log(`⊘ skip ${job.id} (already in manifest)`);
      continue;
    }
    const dest = join(OUT_DIR, `${job.id}.jpg`);
    console.log(`▶ ${job.id} ...`);
    try {
      const url = await generateOne(job);
      await downloadTo(url, dest);
      results.push({ id: job.id, file: `/seed/${job.id}.jpg`, prompt: job.prompt });
      generated++;
      console.log(`  ✓ ${job.id}.jpg`);
      // 写中间 manifest 防止跑挂全丢
      await writeFile(MANIFEST, JSON.stringify({
        generatedAt: new Date().toISOString(),
        items: results,
      }, null, 2));
    } catch (e) {
      console.error(`  ✗ ${job.id}: ${e instanceof Error ? e.message : 'unknown'}`);
      failed++;
    }
  }

  await writeFile(MANIFEST, JSON.stringify({
    generatedAt: new Date().toISOString(),
    items: results,
  }, null, 2));

  console.log(`\n=== 完成 ===`);
  console.log(`新生成: ${generated}, 已存在跳过: ${doneIds.size}, 失败: ${failed}`);
  console.log(`输出: ${OUT_DIR}`);
  console.log(`Manifest: ${MANIFEST}`);
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
