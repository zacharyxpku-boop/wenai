# Design System Specification

Version: 1.0
Purpose: Define how cc24h creates and enforces design systems for target projects

## Why This Exists

Without a design system, Claude Code produces "AI default aesthetics" — visually competent but generic, brand-less, and indistinguishable from other AI-generated sites. A design system constrains output to match intentional brand identity.

## Design System Template

Every UI project built by cc24h must have a `design-system.md` in its docs/ directory. This file is created by the design-system-bootstrap workflow BEFORE any UI coding begins.

### Required Sections

#### 1. Brand Identity
```
Brand name: [name]
Brand personality: [3-5 adjectives, e.g., "bold, trustworthy, playful"]
Visual mood: [description + reference links]
Anti-patterns: [what this brand is NOT, e.g., "not corporate, not childish"]
```

#### 2. Color System
```
Primary:     [hex] — used for CTAs, key actions, brand marks
Secondary:   [hex] — used for supporting elements, secondary actions
Accent:      [hex] — used sparingly for highlights, badges, alerts
Background:  [hex] — primary background
Surface:     [hex] — cards, panels, elevated surfaces
Text:        [hex] — primary text
Text-muted:  [hex] — secondary text, captions
Border:      [hex] — dividers, input borders
Success:     [hex]
Warning:     [hex]
Error:       [hex]

Dark mode variants: [same structure if applicable]
```

Constraints:
- Primary/Background contrast ratio must be >= 4.5:1 (WCAG AA)
- Text/Background contrast ratio must be >= 4.5:1
- Large text (18px+) contrast ratio must be >= 3:1
- Never use pure black (#000000) on pure white (#FFFFFF) — too harsh
- Color palette must NOT be the default AI palette (no generic purple-to-blue gradients unless intentional)

#### 3. Typography
```
Font family (headings): [name] — [why this font]
Font family (body):     [name] — [why this font]
Font family (mono):     [name] — for code blocks

Scale:
  h1:      [size/weight/line-height] — used for [where]
  h2:      [size/weight/line-height] — used for [where]
  h3:      [size/weight/line-height] — used for [where]
  body-lg: [size/weight/line-height] — used for [where]
  body:    [size/weight/line-height] — used for [where]
  body-sm: [size/weight/line-height] — used for [where]
  caption: [size/weight/line-height] — used for [where]

Mobile overrides:
  h1: [mobile size] (typically 60-75% of desktop)
  h2: [mobile size]
```

Constraints:
- Body text minimum 16px on all viewports
- Line height minimum 1.5 for body text
- Maximum line length 65-75 characters (use max-width)
- Font loading: use font-display: swap, preload critical fonts

#### 4. Spacing System
```
Base unit: [e.g., 4px or 0.25rem]

Scale:
  xs:  [value] — inline spacing, icon gaps
  sm:  [value] — between related elements
  md:  [value] — between sections within a component
  lg:  [value] — between components
  xl:  [value] — between page sections
  2xl: [value] — major section separation

Page margins:
  Mobile:  [value]
  Tablet:  [value]
  Desktop: [value]
  Max content width: [value, typically 1200-1440px]
```

Constraints:
- Use consistent spacing scale, never arbitrary values
- Vertical rhythm: prefer multiples of base unit
- Touch targets: minimum 44x44px on mobile

#### 5. Component Specifications
```
Buttons:
  Primary:   [bg, text, border, border-radius, padding, hover state, active state, disabled state]
  Secondary: [same]
  Ghost:     [same]
  Size variants: sm (32px height), md (40px), lg (48px)

Inputs:
  Default:   [border, bg, text, padding, focus state, error state, disabled state]
  Height:    [min 44px for mobile touch]

Cards:
  Default:   [bg, border, border-radius, padding, shadow]
  Hover:     [transform, shadow change]

Navigation:
  Desktop:   [layout, spacing, active state]
  Mobile:    [hamburger/drawer, transition]

Modals/Dialogs:
  Overlay:   [bg opacity]
  Container: [max-width, padding, border-radius]
  Animation: [entry/exit]
```

#### 6. Animation Rules
```
Timing:
  instant:  0ms — toggle states
  fast:     150ms — hover, micro-interactions
  normal:   300ms — transitions, reveals
  slow:     500ms — page transitions, hero animations
  emphasis: 800-1200ms — scroll-driven storytelling moments

Easing:
  default:    cubic-bezier(0.4, 0, 0.2, 1) — standard
  enter:      cubic-bezier(0, 0, 0.2, 1) — decelerate
  exit:       cubic-bezier(0.4, 0, 1, 1) — accelerate
  bounce:     cubic-bezier(0.34, 1.56, 0.64, 1) — playful emphasis

Rules:
  - Animation must communicate, not decorate
  - Scroll-driven animations: use intersection observer, trigger at 20% visible
  - Reduce motion: respect prefers-reduced-motion media query
  - No animation on first paint (LCP impact)
  - Stagger children: 50-100ms delay between siblings
  - Never animate layout properties (width, height, top, left) — use transform/opacity
```

#### 7. Responsive Breakpoints
```
Mobile:    < 640px   — single column, stacked layout
Tablet:    640-1024px — flexible grid, collapsible sidebar
Desktop:   > 1024px   — full layout
Wide:      > 1440px   — max-width container, centered

Approach: Mobile-first (base styles = mobile, add complexity upward)
```

#### 8. Accessibility Baseline
```
Required:
  - All images: descriptive alt text
  - All interactive elements: keyboard accessible
  - All forms: visible labels (no placeholder-only)
  - Focus indicator: visible, 2px+ outline
  - Color: never sole indicator of meaning
  - Heading hierarchy: h1 → h2 → h3, no skipping
  - Landmarks: header, nav, main, footer
  - Skip link: first focusable element

Testing:
  - Tab through entire page
  - Verify with screen reader (VoiceOver/NVDA)
  - Check contrast with axe-core or similar
```

## Anti-Patterns (Reject These)

| Pattern | Why It Fails |
|---------|-------------|
| Purple-to-blue gradient hero | AI cliche, zero brand identity |
| 3-column feature cards with icons | Every AI demo looks like this |
| Generic testimonial carousel | Feels fake, adds no trust |
| "Get Started" as only CTA | Too vague, low conversion |
| Fade-in-on-scroll everywhere | Animation as decoration, not communication |
| White background with grey cards | Safe but forgettable |
| Stock photo hero | Immediately signals "not real" |

## Enforcement

- design-system-bootstrap workflow creates this file BEFORE any UI coding
- Builders must import/reference design tokens from design-system.md
- Reviewers verify component implementations match spec
- screenshot-loop validates visual consistency
- Drift detected = BLOCK until resolved
