---
name: review-checklist
description: Systematic code review covering correctness, security, style, tests, edge cases. Use for PR review or pre-merge check.
user-invocable: true
context: fork
allowed-tools: Read, Glob, Grep, Bash
---

# Code Review Checklist

Review the recent changes systematically.

## Steps

1. Run `git diff HEAD~1` (or `git diff main`) to see changes
2. For each changed file, check:

### Correctness
- [ ] Logic matches the stated goal
- [ ] Edge cases handled (null, empty, overflow, concurrency)
- [ ] Error handling appropriate (not swallowed, not over-caught)

### Security
- [ ] No hardcoded secrets, tokens, or passwords
- [ ] User input validated/sanitized
- [ ] No SQL injection, XSS, command injection vectors
- [ ] Permissions and auth checks in place

### Style & Maintainability
- [ ] Follows existing patterns and conventions
- [ ] No unnecessary complexity or abstraction
- [ ] Variable/function names are clear
- [ ] No dead code or commented-out blocks

### Tests
- [ ] Changed code has test coverage
- [ ] Tests actually assert meaningful behavior
- [ ] Edge cases tested

### Dependencies
- [ ] No unnecessary new dependencies
- [ ] No known vulnerable versions

## Output

```
## Review: <files reviewed>

PASS/FAIL: <overall verdict>

### Issues Found
1. [severity] file:line — description

### Recommendations
- ...
```
