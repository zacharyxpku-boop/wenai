---
name: content-angle-generator
description: Generate ranked content angle trees from campaign briefs. Maps selling points to 6 content categories with engagement predictions.
trigger: after campaign-brief-generator completes
---

# Content Angle Generator

## Purpose
Transform a campaign brief into a structured tree of content angles, ranked by predicted engagement and conversion potential.

## When to Use
- After campaign-brief-generator produces a brief
- When refreshing content strategy for ongoing campaigns
- When pivoting angle after retro analysis

## Inputs
- Campaign brief (state/marketing/campaign-brief-{date}.md)
- Audience persona cards (if available)
- Product feature list

## Execution

### Step 1: Extract Selling Points
From campaign brief, list all concrete selling points and value propositions.

### Step 2: Generate 6-Category Angle Tree
For each selling point, generate angles across:

1. **Controversy/Debate** — provocative takes that spark discussion
   - Format: "Is X actually better than Y?" / "Why X is wrong about Z"
   - Goal: comments and shares through disagreement

2. **User Pain Point** — problems users recognize immediately
   - Format: "You struggle with X because..." / "Why X never works for you"
   - Goal: clicks through recognition

3. **Gameplay/Interactive** — hands-on, try-it-yourself content
   - Format: "Try this and see what happens" / "Your result says X about you"
   - Goal: engagement through participation

4. **Case Study/Story** — real or representative examples
   - Format: "How [persona] discovered X" / "This person's result was..."
   - Goal: trust through specificity

5. **Opinion/Take** — strong positions with reasoning
   - Format: "X is the most underrated Y" / "Stop doing X, start doing Y"
   - Goal: authority and shareability

6. **Comparison/Contrast** — direct matchups
   - Format: "X vs Y: which is more accurate?" / "3 differences between X and Y"
   - Goal: search traffic and curiosity

### Step 3: Rate Each Angle
For each angle, predict (1-5 scale):
- Click probability: would someone stop scrolling?
- Share probability: would someone send this to a friend?
- Conversion probability: would this lead to trying the product?
- Composite score: weighted average (click 30%, share 40%, conversion 30%)

### Step 4: Rank and Output
Sort by composite score. Write to `state/marketing/content-angles-{date}.md`:

```markdown
# Content Angle Tree — {Date}

## Source: {campaign brief link}

## Top 10 Angles (Ranked)

| Rank | Category | Angle | Click | Share | Convert | Score |
|---|---|---|---|---|---|---|
| 1 | ... | ... | 5 | 4 | 4 | 4.3 |

## Full Angle Tree

### Category 1: Controversy/Debate
1. [angle] — Click: X, Share: X, Convert: X
...

### Category 2: User Pain Point
...
(all 6 categories)
```

## Output
- `state/marketing/content-angles-{date}.md`

## Risk Level
L1
