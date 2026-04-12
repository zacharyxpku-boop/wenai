---
name: monetization-gate
description: "MUST run before implementing ANY pricing page, payment flow, paywall, subscription logic, or feature gating. Also triggers when any task mentions: pricing, payment, paywall, subscription, freemium, premium, upgrade, unlock, buy, purchase, ¥, dollar, stripe, wechat pay, alipay. Enforces the principle that free must be genuinely amazing (users think 'this is too good to be free') and paid must be a natural extension (not a roadblock). Running this prevents the two most common monetization failures: free tier too stingy (kills growth) and paid tier not compelling enough (kills revenue)."
---

# Monetization Gate — 付费架构设计

## Core Principle
利他优先：不买也能收获真正的价值，用户才愿意买更多。如果免费版让人觉得是阉割版，付费转化率会接近零。

## 3-Layer Value Map

### Layer 1: FREE — 必须让用户 wow
Score each (0-3):
- 免费体验是否完整？(不是阉割版) [0-3]
- 用户免费用完是否觉得"这也太良心了"？ [0-3]
- 免费层是否足够好到用户愿意分享？ [0-3]

FREE_SCORE < 6 → **FAIL: 免费层不够好，付费转化不会发生**

### Layer 2: TEASE — 看得到够不着
- 在用户最兴奋的时刻展示（不是最困惑的时刻）
- 用渐变淡出，不用弹窗遮罩
- 标题可见，内容自然截断
- 付费入口比分享按钮小（先传播再变现）

### Layer 3: PAID — 不可抗拒
- 是免费内容的 10x 深度（不是 2x）
- 价格锚定：冲动层 ¥1-9.9 / 习惯层 ¥19.9-49 / 承诺层 ¥99-299
- 首次付费必须在冲动层（一杯奶茶钱）

## Trigger Moment Rules

付费入口 MUST 出现在：
- 用户刚看完一个让他兴奋的结果之后 ✅
- 用户想深入某个维度发现"更多解读"时 ✅

付费入口 MUST NOT 出现在：
- 一进来就弹窗 ❌
- 用户困惑/迷路时 ❌
- 核心功能使用前 ❌

## Friction Test
从"想付钱"到"付完钱"需要几步？
- 2步 → PASS
- 3步 → ACCEPTABLE
- 4+步 → FAIL（每多一步流失 20%）

## Mandatory Output

```
MONETIZATION_GATE:
  free_score: [0-9] (3 items × 0-3)
  free_verdict: PASS(≥6) / FAIL(<6)
  tease_style: GRADIENT_FADE / BLUR / MODAL / NONE
  tease_verdict: PASS(gradient/natural) / FAIL(aggressive/blocking)
  price_entry: ¥[X] — [what they get]
  trigger_moment: [page + user emotion at that moment]
  friction_steps: [number]
  VERDICT: PASS:READY / FAIL:FREE_TOO_WEAK / FAIL:TOO_AGGRESSIVE / FAIL:TOO_MUCH_FRICTION
```
