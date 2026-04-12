---
name: production-readiness-audit
description: "Workflow: Complete production readiness check — UX + mobile + a11y + performance + architecture + chatbot + error recovery + observability + review gates."
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
argument-hint: "<project path or URL to audit>"
---

# Production Readiness Audit

The definitive ship gate. Runs all quality checks and produces go/no-go verdict.

## Trigger Phrases
- "能上线吗"
- "准出检查"
- "production ready"
- "能不能发布"
- "全面检查"
- "上线前审查"
- "readiness audit"

## Default Participants
- 尺子官 (lead): overall gate keeper
- 增长官: UX clarity, design compliance
- 铁律官: architecture, performance
- 用户战场官: mobile, user experience
- AI应用工程官: chatbot quality (if applicable)

## Execution

This workflow orchestrates multiple sub-audits. Each sub-audit uses its own skill.

### Phase 1: Parallel Audits (run simultaneously where possible)

1. **Screenshot Loop** → invoke screenshot-loop skill
   - All key pages screenshotted at 3 viewports
   - Design system compliance verified
   - Visual hierarchy assessed

2. **Mobile QA** → invoke mobile-qa skill
   - Touch targets verified
   - Text readability verified
   - Navigation accessible
   - Key flows tested on mobile

3. **Accessibility Audit** → invoke accessibility-audit skill
   - WCAG 2.1 AA compliance
   - Contrast, keyboard nav, ARIA, semantics

4. **Performance Audit** → invoke performance-audit skill
   - Core Web Vitals
   - Bundle size
   - Image optimization
   - Font strategy

5. **Architecture Check** → invoke review-checklist + risk-scan skills
   - Code quality
   - Security scan
   - Dependencies audit

6. **Chatbot Hardening** (if AI/chatbot features) → invoke chatbot-hardening skill
   - 8-dimension assessment
   - Production gap analysis

### Phase 2: User Reality Test

After technical audits pass:
- Invoke user-reality-test with minimum 3 personas
- Focus: can real users complete key flows?
- Launch blockers from personas = P0 fix tasks

### Phase 3: Compile Report

Write report to target project's `docs/production-readiness-report.md`:

```markdown
# Production Readiness Report

Date: <ISO>
Product: <name>

## Overall Verdict: READY / CONDITIONAL / NOT READY

## Audit Results

| Check | Score | Verdict | Key Issues |
|-------|-------|---------|------------|
| UX Clarity | X/10 | PASS/FAIL | ... |
| Mobile | X/10 | PASS/FAIL | ... |
| Accessibility | X/10 | PASS/FAIL | ... |
| Performance | X/10 | PASS/FAIL | ... |
| Design Compliance | X/10 | PASS/FAIL | ... |
| Architecture | X/10 | PASS/FAIL | ... |
| Chatbot (if applicable) | X/10 | PASS/FAIL | ... |
| Error Recovery | X/10 | PASS/FAIL | ... |
| Observability | X/10 | PASS/FAIL | ... |
| Review Gates | X/10 | PASS/FAIL | ... |

## Blockers (must fix before launch)
1. ...

## Warnings (should fix, not blocking)
1. ...

## Launch Recommendation
[go/conditional-go/no-go with reasoning]
```

### Phase 4: Generate Fix Tasks

If NOT READY:
- Each blocker becomes a task in execution-plan.yaml
- Tasks have dependencies, risk levels, owners
- Re-audit required after fixes

## Verdict Logic

- **READY**: All 10 checks PASS, no blockers
- **CONDITIONAL**: All critical checks PASS (UX, Mobile, Architecture), max 2 checks CONDITIONAL
- **NOT READY**: Any critical check FAIL, or more than 2 checks CONDITIONAL

Commander makes final ship decision based on this report.

## Risk Guardrails
- L1: read-only audit, writes report only
- Does NOT deploy or push
- Does NOT auto-fix (generates tasks for build-feature)
- Commander escalation required if CONDITIONAL verdict

## Handoff
- Feeds into: launch-and-growth (final gate)
- Fix tasks feed into: build-feature
- Report written to: docs/production-readiness-report.md
