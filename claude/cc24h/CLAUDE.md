# cc24h — Commander Org System

## 执行 session：先读这里

本项目有 **Commander 中枢**。不要自己规划全局方向。

默认执行节奏：
- 若无明确阻塞、风险升级或用户显式暂停，持续推进，不在每轮结束后反问“是否继续”
- 只有遇到 auth/payment/migration/secrets、外部环境阻塞、或不可逆方向分叉时，才停下确认

```bash
CC=node C:/Users/86136/Desktop/cc24h/bin/cc24h.mjs
$CC status -p .
$CC register -p . -s worker-1 -r builder
$CC claim -p . -s worker-1
$CC submit -p . -s worker-1 -t <task-id> --summary "done" --files "a.ts" --tests pass
```

## 角色

| 角色 | 职责 |
|------|------|
| 破局官 | 产品定义、需求、MVP边界 |
| 增长官 | 文案/CTA/转化 |
| 铁律官 | 架构、风险 |
| 快刀官 | 写代码 |
| 尺子官 | review |
| 用户战场官 | 真实用户视角测试 |
| AI应用工程官 | LLM/Chatbot工程化 |

## 营销团队（10 角色，服从 Council 战略，自动执行营销流水线）

| 角色 | 职责 |
|------|------|
| 营销总指挥 | 接 Council 结论，出 campaign brief，调度营销角色 |
| 用户心智官 | 用户心理判断：什么让人点/转/买 |
| 渠道冷启动官 | 渠道选择、冷启动节奏 |
| 内容策划官 | 内容支柱、选题树、角度矩阵 |
| 文案转化官 | 标题/正文/CTA/评论/私聊话术 |
| 视觉素材官 | 截图/封面/配图 asset brief |
| 活动裂变官 | 分享机制、裂变路径 |
| 自动化运营官 | 流水线、发布包、模板化 |
| 数据复盘官 | 表现分析、CONTINUE/STOP/AMPLIFY/TEST |
| 营销风控官 | 拆穿"看起来不错"的错误 |

## 工作流（说人话触发）

`/repo-onboarding` 读懂项目 · `/idea-to-plan` 做个XX · `/build-feature` 开始干活 · `/bug-triage-hotfix` 有bug · `/refactor-safely` 重构 · `/launch-and-growth` 准备上线 · `/night-run` 今晚自动跑 · `/review-and-recover` 收口 · `/user-reality-test` 用户视角 · `/chatbot-hardening` AI上线 · `/design-system-bootstrap` 定视觉 · `/screenshot-loop` 看效果 · `/reference-driven-design` 参考网站 · `/production-readiness-audit` 能上线吗 · `/deploy` 部署 · `/cross-session-learning` 记住经验

## 营销流水线（一条命令搞定）

### 🚀 主命令：给任意产品生成完整营销系统

```bash
# 给 URL
node scripts/market.mjs --url https://your-product.com

# 给简介
node scripts/market.mjs --brief "产品名: X，目标用户: Y，核心价值: Z"

# 给文件
node scripts/market.mjs --brief-file brief.md
```

**输出**：`state/marketing/[slug]/` → 7 个文件 + START-HERE.md，约 2 分钟完成

**自然语言触发**：说 "帮我做 [产品] 的营销" 或 "给这个 URL 做营销方案" → 自动调用 auto-market skill

### 单项工作流（按需调用）
`/campaign-brief` 营销方案 · `/content-angles` 内容角度 · `/content-pack` 发布包 · `/asset-brief` 素材brief · `/private-launch` 私域启动 · `/referral-pack` 裂变包 · `/seo-matrix` SEO矩阵 · `/qa-reply-pack` 问答弹药 · `/marketing-retro` 营销复盘

## Enforcement Gates（claim 时自动执行）

- UI task + 无 design-system.md → 阻断
- Launch task + 无近24h审计 → 阻断
- AI task + 无 hardening → 警告

## Hooks（硬约束）

- `risk-check.mjs` — 阻止改 auth/payment/secrets
- `ui-quality-check.mjs` — Anti-AI 字体/渐变/布局违规阻止
- `auto-screenshot-trigger.mjs` — 每5次UI编辑提醒截图
- `pre-push-check.mjs` — 无审计不许push

## Anti-AI 禁令

字体：Inter/Roboto/Arial/Poppins · 配色：purple-to-blue gradient · 布局：rounded-3xl+shadow-2xl · 文案："AI驱动"/"智能洞察"

## 质量流水线（UI 任务自动注入）

design-system → Anti-AI check → 编码(mobile-first) → motion-design → baseline-ui → fixing-accessibility → screenshot-loop → mobile-qa

## CLI

规划: `commander/plan/go/enqueue` · 执行: `register/claim/submit/next` · 运维: `status/review/tui/daemon/doctor/sync`

## 技术栈

Node.js (ES modules) · blessed (TUI) · sql.js (SQLite) · commander (CLI) · js-yaml
