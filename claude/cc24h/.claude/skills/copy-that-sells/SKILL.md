---
name: copy-that-sells
description: "ALWAYS apply when writing ANY user-facing text in ANY file — headlines, button labels, descriptions, onboarding steps, error messages, loading states, empty states, tooltips, notifications, page titles, meta descriptions. If the text will appear on screen and a human will read it, this skill governs it. Triggers on ALL tasks involving .tsx/.html/.vue files that contain string literals, landing pages, marketing pages, onboarding flows, result pages, or any UI text changes. A product with great code but generic copy is a product nobody remembers."
---

# Copy That Sells — 卖货文案引擎

## Banned List (auto-reject, zero tolerance)

Grep for these in any changed file. Every match = FAIL:

| Banned | Why it's bad |
|--------|-------------|
| AI驱动 / AI-powered | Nobody cares how it works |
| 智能洞察 / Smart insights | Meaningless buzzword |
| 一站式 / 全方位 / 赋能 | Corporate emptiness |
| 高效 / 便捷 / 智慧 | Says nothing specific |
| 为您提供 / 帮助您实现 | Formal, cold, distant |
| Powered by AI / Leveraging | Tech ego, user doesn't care |
| Save time and boost productivity | Every product says this |
| 精准分析 / 深度解读 | Overused, triggers skepticism |

## Copy Formula

### Headlines (≤15 chars)
Pattern: **[痛点/好奇] + [你能给的]**
- "你的人生图谱，藏在生辰里"
- "性格矛盾？因为你不只一面"
- "你的工作还能撑几年？"

### Subtitles (≤30 chars)
Pattern: **[具体做什么] + [多简单] + [结果]**
- "输入生辰，3 分钟看懂底层性格密码"
- "输入职业，3 秒看 AI 替代风险"

### CTA Buttons (≤8 chars)
Pattern: **[动作] + [好奇心]** — never describe the feature, describe the desire
- "看看我的图谱" not "开始测试"
- "翻开我的八字" not "八字分析"
- "测我俩的缘分" not "开始合盘"

### Pay CTA
Pattern: **[获得什么] + [多便宜]**
- "解锁完整解读 · ¥9.9" not "升级VIP"
- "一杯奶茶的价格" not "购买高级版"

## Emotion Curve (every page follows this)

```
Landing → 好奇: "这是什么？有点意思"
Onboarding → 期待: "快让我看看结果"
Loading → 紧张: "你的图谱正在生成..." not "Loading..."
Result → 惊喜: "好准！" / "原来如此！"
Share → 炫耀: "我要发给朋友看"
Paywall → 渴望: "我想看更多"
Error → 温暖: "信号断了，重新连接中..." not "Error 500"
Empty → 引导: "你还没照过这面镜子" not "暂无数据"
```

## Mandatory Output

For every piece of copy written or modified:

```
COPY_CHECK:
  text: "[the copy]"
  banned_words_found: [list or NONE]
  emotion_target: [what feeling this should trigger]
  verdict: PASS / FAIL
  rewrite: "[improved version, if FAIL]"
```
