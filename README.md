# wenai · SKU 上新物料包子站

> 输入 SKU 信息，生成上新 SOP、主图方向、详情页文案、合规提醒、客服话术和复评 checklist。本仓库作为独立主站里的产品介绍 + 演示 + 线索承接子站，不在这里完成收款。

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel)](https://wenai-one.vercel.app)
[![License](https://img.shields.io/badge/License-proprietary-red)](#license)

当前商业化主线不是“19 个工具集合”，而是一个可解释、可交付、可验收的 SKU 上新工作流。正式收费、合同、发票和支付由独立主站或线下订单承接。

## 快速体验

| 入口 | URL | 说明 |
|---|---|---|
| 🏠 子站首页 | [wenai-one.vercel.app](https://wenai-one.vercel.app) | 产品定位、样例、接入入口 |
| ⚡ 演示入口 | [/demo](https://wenai-one.vercel.app/demo) | 自动进入 5 个演示 SKU 的批量上新流程 |
| 🏭 批量上新 | [/pipelines/batch-launch?demo=1](https://wenai-one.vercel.app/pipelines/batch-launch?demo=1) | 预填样例 SKU，生成批量上新 SOP |
| 📊 样例 | [/cases](https://wenai-one.vercel.app/cases) | 内测样例，不包装成客户业绩证明 |
| 💎 接入方案 | [/pricing](https://wenai-one.vercel.app/pricing) | 演示 / 10 SKU POC / 企业接入 |
| 📝 接入需求 | [/inquire](https://wenai-one.vercel.app/inquire) | 收集 POC 和企业接入线索 |
| 🟢 状态 | [/status](https://wenai-one.vercel.app/status) | SLA 可观测 |

## POC 交付 SOP

商业化交付不靠临场发挥。正式 POC 按 [docs/POC_DELIVERY_SOP.md](docs/POC_DELIVERY_SOP.md) 执行:

1. 先资格判断: 10 个真实 SKU、目标平台、素材状态、验收口径。
2. 再生成交付包: SKU 简报、主图方向、详情页文案、合规提醒、客服话术、30 天复评 checklist。
3. 增加内容拆解与增长测试包: 产品读图、搜索地图、benchmark 拆解、hook、首帧、脚本、素材清单、7 天测试排期。
4. 高阶项目增加创意生产包: Podcast UGC / Street Interview / Batch UGC / Slideshow / Animated Ads / Editing。
5. 最后复盘决策: 验收分、返工点、benchmark 证据、内容测试信号、是否进入主站合同/支付流程。

后台 `/admin/inquiries` 负责沉淀负责人、下一动作、跟进日期、验收分和复盘结论。

## 标品化 SOP 内核

wenai 不要求用户理解内部 skills。SOP 已经沉到代码层:

- `src/lib/sop-workflows.ts`: workflow 模板、推荐逻辑、缺料清单、验收标准、人工终审边界、Markdown 交付包。
- `/pipelines/marketing-campaign`: 面向用户的市场宣传工作台, 自然语言输入后输出稳定标品。
- `/api/standard-pack`: 标准交付包 API, 后续可被批量上新、询盘后台、主站合同流复用。

原则: 用户只填业务信息, 系统负责选择 workflow、暴露缺料、生成可执行交付包。

## 最终目标

wenai 的最终目标已经收敛为一个非常具体的商业结果:

**把这个子站做成能稳定承接并推进 `10 SKU POC -> 复盘 -> 主站合同/支付` 的成交前台。**

北极星指标不是流量，不是工具数量，而是:

**每月进合同的合格 POC 数**

这意味着我们优先优化四件事:

1. 线索质量，而不是粗暴放大询盘数
2. POC 交付率，而不是做一堆无法验收的演示
3. 复盘率，而不是交付完就断掉
4. 合同推进率，而不是停留在“客户觉得不错”

完整定义见 [docs/FINAL_GOAL.md](docs/FINAL_GOAL.md)。

PostPlus 的 agent workflow 可作为参考，但 wenai 不做泛社媒 OS。融合方案见 [docs/POSTPLUS_ECOMMERCE_INTEGRATION.md](docs/POSTPLUS_ECOMMERCE_INTEGRATION.md)，TikTok / Instagram 内容营销 SOP 见 [docs/CONTENT_BENCHMARK_SOP.md](docs/CONTENT_BENCHMARK_SOP.md)，创意生产层见 [docs/CREATIVE_PRODUCTION_PACK.md](docs/CREATIVE_PRODUCTION_PACK.md)。

## 架构

```
┌─── 子站公开层 ───────────────────────────┐
│ 首页 / 样例 / 接入方案 / 询盘 / 分享卡    │
└──────────────────────────────────────────┘
              ↓
┌─── SKU 上新工作流 ───────────────────────┐
│ 输入 SKU 列表 + 平台 + 品牌上下文          │
│ 输出 SOP / Prompt / 参数 / 验收标准        │
│ 附带合规提醒 / 客服话术 / 复评 checklist  │
└──────────────────────────────────────────┘
              ↓
┌─── 商业承接 ─────────────────────────────┐
│ 演示免费看形态 → 10 SKU POC → 主站支付/合同 │
└──────────────────────────────────────────┘
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

## 商业承接（2026-05）

| 档 | 收费位置 | 交付范围 | 特征 |
|---|---|---|---|---|
| 演示 | 子站免费 | 5 个样例 SKU | 看输出形态，不承诺真实业务效果 |
| 10 SKU POC | 主站支付/合同 | 真实 SKU 上新物料包 | 验证复改边界、验收标准、复评节奏 |
| Enterprise | 合同定价 | API / ERP / 独立站嵌入 | SLA、发票、数据边界按合同约定 |

见 `/pricing`

*当前代码作为主站子站使用，不在本仓库内完成扣款。*

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

访问 http://localhost:3000 → 打开 `/demo`，会自动进入 5 个演示 SKU 的批量上新流程。

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
