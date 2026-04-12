---
name: marketing-retro-pack
description: Synthesize marketing results into actionable retrospective — CONTINUE/STOP/AMPLIFY/TEST framework. Feeds back into next campaign cycle.
trigger: end of campaign cycle (weekly or bi-weekly)
---

# Marketing Retro Pack

## Purpose
Analyze what worked, what didn't, and what to do next. Turns marketing data into decisions.

## When to Use
- At the end of each marketing cycle
- When pivoting strategy mid-campaign
- When onboarding new session to marketing context

## Inputs
- Published content list with engagement data
- User feedback (from feedback forms, DMs, comments)
- Previous retro reports (if any)
- Campaign brief (original objectives)

## Execution

### Step 1: Data Collection
Compile data table:
```markdown
| # | Date | Platform | Type | Angle | Variant | Impressions | Engagement | Shares | Conversions | Cost |
|---|---|---|---|---|---|---|---|---|---|---|
```

If data is incomplete, note which fields are missing and proceed with available data.

### Step 2: Pattern Analysis
Cluster content into performance tiers:
- Top performers (top 20% by composite metric)
- Average performers (middle 60%)
- Underperformers (bottom 20%)

Identify patterns across tiers:
- Which content TYPE performs best?
- Which ANGLE performs best?
- Which PLATFORM delivers best?
- Which COPY STYLE converts?
- Which ASSET TYPE gets shared?

### Step 3: Four-Quadrant Recommendations

**CONTINUE:** Strategies that are working — keep doing exactly this
- [strategy] — evidence: [data point]

**STOP:** Strategies that are not working — stop wasting effort
- [strategy] — evidence: [data point]

**AMPLIFY:** Strategies that showed promise — invest more
- [strategy] — evidence: [data point] — proposed action: [specific next step]

**TEST:** New hypotheses to validate next cycle
- [hypothesis] — test method: [how to test] — success criteria: [metric]

### Step 4: Red Team Challenge
- Are we optimizing for vanity metrics or business outcomes?
- Is our best performer actually converting, or just getting likes?
- Are we in an echo chamber?

### Step 5: Output
Write to `state/marketing/retro-{date}.md`

## Output
- Performance data table
- Pattern analysis
- CONTINUE/STOP/AMPLIFY/TEST recommendations
- Next cycle hypothesis

## Risk Level
L1

## Handoff
This output feeds directly into the next campaign-brief-generator cycle, creating a closed loop.
