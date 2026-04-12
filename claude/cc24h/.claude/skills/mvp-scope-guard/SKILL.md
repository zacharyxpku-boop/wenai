---
name: mvp-scope-guard
description: "ALWAYS run before starting ANY new task, feature, or sprint item. This is a mandatory pre-flight gate — no task begins without passing this filter. Triggers on every task dispatch, every 'let's add X' suggestion, every feature request, every 'it would be nice if' idea. The purpose is brutal: if building this thing won't make users pay or share within 2 weeks, it doesn't get built. Most startups die from building too much, not too little."
---

# MVP Scope Guard — 范围守卫

Before writing a single line of code, this task must pass 3 gates in order.

## Gate 1: Revenue Impact
Does this directly make users more likely to PAY?
- **DIRECT** → P0 (build now, nothing else matters)
- **INDIRECT** → P1 (only after all P0 complete)
- **NONE** → proceed to Gate 2

Examples P0: payment integration, paywall design, pricing page, conversion flow
Examples NOT P0: refactoring, dark mode, i18n, extra settings

## Gate 2: Viral Impact
Does this make users more likely to SHARE?
- **DIRECT** → P1
- **INDIRECT** → P2
- **NONE** → proceed to Gate 3

Examples P1: share buttons, referral system, social cards, two-player features
Examples NOT P1: admin dashboard, profile editing, extra animations

## Gate 3: Retention Impact
Does this make users come BACK tomorrow?
- **DIRECT** → P2
- **NONE** → **KILL. Do not build.**

## Hard Rules
- P2 tasks BLOCKED while any P0 is incomplete
- More than 3 tasks in sprint → cut to 3
- Any task > 1 day → break it down
- "It would be nice if..." → KILL by default
- No real user feedback in 7 days → "你在闭门造车" warning

## The Builder's Trap Detector

| Question | YES | NO |
|----------|-----|-----|
| 过去7天有真实用户反馈？ | OK | ⚠️ 闭门造车 |
| 过去7天有人付过钱？ | OK | ⚠️ 付费流程存在吗？ |
| 过去7天有用户自发分享？ | OK | ⚠️ 裂变机制存在吗？ |

三个都是 NO → **STOP BUILDING. START SHIPPING.**

## Mandatory Output

```
SCOPE_GUARD:
  task: "[description]"
  gate1_revenue: DIRECT / INDIRECT / NONE
  gate2_viral: DIRECT / INDIRECT / NONE
  gate3_retention: DIRECT / NONE
  priority: P0 / P1 / P2 / KILL
  VERDICT: BUILD / DEFER / KILL
  reason: [one line]
  blocked_by: [P0 tasks that must finish first]
  builder_trap: [OK / WARNING:闭门造车]
```
