# OPC 零成本冷启动技术栈 SOP

> 除了域名(¥12/年) + Claude($20/月)，其余全免费。别再说没资金，直接 Build。

---

## 一、完整技术栈清单

| 工具 | 用途 | 费用 | 内阁对应角色 |
|------|------|------|------------|
| **Claude Code** | 写代码主力 + 内阁全系统运行 | $20/月 | CTO核心工具 |
| **Supabase** | 后端数据库 + Auth + Storage + Realtime | 免费（500MB/50K MAU） | CTO |
| **Vercel** | 一键部署托管（Next.js最佳搭档） | 免费（100GB带宽/月） | CTO |
| **Namecheap** | 域名注册 | ~¥12/年（.com） | COO |
| **Stripe** | 支付接口 | 免费接入，单笔2.9%手续费 | CFO |
| **GitHub** | 代码版本控制 + CI/CD | 免费 | CTO |
| **Resend** | 邮件分发（事务邮件/营销邮件） | 免费（100封/天） | CMO |
| **Clerk** | 用户登录授权（OAuth/邮箱/手机号） | 免费（10K MAU） | CTO |
| **Cloudflare** | DNS解析 + CDN加速 + DDoS防护 | 免费 | CTO |
| **PostHog** | 用户数据分析（事件追踪/漏斗/留存） | 免费（100万事件/月） | CMO/CFO |
| **Sentry** | 线上错误追踪 + 性能监控 | 免费（5K错误/月） | CTO |
| **Upstash** | Redis缓存 + 消息队列 | 免费（10K命令/天） | CTO |
| **Pinecone** | 向量数据库（AI语义搜索/RAG） | 免费（100K向量） | CTO |

### 月度固定成本

| 项目 | 金额 |
|------|------|
| Claude Code | $20/月（~¥145） |
| 域名 | ~¥1/月 |
| **总计** | **~¥146/月** |

收入产生后才出现的变动成本：Stripe 2.9%/笔。其余全部在免费额度内覆盖早期用户量。

---

## 二、技术栈选型决策树

```
你要做什么？
│
├─ 网站/Web App
│  ├─ 需要SEO？→ Next.js + Vercel（SSR/SSG）
│  └─ 不需要SEO？→ Next.js 或 Vite + React + Vercel
│
├─ 需要用户系统？
│  ├─ 简单（邮箱/Google登录）→ Clerk
│  └─ 复杂（角色权限/团队）→ Clerk + Supabase RLS
│
├─ 需要数据库？
│  ├─ 关系型数据 → Supabase（PostgreSQL）
│  ├─ 实时数据 → Supabase Realtime
│  └─ AI向量搜索 → Pinecone
│
├─ 需要收钱？
│  ├─ 国际用户 → Stripe
│  └─ 国内用户 → 微信支付/支付宝（需企业资质）
│
├─ 需要发邮件？
│  ├─ 事务邮件（验证码/收据）→ Resend
│  └─ 营销邮件（Newsletter）→ Resend + 自建模板
│
├─ 需要AI功能？
│  ├─ 对话/生成 → Claude API（Anthropic）
│  ├─ 语义搜索 → Pinecone + Embedding
│  └─ 国内用户 → DeepSeek API（备选）
│
└─ 需要监控？
   ├─ 错误追踪 → Sentry
   ├─ 用户行为 → PostHog
   └─ 性能/缓存 → Upstash Redis
```

---

## 三、从零到上线 SOP（7步）

### Step 1：项目初始化（Day 1，30分钟）

```bash
# 创建项目
npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir
cd my-app

# 初始化Git
git init && git add -A && git commit -m "init: next.js project scaffold"

# 推送到GitHub
gh repo create my-app --public --push --source=.
```

**内阁校验**：CTO确认技术栈选型合理，CPO确认产品方向已定（不要没想好就建项目）。

### Step 2：基础设施配置（Day 1，1小时）

| 服务 | 操作 | 拿到什么 |
|------|------|---------|
| Vercel | `vercel link` 关联项目 | 自动部署URL |
| Namecheap | 购买域名 | domain.com |
| Cloudflare | 添加域名，改NS记录 | CDN + SSL + DNS |
| Vercel | 绑定自定义域名 | domain.com → Vercel |

```bash
# Vercel CLI
npm i -g vercel
vercel link
vercel --prod
```

### Step 3：数据库 + 认证（Day 2，2小时）

```bash
# Supabase
npm install @supabase/supabase-js

# Clerk（用户认证）
npm install @clerk/nextjs
```

**Supabase配置**：
1. 去 supabase.com 创建项目
2. 拿到 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
3. 写入 `.env.local`

