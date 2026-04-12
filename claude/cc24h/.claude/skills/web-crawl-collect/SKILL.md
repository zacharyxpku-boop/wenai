---
name: web-crawl-collect
description: "Collect public web pages — URLs, titles, summaries, structured text. Low-frequency, respectful crawling."
user-invocable: true
allowed-tools: Read, Write, Bash, WebFetch
argument-hint: "<URL or list of URLs to collect>"
---

# Web Crawl & Collect

Low-risk public page collection with structured output.

## Trigger Phrases
- "抓一下这个网站"
- "采集这几个页面"
- "帮我收集这些公开信息"
- "crawl this page"
- "fetch this URL"
- "把这个页面内容存下来"

## Default Participants
- 铁律官: risk check before crawling
- Commander: decides scope

## Risk Level: L2 (advisory, external fetch)

## Pre-Flight Risk Check

Before any fetch, verify:
- [ ] URL is publicly accessible (no auth required)
- [ ] Not behind paywall
- [ ] Not a login page
- [ ] Domain is not on restricted list
- [ ] Scope is reasonable (≤20 pages per session)

If ANY check fails → STOP and report to user.

## Steps

### 1. Parse Input
From `$ARGUMENTS`: one or more URLs

### 2. Fetch Each Page
For each URL:
```
WebFetch(url, "Extract: title, main content text, publication date if visible, author if visible, key headings")
```

Record:
- URL
- Fetch timestamp (ISO)
- HTTP status (success/redirect/fail)
- Title
- Summary (≤3 sentences)
- Full extracted text

### 3. Structure Output

```markdown
# Web Collection: <topic>
Collected: <ISO timestamp>
Pages: <N>

## Index
| # | URL | Title | Date | Status |
|---|-----|-------|------|--------|
| 1 | <url> | <title> | <date> | ok/fail |

## Page 1: <title>
URL: <url>
Fetched: <timestamp>
---
<extracted text, cleaned>
---

## Page 2: ...
```

### 4. Save
Write to `docs/research/<topic-slug>-collection.md`

## Rate Limiting
- Max 20 pages per invocation
- Wait 2 seconds between fetches (conceptual — WebFetch handles this)
- If site appears to rate-limit → stop and report

## Forbidden
- Do NOT fetch authenticated/paywalled content
- Do NOT bypass robots.txt or rate limits
- Do NOT scrape personal data (emails, phone numbers, addresses)
- Do NOT collect from social media private profiles
- Do NOT store raw HTML (only extracted text)

## Fallback
If WebFetch is unavailable:
- Report that the tool is not accessible
- Suggest user manually provide the page content
- Do NOT use curl/wget without explicit user permission
