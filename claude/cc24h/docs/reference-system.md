# Reference System

Version: 1.0
Purpose: Extract design intelligence from reference websites to elevate output quality

## Why This Exists

Without reference anchoring, Claude Code produces output from its training distribution — which converges on "AI default aesthetics." Reference-driven design extracts the patterns that make real products feel mature, then converts those patterns into engineering constraints.

This is NOT copying. This is pattern extraction and translation.

## What We Extract

From each reference site, extract these patterns:

### 1. Spacing Rhythm
- Section-to-section gaps (vertical breathing room)
- Component-to-component spacing within sections
- Internal component padding
- Page margin/gutter patterns
- Whether spacing increases with viewport size (and by how much)

### 2. Visual Hierarchy
- How do they make the most important thing obvious?
- How many visual "levels" exist on one page?
- What's the contrast ratio between primary and secondary content?
- How do they use size, color, weight, and whitespace to create hierarchy?

### 3. Color Usage
- How many colors are actively used (not just defined)?
- What's the primary/accent ratio?
- How much of the page is neutral vs. colored?
- Dark/light mode approach

### 4. Typography Patterns
- Heading size progression (h1 to h3 ratio)
- Body text size and line height
- Font weight usage (how many weights, when each is used)
- Text alignment patterns (when centered vs. left-aligned)

### 5. Component Architecture
- Card patterns (shadow vs. border vs. background differentiation)
- Navigation patterns (fixed? transparent on hero? how does it transform on scroll?)
- CTA patterns (placement, size, color, copy style)
- Footer patterns (how much content, layout approach)
- Hero patterns (text-only? image? video? split layout?)

### 6. Interaction Language
- Hover effects (what changes, how fast)
- Scroll behavior (parallax? sticky elements? reveal animations?)
- Transition style (snap? ease? bounce?)
- Loading states and skeleton screens

### 7. Information Architecture
- How is the page structured (sections, flow)?
- What's the narrative arc (problem → solution → proof → action)?
- How deep is the navigation?
- How do they handle long content?

## How to Extract

### Method 1: Visual Analysis (gstack browse)
```bash
B=".claude/skills/gstack/browse/dist/browse"

# Navigate and capture
$B goto https://reference-site.com
$B responsive /tmp/ref-analysis

# Get full page structure
$B snapshot -i -c
$B text

# Extract specific CSS values
$B css "h1" "font-size"
$B css "h1" "line-height"
$B css "h1" "font-weight"
$B css ".hero" "padding"
$B css ".section" "margin-bottom"
$B css ".card" "border-radius"
$B css ".card" "box-shadow"
$B css ".cta" "background-color"
$B css ".cta" "padding"
$B css ".cta" "min-height"

# Check computed layout
$B js "getComputedStyle(document.querySelector('.container')).maxWidth"
```

### Method 2: Content Analysis (web fetch)
- Fetch page HTML
- Parse structure and class naming conventions
- Extract CSS custom properties (design tokens)
- Map section ordering and content flow

## Translation Protocol

Reference patterns → Engineering constraints:

1. **Spacing pattern observed**: "Sections have 80-120px gaps on desktop, 48-64px on mobile"
   → **Constraint**: `section-gap: clamp(3rem, 6vw, 7.5rem)`

2. **Typography pattern observed**: "h1 is 3.5x body size, h2 is 2x, h3 is 1.5x"
   → **Constraint**: `h1: 3.5rem, h2: 2rem, h3: 1.5rem (base: 1rem = 16px)`

3. **Color pattern observed**: "90% neutral, 8% primary, 2% accent"
   → **Constraint**: Document color distribution ratios in design-system.md

4. **Component pattern observed**: "Cards use subtle shadow, no border, 16px radius"
   → **Constraint**: `card: shadow-sm, border-none, rounded-2xl`

5. **Interaction pattern observed**: "Hover lifts cards 2px with shadow increase, 200ms transition"
   → **Constraint**: `card-hover: translateY(-2px), shadow-md, transition 200ms ease`

## Reference Selection Criteria

Good references:
- Match the target product's category (SaaS → SaaS, consumer → consumer)
- Have mature, intentional design (not another AI-generated site)
- Are recent (2024-2026)
- Have good performance (fast-loading)
- Have accessibility basics right

Analyze 2-3 references per project. More than 3 creates conflicting patterns.

## Output

Reference analysis produces a `docs/reference-analysis.md` in the target project:

```markdown
# Reference Analysis

## References Studied
1. [site] — Why selected: [reason]
2. [site] — Why selected: [reason]

## Extracted Patterns

### Spacing
[observations and constraints]

### Typography
[observations and constraints]

### Color
[observations and constraints]

### Components
[observations and constraints]

### Interactions
[observations and constraints]

## Design Constraints (apply to design-system.md)
1. [specific constraint]
2. [specific constraint]
...
```

## When to Use

| Phase | Usage |
|-------|-------|
| idea-to-plan Phase 2 | Select references, extract patterns, inform design-spec |
| design-system-bootstrap | Reference patterns feed into design token decisions |
| screenshot-loop | Compare output against reference quality level |
| design-review | Verify output matches reference-informed constraints |

## Anti-Pattern: Copying

Copying = reproducing specific visual elements (exact layouts, exact colors, exact components).
Extracting = understanding WHY those elements work (proportions, rhythm, hierarchy, contrast).

We extract the WHY, not the WHAT.
