---
name: transcript-cleanup
description: "Clean raw transcript — remove filler words, fix punctuation, preserve terminology. Dual output: raw + clean."
user-invocable: true
allowed-tools: Read, Write
argument-hint: "<path to raw transcript file>"
---

# Transcript Cleanup

Transform raw transcription into readable text while preserving meaning.

## Trigger Phrases
- "清理一下这段转写稿"
- "把逐字稿整理干净"
- "clean up this transcript"
- "转写稿太乱了，帮我理一下"
- "去掉口头语，整理成可读版"

## Default Participants
- 快刀官: text processing

## Risk Level: L1 (text transformation, no external access)

## Steps

### 1. Read Raw Transcript
Read the file from `$ARGUMENTS`

### 2. Clean

Apply these transformations:
1. **Remove filler words**: 嗯, 啊, 那个, 就是说, um, uh, like, you know, basically
2. **Fix punctuation**: add periods, commas, question marks where natural
3. **Fix sentence boundaries**: merge fragments, split run-ons
4. **Preserve terminology**: keep technical terms, proper nouns, product names exact
5. **Preserve meaning**: never change what was said, only how it reads
6. **Paragraph breaks**: add at topic transitions
7. **Speaker labels**: preserve if present in original

### 3. Dual Output

```markdown
# Cleaned Transcript: <source filename>
Cleaned: <ISO>
Source: <original file path>

## Summary (3-5 sentences)
<high-level what was discussed>

## Key Points
1. <point>
2. <point>

## Cleaned Version
<full cleaned text with paragraphs>

---

## Original (Raw) Version
<full raw text preserved verbatim>
```

### 4. Save
Write to same directory as source, with `-clean` suffix:
`<original-name>-clean.md`

## Rules
- ALWAYS output both raw and cleaned versions
- NEVER change factual content
- NEVER add information not in the original
- NEVER remove content that changes meaning (even if awkward)
- If unsure whether something is filler → keep it
- Label the summary and key points as "AI-generated interpretation"
