# wenai · 跨境代运营流水线 OS

> 代运营日均重复劳动，用 3 条 Pipeline 吃掉。不做大平台，做流水线。

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel)](https://wenai-one.vercel.app)
[![License](https://img.shields.io/badge/License-proprietary-red)](#license)

五大品类（家居 / 汽摩 / 数码 / 工具 / 生活百货）各有专属 prompt 调教，比通用 GPT 懂 FCC、BPA-Free、CAT III、LFGB。

## 快速体验

| 入口 | URL | 说明 |
|---|---|---|
| 🏠 工作台 | [wenai-one.vercel.app](https://wenai-one.vercel.app) | 登录后看到 3 Pipeline + Toolbox |
| 🎟️ Demo 邀请 | [/invite?code=demo](https://wenai-one.vercel.app/invite?code=demo) | 无需注册直接进 |
| ⚡ 15 秒 demo | [/pipelines/new-listing?demo=1](https://wenai-one.vercel.app/pipelines/new-listing?demo=1) | 零输入看真 AI 输出 |
| 📊 案例 | [/cases](https://wenai-one.vercel.app/cases) | 4 条 Before/After 对比 |
| 💎 定价 | [/pricing](https://wenai-one.vercel.app/pricing) | Free / Team ¥499 / Ent |
| 🟢 状态 | [/status](https://wenai-one.vercel.app/status) | SLA 可观测 |

## 架构

```
┌─── 3 Pipeline (旗舰) ────────────────────┐
│  01 新品上新      → 翻译 + 文案 + 合规    │
│  02 达人冷启      → 批量个性化邮件        │
│  03 AI 电商主图   → 5 张图组合 · 通义万相 │
└──────────────────────────────────────────┘
              ↓ 联动 + 分享
┌─── 19 Toolbox (单点工具) ────────────────┐
│  执行: 翻译/评论/外联/视频/OCR          │
│  内容: 文案/种草/主图/直播/定位          │
│  情报: 竞品/选品/运营/合规/数据/投流     │
│  服务: 客服转化/获客/私域                │
└──────────────────────────────────────────┘
              ↓
        公开分享 /share/<id>
        (7 天 TTL · 自动 OG 图)
```

**决策留痕** (`.planning/`)：
- DECISION.md → DECISION-v2.md · 战略两次收敛
- COMPETITIVE-HOTCLAW.md · 对标 + 5 点差异化
- PHASE3-BILLING.md · 付费链路决策

---

## 3 条 Pipeline

| # | Pipeline | 输入 | 输出 | 成熟度 |
|---|---|---|---|---|
| 01 | 新品上新 | 1 条 SKU + 品类 | 翻译 + 文案 + 合规 三栏并行 + Excel/Markdown | 稳定 · 含批量 ≤ 20 条 |
| 02 | 达人批量冷启 | ≤ 10 位达人名单（\| 分隔） | 每位独立个性化邮件 + Excel 直喂 Gmail Mail Merge | 稳定 |
| 03 | AI 电商主图 | SKU + 场景预设（15 选 1） | 5 张图组合（主/场景/细节/使用/对比） | Alpha · 待接 FAL / Replicate key |

### Pipeline 01 亮点
- 五品类 prompt 前缀自动注入（代码见 `src/lib/category-prompts.ts`）
- 单 SKU 和批量模式 tab 切换
- Excel 4 工作表输出（概览 + 翻译 + 文案 + 合规）
- Pipeline 级配额独立计数（每条 SKU 扣 1 次，不与 Toolbox 共享）

### Pipeline 02 亮点
- 根据粉丝量自动选调性（<50K 共情 / 50-200K 主动 / >200K 数据）
- 根据平台调语气（TikTok 活泼 / YouTube 深度 / Instagram 视觉）
- 严格 `Subject: xxx\n\n<Body>` 格式约束，Excel 导出字段干净

### Pipeline 03 亮点（vs HotClaw 差异化）
- 15 个垂直场景预设（HotClaw 通用模板）
- 1 SKU → 5 图组合（HotClaw 单图）
- 商标词前置过滤（AirPods/Apple/Anker 等自动替换 `[brand]`）
- Amazon / Shopee / Lazada / Instagram 标准尺寸显性展示

---

## Toolbox · 19 单点工具

Pipeline 是编排，Toolbox 是零件。两者共存：
- 执行层：批量翻译 · 媒介外联 · 评论分析 · 视频剪辑 · 图片OCR翻译
- 内容工厂：商品文案 · 种草内容 · 主图生成 · 直播全案 · 直播定位
- 情报层：竞品拆解 · 选品辅助 · 运营策略 · 侵权防控 · 数据洞察 · 投流优化
- 服务层：销售转化Agent · 精准获客 · 私域运营自动化

单独用模块时配额独立（如 `translate: 100 次/天`）与 Pipeline 互不干扰。

---

## 定价（2026-04）

| 档 | 价 | Pipeline 配额 | Toolbox 配额 | 特征 |
|---|---|---|---|---|
| Free | ¥0 · 7 天 | 10 次/天 | 50 次/天 单模块 | 邀请码激活 |
| Team | ¥499/月 | 500 次/天 | — | 5 席 · Excel 导出 · 邮件客服 |
| Enterprise | 面议 | 无限 | — | 本地部署 · 品类深度定制 · SLA 99.9% |

见 `/pricing`

*按分层逻辑详见 `.planning/DECISION.md`*

---

## 本地跑起来（2 分钟）

```bash
git clone https://github.com/zacharyxpku-boop/wenai.git
cd wenai
npm install
cp .env.example .env.local
# 编辑 .env.local，至少填 AI_API_KEY / JWT_SECRET / PASSWORD_SALT
npm run dev
```

访问 http://localhost:3000 → 用 `/invite?code=demo` 激活体验。

### 必填环境变量

| Key | 说明 |
|---|---|
| `AI_API_KEY` | DeepSeek / 通义千问 / OpenAI 任选一家的 API Key |
| `AI_MODEL` | 默认 `qwen-plus`，可换 `deepseek-chat` 等 |
| `AI_ENDPOINT` | 与 model 对应的 endpoint，见 `.env.example` |
| `JWT_SECRET` | 最少 32 字节随机串，生产环境强制必填 |
| `PASSWORD_SALT` | 最少 16 字节随机串 |

生成随机密钥：
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### 可选环境变量

| Key | 说明 |
|---|---|
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | 配了则用 Upstash 做跨实例速率限制，不配则用进程内存 |

---

## 技术栈

- Next.js 16 (App Router) + TypeScript + Tailwind CSS + Turbopack
- AI：DeepSeek / Qwen / OpenAI compatible endpoint
- 认证：JWT (jose) + HttpOnly Cookie
- 限流：Upstash Redis（可选）+ 内存降级
- 部署：Vercel（subtree split from monorepo）

---

## 目录结构

```
src/
├── app/
│   ├── page.tsx              # 工作台首页（Quick Start 3 卡 + 19 模块分组）
│   ├── invite/page.tsx       # 邀请码激活页
│   ├── modules/[moduleId]/   # 动态模块页
│   ├── api/
│   │   ├── ai/route.ts       # 统一 AI 调用入口（含 SSE 流式）
│   │   ├── auth/invite/      # 邀请 token 激活
│   │   ├── feedback/         # 结果反馈收集
│   │   └── trademark/        # 商标数据库查询
│   ├── privacy/page.tsx      # 隐私政策（含内测承诺 banner）
│   └── settings/page.tsx
├── components/
│   ├── AIWorkspace.tsx       # 通用模块工作台（输入→流式输出→反馈）
│   ├── BetaFeedback.tsx      # 轻量反馈 3 按钮
│   └── ...
├── config/
│   ├── modules.json          # 19 模块注册表（含 prompt）
│   ├── client.json           # 租户配置
│   └── tenants/              # 多租户扩展
├── data/
│   ├── references/           # 各模块 few-shot 示例（JSON）
│   ├── industry-benchmarks.json
│   └── trademarks.json       # 500+ 品牌数据库
└── lib/
    ├── ai.ts / auth.ts / ratelimit.ts / references.ts / demo-cache.ts
```

---

## 新增一个模块（15 分钟）

1. 在 `src/config/modules.json` 的 `modules` 数组末尾加一条：
   ```json
   {
     "id": "your-module",
     "name": "模块名",
     "nameEn": "Module Name",
     "description": "一句话描述",
     "category": "execute | content | intel | service",
     "icon": "sparkles",
     "enabled": true,
     "prompt": "你是一个... 请根据以下输入输出..."
   }
   ```
2. 在 `src/config/client.json` 和 `src/config/tenants/default.json` 的 `enabledModules` 加 `"your-module"`
3. 在 `src/app/modules/[moduleId]/page.tsx` 的 `moduleFields` 和 `modulePlaceholders` 补上输入字段
4. 在 `src/app/api/ai/route.ts` 的 `MODULE_TEMPERATURE` 加温度（0.3 精确 / 0.7 创造）
5. 在 `src/lib/demo-cache.ts` 加 demo fallback 响应（API 挂了时顶上）
6. 可选：在 `src/data/references/` 加 few-shot 示例 JSON 并在 `src/lib/references.ts` 注册

---

## 部署到 Vercel

本仓库是 monorepo 的 subtree。主仓库通过以下命令推送：

```bash
git subtree split --prefix=claude/wenai -b wenai-deploy
git push wenai-origin wenai-deploy:main --force
```

Vercel 监听 `main` 分支自动构建。首次部署需在 Vercel Dashboard → Settings → Environment Variables 配置所有必填变量。

---

## 内测期承诺

- 用户输入数据不落库（处理完即丢）
- 不用于 AI 模型训练
- 浏览器关闭即清除 session
- 详见 `/privacy`

---

## 联系

zachary.x.pku@gmail.com
