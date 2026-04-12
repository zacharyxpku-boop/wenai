---
name: campaign-brief-generator
description: Convert Commercialization Council conclusions into actionable campaign briefs. Use after any Council review that produces a GO decision.
trigger: auto — after commercialization-council-review outputs GO or growth-optimization
---

# Campaign Brief Generator

## Purpose
Transform strategic Council verdicts into concrete, executable campaign briefs that the marketing team can act on immediately.

## When to Use
- After Commercialization Council completes a review with GO decision
- When Commander assigns a marketing task
- At the start of a new marketing cycle

## When NOT to Use
- When no Council verdict exists (run commercialization-council-review first)
- For pure research tasks
- When product is in P3 "do not market" state

## Inputs
- Council verdict file (state/council/ or latest commercialization-council-review output)
- Product stage (P0/P1/P2/P3) from Commander
- Product docs: value proposition, target user, feature list

## Execution

### Step 1: Parse Council Verdict
Read the latest Council output. Extract:
- Recommended action (GO / conditional GO / NO-GO)
- Target user definition
- Core value proposition
- Priority channel hints
- Business hypothesis to validate
- Boundaries and off-limits

### Step 2: Determine Campaign Type by Product Stage
- P0 (closest to revenue): Conversion campaign — focus on payment validation, first users, case studies
- P1 (high ticket, low trust): Trust campaign — focus on evidence, demos, case studies, credibility
- P2/P3 (moat-building): Signal campaign — focus on positioning tests, content seeds, feedback

### Step 3: Draft Campaign Brief
Write to `state/marketing/campaign-brief-{YYYY-MM-DD}.md`:

```markdown
# Campaign Brief — {Product Name} — {Date}

## Source
Council verdict: {link to file}
Product stage: {P0/P1/P2/P3}

## Objective
{One sentence: what this campaign must achieve}

## KPI
- Primary: {one measurable goal}
- Secondary: {one measurable goal}

## Timeline
- Prep: {dates}
- Launch: {date}
- Review: {date}

## Target User
{From Council, enriched with behavioral description}

## Core Message
{One sentence value proposition in user language}

## Primary Channel
{One channel with rationale}

## Content Pillars
1. {Pillar 1}
2. {Pillar 2}
3. {Pillar 3}

## Key Messaging
- Headline: {draft}
- Subheadline: {draft}
- CTA: {draft}

## Automation Level
{Full auto / semi-auto / manual confirm for each action type}

## Open Questions
{What still needs validation}

## Off-Limits
{What Council said NOT to do}
```

### Step 4: Dispatch
- Tag audience-insight for persona enrichment
- Tag channel-launch for channel validation
- Store in state/marketing/

## Output
- `state/marketing/campaign-brief-{date}.md`

## Risk Level
L1 — advisory, no external impact

## Validation
- Brief must reference Council verdict (traceability)
- Must have exactly one primary channel
- Must have measurable KPI
- Must state automation level
