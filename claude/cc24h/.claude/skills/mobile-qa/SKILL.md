---
name: mobile-qa
description: "ALWAYS run on ANY page or component before submit. 60%+ users are on mobile. Check: touch targets >=44px, body font >=16px, no horizontal overflow, single-hand operation. Uses preview_resize mobile preset. Skipping mobile QA is a launch blocker."
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
argument-hint: "<URL to test on mobile viewports>"
---

# Mobile QA

Systematic mobile experience verification.

## Trigger Phrases
- "手机上能用吗"
- "移动端测试"
- "触控区域"
- "mobile test"
- "手机体验"
- "响应式检查"

## Default Participants
- 用户战场官 (lead): user perspective testing
- 快刀官: fixes

## Execution

### Step 1: Mobile Viewport Testing

```bash
B=".claude/skills/gstack/browse/dist/browse.exe"

# iPhone SE (smallest common)
$B viewport 375x667
$B goto <URL>
$B screenshot /tmp/mobile-375.png
$B snapshot -i

# iPhone 14/15
$B viewport 390x844
$B goto <URL>
$B screenshot /tmp/mobile-390.png

# Android (Pixel)
$B viewport 412x915
$B goto <URL>
$B screenshot /tmp/mobile-412.png
```

### Step 2: Touch Target Verification

```bash
# Check all interactive element sizes
$B snapshot -i
# For each interactive element @eN:
$B js "(() => { const el = document.querySelector('<selector>'); const r = el.getBoundingClientRect(); return JSON.stringify({w: r.width, h: r.height}); })()"
```

All interactive elements must be >= 44x44px.

### Step 3: Text Readability

```bash
$B css "body" "font-size"        # Must be >= 16px
$B css "p" "line-height"         # Must be >= 1.5
$B css "body" "max-width"        # Content should not exceed viewport
$B js "document.body.scrollWidth > document.body.clientWidth"  # Must be false (no horizontal scroll)
```

### Step 4: Navigation

```bash
$B viewport 375x667
$B snapshot -i
# Verify: navigation accessible (hamburger menu, bottom nav, or visible links)
# Verify: can reach all key pages from mobile nav
```

### Step 5: Key Flows on Mobile

Test core user flows at 375px viewport:
1. Can user complete primary action? (signup, purchase, etc.)
2. Forms usable with thumb?
3. Modals/dialogs fit screen?
4. Scrolling smooth?

### Step 6: Mobile Console Check

```bash
$B console --errors
$B network  # Check for failed requests
```

## Checklist

- [ ] No horizontal scroll at 375px
- [ ] All touch targets >= 44x44px
- [ ] Body text >= 16px
- [ ] Line height >= 1.5 for body
- [ ] Navigation accessible on mobile
- [ ] Key user flow completable on mobile
- [ ] Forms usable with thumb
- [ ] Images responsive (not overflowing)
- [ ] No console errors
- [ ] Modals fit mobile viewport

## Verdict

**PASS**: All checklist items pass.
**FAIL**: Any item fails. List failures for fix.

## Risk Guardrails
- L1: read-only testing
- Does NOT modify code
- Output is QA report with pass/fail per item

## Handoff
- Feeds into: production-readiness-audit, screenshot-loop
- Failures become fix tasks in build-feature
