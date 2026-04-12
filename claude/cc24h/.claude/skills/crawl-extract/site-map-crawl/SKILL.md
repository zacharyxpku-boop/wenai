---
name: site-map-crawl
description: "Map a public website's structure — pages, navigation, hierarchy, content types. Non-destructive read-only crawl."
user-invocable: true
allowed-tools: Read, Write, Bash, WebFetch
argument-hint: "<root URL to map>"
---

# Site Map Crawl

## Purpose
Crawl a public website's navigation and sitemap to produce a complete page inventory — used for competitive analysis, migration planning, or site audit.

## When to Use
- Analyzing a competitor's site structure before building your own
- Planning a site migration
- Auditing your own site's information architecture
- Before page-structured-extract on specific pages

## When NOT to Use
- Site requires login (forbidden)
- You need content, not structure (use web-crawl-collect)
- Site has >200 pages (out of scope for single session)

## Typical User Requests
- "帮我把这个网站的页面结构理出来"
- "这个站有哪些页面"
- "map out this website"
- "爬一下这个网站的导航结构"

## Inputs
- Root URL (required)
- Max depth: 1-3 levels (default: 2)
- Max pages: 10-50 (default: 20)

## Outputs
```markdown
# Site Map: <domain>
Crawled: <ISO>
Root: <URL>
Pages found: <N>

## Navigation Structure
- Home
  - About
  - Products
    - Product A
    - Product B
  - Pricing
  - Blog
    - Post 1
    - Post 2
  - Contact

## Page Inventory
| # | URL | Title | Type | Depth |
|---|-----|-------|------|-------|
| 1 | /  | Home | Landing | 0 |
| 2 | /about | About Us | Info | 1 |
| 3 | /pricing | Pricing | Conversion | 1 |

## Content Types
- Landing pages: N
- Product pages: N
- Blog posts: N
- Info/legal: N
- Conversion (pricing/signup): N

## Observations
- <structural insight>
```

## Execution Pattern
1. WebFetch the root URL, extract all internal links + nav menu
2. Deduplicate and categorize links
3. For depth 2+: WebFetch each level-1 page, extract its links
4. Build tree structure from URL paths
5. Classify each page by type (landing, product, blog, info, conversion)
6. Write to `docs/research/<domain-slug>-sitemap.md`

## Risk Guardrails
- L2: external fetch, but read-only
- Max 50 pages per invocation — hard limit
- 2-second conceptual delay between fetches
- Do NOT follow links to external domains
- Do NOT access /admin, /dashboard, /api, /login paths
- Do NOT submit forms
- Do NOT bypass robots.txt or rate limits
- If site returns 403/429: stop immediately, report

## Dependencies / Adapters
- WebFetch (built-in)

## Validation
- Every URL in the inventory must have been actually fetched or found in navigation
- Do NOT invent pages that weren't in the crawl results
- Note "robots.txt blocked" or "redirect" as findings

## Fallback Behavior
- If WebFetch fails on root: try with/without www prefix
- If most pages fail: report that site may block automated access
- If sitemap.xml exists: fetch it as a shortcut

## Handoff Notes
- Feeds into: page-structured-extract (pick specific pages), competitor-teardown, positioning-compare
- Save: `docs/research/<domain-slug>-sitemap.md`
