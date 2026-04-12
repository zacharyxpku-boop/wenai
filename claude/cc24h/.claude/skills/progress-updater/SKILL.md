---
name: progress-updater
description: Update docs/progress.md, decisions log, and worklogs after task completion. Use after submitting work or at session end.
user-invocable: true
allowed-tools: Read, Write, Glob, Grep, Bash
argument-hint: "<task-id or summary of what was done>"
---

# Progress Updater

After work described by `$ARGUMENTS`, update all project tracking documents.

## Steps

1. **Read current state**:
   - Read `docs/progress.md`
   - Read `tasks/execution-plan.yaml` (if exists)
   - Run `git log --oneline -10` to see recent commits
   - Run `git diff --stat HEAD~3` to see recent changes

2. **Determine what changed**:
   - Which tasks were completed
   - Which files were modified
   - What tests pass/fail
   - Any new blockers or risks discovered

3. **Update `docs/progress.md`**:

   Append to the appropriate section (create if missing):

   ```markdown
   ## Current Stage
   <stage name> — <reason>

   ## Last Updated
   <ISO timestamp>

   ## Completed (recent)
   - [<date>] <task-id>: <what was done>
   - [<date>] <task-id>: <what was done>

   ## In Progress
   - <task-id>: <what's happening, who>

   ## Blocked
   - <task-id>: <reason>

   ## Decisions
   - [<date>] <decision>: <reason>

   ## Next Best Action
   <what should happen next and why>
   ```

4. **Write worklog entry** to `.cc24h/worklogs/<date>-<task-id>.md`:

   ```markdown
   # Worklog: <task-id>
   Date: <ISO>
   Session: <session-id if known>
   Duration: <estimate>

   ## Done
   - <bullet list>

   ## Files Changed
   - <file>: <what changed>

   ## Verification
   - Tests: pass/fail
   - Lint: pass/fail

   ## Issues Found
   - <any problems>

   ## Handoff Notes
   - <anything the next session needs to know>
   ```

5. **Update task status in YAML** (if execution-plan.yaml exists):
   - Mark completed tasks as `status: done`
   - Update blocked tasks with blocker reason
   - Adjust priorities if new information warrants it

## Rules

- NEVER delete existing progress entries — only append
- NEVER overwrite decisions — they are an audit trail
- Keep summaries concise (1-2 lines per item)
- Always include the date/timestamp
- If `docs/progress.md` doesn't exist, create it with the full template
- If `.cc24h/worklogs/` doesn't exist, create it
