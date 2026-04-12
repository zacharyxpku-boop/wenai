# Production Readiness Standard

Version: 1.0
Purpose: Define what "ready to ship" actually means — the gate no product passes without clearing

## The 10-Point Production Checklist

Every product built by cc24h must pass ALL 10 checks before launch. This is not a suggestion — it is a mandatory gate in the launch-and-growth workflow.

### 1. UX Clarity (Owner: 增长官)
- [ ] Value proposition clear in 3 seconds
- [ ] Primary CTA visible above fold on all viewports
- [ ] Navigation intuitive — user can find any feature in 2 clicks
- [ ] Error states are helpful (what went wrong + what to do)
- [ ] Empty states guide users toward action
- [ ] Loading states provide feedback (skeleton, spinner, progress)
- [ ] Confirmation states are clear (what happened + what's next)
- [ ] Copy is concise, scannable, and action-oriented

### 2. Mobile Experience (Owner: 用户战场官 + gstack /qa)
- [ ] All touch targets >= 44x44px
- [ ] Body text >= 16px
- [ ] No horizontal scroll on any viewport < 400px
- [ ] Forms usable with thumb on phone
- [ ] Navigation accessible on mobile (hamburger/bottom nav)
- [ ] Images responsive and not oversized for viewport
- [ ] Key flows completable on mobile (signup, purchase, core action)
- [ ] Tested at 375px (iPhone SE), 390px (iPhone 14), 412px (Pixel)

### 3. Accessibility (Owner: 尺子官)
- [ ] All images have descriptive alt text
- [ ] Color contrast >= 4.5:1 for normal text, >= 3:1 for large text
- [ ] All interactive elements keyboard accessible
- [ ] Tab order logical (follows visual flow)
- [ ] Focus indicator visible (not removed by `outline: none`)
- [ ] Form inputs have visible labels (not placeholder-only)
- [ ] Heading hierarchy correct (h1 > h2 > h3, no skipping)
- [ ] ARIA landmarks present (header, nav, main, footer)
- [ ] Skip navigation link present
- [ ] Reduced motion respected (`prefers-reduced-motion`)

### 4. Performance (Owner: 铁律官)
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] INP (Interaction to Next Paint) < 200ms
- [ ] Total JS bundle < 200KB gzipped (for landing pages)
- [ ] Images in modern format (WebP/AVIF) with appropriate sizing
- [ ] Fonts preloaded with font-display: swap
- [ ] Above-fold content loads without JS where possible
- [ ] Below-fold images lazy loaded
- [ ] No render-blocking resources in critical path
- [ ] Lighthouse Performance score >= 90

### 5. Design System Compliance (Owner: 增长官 + 尺子官)
- [ ] design-system.md exists and is current
- [ ] Colors match defined palette (no arbitrary hex values)
- [ ] Typography matches defined scale
- [ ] Spacing follows defined system
- [ ] Components match specified patterns
- [ ] Animation follows defined timing and easing
- [ ] No visual drift from design spec

### 6. Architecture Quality (Owner: 铁律官)
- [ ] Clear component/module boundaries
- [ ] No circular dependencies
- [ ] Error boundaries around unstable sections
- [ ] State management is predictable and debuggable
- [ ] API calls have timeout, retry, and error handling
- [ ] Environment config externalized (not hardcoded)
- [ ] No secrets in client-side code
- [ ] Build produces optimized output (minified, tree-shaken)

### 7. Chatbot / AI Quality (Owner: AI应用工程官) — if applicable
- [ ] Conversation state maintained across turns
- [ ] Tool calls validated before execution
- [ ] Tool failures handled gracefully
- [ ] Token limits respected (no truncation surprises)
- [ ] Rate limits handled with backoff
- [ ] Fallback responses for AI failures
- [ ] Prompt injection protection
- [ ] Response latency tracked
- [ ] Quality baseline established with test conversations

### 8. Error Recovery (Owner: 铁律官 + 快刀官)
- [ ] Network failures show user-friendly message + retry option
- [ ] API errors don't expose internal details
- [ ] Form data preserved on submission failure
- [ ] Session recovery after disconnect
- [ ] 404 page exists and helps user navigate
- [ ] Global error boundary catches unhandled exceptions
- [ ] Errors logged for debugging (not just swallowed)

### 9. Observability (Owner: 铁律官)
- [ ] Error tracking configured (Sentry or equivalent)
- [ ] Core Web Vitals tracking
- [ ] Key user action analytics (signup, purchase, core feature)
- [ ] API latency monitoring
- [ ] Uptime monitoring
- [ ] Log aggregation for debugging

### 10. Review Gates (Owner: 尺子官 + Commander)
- [ ] All code reviewed (no self-merge)
- [ ] Screenshot loop passed for all UI pages
- [ ] User reality test completed (min 3 personas)
- [ ] Security scan passed (no leaked secrets, no XSS vectors)
- [ ] Dependencies audited (no critical vulnerabilities)
- [ ] Deployment rollback plan documented
- [ ] DNS/domain configured
- [ ] SSL certificate active

## Scoring

Each section is scored:
- **PASS**: All items checked
- **CONDITIONAL**: Minor items unchecked but no blockers
- **FAIL**: Any critical item unchecked

Overall verdict:
- **READY**: All 10 sections PASS
- **CONDITIONAL**: All critical sections PASS, max 2 sections CONDITIONAL
- **NOT READY**: Any section FAIL

## Which Checks Apply

| Product Type | Required Checks |
|-------------|----------------|
| Marketing site / Landing page | 1-6, 8-10 |
| Web application | 1-6, 8-10 |
| AI/Chatbot product | All 10 |
| API / Backend service | 4, 6, 8, 9, 10 |
| Internal tool | 1-4, 6, 8, 10 |

## Integration

This checklist is enforced by the `production-readiness-audit` workflow, which runs during `launch-and-growth` and cannot be bypassed without Commander escalation.
