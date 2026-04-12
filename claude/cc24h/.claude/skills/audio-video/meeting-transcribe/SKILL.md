---
name: meeting-transcribe
description: "Transcribe a meeting recording — speaker diarization, timestamps, topic segmentation. Local processing via ffmpeg + whisper."
user-invocable: true
allowed-tools: Read, Write, Bash
argument-hint: "<path to meeting audio/video file>"
---

# Meeting Transcribe

## Purpose
Convert a meeting recording into a structured transcript with timestamps, speaker labels (when possible), and topic segments.

## When to Use
- After a team meeting, client call, or user interview
- When you need a searchable text version of a conversation
- Before meeting-action-extract (must transcribe first)

## When NOT to Use
- File is not a meeting (use audio-transcribe for general audio)
- You only need action items (use meeting-action-extract on existing transcript)
- File requires downloading from a cloud service you're not logged into

## Typical User Requests
- "把这段会议录音转成文字"
- "帮我转写昨天的会议"
- "transcribe this meeting recording"
- "会议记录转逐字稿"

## Inputs
- File path to audio (.mp3, .wav, .m4a, .ogg) or video (.mp4, .webm, .mov)
- Language hint (optional, auto-detected)
- Meeting context (optional: "product review", "user interview", etc.)

## Outputs
```markdown
# Meeting Transcript: <filename>
Date: <ISO>
Duration: <from file metadata>
Language: <detected>
Participants: <if identifiable from context, otherwise "unknown">

## Topic Segments
| Time | Topic |
|------|-------|
| 0:00 | Opening / introductions |
| 3:45 | <topic from content> |
| 12:30 | <topic> |
| ... | ... |

## Full Transcript
[0:00] Opening remarks and introductions...
[0:45] First topic discussion begins...
[3:45] Transition to second topic...
...

## Metadata
- Source file: <path>
- Format: <codec>
- Duration: <mm:ss>
- Processing model: <whisper variant>
```

## Execution Pattern

### 1. Prerequisites Check
```bash
ffmpeg -version 2>&1 | head -1
which whisper 2>/dev/null || python -c "import whisper" 2>/dev/null || echo "NO_WHISPER"
```

### 2. Extract Audio (if video)
```bash
ffmpeg -i "<input>" -vn -ar 16000 -ac 1 -f wav "/tmp/cc24h-meeting.wav" -y
```

### 3. Transcribe
```bash
whisper "/tmp/cc24h-meeting.wav" --model base --language auto --output_format json --output_dir /tmp/
```

### 4. Post-Process
- Parse JSON output for segments with timestamps
- Identify topic transitions (>3s pause + content shift)
- Format into readable transcript

### 5. Save
Write to `docs/transcripts/<filename>-meeting.md`

## Risk Guardrails
- L2: local file processing only
- NEVER upload audio to external services
- NEVER delete the original file
- Processing must happen on local machine
- If file contains sensitive content: user decides what to keep

## Dependencies / Adapters
| Tool | Required | Install | Fallback |
|------|----------|---------|----------|
| ffmpeg | Yes | `winget install ffmpeg` | Cannot process without it |
| whisper | Yes | `pip install faster-whisper` | Cannot transcribe without it |

## Validation
- Output must have timestamps
- Compare transcript duration with file duration (should roughly match)
- If model confidence is low: note "low confidence" segments

## Fallback Behavior
- If ffmpeg missing: print install instructions, stop
- If whisper missing: print install instructions, stop
- If file format unsupported: try ffmpeg conversion first
- If transcription quality is poor: note it, suggest using larger model

## Handoff Notes
- Feeds into: meeting-action-extract, transcript-cleanup, research-to-brief
- Save: `docs/transcripts/<filename>-meeting.md`
