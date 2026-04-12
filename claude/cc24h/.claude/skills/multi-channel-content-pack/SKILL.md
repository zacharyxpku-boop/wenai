---
name: multi-channel-content-pack
description: Generate platform-specific publish-ready content packs for 小红书, 知乎, 公众号, 社群, SEO. Includes titles, body, comments, hashtags, risk words.
trigger: after content angles are selected
---

# Multi-Channel Content Pack

## Purpose
Transform selected content angles into platform-specific, publish-ready content packs. Each pack follows the target platform's conventions, character limits, and culture.

## When to Use
- After content-angle-generator produces ranked angles
- When creating content for a specific platform
- When repurposing existing angles for new platforms

## Inputs
- Selected content angles (from content-angle-generator)
- Campaign brief
- Product screenshots/assets (paths)
- Platform-specific rules (built-in)

## Execution

### Step 1: Select Top Angles
Pick the top N angles from the angle tree (default: 3 for initial batch).

### Step 2: Generate Platform Packs

#### 小红书 Pack (per post)

```markdown
## XHS Post: {Angle Name}

### Titles (5 variants, each <=20 chars)
1.
2.
3.
4.
5.

### Body (3 variants, each <=500 chars)
**Version A:**
[body with line breaks, personal tone, use "我" and "你"]

**Version B:**
[different angle/hook]

**Version C:**
[different structure]

### Cover Text
[2-3 lines of text to overlay on cover image]

### Image/Screenshot Brief
[What to capture, what state, what to highlight]

### First Comment (首评)
[Conversational, adds context, invites replies]

### Follow-up Comment (追评)
[Builds on first comment, answers likely question]

### Hashtags (10)
#tag1 #tag2 ...

### Risk Word Check
- Flagged: [any terms that may trigger platform filters]
- Suggested replacements: [alternatives]
```

#### 知乎 Pack (per answer)

```markdown
## Zhihu Answer: {Angle Name}

### Target Questions
1. [Existing question URL/text to answer]
2. [Alternative question]

### Answer Framework
- Hook: [first 2 sentences that make reader continue]
- Evidence: [data, example, or experience]
- Story: [personal angle or case]
- CTA: [soft, non-promotional link to product]

### Long Version (800+ chars)
[Full answer]

### Short Version (300 chars)
[Condensed answer]

### Comment Follow-up
[Template for replying to comments]
```

#### 社群/私域 Pack

```markdown
## Group/Private Domain: {Angle Name}

### Group Message Sequence
**Message 1 (Day 1, welcome):**
[text]

**Message 2 (Day 1, +2h, how to use):**
[text]

**Message 3 (Day 2, feedback ask):**
[text]

### DM Invite (3 variants)
**Close friend:**
[text]

**Acquaintance:**
[text]

**Professional:**
[text]

### Moments Post
**Long (150+ chars):**
[text with story hook]

**Short (<=50 chars):**
[text with curiosity hook]
```

### Step 3: Red Team Self-Check
For each pack, verify:
- No banned phrases (AI驱动, 智能洞察, 一站式, 高效, 赋能, 精准分析, Powered by AI)
- Sounds like real person, not marketing bot
- Has specific detail, not generic
- Platform-appropriate tone and format

### Step 4: Output
Write to `state/marketing/content-packs/{platform}-{date}/` with one file per angle.

## Output
- Platform-specific content pack files
- Pack manifest listing all generated files

## Risk Level
L2 — content generation, needs human review before publish

## Copy Rules (MANDATORY)
- Titles: <=15 chars, start with "你", specific scenario, curiosity hook
- No banned words
- Must sound human
- A/B variants always
