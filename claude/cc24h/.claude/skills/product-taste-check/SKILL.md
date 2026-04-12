---
name: product-taste-check
description: "ALWAYS run after completing ANY user-facing page, component, or feature. This includes landing pages, result pages, dashboards, onboarding, modals, forms, settings, error pages — anything a user will SEE. Even a single CSS change on a visible page triggers this. If you wrote or modified ANY .tsx/.html/.css that renders in a browser, run this check before marking done. Skip ONLY for pure backend/config/test changes with zero visual output."
---

# Product Taste Check — 产品品味审计

A developer thinks "it works." A user thinks "do I care?" This skill forces the USER perspective.

## Score Card (0-10)

### 1. 三秒抓力 (0-3)
Imaginary stranger sees this page for 3 seconds:
- 3: Instantly knows what this is AND why they should care
- 2: Gets what it is but not why it matters to them
- 1: Vaguely understands the category
- 0: No clue what this is

### 2. 截图传播力 (0-2)
Screenshot posted to 朋友圈:
- 2: People ask "what is this?" or click through
- 1: People glance but don't act
- 0: Scrolled past, or looks cheap/generic

### 3. 不可删性 (0-2)
If this feature disappeared tomorrow:
- 2: Users complain or leave
- 1: Some users notice
- 0: Nobody cares → **should you even build this?**

### 4. 欲罢不能 (0-2)
After using this feature:
- 2: User actively wants more ("what else can I see?")
- 1: Fine but won't explore further
- 0: Done, closes tab

### 5. 付费冲动 (0-1)
- 1: Creates natural "I wish I could see more" feeling
- 0: No purchase intent generated

## Verdict

| Score | Verdict | Action |
|-------|---------|--------|
| 8-10 | **PASS: SHIP** | Deliver immediately |
| 5-7 | **FAIL: REWORK** | List fixes, do them, re-check |
| 0-4 | **FAIL: KILL** | Stop. Reconsider if this should exist |

## Mandatory Output

```
TASTE_CHECK:
  page: [name]
  三秒抓力: [0-3] — [why]
  截图传播力: [0-2] — [why]
  不可删性: [0-2] — [why]
  欲罢不能: [0-2] — [why]
  付费冲动: [0-1] — [why]
  TOTAL: [0-10]
  VERDICT: PASS:SHIP / FAIL:REWORK / FAIL:KILL
  FIXES: [if REWORK, list exact changes needed]
```
