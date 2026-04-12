---
name: risk-scan
description: Scan for security issues, leaked secrets, broken deps, and deployment risks. Use pre-merge or pre-deploy.
user-invocable: true
context: fork
allowed-tools: Read, Glob, Grep, Bash
---

# Risk Scan

Comprehensive pre-release security and quality check.

## Checks

### Secrets & Credentials
- Search for: API keys, tokens, passwords, connection strings in source
- Commands: `grep -r "sk-\|token.*=\|password.*=\|secret.*=" src/ --include="*.ts" --include="*.js" --include="*.py"`
- Check .env files are in .gitignore
- Check no .env values committed

### Dependencies
- Run `npm audit` or equivalent
- Check for known vulnerable versions
- Flag any `*` version ranges

### Code Quality
- Search for TODO/FIXME/HACK in critical paths (not tests/docs)
- Check for console.log/print statements in production code
- Check for disabled tests (`.skip`, `@pytest.mark.skip`)

### Git Safety
- Check for large binary files staged
- Check for merge conflict markers (`<<<<<<<`)
- Verify .gitignore covers: node_modules, .env, dist, build

### Deployment
- Check build succeeds: `npm run build` or equivalent
- Check for hardcoded localhost/development URLs
- Check environment variable usage (not hardcoded config)

## Output

```
## Risk Scan Results

RISK LEVEL: LOW/MEDIUM/HIGH/CRITICAL

### Found Issues
1. [SEVERITY] description — file:line

### Clean Areas
- No secrets found
- Dependencies clean
- ...

### Recommendations
- ...
```
