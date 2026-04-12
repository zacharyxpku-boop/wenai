---
name: design-system-bootstrap
description: "MANDATORY before writing ANY UI code in a new project. If no design-system.md exists, STOP and run this first. Uses reference-extraction to analyze real sites, then generates tokens. Without this, all output will be generic AI aesthetics. Enforcement gate in commander-core blocks UI tasks without design system."
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, WebSearch, WebFetch
argument-hint: "<project path or brand description>"
---

# Design System Bootstrap

Create a production-grade design system for a target project before any UI code is written.

## Trigger Phrases
- "建设计系统"
- "先定视觉规范"
- "不要 AI 默认风格"
- "品牌视觉"
- "design system"
- "design tokens"
- "视觉约束"

## Default Participants
- 增长官 (lead): brand identity, color, typography direction
- 铁律官: component architecture, responsive strategy, token implementation
- 尺子官: verify contrast ratios, a11y compliance

## Prerequisites
- Project has a clear product concept (from idea-to-plan or user input)
- Brand personality defined (at minimum: 3-5 adjectives)

## Phase 1: Brand Discovery

1. Ask or extract from existing docs:
   - What is the product?
   - Who is the target user?
   - What 3-5 adjectives describe the brand personality?
   - What should this product NOT look like? (anti-patterns)
   - Any existing brand assets (logo, colors)?

2. If reference websites are available, run reference-extraction first.

## Phase 2: Design Token Generation

Using docs/design-system.md as the template, generate project-specific tokens:

1. **Color palette**: Based on brand personality, NOT AI defaults
   - Verify: primary/background contrast >= 4.5:1
   - Verify: text/background contrast >= 4.5:1
   - Reject: generic purple-to-blue gradients (unless explicitly brand-appropriate)

2. **Typography**: Select fonts that match personality
   - Heading font: expressive, matches brand
   - Body font: highly readable, clean
   - Define full scale: h1 through caption with mobile overrides

3. **Spacing system**: Define base unit and scale
   - Consistent multiples (4px or 8px base)
   - Page margins for each breakpoint
   - Max content width

4. **Component specs**: Define core components
   - Buttons (primary, secondary, ghost + states)
   - Inputs (default + states)
   - Cards (default + hover)
   - Navigation (desktop + mobile)

5. **Animation rules**: Define timing, easing, triggers
   - Must communicate, not decorate
   - Respect prefers-reduced-motion

6. **Responsive breakpoints**: Mobile-first approach

7. **Accessibility baseline**: Required standards

## Phase 3: Output

Write `docs/design-system.md` in the target project following the template from cc24h's docs/design-system.md.

The file must be:
- Specific (actual hex values, actual pixel values, actual font names)
- Opinionated (clear decisions, not "choose from these options")
- Enforceable (reviewers can verify compliance by checking values)
- Non-generic (would NOT work for a different product)

## Phase 4: Validation

Before finalizing, verify:
- [ ] Color contrast ratios pass WCAG AA
- [ ] Typography scale is visually distinct at each level
- [ ] Spacing scale provides enough variety without chaos
- [ ] Component specs cover all common patterns
- [ ] Animation rules won't impact performance
- [ ] Mobile breakpoints are practical
- [ ] The system does NOT look like AI default output

## Risk Guardrails
- L2: generates docs, does not write code
- Does NOT auto-generate CSS/code from the system (that's the builder's job)
- Does NOT override existing brand guidelines if they exist
- Requires review before builders can reference it

## Handoff
- Output file: target project's `docs/design-system.md`
- Feeds into: build-feature (builders reference tokens), screenshot-loop (verify compliance), design-review (audit against spec)
