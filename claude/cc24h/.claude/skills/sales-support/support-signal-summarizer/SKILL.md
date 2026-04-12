---
name: support-signal-summarizer
description: "Summarize support/feedback signals — tickets, reviews, issues — into patterns, priorities, and product insights."
user-invocable: true
allowed-tools: Read, Write, Glob, WebSearch
argument-hint: "<source: file path, GitHub issues URL, or topic to search>"
---

# Support Signal Summarizer

## Purpose
Aggregate support signals (bug reports, feature requests, complaints, reviews) into structured patterns that inform product decisions.

## When to Use
- Periodic review of user feedback
- After launch — collecting early signals
- Before planning next sprint — what are users hitting?
- Tracking sentiment over time

## When NOT to Use
- You need individual ticket resolution (this is analysis, not support)
- Data requires authenticated access (CRM, Zendesk login)

## Typical User Requests
- "总结一下用户反馈"
- "最近用户在抱怨什么"
- "summarize support signals"
- "GitHub issues 里有什么趋势"
- "用户最想要什么功能"

## Inputs
- Option A: Path to a file with collected feedback
- Option B: GitHub issues URL (public repo)
- Option C: Topic to search for public reviews/feedback

## Outputs
```markdown
# Support Signal Summary: <product/topic>
Date: <ISO>
Period: <if applicable>
Signals analyzed: <N>

## Top Issues (by frequency)
| # | Issue | Count | Severity | Category |
|---|-------|-------|----------|----------|
| 1 | <issue> | N mentions | high/med/low | bug/ux/feature/perf |

## Feature Requests (by demand)
| # | Request | Count | Effort Est. | Impact Est. |
|---|---------|-------|-------------|-------------|
| 1 | <feature> | N | low/med/high | low/med/high |

## Sentiment Breakdown
- Positive: N (what they like)
- Neutral: N
- Negative: N (what they dislike)

## Patterns
1. <pattern>: <evidence>
2. ...

## Product Implications
1. <what to fix> — urgency: <high/med/low>
2. <what to build> — demand: <strong/moderate/weak>
3. <what to keep> — users value this

## Raw Signals
| # | Source | Signal | Sentiment | Category |
|---|--------|--------|-----------|----------|
| 1 | <URL or file> | "<quote>" | pos/neg/neutral | bug/feature/ux |
```

## Execution Pattern
1. If file path: read and parse
2. If GitHub URL: fetch public issues page
3. If topic: WebSearch "<topic> reviews", "<topic> complaints", "<topic> feature request"
4. Classify each signal: bug / feature request / UX issue / performance / other
5. Count frequency, identify patterns
6. Rank by frequency x severity
7. Write to `docs/research/<product-slug>-signals.md`

## Risk Guardrails
- L1-L2: read-only analysis
- Only use publicly available feedback
- Do NOT access authenticated support systems
- Distinguish raw user quotes from AI interpretation
- Do NOT fabricate support tickets or reviews

## Dependencies / Adapters
- WebSearch + WebFetch (for public sources)
- GitHub CLI (`gh issue list`) for GitHub repos (optional)

## Validation
- Every pattern must reference at least 2 raw signals
- Single mentions are "anecdotal", not "patterns"
- "No significant patterns found" is valid with small sample

## Fallback Behavior
- If source is inaccessible: report limitation, suggest user provide data
- If sample is very small (<5 signals): caveat heavily

## Handoff Notes
- Feeds into: idea-to-plan, progress.md, research-to-brief
- Save: `docs/research/<product-slug>-signals.md`
