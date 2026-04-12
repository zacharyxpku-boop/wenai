---
name: lead-list-builder
description: "Build a structured list of potential partners, channels, communities, or directories from public sources. NOT personal data scraping."
user-invocable: true
allowed-tools: Read, Write, Bash, WebSearch, WebFetch
argument-hint: "<what kind of leads: directories, communities, partners, channels>"
---

# Lead List Builder

## Purpose
Build a curated list of public channels, directories, communities, partner organizations, or distribution opportunities — NOT personal contact scraping.

## When to Use
- Identifying distribution channels for a new product
- Finding communities where target users congregate
- Building a partner/integration prospect list
- Mapping directories to submit to for SEO

## When NOT to Use
- Building personal contact lists (email, phone) — FORBIDDEN
- Scraping social media profiles — FORBIDDEN
- Any data collection requiring login — FORBIDDEN

## Typical User Requests
- "帮我找一下这个领域的社区和渠道"
- "有哪些目录可以提交我们的产品"
- "find communities where our users hang out"
- "列一下可以合作的渠道"

## Inputs
- Product category or target audience description
- Lead type: directories / communities / partners / media / channels

## Outputs
```markdown
# Lead List: <category> — <lead type>
Date: <ISO>

## Leads
| # | Name | Type | URL | Audience | Relevance | Action |
|---|------|------|-----|----------|-----------|--------|
| 1 | Product Hunt | Directory | producthunt.com | Makers, early adopters | High | Submit launch |
| 2 | r/astrology | Community | reddit.com/r/astrology | Astrology enthusiasts | High | Post value content |

## By Type
- Directories: N
- Communities: N
- Partner orgs: N
- Media/blogs: N

## Recommended Priority
1. <lead> — why: <reason>
2. ...

## Sources
Search queries used: <list>
```

## Execution Pattern
1. WebSearch: "<category> directories", "<category> communities", "<category> submit site"
2. WebSearch: "<target audience> forum", "<target audience> reddit", "<target audience> discord"
3. For each result, extract: name, type, URL, audience description
4. Classify by type and relevance
5. Prioritize by expected ROI (reach x relevance)
6. Write to `docs/research/<category-slug>-leads.md`

## Risk Guardrails
- L2: web search, but STRICT boundaries
- **FORBIDDEN**: collecting personal names, emails, phone numbers, social profiles
- **FORBIDDEN**: scraping membership lists or follower lists
- Only collect: organization/community names, public URLs, descriptions
- This builds a CHANNEL list, not a CONTACT list

## Dependencies / Adapters
- WebSearch (built-in)
- WebFetch for verifying URLs (optional)

## Validation
- Every lead must have a real, publicly accessible URL
- Do NOT fabricate communities or directories
- Verify top 3 leads actually exist by fetching their URL

## Fallback Behavior
- If search results are thin: try different keyword angles
- If niche is very small: report "limited public channels found" as valid finding

## Handoff Notes
- Feeds into: go-to-market.md, outreach-brief-builder, content-calendar-draft
- Save: `docs/research/<category-slug>-leads.md`
