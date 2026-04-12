---
name: faq-extractor
description: "Extract FAQ content from public pages — questions, answers, categories. Useful for product planning and content strategy."
user-invocable: true
allowed-tools: Read, Write, Bash, WebFetch, WebSearch
argument-hint: "<URL with FAQ section, or topic to find FAQs for>"
---

# FAQ Extractor

## Purpose
Pull structured FAQ data from competitor sites, support pages, or community sources to understand what users ask and how incumbents answer.

## When to Use
- Building your own FAQ or help center
- Understanding user confusion points
- Content strategy for SEO (FAQ pages rank well)
- Feeding customer-voice-synthesis with structured questions

## When NOT to Use
- FAQ is behind login/paywall
- You need full page content (use web-crawl-collect)

## Typical User Requests
- "把这个网站的 FAQ 提取出来"
- "看看用户经常问什么问题"
- "extract FAQs from this page"
- "收集一下这个品类常见问题"

## Inputs
- Option A: Direct URL to a FAQ page
- Option B: Topic + "FAQ" (auto-search)

## Outputs
```markdown
# FAQ Extract: <source>
Date: <ISO>

## Questions & Answers
| # | Category | Question | Answer Summary | Source |
|---|----------|----------|---------------|--------|
| 1 | Pricing | How much does it cost? | Free plan + $9/mo pro | <URL> |
| 2 | Features | Can I export data? | Yes, CSV and PDF | <URL> |

## Question Categories
- Pricing/billing: N questions
- Features/usage: N
- Technical/integration: N
- Trust/security: N
- Getting started: N

## Insights
- Most asked about: <topic>
- Biggest concern: <what>
- Gap (unanswered common question): <what>
```

## Execution Pattern
1. If URL provided: WebFetch and extract Q&A pairs
2. If topic provided: WebSearch "<topic> FAQ" or "<topic> frequently asked questions"
3. For each FAQ source found, extract structured Q&A
4. Categorize questions by theme
5. Identify patterns and gaps
6. Write to `docs/research/<topic-slug>-faq.md`

## Risk Guardrails
- L1-L2: read-only extraction
- Only public FAQ pages
- Do NOT reproduce full FAQ answers verbatim (copyright) — summarize
- Keep answer summaries under 15 words each

## Dependencies / Adapters
- WebFetch + WebSearch (built-in)

## Validation
- Each Q&A must link to its source
- Do NOT invent questions that weren't on the source page

## Fallback Behavior
- If FAQ page is dynamically loaded (JS): note "FAQ may be incomplete due to dynamic rendering"
- If no FAQ found: check for help center, support docs, or community forums

## Handoff Notes
- Feeds into: customer-voice-synthesis, content-repurpose, design-spec.md
- Save: `docs/research/<topic-slug>-faq.md`
