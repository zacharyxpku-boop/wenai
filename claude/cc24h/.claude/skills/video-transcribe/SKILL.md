---
name: video-transcribe
description: "Extract audio from video and transcribe. Outputs transcript, chapter suggestions, key moments."
user-invocable: true
allowed-tools: Read, Write, Bash
argument-hint: "<path to video file>"
---

# Video Transcribe

Extract speech from video files and produce structured transcript.

## Trigger Phrases
- "把这个视频转成文字"
- "视频转逐字稿"
- "transcribe this video"
- "提取这个视频的对话内容"
- "视频里说了什么"

## Default Participants
- 快刀官: run extraction + transcription pipeline

## Risk Level: L2 (local file processing)

## Prerequisites
Same as audio-transcribe: requires ffmpeg + whisper variant.

## Steps

### 1. Validate
```bash
ffprobe -v quiet -print_format json -show_streams "<video-path>" 2>&1
```
Check: has audio stream? Duration? Codec?

### 2. Extract Audio
```bash
ffmpeg -i "<video-path>" -vn -ar 16000 -ac 1 -f wav "/tmp/cc24h-video-audio.wav" -y
```

### 3. Transcribe
Same as audio-transcribe Step 3.

### 4. Chapter Suggestions
After transcription, analyze the transcript for natural topic breaks:
- Long pauses (>3 seconds)
- Topic shifts (detected from content)
- Speaker changes (if detectable)

### 5. Output

```markdown
# Video Transcript: <filename>
Date: <ISO>
Duration: <total>
Language: <detected>

## Suggested Chapters
| Time | Topic |
|------|-------|
| 0:00 | <topic> |
| 5:23 | <topic> |
| ... | ... |

## Key Moments
- [2:15] <notable quote or point>
- [8:42] <notable quote or point>

## Full Transcript
[0:00-0:15] Text...
[0:15-0:32] Text...
...

## Metadata
- File: <path>
- Video codec: <codec>
- Audio codec: <codec>
- Resolution: <WxH>
- Duration: <seconds>
```

### 6. Save
Write to `docs/transcripts/<filename>-video-transcript.md`

## Rules
- Local processing only
- Do NOT upload video anywhere
- Do NOT delete original file
- Chapter suggestions are AI-generated estimates, label them as such
- Raw transcript takes priority over summary
