# Application Skills Pack v1 + v2

22 application-level skills across 5 groups.

## Skill Map

```
research/                  crawl-extract/          audio-video/              content-ops/       sales-support/
───────────                ─────────────           ────────────              ────────────       ──────────────
market-research            web-crawl-collect       audio-transcribe          content-repurpose  outreach-brief-builder
competitor-teardown        page-structured-extract video-transcribe          content-calendar-  support-signal-
customer-voice-synthesis   site-map-crawl          meeting-transcribe          draft              summarizer
serp-landscape-scan        faq-extractor           meeting-action-extract   research-to-brief
pricing-teardown           lead-list-builder       video-highlight-extract  transcript-cleanup
positioning-compare
```

## v2 Templates (grouped, 12 new skills)

| Group | Skill | Risk | External Deps | Status |
|-------|-------|------|---------------|--------|
| research | serp-landscape-scan | L1 | WebSearch | candidate |
| research | pricing-teardown | L1 | WebSearch+WebFetch | candidate |
| research | positioning-compare | L1 | WebSearch+WebFetch | candidate |
| crawl-extract | site-map-crawl | L2 | WebFetch | candidate |
| crawl-extract | faq-extractor | L1-L2 | WebFetch | candidate |
| crawl-extract | lead-list-builder | L2 | WebSearch | candidate |
| audio-video | meeting-transcribe | L2 | ffmpeg+whisper | sandbox |
| audio-video | meeting-action-extract | L1 | none | candidate |
| audio-video | video-highlight-extract | L1 | none | candidate |
| content-ops | content-calendar-draft | L1 | none | candidate |
| sales-support | outreach-brief-builder | L2 | WebSearch | candidate |
| sales-support | support-signal-summarizer | L1-L2 | WebSearch | candidate |

Typical flow: Research → Collect evidence → Transcribe interviews → Clean up → Generate briefs/content

## Quick Reference

| Skill | Risk | External Deps | What It Does |
|-------|------|---------------|-------------|
| market-research | L1 | WebSearch | Market landscape, players, opportunities |
| competitor-teardown | L1 | WebSearch, WebFetch | Product teardown of a competitor |
| customer-voice-synthesis | L1 | WebSearch | Aggregate public user voices, pain points |
| web-crawl-collect | L2 | WebFetch | Collect public pages, structured output |
| page-structured-extract | L2 | WebFetch | Extract specific fields from a page |
| audio-transcribe | L2 | ffmpeg, whisper | Audio → timestamped text |
| video-transcribe | L2 | ffmpeg, whisper | Video → audio → timestamped text + chapters |
| transcript-cleanup | L1 | none | Clean raw transcript, dual output |
| research-to-brief | L1 | none | Research → actionable brief |
| content-repurpose | L1 | none | Source → homepage/blog/social/video/sales |

## When to Call vs Not Call

### Call market-research when:
- Starting a new project and need market context
- Evaluating whether a direction is worth pursuing
- Need data to support product decisions

### Call competitor-teardown when:
- Know specific competitors, need structured analysis
- Need to find differentiation points
- Preparing positioning strategy

### Call customer-voice-synthesis when:
- Need to understand real user pain points
- Validating whether a problem is real
- Need user language for copy

### Call web-crawl-collect when:
- Need to archive public page content
- Building a reference library
- Collecting evidence for research

### Call audio/video-transcribe when:
- Have a recorded meeting, interview, or talk
- Need text version for analysis or content

### Do NOT call these skills when:
- Content is behind authentication → forbidden
- Need real-time data feeds → out of scope
- Need to scrape at scale (>20 pages) → out of scope
- Need guaranteed transcription accuracy → use professional service

## External Dependencies

### Always Available (built into Claude Code)
- WebSearch: market-research, competitor-teardown, customer-voice-synthesis
- WebFetch: web-crawl-collect, page-structured-extract
- Read/Write: all skills

### Requires Local Installation
| Tool | Used By | Install |
|------|---------|---------|
| ffmpeg | audio-transcribe, video-transcribe | `winget install ffmpeg` |
| whisper | audio-transcribe, video-transcribe | `pip install openai-whisper` or `pip install faster-whisper` |

### Graceful Degradation
- If ffmpeg missing: skill reports the gap, suggests install command
- If whisper missing: skill reports the gap, suggests alternatives
- If WebSearch unavailable: skill notes limitation, works with provided data only
- Skills never pretend tools exist when they don't

## Risk Controls

### Crawling
- Public content only, no auth bypass
- Max 20 pages per invocation
- Must record source URL + fetch timestamp
- No personal data extraction
- Respect rate limits

### Transcription
- Local processing only, no uploads
- User must provide the file explicitly
- Raw transcript always preserved
- Model-generated summaries labeled as such

### Research
- Every data point needs a source
- Facts vs inferences clearly distinguished
- "Unknown" is a valid answer
- No fabricated quotes, stats, or personas
