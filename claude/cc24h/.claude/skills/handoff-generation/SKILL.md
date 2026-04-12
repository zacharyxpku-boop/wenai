---
name: handoff-generation
description: Generate structured handoff notes when ending a session, switching agents, or hitting a blocker. Enables reliable session relay.
user-invocable: true
allowed-tools: Read, Write, Glob, Grep, Bash
argument-hint: "<task-id or reason>"
---

# Handoff Generation

Generate a handoff for `$ARGUMENTS` so the next session can continue seamlessly.

## Data Collection

1. Run `git diff --stat HEAD~3` — what changed recently
2. Run `git log --oneline -5` — recent commits
3. Read `docs/progress.md` — current stage
4. Read relevant task in `tasks/*.yaml` — what was assigned
5. Check `.cc24h/worklogs/` — any recent worklogs
6. Check `.cc24h/commander/decisions/` — recent decisions

## Output

Write to `.cc24h/handoffs/<task-id>-<timestamp>.md`:

```markdown
# Handoff: <task-id>
Date: <ISO>
From: <session-id or "manual">
Role: <builder|reviewer|qa-operator>

## Goal
<What this task/session was trying to achieve — 1-2 sentences>

## Completed
- <Specific item with file paths>
- <e.g., "Implemented JWT auth in src/api/auth.ts">

## Not Completed
- <What remains, with enough detail to resume>
- <e.g., "Token refresh logic needs implementation in src/api/auth.ts:refreshToken()">

## Files Modified
- `src/api/auth.ts` — added login endpoint
- `tests/auth.test.ts` — added 3 test cases

## Test Results
- ✅ `npm test` passes (12/12)
- ⚠️ `src/api/auth.ts:refreshToken` has no test coverage yet

## Current Risks
- <e.g., "JWT secret is hardcoded in auth.ts:5 — should move to env">

## Blockers
- <If any: what's blocking and why>
- "None" if no blockers

## Decision Context
- <Any decisions made and WHY>
- <e.g., "Chose bcrypt over argon2 — already a project dependency">

## Next Steps (for the next session)
1. <Most important thing to do next>
2. <Second priority>
3. <Third priority>

## Parallel Safety
- Can remaining work be parallelized? <yes/no>
- Protected files: <list of files others must not modify>

## Resume Instructions
1. `cd <worktree path or project root>`
2. `git checkout <branch>`
3. Read <key file> to understand current state
4. Start with: <specific next action>
```

## Rules

- Be SPECIFIC — name file paths and function names
- "Completed" means verified, not "I think I did it"
- "Not Completed" must be detailed enough for a stranger to continue
- Include WHY for decisions, not just WHAT
- Always include resume instructions — assume zero prior context
- Never omit risks — let the next session judge importance
- If no blockers, write "None" — don't omit the section
