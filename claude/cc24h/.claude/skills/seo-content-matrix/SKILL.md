---
name: seo-content-matrix
description: Generate 20-topic SEO content matrix with keyword clusters, outlines, FAQs, CTAs, and publish priority. For long-tail organic traffic.
trigger: post-launch when organic growth becomes priority
---

# SEO Content Matrix

## Purpose
Build a structured SEO content plan that captures long-tail search traffic related to the product's domain.

## When to Use
- After initial launch when organic growth matters
- When building content moat
- When refreshing SEO strategy based on retro data

## Inputs
- Product keywords and domain
- Target audience search behavior
- Competitor content gaps (if available from competitive-teardown)

## Execution

### Step 1: Keyword Research Framework
Define seed keywords from:
- Product features (e.g., MBTI, 八字, tarot, 合盘)
- User questions (e.g., "我的性格", "今年运势", "和TA配不配")
- Competitor gaps
- Long-tail combinations (e.g., "MBTI x 八字", "ENFP 八字", "金牛座 八字")

### Step 2: Generate 20 Topics
For each topic:
```markdown
### Topic {N}: {Title}
- Primary Keyword: {main keyword}
- Secondary Keywords: {3-5 related terms}
- Search Intent: {informational / navigational / transactional}
- Title: {<=60 chars, keyword-first}
- Outline:
  - H2: {section}
    - H3: {subsection}
  - H2: {section}
  - ...
- Word Count Target: {800-1500}
- FAQ (3-5 questions):
  1. {question} — {brief answer}
  2. ...
- CTA: {contextual, not hard-sell, links to product}
- Internal Links: {which other articles to link to}
- Publish Priority: Wave {1/2/3}
```

### Step 3: Prioritize
Rank by: estimated search volume x conversion potential / competition level
Assign to waves:
- Wave 1: High volume + high conversion + low competition (publish first)
- Wave 2: Medium metrics (publish second)
- Wave 3: Long-tail experiments (publish third)

### Step 4: Output
Write to `state/marketing/seo-matrix-{date}.md`

## Output
- 20-topic SEO matrix with full outlines
- Keyword cluster map
- Priority ranking

## Risk Level
L1
