#!/usr/bin/env node
/**
 * market.mjs — Universal Marketing Pipeline
 *
 * Usage:
 *   node scripts/market.mjs --url https://your-product.com
 *   node scripts/market.mjs --brief "产品名: X，目标用户: Y，核心价值: Z"
 *   node scripts/market.mjs --brief-file path/to/brief.md
 *
 * Outputs: state/marketing/[slug]/ with 10 production-ready files + START-HERE.md
 *
 * Requires: DEEPSEEK_API_KEY in env or hardcoded below
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

// ── Config ────────────────────────────────────────────────────────────────────
const DEEPSEEK_API_KEY =
  process.env.DEEPSEEK_API_KEY || 'sk-0972d9339da34038909463f70541a5cf'
const API_URL = 'https://api.deepseek.com/v1/chat/completions'
const MODEL = 'deepseek-chat'

// ── Helpers ───────────────────────────────────────────────────────────────────
function log(emoji, msg) {
  console.log(`${emoji}  ${msg}`)
}

function slug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
}

async function ai(systemPrompt, userPrompt, maxTokens = 3000) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: maxTokens,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DeepSeek API error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.choices[0].message.content.trim()
}

async function fetchURL(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000),
    })
    const html = await res.text()
    // Strip tags, keep meaningful text
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 6000)
  } catch (e) {
    return `[URL抓取失败: ${e.message}]`
  }
}

function write(dir, filename, content) {
  fs.writeFileSync(path.join(dir, filename), content, 'utf8')
}

// ── Step 0: Parse args ────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2)
  const get = (flag) => {
    const i = args.indexOf(flag)
    return i !== -1 ? args[i + 1] : null
  }
  return {
    url: get('--url'),
    brief: get('--brief'),
    briefFile: get('--brief-file'),
  }
}

// ── Step 1: Product Intelligence ─────────────────────────────────────────────
async function extractProductProfile(rawInput) {
  log('🔍', '分析产品中...')
  const profile = await ai(
    `你是顶级产品策略分析师。严格输出 JSON，不要加任何 markdown code block 或其他文字。`,
    `根据以下产品信息，提取结构化 profile：

${rawInput}

输出格式（严格 JSON）：
{
  "name": "产品名（简短）",
  "tagline": "一句话定位（≤20字）",
  "target_user": "核心目标用户（具体描述，不要泛化）",
  "target_user_short": "目标用户简版（≤10字，用于文案）",
  "core_value": "用户最核心收益是什么（具体，不能是废话）",
  "usp": "和竞品最不同的一点",
  "free_hook": "免费提供什么（让用户愿意进来）",
  "paid_value": "付费获得什么（具体价值）",
  "price": "定价区间或具体价格",
  "stage": "P0（已有产品可验证付费）/ P1（需建信任）/ P2（早期概念）",
  "primary_channels": ["小红书", "私域", "知乎"],
  "content_angles": ["角度1", "角度2", "角度3", "角度4", "角度5"],
  "user_pain_points": ["痛点1", "痛点2", "痛点3"],
  "share_hooks": ["让用户想分享的点1", "让用户想分享的点2"],
  "risk_words": ["需要避免的词1", "需要避免的词2"],
  "cold_start_path": "冷启动第一步建议"
}`,
    1500
  )
  try {
    // Strip markdown code fences if present
    const cleaned = profile
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim()
    return JSON.parse(cleaned)
  } catch {
    // Try to extract JSON from anywhere in the response
    const match = profile.match(/\{[\s\S]+\}/)
    if (match) {
      try { return JSON.parse(match[0]) } catch {}
    }
    log('⚠️', '产品 profile 解析异常，使用降级模式')
    // Build minimal profile from raw input
    const nameMatch = rawInput.match(/产品名[：:]\s*([^\n，,]+)/)
    const userMatch = rawInput.match(/目标用户[：:]\s*([^\n，,]+)/)
    const valueMatch = rawInput.match(/核心价值[：:]\s*([^\n，,]+)/)
    return {
      name: nameMatch?.[1]?.trim() || 'Product',
      tagline: valueMatch?.[1]?.trim() || rawInput.slice(0, 50),
      target_user: userMatch?.[1]?.trim() || '目标用户',
      target_user_short: userMatch?.[1]?.trim().slice(0, 10) || '目标用户',
      core_value: valueMatch?.[1]?.trim() || '',
      usp: '',
      free_hook: '免费体验',
      paid_value: '深度报告',
      price: '9.9元',
      stage: 'P0',
      primary_channels: ['私域', '小红书'],
      content_angles: ['测试结果', '用户故事', '关系配对', '对比讨论', '玩法互动'],
      user_pain_points: ['不了解自己', '关系困惑', '自我认知模糊'],
      share_hooks: ['个性化结果', '对比好奇心'],
      risk_words: ['算命', '占卜', '预测未来'],
      cold_start_path: '先私域后小红书',
    }
  }
}

// ── Step 2: Campaign Brief ────────────────────────────────────────────────────
async function generateCampaignBrief(profile) {
  log('📋', '生成营销方案...')
  return await ai(
    `你是营销总指挥，输出真正有战略价值的 campaign brief。禁止使用：AI驱动、智能洞察、一站式、高效、赋能、精准分析。`,
    `产品信息：
${JSON.stringify(profile, null, 2)}

输出完整 campaign brief（markdown 格式）：

# Campaign Brief — ${profile.name}

## 核心判断
（3 句话，说清楚：这个产品现在最应该干什么、为什么）

## 本轮主战役
（具体的一句话，不是方向，是战役名称和目标）

## 目标用户聚焦
（具体描述"第一批用户是谁"，不要泛化，描述到能在脑子里想象出具体的一个人）

## 核心传播语
（3 个版本，每个 ≤15 字，像真人说话，不像广告）

## 渠道优先级
（按当前阶段，写清楚 1/2/3 优先级和原因）

## 内容主轴（5 个内容方向）
每个方向：角度名称 + 为什么这个方向有传播力 + 一个具体标题示例

## 裂变设计
（完成什么动作后，为什么用户会想分享，分享什么）

## 第一周执行重点
（具体 3 件事，不是方向）

## 风控边界
（2-3 条，什么不能说，为什么）`,
    2500
  )
}

// ── Step 3: XHS Pack (5 posts) ────────────────────────────────────────────────
async function generateXHSPack(profile, brief) {
  log('📱', '生成小红书内容包（5 条）...')
  return await ai(
    `你是小红书内容专家，写出真实女生风格的内容。禁止使用：AI驱动、智能洞察、一站式、高效、赋能、精准分析、Powered by AI。`,
    `产品：${profile.name}
定位：${profile.tagline}
目标用户：${profile.target_user}
核心价值：${profile.core_value}
内容角度：${(profile.content_angles || []).join('、')}

为该产品生成 5 条完整小红书发布包：

每条包含：
### Post N: [角度名称]
**推荐发布：** Day X（发布日期建议）
**最佳时间：** XX:00

**标题方案**（5个，每个≤15字，至少2个以"你"开头）：
1. ...
2. ...
3. ...
4. ...
5. ...

**正文**（300-500字，真实女生语气，用换行断句，自然用emoji，不超过3个）：

**封面文案**（≤12字）：

**图片 brief**（一句话，说明截图主体和视觉重点）：

**首评**（发布后立即自己评，引导互动）：

**追评**（2-4小时后，回应可能的问题）：

**标签**（8个，#格式）：

---

5 条角度要不同：测试结果展示、关系/合盘、用户故事/案例、争议对比、玩法互动`,
    4000
  )
}

// ── Step 4: Private Launch Pack ───────────────────────────────────────────────
async function generatePrivateLaunchPack(profile) {
  log('💬', '生成私域启动包...')
  return await ai(
    `你是私域运营专家。写出真实自然的中文朋友圈和私聊文案。`,
    `产品：${profile.name}
定位：${profile.tagline}
目标用户：${profile.target_user_short || profile.target_user}
核心价值：${profile.core_value}
免费内容：${profile.free_hook || '免费体验'}
付费内容：${profile.paid_value || '深度报告'}

生成完整私域启动包：

## 朋友圈文案

### 长版（150-200字，真实感，像朋友分享，不像广告）：
[文案]
[配图建议]
[发布时间建议]

### 短版1（50字内，强悬念）：
[文案]

### 短版2（30字内，问句式）：
[文案]

### 里程碑版（当有第一批用户后用）：
[文案]

## 9 图顺序建议
1. 图1：[说明]
2. 图2：[说明]
...（列出9张的主题和设计重点）

## 私聊邀请话术

### 对闺蜜/好友：
[话术，自然不做作]

### 对普通朋友：
[话术]

### 对伴侣/恋人：
[话术，引导一起做合盘类功能]

## 50人内测群启动包

### 群欢迎语：
[包含：欢迎+产品介绍+使用方式+反馈要求，200字内]

### 群第1条消息（入群后1小时）：
[内容]

### 群第2条消息（入群后4小时）：
[内容]

### 群第3条消息（第2天）：
[内容]

## 反馈收集文案
[5个问题，问卷形式，帮助收集真实反馈]`,
    3000
  )
}

// ── Step 5: Referral Pack ─────────────────────────────────────────────────────
async function generateReferralPack(profile) {
  log('🔄', '生成裂变素材包...')
  return await ai(
    `你是裂变增长专家。设计真实可执行的分享机制，不能是强迫式弹窗。`,
    `产品：${profile.name}
分享钩子：${(profile.share_hooks || ['有趣结果', '对比功能']).join('、')}
目标用户：${profile.target_user_short || profile.target_user}

生成完整裂变素材包：

## 分享触发设计
（在什么时刻触发分享，在产品哪个页面，触发什么情绪）

## 对比图文案（3个版本）
（用户完成后展示给朋友看的对比，核心是让接收者好奇）
版本1（冲突型）：
版本2（好奇型）：
版本3（共鸣型）：

## 分享文案

### 短文案（≤30字，5个）：
1.
2.
3.
4.
5.

### 长文案（100-150字，3个，不同角度）：
版本1：
版本2：
版本3：

## 平台适配版

### 小红书版（正文+标题+首评）：

### 朋友圈版（长/短/极简 三个）：

### 私聊版（3个场景：好友/群发/陌生人）：

## 接收者体验设计
（收到链接的人：点开后 10 秒内看到什么，30 秒内能做什么，不需要注册能体验什么）

## 风险控制
（哪些说法必须避免，平台规则注意点）`,
    2500
  )
}

// ── Step 6: Zhihu + SEO ───────────────────────────────────────────────────────
async function generateZhihuSEO(profile) {
  log('🔎', '生成知乎回答 + SEO 矩阵...')
  return await ai(
    `你是内容营销专家。知乎回答风格：专业但不做作，价值优先，软植入。`,
    `产品：${profile.name}
核心价值：${profile.core_value}
目标用户：${profile.target_user}
内容角度：${(profile.content_angles || []).join('、')}

## Part 1: 知乎 5 条完整回答

对每个问题写一个800字+的完整回答：
问题1（系统对比类）
问题2（产品推荐类）
问题3（方法论类）
问题4（情感/关系类）
问题5（怀疑/辩论类）

每条回答格式：
**问题：** [问题标题]
**回答：** [完整回答，自然软提到${profile.name}]

---

## Part 2: SEO 文章 10 篇大纲

每篇：
**标题：** [关键词优化，≤60字]
**主关键词：**
**副关键词：**
**大纲：**（H2/H3结构）
**CTA位置：** （在哪段软植入）`,
    4000
  )
}

// ── Step 7: QA Reply Pack ─────────────────────────────────────────────────────
async function generateQAPack(profile) {
  log('💡', '生成评论回复弹药库...')
  return await ai(
    `你是社区运营专家。回复要真实自然，有温度，不要企业号语气。`,
    `产品：${profile.name}
风险词：${(profile.risk_words || []).join('、')}

生成完整评论回复弹药库：

## 高频正面评论回复（10条）
（有人说"好准"/"真的吗"/"我也来测"时的回复）

## 质疑/负面处理（8条）
（有人说"不准"/"骗人"/"算命？"时的回复，不争辩，转化困惑）

## 追问引导（5条）
（引导评论者去试试或分享给朋友）

## 私聊承接话术（3条）
（有人私信询问时，如何接住并转化）

## 知乎评论区软植入（5条）
（在别人回答下面留言，不生硬，有价值）

## 紧急危机处理
（如果内容被认为是算命/迷信/虚假宣传，怎么回应）`,
    2500
  )
}

// ── Step 8: 30-Day Calendar ───────────────────────────────────────────────────
async function generate30DayCalendar(profile, brief) {
  log('📅', '生成 30 天执行日历...')
  return await ai(
    `你是营销执行专家。日历必须极其具体，用户可以不动脑地跟着执行。`,
    `产品：${profile.name}
阶段：${profile.stage || 'P0'}
渠道优先级：${(profile.primary_channels || ['私域', '小红书']).join(' → ')}
冷启动路径：${profile.cold_start_path || '先私域后小红书'}

生成 30 天精细执行日历：

## Day 0（上线前准备，1天）
清单式，列出所有必须准备的事（截图/链接/群/账号等）

## Week 1：冷启动（Day 1-7，精确到小时）

对 Day 1-3，每天格式：
### Day N — [主题]
| 时间 | 渠道 | 动作 | 复制哪个文件哪个部分 | 预期结果 |
|------|------|------|---------------------|---------|
| 10:00 | ... | ... | ... | ... |
（覆盖从早到晚所有营销动作）

Day 4-7 按天格式，精确到上午/下午/晚上

## Week 2-4 节奏
每周一个核心主题，每天一行格式：
Day X | 渠道 | 核心动作 | 预期里程碑

## 内容发布节奏表
| 渠道 | 频率 | 最佳时间 | 内容类型 |
|------|------|---------|---------|

## 应急手册
| 情况 | 判断信号 | 立即做什么 |
|------|---------|---------|
（覆盖：无互动/被限流/差评/无付费/产品bug 5种情况）

## 每周复盘问题（5个）
（每周日回答，用于调整下周策略）`,
    4000
  )
}

// ── Main pipeline ─────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs()

  if (!args.url && !args.brief && !args.briefFile) {
    console.log(`
用法：
  node scripts/market.mjs --url https://your-product.com
  node scripts/market.mjs --brief "产品名: X，目标用户: Y，核心价值: Z"
  node scripts/market.mjs --brief-file path/to/brief.md
`)
    process.exit(1)
  }

  console.log('\n🚀  Marketing Pipeline 启动\n')

  // ── Prepare raw input ──
  let rawInput = ''
  if (args.url) {
    log('🌐', `抓取产品页面: ${args.url}`)
    rawInput = `产品 URL: ${args.url}\n\n页面内容:\n${await fetchURL(args.url)}`
  } else if (args.briefFile) {
    rawInput = fs.readFileSync(path.resolve(args.briefFile), 'utf8')
  } else {
    rawInput = args.brief
  }

  // ── Step 1: Product Profile ──
  const profile = await extractProductProfile(rawInput)
  const projectSlug = slug(profile.name || 'product')
  const timestamp = new Date().toISOString().slice(0, 10)
  const outDir = path.join(ROOT, 'state', 'marketing', `${projectSlug}-${timestamp}`)
  fs.mkdirSync(outDir, { recursive: true })

  write(outDir, '00-product-profile.json', JSON.stringify(profile, null, 2))
  log('✅', `产品 profile 完成 → ${profile.name}`)

  // ── Steps 2-8: Run in parallel (grouped to respect rate limits) ──
  log('⚡', '并行生成所有营销内容（预计 1-2 分钟）...\n')

  const [brief, xhs, privateLaunch] = await Promise.all([
    generateCampaignBrief(profile),
    generateXHSPack(profile, ''),
    generatePrivateLaunchPack(profile),
  ])

  write(outDir, '01-campaign-brief.md', `# Campaign Brief — ${profile.name}\n\n${brief}`)
  write(outDir, '02-xhs-pack.md', `# 小红书发布包 — ${profile.name}\n\n${xhs}`)
  write(outDir, '03-private-launch-pack.md', `# 私域启动包 — ${profile.name}\n\n${privateLaunch}`)
  log('✅', 'Campaign Brief + 小红书包 + 私域包 完成')

  const [referral, zhihuSeo, qa] = await Promise.all([
    generateReferralPack(profile),
    generateZhihuSEO(profile),
    generateQAPack(profile),
  ])

  write(outDir, '04-referral-pack.md', `# 裂变素材包 — ${profile.name}\n\n${referral}`)
  write(outDir, '05-zhihu-seo-pack.md', `# 知乎 + SEO 内容包 — ${profile.name}\n\n${zhihuSeo}`)
  write(outDir, '06-qa-reply-pack.md', `# 评论回复弹药库 — ${profile.name}\n\n${qa}`)
  log('✅', '裂变包 + 知乎SEO + QA弹药库 完成')

  const calendar = await generate30DayCalendar(profile, brief)
  write(outDir, '07-30day-calendar.md', `# 30 天执行日历 — ${profile.name}\n\n${calendar}`)
  log('✅', '30 天日历 完成')

  // ── Generate START-HERE ──
  const startHere = generateStartHere(profile, outDir, timestamp)
  write(outDir, 'START-HERE.md', startHere)

  // ── Summary ──
  const files = fs.readdirSync(outDir)
  const totalLines = files.reduce((sum, f) => {
    try {
      return sum + fs.readFileSync(path.join(outDir, f), 'utf8').split('\n').length
    } catch {
      return sum
    }
  }, 0)

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  ✅  营销系统生成完成                                          ║
╠══════════════════════════════════════════════════════════════╣
║  产品：${profile.name.padEnd(52)}║
║  文件：${String(files.length).padEnd(52)}║
║  总行数：${String(totalLines).padEnd(50)}║
╠══════════════════════════════════════════════════════════════╣
║  📂  ${outDir.slice(-55).padEnd(54)}║
╚══════════════════════════════════════════════════════════════╝

👉 打开 START-HERE.md 开始执行
`)
}

function generateStartHere(profile, outDir, date) {
  return `# START HERE — ${profile.name}
> 生成日期：${date}

## 你只需要做 3 件事

### 1️⃣ 今天（Day 0）— 30分钟准备
打开 \`07-30day-calendar.md\` → 找 "Day 0" → 按清单准备截图和链接

### 2️⃣ 明天（Day 1）— 20分钟启动
打开 \`07-30day-calendar.md\` → 找 "Day 1" → 按时间表执行
- 早10:00 → 打开 \`03-private-launch-pack.md\` → 发朋友圈（长版）
- 晚20:00 → 打开 \`03-private-launch-pack.md\` → 发私聊邀请（好友版）
- 晚21:00 → 打开 \`03-private-launch-pack.md\` → 群欢迎语

### 3️⃣ Day 4 起 — 每天20分钟
- 看 \`07-30day-calendar.md\` 当天任务
- 从对应文件复制文案
- 发布 → 回复评论（用 \`06-qa-reply-pack.md\`）

---

## 文件导航

| 文件 | 用途 | 何时用 |
|------|------|--------|
| \`01-campaign-brief.md\` | 整体策略方向 | 第一次看，理解全局 |
| \`02-xhs-pack.md\` | 5条小红书完整发布包 | Day 4 起每天发1条 |
| \`03-private-launch-pack.md\` | 朋友圈+群+私聊 | Day 1-3 |
| \`04-referral-pack.md\` | 裂变分享素材 | Day 5 起开启合盘邀请 |
| \`05-zhihu-seo-pack.md\` | 知乎回答+SEO大纲 | Day 15 起 |
| \`06-qa-reply-pack.md\` | 评论回复话术 | 随时查，有评论就用 |
| \`07-30day-calendar.md\` | 每天做什么 | 每天早上打开 |

---

## 产品速查
- **产品**：${profile.name}
- **定位**：${profile.tagline}
- **目标用户**：${profile.target_user_short || profile.target_user}
- **核心价值**：${profile.core_value}
- **第一渠道**：${(profile.primary_channels || ['私域'])[0]}
- **阶段**：${profile.stage || 'P0'}

---

## 每周复盘
每周日对我说："${profile.name} 营销复盘，本周数据：[贴数据]"
→ 自动分析 + 下周策略调整
`
}

main().catch((err) => {
  console.error('\n❌ Pipeline 出错：', err.message)
  process.exit(1)
})
