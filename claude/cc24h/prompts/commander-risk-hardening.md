# Commander Risk Hardening

## Context
- Skill governance and risk policy are in code (src/skill-governance.mjs)
- But enforcement happens only when explicitly called, not automatically
- Need to bridge the gap: code policy → hook enforcement → audit

## Goal
Make risk policy enforcement automatic and auditable.

## Tasks

### 1. Auto-generate context-inject.md on task claim
In `src/session-bridge.mjs` or `src/commander-core.mjs`, when `claimTask()` is called:
- Write `.cc24h/commander/context-inject.md` with:
  - Current task ID, title, goal
  - Allowed files (files_touched from task)
  - Forbidden zones (from risk-policy.yaml)
  - Session ID and role
  - Deadline/priority info
- This file is read by PostCompact hook to re-inject context

### 2. Auto-audit skill usage in orchestrator
In `src/orchestrator.mjs` or `src/autonomous.mjs`, after each worker completes:
- Parse worker output for skill invocations (look for skill names in output)
- Call `skillRegistry.recordUsage()` for each detected skill
- Call `skillRegistry.audit()` with session/task context
- Log to events table

### 3. Quarantine threshold in autonomous loop
In autonomous loop, after each task:
- Check `riskPolicy.shouldDisable()` for all trial skills used
- If a skill crosses threshold, auto-disable and log event
- Report in next `cc24h skill report`

## Constraints
- Do NOT change the CLI interface
- Do NOT change database schema
- Changes only in: src/session-bridge.mjs, src/autonomous.mjs, src/orchestrator.mjs
- Keep it simple: parse text output, don't require structured worker output yet

## Verification
1. `cc24h claim -s test -p .` → `.cc24h/commander/context-inject.md` exists
2. After daemon run, `cc24h skill audit` shows usage records
3. A skill with >50% fail rate gets flagged in `cc24h skill report`
