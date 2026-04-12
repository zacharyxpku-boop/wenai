---
name: qa-comment-reply-pack
description: Generate QA ammunition — question pools, answer frameworks, comment replies, objection handling, soft-sell traffic scripts. For 知乎, 小红书 comments, and DM.
trigger: after content is published and engagement begins
---

# QA Comment Reply Pack

## Purpose
Prepare ready-to-use responses for questions, comments, objections, and DMs across platforms. Traffic-generating but not hard-sell.

## When to Use
- After content is published
- When preparing for expected questions
- When training team on response patterns

## Inputs
- Product FAQ
- Known user objections
- Published content list
- Audience persona cards

## Execution

### Step 1: Question Pool (20 questions)
Generate questions users actually ask:
- About accuracy ("这个准吗")
- About methodology ("这是怎么算的")
- About price ("要钱吗")
- About comparison ("和XX有什么区别")
- About privacy ("我的信息安全吗")
- Curiosity-driven ("我是XX座配什么")

### Step 2: Answer Frameworks
Each answer follows: Hook → Evidence → Experience → Soft CTA

### Step 3: Generate Per Question
```markdown
### Q: {question}

**Long Answer (300+ chars):**
[Authoritative, detailed, includes evidence/example]

**Short Answer (100 chars):**
[Conversational, direct]

**Comment Follow-up:**
[Anticipate their next question and pre-answer]
```

### Step 4: Objection Handling
```markdown
### Objection: "这个准吗？"
Response: [Don't over-promise. Use "many users found X resonated" not "100% accurate"]

### Objection: "和XX有什么区别？"
Response: [Differentiate on unique angle, not bash competitor]

### Objection: "看起来像 AI 生成的"
Response: [Acknowledge AI assists, emphasize human expertise/curation]

### Objection: "要收费？"
Response: [Value-first: "基础版完全免费，你可以先试试看是否有共鸣"]
```

### Step 5: Traffic Scripts (Non-Hard-Sell)
- Bio/profile optimization suggestions
- Comment-to-DM bridge scripts
- "If you want to know more" soft CTAs

### Step 6: Output
Write to `state/marketing/qa-pack-{date}.md`

## Output
- Question pool with answers
- Objection handling scripts
- Traffic bridge scripts

## Risk Level
L1

## Platform Rules
- Never impersonate real users
- Never post fake reviews
- Disclose product affiliation when directly asked
- No exaggerated claims
