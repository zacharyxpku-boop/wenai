---
name: customer-voice-synthesis
description: "Synthesize public user voices — reviews, forums, communities. Extract pain points and demand patterns."
user-invocable: true
allowed-tools: Read, Write, Bash, WebSearch, WebFetch
argument-hint: "<product/topic to research user voices for>"
---

# Customer Voice Synthesis

Aggregate public user signals into structured insights.

## Trigger Phrases
- "看看用户怎么说"
- "用户痛点是什么"
- "收集一下用户反馈"
- "社区里大家在讨论什么"
- "user voice synthesis"
- "有哪些真实需求"

## Default Participants
- 增长官 (lead): demand patterns
- 破局官: opportunity validation

## Risk Level: L1 (read-only, advisory)

## Steps

### 1. Define Target
From `$ARGUMENTS`: product name, topic, or niche

### 2. Search Public Sources
Search for:
1. "<topic> review"
2. "<topic> reddit discussion"
3. "<topic> 用户评价 知乎"
4. "<topic> complaints problems"
5. "<topic> alternatives recommendations"

For each source, extract:
- Platform (Reddit, forum, review site, etc.)
- Original quote (verbatim, short)
- Sentiment (positive/negative/neutral)
- Pain point or need expressed

### 3. Synthesize

```markdown
# Customer Voice: <topic>
Date: <ISO>

## Top Pain Points (by frequency)
1. <pain point> — mentioned N times
   - "<verbatim quote>" — <source>
   - "<verbatim quote>" — <source>
2. ...

## Recurring Needs
1. <need pattern>
2. ...

## Positive Signals (what users like)
1. <signal>

## Keywords & Language
Users commonly say:
- "<phrase 1>"
- "<phrase 2>"
(Useful for copy and marketing)

## Demand Patterns
- Strongest demand: <what>
- Underserved need: <what>
- Emerging trend: <what>

## Raw Signal vs Model Summary
Above synthesis is based on the following raw signals.
Each signal includes: source, quote, sentiment.

| # | Source | Quote | Sentiment |
|---|--------|-------|-----------|
| 1 | <URL> | "<quote>" | pos/neg/neutral |
| ... | ... | ... | ... |

## Sources
- [1] <URL>
```

### 4. Save
Write to `docs/research/<topic-slug>-voices.md`

## Rules
- MUST distinguish raw quotes from model interpretation
- MUST include source for every quote
- Do NOT fabricate user quotes
- Do NOT invent personas from insufficient data
- "Insufficient public data" is a valid finding
- Only use publicly accessible content