**Clerk配置**：
1. 去 clerk.com 创建应用
2. 拿到 `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 和 `CLERK_SECRET_KEY`
3. 写入 `.env.local`
4. 在 `middleware.ts` 中配置路由保护

```typescript
// .env.local 模板
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_key
STRIPE_SECRET_KEY=your_key
STRIPE_WEBHOOK_SECRET=your_secret
RESEND_API_KEY=your_key
NEXT_PUBLIC_POSTHOG_KEY=your_key
SENTRY_DSN=your_dsn
```

**内阁校验**：CLO确认用户数据处理合规（个保法/GDPR），CTO确认不暴露敏感key。

### Step 4：支付集成（Day 3，2小时）

```bash
npm install stripe @stripe/stripe-js
```

核心文件：
- `/api/stripe/checkout/route.ts` — 创建支付会话
- `/api/stripe/webhook/route.ts` — 接收支付回调
- 前端按钮调用 checkout

**内阁校验**：CFO审核定价策略（调用 `pricing-strategy` skill），CLO确认支付合规。

### Step 5：监控三件套（Day 3，30分钟）

```bash
# PostHog（用户行为）
npm install posthog-js

# Sentry（错误追踪）
npx @sentry/wizard@latest -i nextjs

# Upstash（缓存，按需）
npm install @upstash/redis
```

**内阁校验**：CMO确认关键事件已埋点（注册/付费/留存），CTO确认Sentry告警配置。

### Step 6：邮件系统（Day 4，1小时）

```bash
npm install resend
```

核心场景：
- 注册欢迎邮件
- 付费确认邮件
- 密码重置
- 营销Newsletter（后期）

### Step 7：部署上线（Day 4，15分钟）

```bash
git add -A
git commit -m "feat: MVP ready for launch"
git push origin main
# Vercel自动部署
```

验证清单：
- [ ] 域名可访问
- [ ] HTTPS正常（Cloudflare）
- [ ] 注册流程通（Clerk）
- [ ] 数据库读写正常（Supabase）
- [ ] 支付流程通（Stripe测试模式）
- [ ] 错误追踪正常（Sentry）
- [ ] 埋点正常（PostHog）

**内阁校验**：CTO跑完验证清单，COO写SOP记录部署流程，CPO确认MVP功能完整。

---

## 四、免费额度天花板（什么时候该花钱）

| 服务 | 免费上限 | 触发付费的信号 | 预估月费 |
|------|---------|-------------|---------|
| Supabase | 500MB数据/50K MAU | 数据>400MB或MAU>40K | $25/月 |
| Vercel | 100GB带宽 | 带宽>80GB | $20/月 |
| Clerk | 10K MAU | MAU>8K | $25/月 |
| PostHog | 100万事件/月 | 事件>80万 | $0（自托管）或$40 |
| Sentry | 5K错误/月 | 错误>4K（说明有大bug） | $26/月 |
| Resend | 100封/天 | 日均>80封 | $20/月 |
| Pinecone | 100K向量 | 向量>80K | $70/月 |
| Upstash | 10K命令/天 | 日均>8K | $10/月 |

**CFO铁律**：在月活<5000、月收入<¥5000之前，所有工具必须保持在免费额度内。超了先优化，不是先升级。

---

## 五、内阁调用协议（技术栈相关）

当你在内阁会议中讨论技术决策时，CTO自动参考本文档：

| 你问 | 内阁怎么响应 |
|------|------------|
| 「该用什么技术栈」 | CTO按决策树推荐，CFO确认在免费额度内 |
| 「要不要上XX付费服务」 | CFO先查免费替代，CTO评估迁移成本 |
| 「数据库怎么设计」 | CTO基于Supabase PostgreSQL设计schema |
| 「支付怎么接」 | CTO推Stripe，CFO算手续费对利润的影响 |
| 「要不要自建XX」 | CTO评估Build vs Buy，COO算维护成本 |
| 「性能有问题」 | CTO先查Sentry/PostHog，再决定是优化还是升级 |

---

## 六、与 gstack 的配合

本SOP管**选什么工具**，gstack管**怎么写代码**。

```
内阁决定做什么产品 → 本SOP确定技术栈 → gstack开始写代码
       ↑                                      ↓
       └──── PostHog数据反馈 ←── Vercel部署上线
```

**推荐工作流**：
1. 内阁·CPO 定义需求
2. 内阁·CTO 按本SOP选型
3. gstack `/plan` 规划实现
4. gstack `/code` + `/review` + `/test` 开发
5. gstack `/ship` 部署到 Vercel
6. 内阁·CMO 看 PostHog 数据决定下一步

---

*版本：v1.0 | 2026-04-10 | 基于 @noexcuse555 技术栈 + 内阁体系整合*
*适用于：任何OPC创始人的第一个产品冷启动*
