---
name: reference-extraction
description: "ALWAYS use before design-system-bootstrap. Extract real design patterns from reference websites using WebFetch/firecrawl/preview_*. Outputs engineering constraints, not vague inspiration."
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, WebSearch, WebFetch, mcp__Claude_Preview__preview_start, mcp__Claude_Preview__preview_screenshot, mcp__Claude_Preview__preview_eval, mcp__Claude_Preview__preview_inspect, mcp__Claude_Preview__preview_resize, mcp__Claude_Preview__preview_snapshot, mcp__Claude_Preview__preview_network
argument-hint: "<reference URL or product category>"
---

# Reference Extraction — EXECUTABLE Pattern Mining

Extract REAL design patterns from REAL websites and translate them into engineering constraints.
**This skill MUST precede design-system-bootstrap.** Without reference data, design systems are generic.

## Phase 1: Find References

If user provides URLs, use those. Otherwise, search:

```
WebSearch({ query: "<product category> best website design 2025 2026" })
```

Select 2-3 sites that are:
- Mature, intentional design (NOT AI-generated — check for Inter + purple gradient tells)
- Recent (2024-2026)
- Same product category as the target
- Known for good design (Awwwards, SiteInspire level)

## Phase 2: Extract Patterns with WebFetch

For each reference URL, execute ALL of these:

### 2a. Fetch and analyze HTML/CSS structure
```
WebFetch({
  url: "<REFERENCE_URL>",
  prompt: "Extract these design patterns:
    1. Font families used (heading, body, mono)
    2. Font sizes for h1, h2, h3, body, small text
    3. Colors: primary, secondary, accent, background, text, muted
    4. Spacing: section padding, component gaps, container max-width
    5. Border radius values used
    6. Shadow values used
    7. Layout patterns: grid columns, flex patterns, max-width
    8. CTA button styling: size, color, shape, hover state
    9. Hero section: height, alignment, content structure
    10. Navigation: style, position, height
    Output as structured data."
})
```

### 2b. Analyze visual approach
```
WebFetch({
  url: "<REFERENCE_URL>",
  prompt: "Describe the overall visual approach:
    1. Light or dark mode? Both?
    2. Minimalist or maximalist?
    3. Photography, illustration, or abstract?
    4. Animation: scroll-driven? Hover effects? Page transitions?
    5. Information density: spacious or compact?
    6. Typography personality: geometric, humanist, serif, display?
    7. Color temperature: warm, cool, neutral?
    8. What makes this site feel NOT like AI-generated?
    Output as bullet points."
})
```

### 2c. If firecrawl available, deep extract
```bash
# Check if firecrawl is configured
if [ -n "$FIRECRAWL_API_KEY" ]; then
  curl -s -X POST "https://api.firecrawl.dev/v1/scrape" \
    -H "Authorization: Bearer $FIRECRAWL_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"url\":\"<REFERENCE_URL>\",\"formats\":[\"markdown\",\"screenshot\"]}" \
    -o /tmp/ref-extract.json
fi
```

### 2d. If building a local app, visit reference via preview tools

If you can navigate to the reference URL in a preview browser:
```
preview_eval({ serverId, expression: "window.location.href = '<REFERENCE_URL>'" })
preview_screenshot({ serverId })  // visual capture
preview_inspect({ serverId, selector: "h1", styles: ["font-family", "font-size", "line-height", "font-weight", "color"] })
preview_inspect({ serverId, selector: "body", styles: ["font-family", "font-size", "line-height", "color", "background-color"] })
preview_inspect({ serverId, selector: "nav", styles: ["height", "padding", "background-color", "position"] })
preview_inspect({ serverId, selector: "button, .btn, [class*=btn]", styles: ["background-color", "color", "padding", "border-radius", "font-size", "font-weight"] })
preview_inspect({ serverId, selector: "section, [class*=section]", styles: ["padding-top", "padding-bottom"] })
preview_inspect({ serverId, selector: ".container, [class*=container], [class*=wrapper], main", styles: ["max-width", "padding-left", "padding-right"] })
```

## Phase 3: Pattern Translation

Convert raw observations into engineering constraints:

| Observed | Translated Constraint |
|----------|----------------------|
| h1: Geist Sans 64px/1.1 900 | `--font-heading: 'Geist Sans', sans-serif; --text-6xl: 4rem; --leading-tight: 1.1` |
| Sections: 96px desktop, 48px mobile | `--section-gap: clamp(3rem, 6vw, 6rem)` |
| Primary: #0070F3 | `--color-primary: #0070F3; --color-primary-hover: #0060df` |
| Container: 1200px | `--container-max: 75rem; --container-padding: clamp(1rem, 3vw, 2rem)` |
| Cards: 8px radius, 1px border | `--radius-card: 0.5rem; --border-card: 1px solid var(--color-border)` |
| CTA: 48px height, 24px padding-x | `--btn-height: 3rem; --btn-px: 1.5rem` |

## Phase 4: Output

Write `docs/reference-analysis.md` in target project:

```markdown
# Reference Analysis
Generated: <date>

## Sources
1. <URL1> — <what we extracted>
2. <URL2> — <what we extracted>

## Typography System
| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| h1 | ... | ... | ... | ... |
| h2 | ... | ... | ... | ... |
| body | ... | ... | ... | ... |

## Color Palette
| Role | Value | Usage |
|------|-------|-------|
| Primary | #... | CTA, links, accents |
| Background | #... | Page background |
| Text | #... | Body copy |

## Spacing System
| Token | Value | Responsive |
|-------|-------|-----------|
| section-gap | ... | clamp(...) |
| component-gap | ... | ... |
| container-max | ... | ... |

## Component Patterns
- Hero: ...
- Navigation: ...
- Cards: ...
- CTA buttons: ...

## Animation Patterns
- Scroll effects: ...
- Hover states: ...
- Page transitions: ...

## Anti-Patterns Avoided (what makes this NOT look AI-generated)
- ...
```

This file feeds directly into:
- **design-system-bootstrap** → uses these values as seed tokens
- **screenshot-loop** → compares output quality against reference level
- **frontend-design** → uses animation and layout patterns

## Risk Guardrails
- Read-only analysis, writes docs only
- Extracts patterns (proportions, rhythm), not specifics (exact branding)
- Credits all reference sites
