# State of wenai · 2026-04-28

阁主战略快照 · 本轮 loop 收尾时刻 · 一份让团队/投资人/未来自己快速读懂的产品现状

## 一句话定位

**wenai 不是 AI 工具集, 是一个会主动盯着你 SKU 的远程同事。**
- 工具 = 给你输入框, 等你想起来用
- wenai = 知道你卖什么, 看着你 portfolio, 上架超 30 天没动会戳你, 命中率掉到 10% 以下会 push 邮件

## 11 道护城河 (MOAT)

| ID | 名字 | 形式 | 复制难度 |
|---|---|---|---|
| 01 | 视频拆解 | Gemini Vision storyboard 出 prompt | 中 (技术可抄) |
| 02 | 反向意图 | LMA3 同款方法论 + AI 客群挖掘 | 中 |
| 03 | 全链路工厂 | 10 pipeline 串成 SOP, 不是单点工具 | 高 (需要全系统投入) |
| 04 | ToB 询盘漏斗 | /inquire + /admin 主源/子源二级转化 | 中 |
| 05 | SKU 闭环 retention | 写 → 读双向 (ab-test 写 perf, /me/skus 读, data-insights 用) | 高 |
| 06 | 决策/执行二元 | 决策模块 (selection/insights) + 执行模块 (photoshoot/video) 分类 | 中 |
| 07 | 工厂入口 | /pipelines 一键串联, /me dashboard 总入口 | 中 |
| 08 | 预留 | (待规划) | - |
| 09 | SKU 复评主动提醒 | 上架超 30 天 → 顶部 banner + alerts inbox + 邮件 push | 中高 (需要长期数据) |
| 10 | 双源拉新通道 | /benchmark SEO + /share/[id] PLG 病毒 | 高 (需要存量数据) |
| 11 | **跨 org 匿名 benchmark** | 全平台 CTR/CPC 分位 → 越多商家越准 | **极高 (网络效应)** |

MOAT-11 是真正的网络效应壁垒, 与 cache/savings 这种"个人飞轮"不同, 它是"集体红利"

## 商家旅程 (新进 → 重度用户)

```
T+0  访客 → /benchmark 看行业 CTR 中位 → /inquire 或注册
T+1  /me 总览 dashboard 看到大数字 (省钱/信号/SKU 数)
     ↓
T+1  /me/settings 填行业 + 开邮件 digest
     ↓
T+2  跑 ab-test 投放 → 回填 perf → SKU.performance 落 Redis
     ↓
T+3  data-insights 看到分位数 (你在 47 个同类 SKU 中排前 28%)
     ↓
T+7  /me dashboard 看累计 ¥XK 省钱 (心理锚定)
T+7  邮件收到 daily digest "🚨 3 个 SKU 该复评" → 回站点
     ↓
T+30 SKU 库满 50+ → ⌘K 跨跳 + / 搜索 + j/k 翻 SKU 频次↑
     ↓
T+60 数据足够厚 → AI 推荐越来越贴 → 切走成本越来越高 (lock-in)
T+60 可分享 /share/[id] 给朋友 (品牌曝光) + /benchmark 自动加进池子
```

## 数据飞轮三层

1. **个人飞轮 (cache)**: 你跑过的 prompt + ref 14 天内 ¥0 复用
2. **集体飞轮 (benchmark)**: 你的 perf 数据匿名加进 wenai 池子, 让你 + 别人都受益
3. **PLG 飞轮 (share)**: 商家分享带 wenai 品牌的产出页, 0 成本拉新

每一层都让 wenai 比对手更难复制

## 三视图设计

- **公开层** (访客): 首页累计省钱大数字 / /benchmark 行业基线 SEO 页 / /share 品牌引流  
- **商家层** (登录): /me 总览 dashboard / /me/skus 库 / /me/alerts 信号 / /me/savings 战利品 / /me/settings  
- **运营层** (admin): admin/cost 趋势 / admin/cache 命中率 / admin/inquiries 来源转化漏斗 / admin/alerts 跨 org 信号

## 键盘流哲学

- ⌘K 全局命令面板 (Linear / Raycast / VS Code 同款)
- ? 全局快捷键帮助
- j/k SKU 详情页翻
- / SKU 库聚焦搜索
- Esc 关任何弹层

不做 onboarding tour 强制流程, 让老手键盘流主导, 新手按 ? 自学

## 关键 lib 索引

- `src/lib/cost-cap.ts` 日成本闸 + detail 明细
- `src/lib/cache-stats.ts` 缓存命中率统计
- `src/lib/cross-org-benchmark.ts` 跨 org CTR/CPC 分位
- `src/lib/image-cache.ts` 内容哈希缓存
- `src/lib/teardown-cache.ts` 视频拆解缓存
- `src/lib/user-settings.ts` 商家偏好 (邮件/行业)
- `src/lib/mailer.ts` Resend/SendGrid/log 三档适配
- `src/lib/sku-history.ts` SKU 全周期 + statusHistory
- `src/lib/use-my-skus.ts` 客户端 SKU 库 hook
- `src/lib/use-share.ts` 共享分享 hook

## 关键 cron

- `vercel.json` cron `0 1 * * *` (UTC 01 = 北京 09) → `/api/cron/daily-digest`
  - 扫所有 org 跑 5 类信号检测
  - 写 `wenai:digest:<orgId>:<date>` 30 天 TTL
  - 配 settings 时按阈值发 Resend/SendGrid 邮件

## 仍开放的工作

短期:
- Stripe webhook 接付费 → 账户升级解锁配额
- /me/alerts 加 j/k vim 流 (与 SKU 详情页一致)
- /me/skus 列表 j/k 选中 + Enter 进详情
- 邮件 unsubscribe link

中期:
- ICP 商城接入 (抖店/Shopee/Amazon)
- 多人协作 (一个 org 多 user)
- API 公开 (商家自动化)
- Stripe Checkout + 计量计费

长期 (MOAT-08 候选):
- 私有部署 (大 ToB)
- AI agent 全自动跑全链路 (商家只设目标)
- Vector search SKU 名 + 描述

## 建模决策记录

- 用 Redis 不用 Postgres: 决策类数据 TTL 友好, 不需要事务, 成本低
- Next.js App Router 全栈一体: 单代码库不分前后端, 部署 vercel 一键
- 不锁定模型: ai/route.ts 抽 endpoint + key, 切 Qwen / DeepSeek / OpenAI 改 env
- 不接队列 (BullMQ): vercel serverless 不适合长 worker, 改前端分片调 chunk
- 不绑库 cookie/Auth: x-tenant-id + JWT 二层兼容, demo 也能跑

# Marketing rewrite shipped at 18b5562
