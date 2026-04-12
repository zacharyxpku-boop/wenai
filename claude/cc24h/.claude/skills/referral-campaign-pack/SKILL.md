---
name: referral-campaign-pack
description: Generate referral/viral campaign materials — share triggers, share copy, comparison images, platform-specific versions, receiver experience spec.
trigger: after product has share mechanics implemented
---

# Referral Campaign Pack

## Purpose
Generate everything needed to make users share after completing a product experience. Focus on the "why would they share" moment.

## When to Use
- After product share mechanics are built
- When designing a referral campaign
- When optimizing existing share flow

## Inputs
- Product share flow description
- Result page design / screenshots
- Campaign brief
- Audience persona cards

## Execution

### Step 1: Define Share Trigger
- What action triggers the share prompt?
- At what emotional peak does sharing feel natural?
- What does the user just learned about themselves that they want to show?

### Step 2: Generate Share Content

**Comparison Image Copy (for 合盘/compatibility):**
```
你: [用户类型] — [一句话特征]
TA: [对方类型] — [一句话特征]
你俩的缘分指数: [X]%
[悬念句：比如"有一个维度你俩完全相反..."]
```

**Short Share Text (<=30 chars):**
3 variants, each with curiosity hook

**Long Share Text (100+ chars):**
3 variants, each with story structure

**DM Forwarding Script:**
3 variants: for close friend, for crush/partner, for group chat

### Step 3: Platform-Specific Versions

**小红书 Version:**
- Visual-first, hashtag-heavy
- Share as "discovery post"
- Include screenshot + reaction

**朋友圈 Version:**
- Personal, emotional
- "I just discovered..." tone
- 1-3 images max

**私聊 Version:**
- Intimate, curiosity hook
- "你试试这个" tone
- Direct link

### Step 4: Receiver Experience Spec
- What does the receiver see when they click?
- Can they start in <=30 seconds without registering?
- Can they see the sender's result (comparison motive)?
- After completing, do they get their own share prompt?

### Step 5: Output
Write to `state/marketing/referral-pack-{date}/`

## Output
- Share content variants
- Platform-specific packages
- Receiver experience spec
- Re-share loop design

## Risk Level
L2
