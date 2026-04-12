---
name: serp-landscape-scan
description: "Scan search results for a niche/keyword to map the competitive landscape — who ranks, what content exists, what gaps remain."
user-invocable: true
allowed-tools: Read, Write, Bash, WebSearch, WebFetch
argument-hint: "<keyword or niche to scan>"
---

# SERP Landscape Scan

## Purpose
Search 3-5 keyword variations, catalog the top results, and produce a landscape map showing who dominates, what content types rank, and where whitespace exists.

## When to Use
- Starting research on a new niche or product category
- Assessing how saturated a market is before building
- Identifying SEO/content opportunities
- Feeding competitor-teardown or positioning-compare with targets

## When NOT to Use
- You already have a clear competitor list (use positioning-compare instead)
- You need deep product-level analysis (use competitor-teardown)
- The topic is too broad to produce useful results in one scan

## Typical User Requests
- "看看 AI 塔罗这个赛道谁在做"
- "搜一下 XX 关键词，看看排名情况"
- "scan the SERP for AI astrology apps"
- "这个领域有多少竞争者"

## Inputs
- Primary keyword (required)
- 2-4 related keyword variations (auto-generated if not provided)
- Geographic focus (default: global)

## Outputs
```markdown
# SERP Landscape: <keyword>
Date: <ISO>

## Keywords Scanned
1. "<keyword 1>"
2. "<keyword 2>" ...

## Landscape Map
| Rank | Domain | Title | Type | Notes |
|------|--------|-------|------|-------|
| 1 | example.com | ... | Product / Blog / Directory / Tool | ... |

## Content Type Distribution
- Product/SaaS pages: N
- Blog/content: N
- Directories/aggregators: N
- News: N
- Forums: N

## Key Players (top 5)
1. <domain> — <what they do, why they rank>

## Gaps & Opportunities
1. <gap> — why it matters

## Sources
- All URLs from search results
```

## Execution Pattern
1. Generate 3-5 keyword variations from the primary keyword
2. WebSearch each variation
3. Catalog top 10 results per keyword (deduplicate by domain)
4. Classify each result by type (product, blog, directory, etc.)
5. Identify recurring domains (= strong players)
6. Identify content gaps (queries with thin results)
7. Write output to `docs/research/<keyword-slug>-serp.md`

## Risk Guardrails
- L1 (read-only): no page modification, no account creation
- Only uses public search results
- Does NOT click through to authenticated content
- Does NOT scrape full page content (use web-crawl-collect for that)

## Dependencies / Adapters
- WebSearch (built-in): required
- WebFetch: optional, only if deeper page analysis needed

## Validation
- Every entry must have a real URL from search results
- "No results found" is a valid and useful finding
- Do NOT fabricate domains or rankings

## Fallback Behavior
- If WebSearch unavailable: report limitation, suggest user provide manual search results
- If fewer than 10 results: report the actual count, don't pad

## Handoff Notes
- Output feeds into: competitor-teardown, positioning-compare, idea-to-plan
- Save path: `docs/research/<keyword-slug>-serp.md`
