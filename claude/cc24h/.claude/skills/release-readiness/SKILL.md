---
name: release-readiness
description: Pre-release check covering tests, security, dependencies, broken links, env config, and deployment readiness. Use before merge or deploy.
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash
argument-hint: "<branch or 'current'>"
---

# Release Readiness Check

Perform a comprehensive pre-release review for `$ARGUMENTS`.

## Checks (execute in order)

### 1. Build Check
```bash
npm run build --if-present 2>&1 || echo "NO BUILD SCRIPT"
```
- Does it build without errors?
- Any new warnings vs. baseline?

### 2. Test Suite
```bash
npm test --if-present 2>&1 || node --test tests/ 2>&1 || echo "NO TESTS"
```
- All tests pass?
- Any skipped tests that shouldn't be?

### 3. Lint / Type Check
```bash
npm run lint --if-present 2>&1 || echo "NO LINT"
npm run typecheck --if-present 2>&1 || echo "NO TYPECHECK"
```

### 4. Security Scan
- Grep for leaked secrets:
  ```
  Grep: pattern=/(api[_-]?key|secret|password|token)\s*[:=]\s*["'][^"']+/i
  ```
- Check `.env` files not in `.gitignore`
- `npm audit --production 2>/dev/null` if applicable

### 5. Dependency Health
- Any `package-lock.json` changes? Were they intentional?
- Any new dependencies added? Are they justified?
- Any deprecated packages?

### 6. Git Hygiene
```bash
git status
git log --oneline -5
git diff --stat main...HEAD 2>/dev/null || git diff --stat HEAD~5
```
- Any uncommitted changes?
- Commit messages follow conventions?
- Branch is up to date with base?

### 7. Documentation
- `README.md` still accurate?
- `CLAUDE.md` needs updates?
- Any new APIs undocumented?

### 8. Configuration
- Environment variables documented?
- No hardcoded URLs or credentials?
- Config files have sensible defaults?

## Output Format

```markdown
# Release Readiness: <branch>
Date: <ISO>

## Summary
<READY / NOT READY / NEEDS ATTENTION>

## Results
| Check | Status | Notes |
|-------|--------|-------|
| Build | ✅/❌ | ... |
| Tests | ✅/❌ | ... |
| Lint | ✅/❌ | ... |
| Security | ✅/❌ | ... |
| Deps | ✅/❌ | ... |
| Git | ✅/❌ | ... |
| Docs | ✅/❌ | ... |
| Config | ✅/❌ | ... |

## Blocking Issues
- <issue>: <how to fix>

## Warnings (non-blocking)
- <warning>

## Recommendation
<what to do before merging/deploying>
```

## Rules

- This skill is READ-ONLY — it reports, never modifies code
- If a check fails, explain WHY and HOW to fix, don't just say "failed"
- Security findings should be specific (file, line, what was found)
- If no test suite exists, flag it as a warning, not a blocker
- Always output the table even if all checks pass
