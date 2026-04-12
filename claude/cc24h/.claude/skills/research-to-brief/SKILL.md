---
name: research-to-brief
description: "Turn research outputs into actionable briefs — for product, growth, sales, or content teams."
user-invocable: true
allowed-tools: Read, Write, Glob
argument-hint: "<brief type: product|growth|sales|content> <research file path>"
---

# Research to Brief

Transform research materials into decision-ready briefs.

## Trigger Phrases
- "把研究结果整理成 brief"
- "出一份产品 brief"
- "把调研结果变成可执行方案"
- "写个增长 brief"
- "research to brief"
- "把这些素材整理成销售摘要"

## Default Participants
- 增长官 or 破局官 (depends on brief type)

## Risk Level: L1 (text synthesis)

## Steps

### 1. Parse Input
- Brief type: product / growth / sales / content (default: product)
- Source: file path or docs/research/ directory

### 2. Read Sources
Read all referenced research files. Check docs/research/ for recent outputs.

### 3. Generate Brief by Type

#### Product Brief
```markdown
# Product Brief: <topic>
Date: <ISO>
Sources: <list>

## Opportunity
<2-3 sentences: what's the opportunity and why now>

## Target User
<1 sentence persona>
<top 3 pain points from research>

## Value Proposition
<1 sentence: what we offer that solves their problem>

## MVP Scope
Must have:
1. ...
Should have:
1. ...
Won't have (now):
1. ...

## Key Risks
1. <risk> — mitigation: <how>

## Success Metric
<1 measurable outcome>

## Recommended Next Step
<1 action>
```

#### Growth Brief
```markdown
# Growth Brief: <topic>
Date: <ISO>

## Target Audience
<who, where they are, what they search for>

## Channel Strategy
| Channel | Effort | Expected Impact | Priority |
|---------|--------|----------------|----------|
| ... | ... | ... | ... |

## Messaging
- Headline: <proposed>
- Hook: <proposed>
- CTA: <proposed>

## Content Plan
1. <content piece> — purpose: <goal>
2. ...

## Experiments
1. <experiment> — hypothesis: <what we test>

## Key Metrics
- Primary: <metric>
- Secondary: <metric>
```

#### Sales Brief
```markdown
# Sales Brief: <topic>
Date: <ISO>

## Elevator Pitch (30 seconds)
<pitch>

## Key Differentiators
1. ...

## Objection Handling
| Objection | Response |
|-----------|----------|
| "..." | "..." |

## Proof Points
- <stat or quote from research>

## Ideal Customer Profile
<who to target first>

## Pricing Guidance
<if available from research>
```

#### Content Brief
```markdown
# Content Brief: <topic>
Date: <ISO>

## Content Pieces
| # | Type | Title | Audience | Goal |
|---|------|-------|----------|------|
| 1 | Blog | ... | ... | ... |
| 2 | Social | ... | ... | ... |

## Key Messages
1. ...

## Keywords (from user voice research)
- ...

## Tone & Style
<guidance>

## Distribution
- Primary: <channel>
- Secondary: <channel>
```

### 4. Save
Write to `docs/briefs/<type>-<topic-slug>.md`

## Rules
- Every claim in brief must trace to a research source
- Label opinions vs data-backed insights
- "Insufficient data for this section" is acceptable
- Do NOT fill gaps with fabricated data
