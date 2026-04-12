---
name: meeting-action-extract
description: "Extract action items, decisions, and follow-ups from a meeting transcript."
user-invocable: true
allowed-tools: Read, Write, Glob
argument-hint: "<path to meeting transcript file>"
---

# Meeting Action Extract

## Purpose
Read a meeting transcript and extract structured action items, decisions made, questions raised, and follow-up tasks.

## When to Use
- After meeting-transcribe produced a transcript
- When you have meeting notes and need to extract tasks
- To convert discussion into actionable work items

## When NOT to Use
- You don't have a transcript yet (use meeting-transcribe first)
- The "meeting" is actually a presentation with no action items

## Typical User Requests
- "从会议记录里提取待办"
- "这个会议有哪些 action items"
- "extract actions from this transcript"
- "会议决定了什么，接下来做什么"

## Inputs
- Path to transcript file (from meeting-transcribe or manual notes)

## Outputs
```markdown
# Meeting Actions: <meeting name>
Extracted: <ISO>
Source: <transcript file>

## Decisions Made
1. [<time>] <decision> — context: <why>
2. ...

## Action Items
| # | Action | Owner | Deadline | Priority | Status |
|---|--------|-------|----------|----------|--------|
| 1 | <task> | <person or TBD> | <if mentioned> | <high/med/low> | pending |

## Open Questions
1. <question raised but not resolved>

## Key Discussion Points
1. [<time>] <topic> — <outcome or status>

## Follow-Up Meeting Topics
1. <topic to discuss next time>

## Raw Quotes (supporting evidence)
- "<verbatim quote>" [<timestamp>] — supports action #N
```

## Execution Pattern
1. Read the transcript file
2. Scan for action indicators: "we should", "let's", "I'll", "need to", "action item", "follow up", "decision"
3. Scan for decision indicators: "agreed", "decided", "confirmed", "approved", "let's go with"
4. Scan for question indicators: "?", "not sure", "need to figure out", "open question"
5. Structure into categories
6. Save to same directory as source with `-actions` suffix

## Risk Guardrails
- L1: text analysis only, no external access
- Do NOT add actions that aren't supported by transcript content
- Do NOT assign owners unless names are clearly in the transcript
- Label "AI-inferred" vs "explicitly stated" items

## Dependencies / Adapters
- None (text processing only)

## Validation
- Every action item must reference a timestamp or quote from transcript
- If transcript is unclear: mark items as "uncertain"
- Count of actions should be reasonable (2-15 for a typical meeting)

## Fallback Behavior
- If transcript is too short or unclear: extract what's possible, note limitations
- If no clear actions found: report "no explicit action items identified"

## Handoff Notes
- Feeds into: task-decomposition, execution-plan.yaml, progress.md
- Can generate cc24h tasks directly if action items are development work
- Save: `docs/transcripts/<source>-actions.md`
