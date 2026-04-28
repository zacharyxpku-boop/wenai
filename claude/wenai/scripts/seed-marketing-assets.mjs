/**
 * 批量生成 marketing 占位资产 · 喂 HappyHorse GPT Image 2
 * 跑法: cd wenai && node scripts/seed-marketing-assets.mjs
 *
 * Node 18+ 内置 fetch · 不依赖 dotenv/tsx
 * 已生成的不重跑 (manifest.json), 删它强制重跑
 */

import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// ---- 极简 .env.local 解析 (KEY=VALUE 行) ----
function loadEnvLocal() {
  const path = join(process.cwd(), '.env.local');
  if (!existsSync(path)) return;
  const txt = readFileSync(path, 'utf-8');
  for (const line of txt.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnvLocal();

const HH_BASE = process.env.HAPPYHORSE_BASE_URL || 'https://mm-internal-cn.leonecloud.com';
const HH_KEY = process.env.HAPPYHORSE_API_KEY || process.env.AI_API_KEY;
if (!HH_KEY) {
  console.error('❌ HAPPYHORSE_API_KEY 未配置');
  process.exit(1);
}
console.log(`✓ HH key loaded (${HH_KEY.slice(0, 6)}...), base=${HH_BASE}`);

const OUT_DIR = join(process.cwd(), 'public/seed');
const MANIFEST = join(OUT_DIR, 'manifest.json');

const JOBS = [
  {
    id: 'founder',
    prompt: '亚洲男性创始人 35 岁, 半身专业肖像照, 白色简约 T 恤外搭暗灰色西装外套, 极简白灰背景, 自然窗光从左侧 45 度入射, 摄影棚级布光, 神情自信平静,看向镜头略带笑意, 浅景深, 现代科技公司创始人风格, Linear Stripe 官网创始人照风格',
    size: '1:1',
  },
  ...['女性 28 岁', '男性 32 岁', '女性 30 岁', '男性 35 岁戴眼镜', '女性 26 岁', '男性 29 岁'].map((p, i) => ({
    id: `team-${i + 1}`,
    prompt: `亚洲${p}, 半身专业头像, 白衬衣或浅色简约上衣, 白灰渐变背景, 自然棚光, 神情自信亲和, 注视镜头略带笑容, 浅景深 50mm, Linear 官网团队照风格`,
    size: '1:1',
  })),
  ...[
    '内容运营 32 岁女性 干练职业装',
    '跨境运营总监 38 岁男性 商务休闲',
    '法务 30 岁女性 正装',
    '创始人 42 岁男性 商务衬衫',
    '运营经理 28 岁女性 工装风',
    'IT 负责人 35 岁男性 polo 衫',
  ].map((p, i) => ({
    id: `testimonial-${i + 1}`,
    prompt: `亚洲${p}, 中景肖像, 工作场景虚化背景 (办公室或工作室), 自然光, 真实纪实风格, 神情专注或微笑, 35mm 浅景深, 看向镜头, LinkedIn 高质量头像但更具场景感`,
    size: '1:1',
  })),
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

  // ============================================================
  // /product/photoshoot Hero 右栏 8 卡 · 8 套场景模式代表图
  // 1:1 用作 Hero grid-cols-4 aspect-square 卡
  // ============================================================
  {
    id: 'photoshoot-mode-01',
    prompt: '亚洲女性时装模特电商写真, 25 岁, 棕色长发, 自然妆, 穿米色简约针织上衣 + 米白色高腰长裤, 中性奶油背景, 自然柔光从右侧入射, 35mm 中景, 商业电商模特图风格, 真实摄影感, 干净构图',
    size: '1:1',
  },
  {
    id: 'photoshoot-mode-02',
    prompt: '电商白底主图: 一只哑光黑色保温水杯居中放置, 纯白无影背景, 柔和顶光, 完美对称构图, 1:1 商业产品摄影, 锐利对焦, Amazon 主图规范, 极简高级感',
    size: '1:1',
  },
  {
    id: 'photoshoot-mode-03',
    prompt: '生活场景产品展示: 一只白色陶瓷咖啡杯放在原木桌面, 旁边是一本翻开的杂志和一束尤加利叶, 北欧极简家居室内, 自然窗光从左侧斜射, 浅景深 50mm, 编辑摄影风格, 温暖生活感',
    size: '1:1',
  },
  {
    id: 'photoshoot-mode-04',
    prompt: '节日营销电商主图: 一只红色礼盒装彩妆产品, 春节氛围背景 (柔和金红渐变 + 隐约梅花纹理), 戏剧化侧光, 喜庆但不俗气, 高端礼盒摄影, 1:1 商业构图',
    size: '1:1',
  },
  {
    id: 'photoshoot-mode-05',
    prompt: '汽车配件实拍: 一只黑色铝合金车载手机支架已装在真车仪表台中央, 真皮内饰背景虚化, 黄昏暖色侧光, 35mm 浅景深, 真实车内场景非渲染, 商业产品摄影质感',
    size: '1:1',
  },
  {
    id: 'photoshoot-mode-06',
    prompt: '数码 3C 产品展示: 一对银白色无线耳机与充电仓放在深灰金属磨砂桌面, 戏剧化冷蓝色侧光, 科技感氛围, 微距锐利对焦, 高端 3C 商业摄影, 1:1 构图',
    size: '1:1',
  },
  {
    id: 'photoshoot-mode-07',
    prompt: '家居家纺场景: 一条米色羊毛毛毯随意搭在原木沙发扶手, 旁边一只米白色编织靠枕, 北欧极简客厅, 自然窗光柔和, 35mm 浅景深, 温暖编辑摄影风格, 1:1 商业构图',
    size: '1:1',
  },
  {
    id: 'photoshoot-mode-08',
    prompt: '美妆个护场景: 一支金色管口红 + 一瓶玻璃精华液放在大理石化妆台, 旁边散落几片玫瑰花瓣, 柔和粉金色顶光, 高端美妆杂志摄影风格, 浅景深, 1:1 商业构图',
    size: '1:1',
  },

  // ============================================================
  // /product/video 3 视频场景缩略图 · aspect-video 16:9
  // ============================================================
  {
    id: 'video-scenario-01',
    prompt: '带货短视频截帧风格: 亚洲女主播 28 岁手持一个白色无线耳机充电仓特写, 笑容自然展示产品细节, 明亮直播间布光, 背景虚化, 16:9 宽屏构图, 真实直播感, 短视频 thumbnail 风格',
    size: '16:9',
  },
  {
    id: 'video-scenario-02',
    prompt: '产品教程视频截帧: 一双手正在演示打开一只智能水杯的盖子, 桌面布满相关零件分镜排列, 俯拍视角, 干净白色台面, 教学视频常用的清晰布光, 16:9 宽屏构图, YouTube 教程缩略图风格',
    size: '16:9',
  },
  {
    id: 'video-scenario-03',
    prompt: '生活场景植入视频截帧: 一位亚洲女性在阳光明媚的厨房使用一台银白色咖啡机, 自然清晨窗光从右侧, 温暖生活方式氛围, 16:9 宽屏中景, 编辑短视频风格, 真实生活感',
    size: '16:9',
  },

  // ============================================================
  // /product/pipeline Hero 三联拼贴 · 主图 + 视频截帧 + 详情页缩略
  // ============================================================
  {
    id: 'pipeline-hero-collage',
    prompt: '电商 SaaS 产品 Hero 三联视觉拼贴: 横向并排三个矩形格子, 左格子是干净的白底产品主图 (家居陶瓷杯), 中间格子是带货短视频截帧 (亚洲主播展示产品), 右格子是手机端 Amazon 商品详情页截图缩略, 整体深色背景, 三个格子之间用细金色分隔线, 设计感强, 现代 SaaS 官网 Hero 视觉, 16:9 宽屏构图',
    size: '16:9',
  },

  // ============================================================
  // /cases 4 个案例头部产品场景图
  // ============================================================
  {
    id: 'case-homelody',
    prompt: '家居收纳产品商业摄影: 6 件装透明密封塑料收纳盒整齐堆叠在白色橱柜台面, 旁边放着北欧风厨具, 干净厨房场景, 自然窗光, 35mm 浅景深, Amazon 主图规范, 真实拍摄质感, 16:9 商业构图',
    size: '16:9',
  },
  {
    id: 'case-vicseed',
    prompt: '汽车配件场景实拍: 一只磁吸式黑色车载手机支架已装在真车仪表台中央, 上面吸附一台黑色 iPhone, 真皮内饰背景, 黄昏暖色侧光, 35mm 中景浅景深, 真实车内非渲染, 高端汽车配件商业摄影, 16:9 构图',
    size: '16:9',
  },
  {
    id: 'case-micro-audio',
    prompt: '户外蓝牙音箱场景: 一只哑黑户外便携蓝牙音箱放在岩石上, 背景是清晨湖面薄雾, 自然清晨光线, 35mm 浅景深, 户外生活方式商业摄影, 真实户外质感, 16:9 宽屏构图',
    size: '16:9',
  },
  {
    id: 'case-novahome-image',
    prompt: '家居代工厂主图工业风: 多款不同尺寸白色食品级收纳盒整齐排列在干净白色台面, 顶光均匀打光, 极简构图, 工业产品图录风格, 锐利对焦, 16:9 横版商业构图, 真实棚拍质感',
    size: '16:9',
  },
];

async function loadManifest() {
  if (!existsSync(MANIFEST)) return null;
  try { return JSON.parse(await readFile(MANIFEST, 'utf-8')); } catch { return null; }
}

async function generateOne(job) {
  const headers = {
    Authorization: `Bearer ${HH_KEY}`,
    'Content-Type': 'application/json',
  };
  const createBody = { prompt: job.prompt, aspectRatio: job.size };

  const createRes = await fetch(`${HH_BASE}/api/v2/open/aigc/gpt-image`, {
    method: 'POST', headers, body: JSON.stringify(createBody),
  });
  if (!createRes.ok) {
    throw new Error(`create HTTP ${createRes.status}: ${(await createRes.text()).slice(0, 200)}`);
  }
  const created = await createRes.json();
  if (created.code !== 0 || !created.data?.taskId) {
    throw new Error(`create failed: ${created.msg}`);
  }
  const taskId = created.data.taskId;

  const start = Date.now();
  let queried = null;
  while (Date.now() - start < 180_000) {
    await new Promise(r => setTimeout(r, Date.now() - start > 30_000 ? 5000 : 3000));
    const r = await fetch(`${HH_BASE}/api/v2/open/aigc/${taskId}`, {
      headers: { Authorization: `Bearer ${HH_KEY}` },
    });
    if (!r.ok) continue;
    queried = await r.json();
    if (queried?.code !== 0) continue;
    const status = queried.data?.status;
    if (status === 'success' || status === 'failed') break;
  }
  if (!queried?.data) throw new Error('poll timeout');
  if (queried.data.status === 'failed') throw new Error(queried.data.errorMsg || 'failed');
  const url = queried.data.result?.[0];
  if (!url) throw new Error('no result url');
  return url;
}

async function downloadTo(url, dest) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  await writeFile(dest, buf);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const existing = await loadManifest();
  const doneIds = new Set(existing?.items.map(i => i.id) ?? []);

  const results = existing?.items ?? [];
  let generated = 0, failed = 0;

  for (const job of JOBS) {
    if (doneIds.has(job.id)) {
      console.log(`⊘ skip ${job.id}`);
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
      await writeFile(MANIFEST, JSON.stringify({
        generatedAt: new Date().toISOString(),
        items: results,
      }, null, 2));
    } catch (e) {
      console.error(`  ✗ ${job.id}: ${e?.message || e}`);
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
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
