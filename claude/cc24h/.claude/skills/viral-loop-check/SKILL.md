---
name: viral-loop-check
description: "ALWAYS run on ANY page that shows user results, profiles, scores, reports, diagnoses, charts, or any personalized output. Also run on any share/invite flow. If a page displays something personal to the user, this skill MUST check the viral loop. A result page without a working viral loop is a wasted acquisition — every user who sees results and can't easily share is a lost multiplier."
---

# Viral Loop Check

A product without viral loops grows linearly. With viral loops, exponentially. Every result page is an acquisition channel.

## 4-Point Loop Audit

### 1. Share Trigger (0-3)
- 3: Visible share button at peak emotion moment (right after "wow" result), bigger than any other CTA
- 2: Share button exists but not prominent or poorly timed
- 1: Share buried in menu or requires extra clicks
- 0: No share mechanism at all

### 2. Shared Content (0-3)
The receiver must feel CURIOSITY, not information.

BAD: "我用了MiraLife"
GOOD: "我的八字说我是'自由烈火型'，难怪总待不住😂 你是什么型？"

- 3: Personalized result + curiosity hook + visual card + direct link
- 2: Has personalization but weak hook or no visual
- 1: Generic share text, no personalization
- 0: No share content defined

### 3. Receiver Activation (0-3)
When receiver clicks the shared link:
- 3: Starts own experience in <30s, no registration, sees sender's result for comparison
- 2: Can start but needs registration or can't see sender's result
- 1: Lands on homepage instead of relevant experience
- 0: Link broken or leads nowhere useful

### 4. Loop Closure (0-3)
After receiver completes their own experience:
- 3: Has own share button + tracking shows A→B→C chain
- 2: Has share button but no chain tracking
- 1: No share prompt after completion
- 0: Dead end — receiver has no reason to share

## Bonus: 双人机制 (+2)
If product has pair/match/compatibility features:
- +2: A invites B with personalized message → B sees "A想看你俩的缘分" → both get results → both can share
- +1: Invite exists but not personalized or one-sided
- 0: No pair mechanic

## Verdict

| Score | Verdict |
|-------|---------|
| 10-14 | **PASS: VIRAL_MACHINE** |
| 7-9 | **PASS: VIRAL_READY** |
| 4-6 | **FAIL: LEAKING** — users want to share but can't easily |
| 0-3 | **FAIL: ISLAND** — product is invisible to potential users |

## Mandatory Output

```
VIRAL_LOOP:
  page: [name]
  share_trigger: [0-3] — [why]
  shared_content: [0-3] — [why]
  receiver_activation: [0-3] — [why]
  loop_closure: [0-3] — [why]
  pair_bonus: [0-2] — [why]
  TOTAL: [0-14]
  VERDICT: PASS:VIRAL_MACHINE / PASS:VIRAL_READY / FAIL:LEAKING / FAIL:ISLAND
  FIXES: [specific actions to close the loop]
```
