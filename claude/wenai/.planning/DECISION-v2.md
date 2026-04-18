# wenai 战略收敛 v2 · 从 3 旗舰 → 1 Pipeline

> v1 见 DECISION.md（3 旗舰分层）· 证据见 COMPETITIVE-HOTCLAW.md

## v1 → v2 的核心转向

| 维度 | v1（3 旗舰 + 分层） | v2（1 Pipeline + Toolbox） |
|---|---|---|
| 首页主视觉 | 3 张旗舰卡 | 1 张 Pipeline 大卡 + Phase2 占位 |
| 用户心智 | "选一个工具" | "跑一条流水线" |
| 差异化 | 单点能力深度 | 多步编排 + 品类定制 |
| 对标 | 翻译单点赢 Google/DeepL（赢不了） | 流水线赢店匠/HotClaw（工具堆叠死法） |
| MVP 规模 | 3 个模块各优化 | 3 个执行层模块拼接成 Pipeline |

## 促成转向的证据链

1. **用户直觉否决翻译做旗舰** — "不能把翻译作为主要的"
2. **HotClaw PDF 参考** — Pipeline / Workflow 编排模式比工具集更打动 B 端
3. **阿里 250 人教训**（reality_check.md）— 四大真刚需都是执行层，AI 编排这些才是机会
4. **锚点客户反馈**（anchor_feedback.md）— 缺"品类定制"，五大品类需专属 prompt
5. **竞品共性死法**（real_competitors.md）— 店匠 36 万客户仍小众，病因"用户不知从哪用起"
6. **first_principles 三层公式** — AI 只做执行层，Pipeline 每步都是执行
7. **HotClaw 真实战况** — 创始人自己说"1-2 客户，不 scale up"，战场未定

## v2 决策（阁主裁决）

### ✅ 确定做

1. **1 个 Pipeline 做到极致** ——《新品上新流水线》(/pipelines/new-listing)
2. **Pipeline 结构复刻 HotClaw 三段式** ——痛点/方案/工作流
3. **品类定制是差异化护城河** —— 五大类各注入专属 prompt 前缀
4. **Toolbox 19 模块全保留** —— 折叠在 Pipeline 下方
5. **Phase 2 留位** —— AI 电商主图生成（对标 HotClaw 核心战场），暂不实现

### ❌ 明确不做

1. ~~2 条 Pipeline 同时做~~ —— 资源分散，两个都半成品
2. ~~Excel 批量上传 / ZIP 打包 / 任务队列~~ —— serverless 不友好，内测场景不需要
3. ~~修改任何现有模块 prompt~~ —— 本轮只做结构重构，不碰内容
4. ~~虚拟模特人脸替换~~ —— HotClaw 领先+版权雷区，不追
5. ~~"AI 选品" 类能力~~ —— reality_check 明确证伪

### 🔀 条件触发

**Phase 2 启动条件**（任一成立）：
- Pipeline 上线后 2 周内 ≥ 5 个独立朋友用过
- "我想先用主图生成" 占位按钮点击 ≥ 10 次
- wzq 锚点客户明确提出生图需求

## 回退路径

v2 出问题要回到 v1 甚至 v0：
- 删 `src/app/pipelines/` 目录
- `page.tsx` 把 MODULE_TIERS 全部改回 `'flagship'`
- Vercel 一次 redeploy 即完成

---

## 提交物清单（本轮）

- [x] `.planning/DECISION-v2.md`（本文件）
- [x] `.planning/COMPETITIVE-HOTCLAW.md`
- [ ] `src/lib/category-prompts.ts`
- [ ] `src/app/api/ai/route.ts`（接收 category 参数）
- [ ] `src/app/pipelines/new-listing/page.tsx`
- [ ] `src/app/page.tsx`（Pipeline Hero 替代旧 Hero）
- [ ] `src/app/layout.tsx / invite/page.tsx / README.md`（文案全线换）

## 核心成功指标

朋友打开 `/invite?code=xxx` → 激活 → 看到 Pipeline 大卡 → 点进 → 选品类 → 贴 1 个 SKU → 30-45 秒内三栏流式出结果 → 一键下载 Markdown。**全程无需学习。**
