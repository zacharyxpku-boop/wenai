# Wenai Design System

> Industrial Editorial — dark, precise, warm amber accent

## Aesthetic Direction

**Tone**: Professional B2B SaaS for cross-border e-commerce. Dark theme with industrial precision. Not flashy, not playful. Think Bloomberg Terminal meets Linear.

**Key characteristic**: Information density without clutter. Every pixel serves a purpose.

## Typography

- **Display**: Outfit (variable, sans-serif) — headlines, module names, navigation
- **Mono**: IBM Plex Mono — labels, stats, metadata, button text, data values
- **Body**: Outfit at smaller weights — paragraph text, descriptions

### Scale
- Page title: `text-base font-semibold` (Outfit)
- Section label: `text-[10px] font-mono uppercase tracking-widest` (IBM Plex Mono)
- Body text: `text-[13px]` (Outfit)
- Button text: `text-[11px] font-mono`
- Metadata: `text-[10px] font-mono`

## Colors

```css
--color-bg-root: #0e0e11       /* page background */
--color-bg-surface: #16161a    /* cards, panels */
--color-bg-raised: #1e1e23     /* inputs, elevated surfaces */
--color-bg-hover: #242429      /* hover states */
--color-border-subtle: #2a2a30 /* default borders */
--color-border-default: #35353d /* active/hover borders */
--color-text-primary: #ececf0  /* headings, important text */
--color-text-secondary: #8b8b95 /* body text */
--color-text-tertiary: #5c5c66 /* labels, metadata */
--color-accent: #c8975a        /* primary action, amber */
--color-accent-hover: #d9a86b  /* hover state */
--color-accent-dim: rgba(200, 151, 90, 0.10) /* subtle backgrounds */
```

### Category Colors (4 operational layers)
- Execute: `#c8975a` (amber — matches brand accent)
- Content: `#6ea8d7` (muted blue)
- Intel: `#9b8ec4` (muted purple)
- Service: `#5bb89a` (muted green)

### Semantic
- Success: `#4ade80`
- Error: `#ef4444`
- Warning: amber accent

## Layout

- **Sidebar**: 240px fixed left, dark surface background
- **Main content**: Fluid, max-width varies by page
- **Spacing**: Tailwind scale, prefer `gap-2/3/4`, generous whitespace
- **Grid**: Dashboard uses responsive grid, no three-equal-columns

## Components

### Buttons
- Primary: `bg-accent text-bg-root rounded-md px-5 py-2`
- Secondary: `border border-border-subtle text-text-tertiary rounded-md px-3 py-1.5`
- Ghost: `text-text-tertiary hover:text-text-primary`
- No `rounded-3xl`, no `shadow-2xl`

### Cards
- Background: `bg-bg-surface`
- Border: `border border-border-subtle`
- Radius: `rounded-md` (never `rounded-3xl`)
- No box-shadow decorations

### Inputs
- Background: `bg-bg-raised` or `bg-bg-surface`
- Border: `border-border-subtle`, focus: `border-border-default`
- Text: `text-[13px]`

### Animation
- Entry: `fadeUp` — 0.4s ease-out, translateY(8px)
- Stagger: 50ms increments via `.stagger-N`
- Spinner: `animate-spin-smooth` — 0.8s linear
- Pulse: `animate-pulse-dot` — 2s ease-in-out
- Transition: `transition-colors` for interactive elements

## Iconography

Geometric SVG icons, no emoji. Each module has a unique icon defined in Sidebar.tsx via inline SVG paths. Style: thin stroke, 16x16 viewBox.

## Texture

- Noise overlay: fractalNoise SVG filter at 3% opacity, fixed position
- Selection highlight: amber at 25% opacity

## Anti-patterns (never do)

- Inter, Roboto, Poppins fonts
- Purple-blue gradients
- `rounded-3xl` + `shadow-2xl`
- Three-column equal-width card grids
- Emoji as icons
- White/light theme
- Generic "AI-powered" marketing aesthetics
