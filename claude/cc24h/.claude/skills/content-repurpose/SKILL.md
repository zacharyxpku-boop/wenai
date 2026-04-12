---
name: content-repurpose
description: "Transform research/transcripts into multiple content formats — landing page copy, blog outlines, social posts, video scripts, sales summaries."
user-invocable: true
allowed-tools: Read, Write, Glob
argument-hint: "<source file> <format: homepage|blog|social|video-script|sales>"
---

# Content Repurpose

One source → multiple content formats.

## Trigger Phrases
- "把这个转成首页文案"
- "写个博客提纲"
- "出几条社媒短帖"
- "转成视频脚本"
- "repurpose this content"
- "把访谈内容变成可发布素材"
- "一鱼多吃"

## Default Participants
- 增长官 (lead): content strategy, conversion
- 破局官: messaging alignment

## Risk Level: L1 (text generation)

## Steps

### 1. Read Source
From `$ARGUMENTS`: source file path
Read the content (transcript, research, brief, etc.)

### 2. Generate Requested Formats

If no specific format requested, generate ALL applicable ones.

#### Homepage Copy Framework
```markdown
## Homepage Copy: <topic>

### Hero
Headline: <powerful 6-10 word headline>
Subhead: <1 sentence expanding the headline>
CTA: <button text>

### Benefits (3)
1. <benefit headline> — <1 sentence>
2. <benefit headline> — <1 sentence>
3. <benefit headline> — <1 sentence>

### How It Works (3 steps)
1. <step> — <1 sentence>
2. <step> — <1 sentence>
3. <step> — <1 sentence>

### Social Proof
"<quote from research/transcript>" — <attribution>

### Final CTA
<headline>
<button text>
```

#### Blog Outline
```markdown
## Blog: <suggested title>
Target: <audience>
Goal: <SEO / thought leadership / conversion>
Length: <word count estimate>

### Outline
1. Hook: <opening angle>
2. Problem: <what readers struggle with>
3. <Section>: <key point>
4. <Section>: <key point>
5. <Section>: <key point>
6. CTA: <what reader should do next>

### SEO Keywords
- <keyword 1>
- <keyword 2>
```

#### Social Media Posts (3-5)
```markdown
## Social Posts

### Post 1 (Twitter/X)
<280 chars, hook + insight + CTA>

### Post 2 (LinkedIn)
<3-5 sentences, professional tone, ends with question>

### Post 3 (Short-form)
<Instagram/TikTok caption, casual, emoji ok>
```

#### Video Script
```markdown
## Video Script: <title>
Duration: <estimated minutes>

### Hook (0:00-0:15)
<what to say to grab attention>

### Problem (0:15-1:00)
<relate to audience pain>

### Solution (1:00-2:00)
<introduce the product/idea>

### Proof (2:00-2:30)
<evidence, demo, or testimonial>

### CTA (2:30-3:00)
<clear call to action>
```

#### Sales Summary
```markdown
## Sales One-Pager

### Problem We Solve
<1 sentence>

### Our Solution
<1 sentence>

### Key Benefits
1. ...
2. ...
3. ...

### For Who
<ideal customer in 1 sentence>

### Proof
<1 stat or quote>

### Next Step
<CTA>
```

### 3. Save
Write to `docs/content/<format>-<topic-slug>.md`

## Rules
- Content must be derived from the source material
- Do NOT invent claims not supported by source
- Match tone to format (formal for sales, casual for social)
- Always credit source material
- Label AI-generated content as drafts requiring human review
