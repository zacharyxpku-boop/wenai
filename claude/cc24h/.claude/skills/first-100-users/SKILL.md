---
name: first-100-users
description: "Generate actionable user acquisition plan for the first 100 real users. MUST run before or immediately after deploying any product to production. Also triggers when: user says 'launch', 'go live', 'deploy', 'how do I get users', 'nobody is using this', 'no traffic', or any discussion about growth/marketing/distribution for a pre-traction product. Covers zero-budget channels: 小红书, 朋友圈, 微信群, 即刻, V2EX, 少数派. Outputs ready-to-post content templates, not vague advice."
---

# First 100 Users — 零成本获客手册

不花钱，不投广告。靠内容 + 产品自传播。

## Pre-Launch Checklist (all must be YES)

| Check | Status |
|-------|--------|
| 手机能正常使用？ | |
| 不注册就能用核心功能？ | |
| 结果页有显眼的分享按钮？ | |
| 分享链接有 UTM 追踪？ | |
| 首页加载 < 3秒？ | |
| 有至少 1 个双人/社交功能？ | |

Any NO → fix before launching. Launching without these is wasting your first impression.

## Phase 1: 种子 (Users 1-10)
Source: You + friends + family

```
Day 1: 自己走完全流程，截图最惊艳的结果
Day 2: 发朋友圈（好奇心钩子，不说"我做了个产品"）
  文案模板："[个人化结果] + 笑死/准到离谱 + 你也试试 → [链接]"
Day 3: 私聊 10 个朋友："帮我试试这个，给我真实反馈"
Day 4-7: 收集反馈，记录：哪里卡住？什么时候说"好准"？
```

## Phase 2: 内容 (Users 10-50)

### 小红书 (5 篇，每篇不同角度)

**笔记1 — 结果展示型**
```
标题：[你的个性化结果]，笑死准到离谱
配图：结果截图（重点高亮）
正文：个人感受 + "你们也去测测"
标签：#[产品相关标签] × 5
评论区：置顶链接
```

**笔记2 — 双人/关系型**
```
标题：和[对象/闺蜜]测了一下，结果...
配图：双人结果截图
正文：反应 + "必测！"
```

**笔记3 — 科普型**
```
标题：[领域知识点]，比你想的准 10 倍
正文：为什么准 + "免费的，链接在评论区"
```

**笔记4 — 每日型**（如有日常功能）
```
标题：今天的[签/诊断/结果]是...
正文：截图 + 解读
```

**笔记5 — 工具推荐型**
```
标题：找到一个免费的[产品类型]工具
正文：功能介绍 + 截图 + "不用注册直接用"
```

### 朋友圈 (3 条，间隔 2 天)
```
Day 1: 个人结果截图 + "这个[X]有点东西"
Day 3: 双人结果 + "和XX测了一下，出乎意料"
Day 7: 日常结果 + "今天的太准了"
```

### 微信群
```
话术："最近做了个[X]工具，免费的，你们试试看准不准 [链接]"
时机：群里有人聊相关话题时自然接入，不硬推
```

### 即刻/V2EX (独立开发者社区)
```
标题："独立开发者分享：我做了一个[产品描述]"
内容：开发故事 + 技术选型 + 产品思考 + "求反馈"
```

## Phase 3: 裂变 (Users 50-100)
1. 数据看板：哪个功能最受欢迎？哪个页面停留最久？
2. 加倍投入最受欢迎的功能/内容
3. 推双人功能："发给你的朋友/对象试试"
4. 有人主动分享 → 私聊感谢 + 问为什么分享

## UTM 追踪规范
```
小红书: ?utm_source=xhs&utm_medium=note&utm_campaign=launch
朋友圈: ?utm_source=wechat&utm_medium=moments&utm_campaign=launch
微信群: ?utm_source=wechat&utm_medium=group&utm_campaign=launch
即刻: ?utm_source=jike&utm_medium=post&utm_campaign=launch
V2EX: ?utm_source=v2ex&utm_medium=post&utm_campaign=launch
```

## Mandatory Output

```
ACQUISITION_PLAN:
  product: [name]
  pre_launch_check: PASS / FAIL ([which items failed])
  phase1_seed:
    channel: [朋友圈/私聊]
    target: 10 users by Day 7
    content: [ready-to-post text]
  phase2_content:
    primary_channel: [小红书/抖音/etc]
    posts_count: 5
    target: 50 users by Day 21
  phase3_viral:
    mechanic: [what drives sharing]
    target: 100 users by Day 30
  tracking: [UTM + funnel events list]
  VERDICT: READY_TO_LAUNCH / NOT_READY ([blockers])
```
