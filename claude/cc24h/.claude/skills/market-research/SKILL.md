---
name: market-research
description: "Research a market/niche — landscape, players, opportunities, risks. Preserves sources."
user-invocable: true
allowed-tools: Read, Write, Bash, WebSearch, WebFetch
argument-hint: "<market topic or niche>"
---

# Market Research

Structured market analysis for a given topic or niche.

## Trigger Phrases
- "帮我研究一下这个赛道"
- "这个市场怎么样"
- "调研一下 XX 领域"
- "market research on XX"
- "这个方向有机会吗"
- "帮我看看竞争格局"

## Default Participants
- 增长官 (lead): market sizing, opportunity
- 破局官: strategic judgment

## Risk Level: L1 (read-only, advisory)

## Steps

### 1. Define Scope
From `$ARGUMENTS`, clarify:
- Market/niche name
- Geographic scope (global/China/US/other)
- Time frame (current state vs trends)

### 2. Research (using WebSearch)
Search for:
1. "XX market size 2025 2026"
2. "XX industry landscape players"
3. "XX 市场规模 竞争格局"
4. "XX trends opportunities risks"
5. "XX target users pain points"

For each search, record:
- Source URL
- Key data point or insight
- Retrieval date

### 3. Structure Findings

Output format:
```markdown
# Market Research: <topic>
Date: <ISO>

## Market Overview
- Size: <estimate with source>
- Growth: <trend with source>
- Stage: <emerging / growing / mature / declining>

## Key Players (top 5-8)
| Player | Positioning | Est. Size | Notable |
|--------|------------|-----------|---------|
| ... | ... | ... | ... |

## Target Users
- Primary: <who, what they need>
- Secondary: <who>
- Underserved: <gap>

## Opportunities
1. <opportunity> — evidence: <source>
2. ...

## Risks
1. <risk> — evidence: <source>
2. ...

## Recommendation
<1-3 sentences: is this worth pursuing, and how>

## Sources
- [1] <URL> (accessed <date>)
- [2] ...
```

### 4. Save
Write to `docs/research/<topic-slug>-market.md`

## Rules
- Every data point must have a source
- Clearly label estimates vs confirmed data
- Do NOT fabricate statistics
- Do NOT present model inference as market data
- "Unknown" is an acceptable answer
