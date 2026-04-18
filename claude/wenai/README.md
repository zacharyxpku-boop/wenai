# wenai · 跨境代运营 AI 三件套

**Slogan**：让跨境代运营的重复劳动变成 3 个按钮：**批量翻译 · 评论结构化 · 达人冷邮**。

阿里国际 250 人团队 8 个月验证过的真刚需。不做"大平台"，只把这 3 件事做到极致。

其他 16 个模块（文案 / 竞品 / 投流 / 私域 / 直播 ...）保留代码入口，展开可用，但首屏只聚焦旗舰三件。详见 `.planning/DECISION.md`。

**Live Beta**: https://wenai-one.vercel.app  
**Invite-only**: `/invite?code=xxx`（邀请码在 `src/app/api/auth/invite/route.ts`）

---

## 旗舰三件套

| 模块 | 一句话价值 | 典型场景 |
|---|---|---|
| 🏆 批量翻译 | 10 条 listing 一次出 5 语言 | 日均节省 45 分钟 |
| 🏆 评论结构化 | 20 条评论 → 4 维度报告 | 选品 / 优化 / 差评挽回 |
| 🏆 达人冷邮 | 3 版本冷启邮件 A/B | 回复率 ×10 |

## 配套工具

侵权防控 · 商品文案 · OCR翻译

## 其他观察模块（默认折叠）

文案 / 种草 / 主图 / 直播全案 / 直播定位 / 竞品 / 选品 / 运营 / 销售转化 / 获客 / 视频 / 私域 / 数据 / 投流

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
