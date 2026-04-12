---
name: audio-transcribe
description: "Transcribe audio files to text. Local-first via ffmpeg + whisper. Outputs raw transcript + cleaned version."
user-invocable: true
allowed-tools: Read, Write, Bash
argument-hint: "<path to audio file>"
---

# Audio Transcribe

Convert audio files to text with timestamps.

## Trigger Phrases
- "把这段录音转成文字"
- "转写这个音频"
- "会议录音转文字"
- "transcribe this audio"
- "语音转文字"
- "听写这段音频"

## Default Participants
- 快刀官: run transcription pipeline
- 尺子官: verify output quality

## Risk Level: L2 (local file processing)

## Prerequisites Check

```bash
# Check ffmpeg
ffmpeg -version 2>&1 | head -1 || echo "MISSING: ffmpeg"

# Check whisper (any variant)
which whisper 2>/dev/null || which whisper.cpp 2>/dev/null || python -c "import whisper" 2>/dev/null || echo "MISSING: whisper"
```

### If ffmpeg missing:
```
PREREQUISITE MISSING: ffmpeg
Install: winget install ffmpeg  (Windows)
         brew install ffmpeg    (macOS)
         apt install ffmpeg     (Linux)
```

### If whisper missing:
```
PREREQUISITE MISSING: whisper
Options (pick one):
  pip install openai-whisper       # OpenAI Whisper (Python, GPU recommended)
  pip install faster-whisper        # Faster Whisper (Python, CPU ok)
  winget install whisper-cpp        # whisper.cpp (C++, fast CPU)
```

### Fallback if neither available:
- Report that transcription tools are not installed
- Offer to save the audio path for later processing
- Do NOT pretend to transcribe without actual tools

## Steps (when tools available)

### 1. Validate Input
```bash
# Check file exists and format
ffprobe -v quiet -print_format json -show_format "<audio-path>" 2>&1
```

### 2. Convert to WAV (if needed)
```bash
ffmpeg -i "<audio-path>" -ar 16000 -ac 1 -f wav "/tmp/cc24h-transcribe.wav" -y
```

### 3. Transcribe
```bash
# Option A: whisper CLI
whisper "/tmp/cc24h-transcribe.wav" --model base --language auto --output_format txt --output_dir /tmp/

# Option B: faster-whisper
python -c "
from faster_whisper import WhisperModel
model = WhisperModel('base', device='cpu')
segments, info = model.transcribe('/tmp/cc24h-transcribe.wav')
for seg in segments:
    print(f'[{seg.start:.1f}-{seg.end:.1f}] {seg.text}')
"

# Option C: whisper.cpp
whisper.cpp -m models/ggml-base.bin -f /tmp/cc24h-transcribe.wav
```

### 4. Output

```markdown
# Transcript: <filename>
Date: <ISO>
Duration: <from ffprobe>
Language: <detected>
Model: <whisper variant used>

## Raw Transcript
<verbatim output with timestamps>

[0:00-0:15] First segment text...
[0:15-0:32] Second segment text...

## Metadata
- File: <path>
- Format: <codec>
- Duration: <seconds>
- Sample rate: <Hz>
- Channels: <mono/stereo>
```

### 5. Save
Write to `docs/transcripts/<filename>-transcript.md`

## Rules
- Only process files the user explicitly provides
- Output RAW transcript by default (no summarization unless asked)
- Always include timestamps if available
- Do NOT delete original audio file
- Do NOT upload audio anywhere
- All processing must be local
