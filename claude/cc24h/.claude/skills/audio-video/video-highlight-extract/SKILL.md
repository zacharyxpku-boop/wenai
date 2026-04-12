---
name: video-highlight-extract
description: "Identify key moments, quotable segments, and highlight timestamps from a video transcript."
user-invocable: true
allowed-tools: Read, Write, Glob
argument-hint: "<path to video transcript file>"
---

# Video Highlight Extract

## Purpose
Scan a video transcript and identify the most shareable, quotable, or important moments — for creating clips, social media content, or summaries.

## When to Use
- After video-transcribe produced a transcript
- Preparing clips for social media
- Creating a highlight reel or summary
- Finding the "best 60 seconds" of a long video

## When NOT to Use
- No transcript exists yet (use video-transcribe first)
- You need the actual video clips (this only identifies timestamps; clip cutting requires ffmpeg)

## Typical User Requests
- "找出这个视频的精彩片段"
- "哪些地方适合做短视频"
- "extract highlights from this transcript"
- "这个访谈最值得引用的部分是什么"

## Inputs
- Path to video transcript (from video-transcribe)
- Purpose: social-clips / summary / quotes / all (default: all)

## Outputs
```markdown
# Video Highlights: <source>
Extracted: <ISO>
Source: <transcript file>

## Top Highlights (ranked by impact)
| # | Timestamp | Duration | Type | Quote/Summary | Why It's Good |
|---|-----------|----------|------|--------------|---------------|
| 1 | 5:23-5:45 | 22s | Quotable | "..." | Strong insight, self-contained |
| 2 | 12:10-13:02 | 52s | Story | ... | Compelling narrative, emotional |
| 3 | 18:30-18:50 | 20s | Data | ... | Surprising stat, shareable |

## Clip Suggestions for Social
### 60-second clip
- Start: <timestamp>
- End: <timestamp>
- Hook: "<first line>"
- Platform: best for <Twitter/LinkedIn/TikTok/YouTube Shorts>

### 15-second clip
- Start: <timestamp>
- End: <timestamp>
- Hook: "<line>"

## Key Quotes
1. "<quote>" — [<timestamp>]
2. ...

## Chapter Summary
| Chapter | Time | Key Takeaway |
|---------|------|-------------|
| ... | ... | ... |

## ffmpeg Cut Commands (if user wants actual clips)
```bash
ffmpeg -i <source-video> -ss <start> -to <end> -c copy highlight-1.mp4
```
```

## Execution Pattern
1. Read the full transcript
2. Score each segment for:
   - Insight density (new information per second)
   - Emotional impact (stories, surprises, humor)
   - Quotability (self-contained, no context needed)
   - Shareability (would someone repost this?)
3. Rank and select top 5-10 highlights
4. For each, note timestamp, type, and why it's notable
5. Generate clip suggestions with ffmpeg commands
6. Save to same directory as source

## Risk Guardrails
- L1: text analysis only
- Do NOT modify the original transcript
- Highlight selection is subjective — label as "AI-suggested"
- ffmpeg commands are suggestions, not auto-executed

## Dependencies / Adapters
- None for highlight identification (text only)
- ffmpeg needed only if user wants to actually cut clips (optional, not auto-run)

## Validation
- Every highlight must reference a real timestamp from the transcript
- Do NOT fabricate quotes
- Timestamps must be within the video's duration

## Fallback Behavior
- If transcript has no timestamps: identify by paragraph number instead
- If content is monotone/flat: report "no standout highlights found" as valid

## Handoff Notes
- Feeds into: content-repurpose, content-calendar-draft, social posts
- Save: `docs/transcripts/<source>-highlights.md`
