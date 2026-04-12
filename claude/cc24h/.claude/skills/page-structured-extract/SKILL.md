---
name: page-structured-extract
description: "Extract structured fields from a web page — title, price, features, CTA, FAQ, metadata."
user-invocable: true
allowed-tools: Read, Write, Bash, WebFetch
argument-hint: "<URL and fields to extract>"
---

# Page Structured Extract

Pull specific structured data from a public web page.

## Trigger Phrases
- "从这个页面提取信息"
- "抓一下这个产品页的价格和功能"
- "提取这个页面的结构化数据"
- "extract fields from this page"
- "把这个页面的关键信息提出来"

## Default Participants
- 铁律官: validate URL safety
- 增长官: interpret extracted data

## Risk Level: L2 (advisory, external fetch)

## Steps

### 1. Parse Input
From `$ARGUMENTS`:
- URL (required)
- Fields to extract (optional, defaults below)

Default fields:
- title
- description/subtitle
- price/pricing tiers
- key features (list)
- CTA text and URL
- FAQ items
- author/company
- publication/update date
- social proof (testimonials, stats)
- tech stack hints

### 2. Fetch & Extract
```
WebFetch(url, "Extract these specific fields as structured data:
- Page title
- Main headline
- Subtitle/description
- Pricing (all tiers if visible)
- Features list
- CTA button text and link
- FAQ questions and answers
- Author or company name
- Date published or last updated
- Any testimonials or social proof
- Navigation structure (main menu items)
Return as structured key-value pairs.")
```

### 3. Structure Output

```markdown
# Extracted: <page title>
URL: <url>
Fetched: <ISO>

## Core
- **Title**: <title>
- **Headline**: <main headline>
- **Description**: <subtitle>
- **CTA**: "<button text>" → <link>

## Pricing
| Tier | Price | Key Features |
|------|-------|-------------|
| ... | ... | ... |

## Features
1. <feature>
2. ...

## FAQ
**Q: <question>**
A: <answer>

## Social Proof
- "<testimonial>" — <source>

## Metadata
- Author/Company: <name>
- Date: <date>
- Nav items: <list>
```

### 4. Save
Write to `docs/research/<domain>-extract.md`

## Rules
- Only public pages
- Mark "not found" for fields not visible on page
- Do NOT infer data that isn't on the page
- Do NOT access authenticated content
