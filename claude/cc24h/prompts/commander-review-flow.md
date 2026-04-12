# Commander Review Flow Enhancement

## Context
- Tasks can be in "review" status but review is manual
- Need automated review gates that use the review-checklist skill

## Goal
When a task moves to "review" status, auto-spawn a reviewer that checks the work.

## Tasks

### 1. Auto-review on task completion
In `src/autonomous.mjs`, after worker submits successfully:
- If task has `review_checklist` defined, spawn a reviewer session
- Reviewer reads git diff on the task branch, runs review-checklist skill
- Reviewer outputs pass/fail + issues
- If pass: task → done
- If fail: task → todo (retry) with reviewer notes as context

### 2. Review results in handoff
When reviewer completes:
- Write review results to handoff
- Include: what was checked, what passed, what failed, specific file:line references

## Constraints
- Reviewer is a separate `claude` spawn, not same session
- Use `--max-turns 15` for reviewer (should be quick)
- Don't block if review fails — just mark task as needs-attention
- Only auto-review if task has review_checklist in YAML

## Verification
1. Enqueue task with review_checklist
2. Run daemon
3. After worker completes, reviewer auto-spawns
4. Task moves to done (if pass) or retries (if fail)
5. Handoff includes review notes
