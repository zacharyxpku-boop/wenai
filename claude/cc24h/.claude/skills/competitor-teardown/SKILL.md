---
name: competitor-teardown
description: "Teardown a competitor — positioning, features, pricing, growth strategy, lessons."
user-invocable: true
allowed-tools: Read, Write, Bash, WebSearch, WebFetch
argument-hint: "<competitor name or URL>"
---

# Competitor Teardown

Systematic competitor analysis.

## Trigger Phrases
- "拆一下这个竞品"
- "分析一下 XX 这个产品"
- "XX 是怎么做的"
- "competitor analysis on XX"
- "看看 XX 的打法"
- "这个对手的优劣势是什么"

## Default Participants
- 增长官 (lead): positioning, growth
- 破局官: strategic differentiation

## Risk Level: L1 (read-only, advisory)

## Steps

### 1. Identify Target
From `$ARGUMENTS`: competitor name/URL/product

### 2. Research
Search for:
1. "<competitor> product features"
2. "<competitor> pricing plans"
3. "<competitor> reviews users"
4. "<competitor> 产品 定位 用户"
5. "<competitor> growth strategy funding"

If URL provided, fetch the public homepage:
- Extract hero text, value proposition, CTA
- Note pricing if visible
- Note key features listed

### 3. Structure

```markdown
# Competitor Teardown: <name>
Date: <ISO>
URL: <if available>

## Positioning
- Tagline: "<their headline>"
- Target user: <who they serve>
- Value prop: <their core promise>

## Product
| Feature | Available | Notes |
|---------|----------|-------|
| ... | yes/no/partial | ... |

## Pricing
| Tier | Price | Key limits |
|------|-------|-----------|
| ... | ... | ... |

## Growth Strategy
- Channels: <how they acquire users>
- Content: <what they publish>
- Differentiator: <why users choose them>

## Strengths
1. ...

## Weaknesses
1. ...

## Lessons for Us
1. <what to learn>
2. <what to avoid>
3. <where we can differentiate>

## Sources
- [1] <URL>
```

### 4. Save
Write to `docs/research/<competitor-slug>-teardown.md`

## Rules
- Only use publicly available information
- Do NOT fabricate feature lists or pricing
- Do NOT access authenticated pages
- Mark uncertain information as "unconfirmed"
