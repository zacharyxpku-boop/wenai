---
name: build-feature
description: "Workflow: Claim task from Commander → execute in worktree → verify → submit → repeat. The builder loop."
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
---

# Build Feature Workflow

Enter the claim-execute-submit loop as a 快刀官 (Builder).

## Trigger Phrases
- "开始做这个功能"
- "帮我实现这个"
- "开始干活"
- "执行 pending 任务"
- "写代码"
- "build this"
- "开始开发"
- "领任务"

## Default Participants
- 铁律官: boundary + risk check (if needed)
- 快刀官 (lead): implement + verify
- 尺子官: review after completion

## Setup

```bash
# Generate unique session ID
SESSION="builder-$(date +%s | tail -c 5)"

# Register
node C:/Users/86136/Desktop/cc24h/bin/cc24h.mjs register -p . -s $SESSION -r builder
```

## Loop (repeat until no tasks)

### Step 1: Claim
```bash
node C:/Users/86136/Desktop/cc24h/bin/cc24h.mjs claim -p . -s $SESSION
```
Read the output carefully. Note:
- **Task ID** — you'll need it for submit
- **Worktree path** — cd there before working
- **Branch** — you're already on it in the worktree
- **Prompt** — your exact instructions

### Step 2: Execute
1. `cd <worktree path>` (if provided)
2. Read ALL files mentioned in the prompt first
3. Implement exactly what's asked
4. Follow existing code patterns (don't invent new ones)
5. Do NOT modify files outside the prompt scope

### Step 3: Verify
Run whatever verification the prompt specifies:
```bash
npm test --if-present
npm run lint --if-present
npm run build --if-present
```

### Step 4: Commit
```bash
git add <changed files>
git commit -m "feat(<task-id>): <short description>"
```

### Step 5: Submit
```bash
node C:/Users/86136/Desktop/cc24h/bin/cc24h.mjs submit -p . -s $SESSION -t <task-id> \
  --summary "Implemented X in Y" \
  --files "src/a.ts,src/b.ts" \
  --tests pass
```

If failed: `--tests fail --issues "Description of what went wrong"`

### Step 6: Next
```bash
node C:/Users/86136/Desktop/cc24h/bin/cc24h.mjs claim -p . -s $SESSION
```
If "No tasks available" → done.

## Rules
- One task at a time
- Don't skip verification
- Don't expand scope — report issues via --issues
- Always submit, even on failure
