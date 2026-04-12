---
name: outreach-brief-builder
description: "Build outreach briefs — who to contact, what to say, which channel, what angle. For partnerships, media, or distribution."
user-invocable: true
allowed-tools: Read, Write, Glob, WebSearch
argument-hint: "<outreach goal: partnerships, media, communities, distribution>"
---

# Outreach Brief Builder

## Purpose
Create structured outreach briefs for partnership, media, community, or distribution targets — with context, messaging angles, and channel recommendations.

## When to Use
- After lead-list-builder identified targets
- Preparing a launch outreach campaign
- Reaching out to communities, directories, or media
- Planning partnership conversations

## When NOT to Use
- You don't have targets yet (use lead-list-builder first)
- You need to actually send messages (this produces the BRIEF, not the send)
- Target is a personal individual (we don't build personal outreach)

## Typical User Requests
- "帮我准备一下合作推广的素材"
- "怎么跟这些社区/渠道合作"
- "build an outreach brief for launch"
- "准备一下 PR 沟通材料"

## Inputs
- Outreach goal: partnerships / media / communities / directories / distribution
- Target list (from lead-list-builder or user-provided)
- Product context (from docs/)

## Outputs
```markdown
# Outreach Brief: <goal>
Date: <ISO>
Product: <name>

## Value Proposition (for outreach context)
- We are: <1 sentence>
- We help: <who> do <what>
- Why now: <timeliness>

## Target Segments
### Segment A: <type, e.g., "Tech communities">
| Target | Channel | Angle | Priority |
|--------|---------|-------|----------|
| <name> | <email/DM/form/post> | <why they'd care> | high |

### Segment B: <type>
| ... | ... | ... | ... |

## Messaging Templates

### For Communities
Subject: <if email>
Body framework:
- Hook: <why this is relevant to THEIR audience>
- Value: <what we offer THEM, not us>
- Ask: <specific, small ask>
- Proof: <credibility signal>

### For Media
Pitch angle: <newsworthy angle>
Hook: <why now>
Data point: <supporting stat>

### For Directories
Submission info needed: <what most directories ask for>
Description templates: <50-word, 100-word, 200-word versions>

## Outreach Sequence
1. Week 1: <what to do>
2. Week 2: <follow up>
3. Week 3: <assess>

## Do NOT
- Cold email individuals without context
- Spam communities with self-promotion
- Misrepresent the product
```

## Execution Pattern
1. Read docs/go-to-market.md and docs/research/*-leads.md
2. For each target segment, research their audience and preferences
3. Craft messaging angles per segment
4. Create templates that emphasize value to THEM
5. Define sequence and timing
6. Save to `docs/outreach/<goal-slug>-brief.md`

## Risk Guardrails
- L2: research involves web search, but output is advisory
- **NEVER** include personal email addresses or phone numbers
- Templates are DRAFTS — human must review before sending
- Do NOT auto-send any messages
- Messaging must be honest — no false claims or fake urgency

## Dependencies / Adapters
- WebSearch (optional, for researching target preferences)
- lead-list-builder output (recommended input)

## Validation
- Messaging must be honest about our product
- Value prop must focus on what THEY get, not what WE want
- Templates should be customizable, not one-size-fits-all

## Fallback Behavior
- If no lead list exists: create a generic brief framework, flag as "needs targets"
- If product context is thin: focus on educational/value-add angles

## Handoff Notes
- Feeds into: content-calendar-draft, go-to-market.md
- Save: `docs/outreach/<goal-slug>-brief.md`
