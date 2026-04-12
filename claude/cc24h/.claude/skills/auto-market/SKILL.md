---
name: auto-market
description: Universal one-command marketing pipeline. Give any product URL or brief → get complete, ready-to-execute marketing system in ~2 minutes. Calls DeepSeek API to generate all 7 content packs automatically. Trigger on ANY marketing request with a product input.
trigger: auto — whenever user provides a product URL or brief and asks for marketing
---

# Auto-Market Pipeline

## What It Does
Takes a product (URL or brief text) and generates a complete marketing system:
- Campaign strategy brief
- 5 × 小红书 complete posts
- Private launch pack (朋友圈 + 群 + 私聊)
- Referral/viral campaign pack
- 知乎 Q&A + SEO article matrix
- QA reply ammunition library
- 30-day execution calendar

## Trigger Phrases
- "帮我做 [产品] 的营销"
- "给这个产品做个营销方案：[URL or brief]"
- "我有个新产品，URL 是 xxx"
- "做营销" + 任何产品信息
- "/market"

## Execution

### If user provides URL:
```bash
node C:/Users/86136/Desktop/cc24h/scripts/market.mjs --url [URL]
```

### If user provides brief text:
```bash
node C:/Users/86136/Desktop/cc24h/scripts/market.mjs --brief "[brief]"
```

### If user has a brief file:
```bash
node C:/Users/86136/Desktop/cc24h/scripts/market.mjs --brief-file [path]
```

## Output Location
```
cc24h/state/marketing/[product-slug]-[date]/
├── 00-product-profile.json     ← 产品分析
├── 01-campaign-brief.md        ← 营销策略
├── 02-xhs-pack.md             ← 5条小红书
├── 03-private-launch-pack.md  ← 私域启动
├── 04-referral-pack.md        ← 裂变素材
├── 05-zhihu-seo-pack.md       ← 知乎+SEO
├── 06-qa-reply-pack.md        ← 评论弹药
├── 07-30day-calendar.md       ← 执行日历
└── START-HERE.md              ← 从这里开始
```

## Time to Complete
~2 minutes (8 parallel DeepSeek API calls)

## Human Touchpoints
1. Review START-HERE.md once (~5 minutes)
2. Replace [PRODUCT_URL] with actual URL
3. Execute daily per calendar (~20 min/day)

## After Running
Tell user:
"✅ 完成。打开 START-HERE.md 开始。以后每天 20 分钟，按日历走。"

## Minimum Brief Format
If user only has partial info, extract what you can and fill the rest:
- 产品名 + 一句话介绍 → 足够运行
- 加上目标用户 → 更精准
- 加上定价信息 → 更完整
