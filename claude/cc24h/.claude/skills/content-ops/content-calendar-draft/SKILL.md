---
name: content-calendar-draft
description: "Draft a 2-4 week content calendar — topics, formats, channels, cadence — based on research and product context."
user-invocable: true
allowed-tools: Read, Write, Glob
argument-hint: "<product/brand context or 'based on existing research'>"
---

# Content Calendar Draft

## Purpose
Produce a structured content calendar with specific topics, formats, target channels, and publishing cadence — grounded in research or product context.

## When to Use
- After market-research or customer-voice-synthesis produced insights
- When starting content marketing from scratch
- When existing content cadence is inconsistent
- Planning next month's content

## When NOT to Use
- No research or product context exists (do research first)
- You need the actual content written (use content-repurpose for that)

## Typical User Requests
- "帮我做一个内容日历"
- "规划下个月的内容"
- "draft a content calendar"
- "我该发什么内容，什么时候发"

## Inputs
- Product/brand context (from docs/ or user input)
- Available research (docs/research/*.md)
- Target channels (default: blog + 1 social platform)
- Time range (default: 2 weeks)

## Outputs
```markdown
# Content Calendar: <brand/product>
Period: <start> to <end>
Created: <ISO>

## Strategy Summary
- Goal: <awareness / traffic / conversion / engagement>
- Audience: <who>
- Channels: <where>
- Cadence: <how often>
- Themes: <3-4 content pillars>

## Calendar
| Week | Day | Channel | Format | Topic | Hook | Goal | Status |
|------|-----|---------|--------|-------|------|------|--------|
| 1 | Mon | Blog | Long-form | <topic> | <angle> | SEO | draft |
| 1 | Wed | Twitter | Thread | <topic> | <hook> | Engagement | draft |
| 1 | Fri | LinkedIn | Post | <topic> | <hook> | Authority | draft |
| 2 | Mon | Blog | How-to | <topic> | <angle> | Traffic | draft |
| ... | ... | ... | ... | ... | ... | ... | ... |

## Content Pillars
1. **<Pillar A>**: <what topics, why>
2. **<Pillar B>**: <what topics, why>
3. **<Pillar C>**: <what topics, why>

## Topic Ideas Bank (extras)
1. <topic> — type: <format> — priority: <high/med/low>
2. ...

## Key Dates / Hooks
- <date>: <event or trend to tie content to>

## Metrics to Track
- <metric 1>
- <metric 2>
```

## Execution Pattern
1. Read docs/design-spec.md, docs/go-to-market.md, docs/research/*.md
2. Identify target audience and their content consumption habits
3. Define 3-4 content pillars based on research insights
4. Map pillars to specific topics
5. Assign formats and channels
6. Space across the time period
7. Write to `docs/content/calendar-<period>.md`

## Risk Guardrails
- L1: planning only, no publishing
- Calendar is a DRAFT — requires human review before publishing
- Do NOT auto-post or schedule anything
- Topics must be grounded in research, not generic filler

## Dependencies / Adapters
- None (text planning)

## Validation
- Every topic should connect to a research insight or product feature
- Calendar should not have >2 posts per day per channel
- Cadence should be sustainable (don't plan daily posts if team is 1 person)

## Fallback Behavior
- If no research exists: create a minimal calendar with obvious topics, flag as "needs research backing"
- If product context is thin: focus on thought leadership / educational content

## Handoff Notes
- Feeds into: content-repurpose (to write each piece), go-to-market.md
- Save: `docs/content/calendar-<period>.md`
