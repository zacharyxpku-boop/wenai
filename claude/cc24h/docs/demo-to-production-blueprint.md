# Demo to Production Blueprint

Date: 2026-03-20
Purpose: Transform cc24h from "can build demos" to "consistently produces production-grade output"

## Why Demos Stay Demos

Six structural reasons Claude Code output gets stuck at demo quality:

1. **No visual constraint** — Without a design system, every build inherits AI default aesthetics (purple gradients, generic cards, stock hero sections). The model optimizes for "looks reasonable" not "matches brand".

2. **No visual feedback** — The builder cannot see what it builds. Text-based code review catches logic bugs but misses layout issues, spacing problems, visual hierarchy failures, and mobile breakage.

3. **No reference anchor** — Without studying real production sites, output lacks the spacing rhythm, visual maturity, and information architecture patterns that distinguish polished products from prototypes.

4. **No real device testing** — Desktop viewport checks pass, but actual phone experience (touch targets, scroll behavior, font readability, load time) goes unverified.

5. **No accessibility baseline** — WCAG compliance is mentioned in briefs but never validated. Color contrast, keyboard navigation, screen reader support, and semantic HTML are afterthoughts.

6. **No performance budget** — Bundle size, image optimization, lazy loading, Core Web Vitals (LCP/CLS/INP) have no enforcement mechanism.

## Gap Resolution Map

### Gap 1: Design System Enforcement
| Aspect | Solution |
|--------|----------|
| Problem | AI default aesthetics |
| Solve with | Skill: design-system-bootstrap |
| How | Before any UI work, generate project-specific design-system.md defining colors, typography, spacing, components, animation rules, responsive breakpoints |
| Enforcement | Rule: builders must reference design-system.md; reviewers verify compliance |
| Workflow | design-system-bootstrap (new) |

### Gap 2: Visual Feedback Loop
| Aspect | Solution |
|--------|----------|
| Problem | Cannot see output |
| Solve with | Skill: screenshot-loop + gstack /browse integration |
| How | After each UI change: screenshot → analyze → identify issues → fix → re-screenshot → verify |
| Enforcement | Workflow gate: screenshot-loop must pass before submit |
| Workflow | screenshot-loop (new) |

### Gap 3: Reference-Driven Design
| Aspect | Solution |
|--------|----------|
| Problem | Generic output without design maturity |
| Solve with | Skill: reference-extraction |
| How | Crawl reference sites → extract spacing rhythm, color patterns, component hierarchy, interaction patterns → generate engineering constraints |
| Enforcement | Reference analysis happens in idea-to-plan Phase 2 (design) |
| Workflow | reference-driven-design (new) |

### Gap 4: Mobile-First QA
| Aspect | Solution |
|--------|----------|
| Problem | Broken on real phones |
| Solve with | Skill: mobile-qa |
| How | gstack browse responsive (375x812, 768x1024, 1280x720) → verify touch targets (min 44px) → check font readability → test scroll behavior |
| Enforcement | Part of production-readiness-audit, blocks launch |
| Workflow | mobile-a11y-performance-pass (new) |

### Gap 5: Accessibility
| Aspect | Solution |
|--------|----------|
| Problem | Excludes users, fails compliance |
| Solve with | Skill: accessibility-audit |
| How | Check WCAG 2.1 AA: contrast ratios, alt text, ARIA labels, keyboard navigation, focus management, semantic HTML, heading hierarchy |
| Enforcement | Part of production-readiness-audit, blocks launch |
| Workflow | mobile-a11y-performance-pass (new) |

### Gap 6: Performance
| Aspect | Solution |
|--------|----------|
| Problem | Slow loads, poor Core Web Vitals |
| Solve with | Skill: performance-audit |
| How | Check bundle size, image formats (WebP/AVIF), lazy loading, code splitting, font loading strategy, LCP target (<2.5s), CLS target (<0.1) |
| Enforcement | Part of production-readiness-audit, blocks launch |
| Workflow | mobile-a11y-performance-pass (new) |

## New Capability Layer

### New Skills (7)
| Skill | Type | Risk | Purpose |
|-------|------|------|---------|
| design-system-bootstrap | Workflow skill | L2 | Generate project-specific design system before coding |
| screenshot-loop | Workflow skill | L1 | Visual feedback: screenshot → analyze → fix → verify |
| reference-extraction | Analysis skill | L1 | Extract design patterns from reference websites |
| mobile-qa | Quality skill | L1 | Mobile viewport, touch target, font, scroll QA |
| accessibility-audit | Quality skill | L1 | WCAG 2.1 AA compliance check |
| performance-audit | Quality skill | L1 | Core Web Vitals, bundle size, optimization check |
| production-readiness-audit | Workflow skill | L1 | Combined ship gate (all checks) |

### New Workflows (4)
| Workflow | Trigger | Roles | Flow |
|----------|---------|-------|------|
| design-system-bootstrap | Before any UI project | 增长官 → 铁律官 | Define brand → Generate design tokens → Create component spec → Write design-system.md |
| screenshot-loop | After UI changes | 快刀官 + gstack browse | Screenshot → Analyze → Fix → Re-screenshot → Verify pass |
| reference-driven-design | During idea-to-plan Phase 2 | 增长官 → 铁律官 | Select references → Extract patterns → Generate constraints → Apply to design-spec |
| production-readiness-audit | Before launch | 尺子官 (lead) + all | Mobile QA → A11y audit → Perf audit → UX review → Chatbot hardening → Go/no-go |

### Strengthened Workflows (3)
| Workflow | Change |
|----------|--------|
| idea-to-plan | Phase 2 now includes reference-driven-design |
| build-feature | Submit gate now requires screenshot-loop pass for UI tasks |
| launch-and-growth | Now includes full production-readiness-audit |

## Implementation Priority

### Wave 1: Highest ROI (do first)
1. design-system-bootstrap skill + workflow
2. screenshot-loop skill + workflow
3. production-readiness-audit skill + workflow

### Wave 2: Quality enforcement
4. reference-extraction skill
5. mobile-qa skill
6. accessibility-audit skill
7. performance-audit skill

### Wave 3: Integration hardening
8. Update build-feature to require screenshot-loop for UI tasks
9. Update launch-and-growth to require production-readiness-audit
10. Update idea-to-plan to include reference-driven-design

## Success Criteria

This upgrade succeeds when:
1. No UI task can be submitted without passing screenshot-loop
2. No product can launch without passing production-readiness-audit
3. Every new UI project starts with design-system-bootstrap
4. Reference analysis is standard practice in idea-to-plan
5. Mobile, a11y, and performance checks are automated and mandatory
