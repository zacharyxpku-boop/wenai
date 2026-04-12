---
name: deploy
description: "CI/CD deployment workflow. Use when the user wants to deploy, push to production, set up CI/CD, configure GitHub Actions, or automate the release process."
---

# Deploy Workflow

## Purpose
Orchestrate the full deployment pipeline from code-ready to production-live.

## When to Invoke
- User says "deploy", "push to production", "CI/CD", "GitHub Actions", "发布到线上"
- After production-readiness-audit passes
- As part of launch-and-growth workflow completion

## Pre-Flight Checks (MANDATORY)
Before any deployment:
1. **production-readiness-audit** must have passed within last 24h
2. All tests passing (`npm test` / `npm run build` succeeds)
3. No P0/P1 issues open in task queue
4. Branch is clean (no uncommitted changes)
5. User has explicitly confirmed deployment target

## Deployment Strategies

### Strategy A: Static Site (Vercel/Netlify/Cloudflare Pages)
```bash
# 1. Build
npm run build

# 2. Preview deploy
vercel --prod  # or netlify deploy --prod

# 3. Verify
# Use agent-browser to verify deployed URL
npx agent-browser session:start --url <deployed-url>
```

### Strategy B: Node.js App (Railway/Render/Fly.io)
```bash
# 1. Verify Dockerfile or build command
# 2. Push to deploy branch
git push origin main

# 3. Monitor deploy logs
# 4. Health check endpoint verification
```

### Strategy C: GitHub Actions CI/CD
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm test
      # Deploy step varies by platform
```

### Strategy D: Docker
```bash
docker build -t <app-name> .
docker push <registry>/<app-name>:latest
```

## Post-Deploy Verification
1. **Health check** — verify `/api/health` or main page loads
2. **Smoke test** — use agent-browser to click through critical paths
3. **Performance check** — verify Core Web Vitals on deployed URL
4. **Error monitoring** — check for new errors in first 15 minutes
5. **Rollback plan** — document how to rollback if issues found

## Output
```yaml
deployment:
  url: <deployed-url>
  strategy: <A|B|C|D>
  timestamp: <ISO>
  pre_flight: PASS
  post_deploy_check: PASS|FAIL
  rollback_command: <command>
  monitoring_url: <if applicable>
```

## Escalation
- **MUST** ask user before deploying to production
- **MUST** ask user before deploying to a new platform
- **NEVER** auto-deploy without explicit user confirmation
- If post-deploy check fails → immediate rollback + notify user
