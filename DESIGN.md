# Clico AI Video Dashboard — Design System

**Style:** Vercel/Linear — clean, functional, data-dense. Agency SaaS tool.
**Last updated:** 2026-04-12

---

## Anti-Patterns (NEVER USE)

- NO Inter, Roboto, or Poppins fonts
- NO purple-blue gradients (`from-purple-500 to-blue-500` etc.)
- NO `rounded-3xl` + `shadow-2xl` combo
- NO three-column equal-width card layouts
- NO `shadow-xl` or larger unless explicitly specified below

---

## Typography

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
font-family-mono: 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', Consolas, monospace;
```

Tailwind config override:
```js
fontFamily: {
  sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
  mono: ['"SF Mono"', '"Fira Code"', 'Consolas', 'monospace'],
}
```

### Scale

| Token | Tailwind Class | Usage |
|-------|---------------|-------|
| `text-xs` | `text-xs` (12px) | Captions, metadata, badge labels |
| `text-sm` | `text-sm` (14px) | Table cells, form labels, secondary body |
| `text-base` | `text-base` (16px) | Primary body, card descriptions |
| `text-lg` | `text-lg` (18px) | Card titles, section headers |
| `text-xl` | `text-xl` (20px) | Page section headings |
| `text-2xl` | `text-2xl` (24px) | Page titles |
| `text-3xl` | `text-3xl` (30px) | Hero/metric numbers only |

### Weight

| Usage | Class |
|-------|-------|
| Normal body | `font-normal` |
| Table header, label | `font-medium` |
| Page title, card title | `font-semibold` |
| Metric numbers | `font-bold` |

---

## Color Tokens

### Palette (Monochrome + Emerald Accent)

```
Background:    #0a0a0a  (zinc-950)
Surface:       #111111  (zinc-900)
Surface-2:     #1a1a1a  (zinc-800/50)
Border:        #262626  (zinc-800)
Border-subtle: #1f1f1f  (zinc-900)

Text-primary:  #fafafa  (zinc-50)
Text-secondary:#a1a1aa  (zinc-400)
Text-muted:    #71717a  (zinc-500)
Text-disabled: #52525b  (zinc-600)

Accent:        #10b981  (emerald-500)  ← primary CTA, links, active nav
Accent-hover:  #059669  (emerald-600)
Accent-subtle: #064e3b  (emerald-900)  ← background for accent highlights

Destructive:   #ef4444  (red-500)
Destructive-subtle: #450a0a (red-950)

Warning:       #f59e0b  (amber-500)
Warning-subtle:#451a03  (amber-950)

Success:       #10b981  (emerald-500)  ← same as accent
```

### Tailwind Class Mapping

| Token | Class |
|-------|-------|
| bg-base | `bg-zinc-950` |
| bg-surface | `bg-zinc-900` |
| bg-surface-2 | `bg-zinc-800` |
| border | `border-zinc-800` |
| text-primary | `text-zinc-50` |
| text-secondary | `text-zinc-400` |
| text-muted | `text-zinc-500` |
| accent | `text-emerald-500` / `bg-emerald-500` |
| destructive | `text-red-500` / `bg-red-500` |
| warning | `text-amber-500` |

---

## Spacing Scale

Follow 4px base unit. Use Tailwind's default spacing (1 = 4px).

| Token | px | Tailwind |
|-------|-----|---------|
| xs | 4px | `p-1` / `gap-1` |
| sm | 8px | `p-2` / `gap-2` |
| md | 12px | `p-3` / `gap-3` |
| base | 16px | `p-4` / `gap-4` |
| lg | 24px | `p-6` / `gap-6` |
| xl | 32px | `p-8` / `gap-8` |
| 2xl | 48px | `p-12` / `gap-12` |

---

## Component Patterns

### Cards

```html
<!-- Standard data card -->
<div class="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
  <h3 class="text-sm font-medium text-zinc-50">Card Title</h3>
  <p class="text-sm text-zinc-400 mt-1">Description or value</p>
</div>

<!-- Metric card (large number) -->
<div class="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
  <p class="text-xs text-zinc-500 uppercase tracking-wide">Total Jobs</p>
  <p class="text-3xl font-bold text-zinc-50 mt-1">142</p>
  <p class="text-xs text-zinc-400 mt-1">+12 this week</p>
</div>
```

Rules: `rounded-lg` max. `shadow-sm` only if needed. Never `shadow-xl`.

### Buttons

```html
<!-- Primary (CTA) -->
<button class="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
  Submit Job
</button>

<!-- Secondary (outline) -->
<button class="border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-zinc-50 text-sm font-medium px-4 py-2 rounded-md transition-colors bg-transparent">
  Cancel
</button>

<!-- Destructive -->
<button class="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
  Delete
</button>

<!-- Ghost (icon buttons, secondary actions) -->
<button class="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 p-2 rounded-md transition-colors">
  <!-- icon -->
</button>

<!-- Disabled state (any button) -->
<button class="... opacity-50 cursor-not-allowed" disabled>...</button>
```

### Form Inputs

```html
<!-- Text input -->
<input class="w-full bg-zinc-900 border border-zinc-700 text-zinc-50 placeholder-zinc-500 text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500" />

<!-- Label -->
<label class="block text-sm font-medium text-zinc-300 mb-1">Field Label</label>

<!-- Error message -->
<p class="text-xs text-red-400 mt-1">This field is required</p>

<!-- Select -->
<select class="w-full bg-zinc-900 border border-zinc-700 text-zinc-50 text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500">
  <option>Option 1</option>
</select>
```

### Data Tables

Rules: left-aligned text, right-aligned numbers, alternating row backgrounds, sticky header.

```html
<div class="overflow-x-auto">
  <table class="w-full text-sm">
    <thead>
      <tr class="border-b border-zinc-800">
        <th class="text-left text-xs font-medium text-zinc-500 uppercase tracking-wide px-4 py-3">Job</th>
        <th class="text-left text-xs font-medium text-zinc-500 uppercase tracking-wide px-4 py-3">Client</th>
        <th class="text-right text-xs font-medium text-zinc-500 uppercase tracking-wide px-4 py-3">Cost</th>
        <th class="text-left text-xs font-medium text-zinc-500 uppercase tracking-wide px-4 py-3">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
        <td class="text-left text-zinc-50 px-4 py-3">Job name</td>
        <td class="text-left text-zinc-400 px-4 py-3">Client name</td>
        <td class="text-right text-zinc-400 font-mono px-4 py-3">$0.93</td>
        <td class="text-left px-4 py-3"><!-- badge --></td>
      </tr>
    </tbody>
  </table>
</div>
```

Alternating rows: odd rows `bg-transparent`, even rows `bg-zinc-900/30`. Use hover `bg-zinc-800/30`.

### Status Badges / Pills

```html
<!-- queued — gray -->
<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400">
  queued
</span>

<!-- processing — amber -->
<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-950 text-amber-400">
  processing
</span>

<!-- complete — emerald -->
<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-400">
  complete
</span>

<!-- failed — red -->
<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-950 text-red-400">
  failed
</span>

<!-- delivered — blue -->
<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-950 text-blue-400">
  delivered
</span>
```

### Progress / Step Indicators

```html
<!-- Step with status icon -->
<div class="flex items-center gap-3">
  <div class="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
    <svg class="w-3 h-3 text-white"><!-- checkmark --></svg>
  </div>
  <span class="text-sm text-zinc-300">Step completed</span>
</div>

<!-- Loading spinner -->
<div class="w-5 h-5 rounded-full border-2 border-zinc-700 border-t-emerald-500 animate-spin"></div>
```

### Sidebar Nav Items

```html
<!-- Active -->
<a class="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-800 text-zinc-50 text-sm font-medium">
  <!-- icon --> Dashboard
</a>

<!-- Inactive -->
<a class="flex items-center gap-2 px-3 py-2 rounded-md text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 text-sm transition-colors">
  <!-- icon --> Jobs
</a>
```

### Dividers

```html
<hr class="border-zinc-800" />
```

---

## Layout Patterns

### Dashboard Layout (Client Portal)

Fixed sidebar `w-56`, scrollable main area.

```html
<div class="flex h-screen bg-zinc-950 overflow-hidden">
  <!-- Sidebar -->
  <aside class="w-56 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col">
    <!-- Logo -->
    <div class="h-14 flex items-center px-4 border-b border-zinc-800">
      <span class="text-sm font-semibold text-zinc-50">Clico</span>
    </div>
    <!-- Nav -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <!-- Nav items here -->
    </nav>
    <!-- Credit meter (bottom) -->
    <div class="p-4 border-t border-zinc-800">
      <!-- CreditMeter component -->
    </div>
  </aside>

  <!-- Main content -->
  <main class="flex-1 overflow-y-auto">
    <!-- Top bar -->
    <header class="h-14 border-b border-zinc-800 flex items-center px-6 sticky top-0 bg-zinc-950/80 backdrop-blur-sm z-10">
      <h1 class="text-base font-semibold text-zinc-50">Page Title</h1>
    </header>
    <!-- Page content -->
    <div class="p-6">
      <!-- content -->
    </div>
  </main>
</div>
```

### Admin Layout

Same structure, different nav items. Admin sidebar may include a "Queue Health" indicator dot.

### Page Content Width

```html
<!-- Standard content max-width -->
<div class="max-w-6xl mx-auto">...</div>

<!-- Narrow (forms, settings) -->
<div class="max-w-2xl mx-auto">...</div>

<!-- Full-width (tables, Kanban) -->
<div class="w-full">...</div>
```

### Kanban Board (SOP)

```html
<div class="flex gap-4 overflow-x-auto pb-4">
  <!-- Column -->
  <div class="flex-shrink-0 w-64 bg-zinc-900 border border-zinc-800 rounded-lg">
    <div class="p-3 border-b border-zinc-800 flex items-center justify-between">
      <h3 class="text-xs font-medium text-zinc-400 uppercase tracking-wide">Client</h3>
      <span class="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">3</span>
    </div>
    <div class="p-2 space-y-2">
      <!-- Job cards here -->
    </div>
  </div>
</div>
```

### Empty States

```html
<div class="flex flex-col items-center justify-center py-16 text-center">
  <div class="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4">
    <!-- icon -->
  </div>
  <h3 class="text-sm font-medium text-zinc-50 mb-1">No jobs yet</h3>
  <p class="text-sm text-zinc-400 mb-4">Submit your first job to get started.</p>
  <button class="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
    New Job
  </button>
</div>
```

---

## Icons

Use `lucide-react` (already common in Next.js projects). Size: `w-4 h-4` for inline, `w-5 h-5` for nav, `w-6 h-6` for hero.

```tsx
import { ChevronRight, AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react'
```

---

## Responsive Breakpoints

This is a SaaS dashboard — desktop-first. Mobile is not the primary use case.

| Breakpoint | Behavior |
|-----------|----------|
| `< lg` (1024px) | Sidebar collapses to icon-only or hidden |
| `>= lg` | Full sidebar + main content |

Use `lg:` prefix for desktop-specific rules.

---

## Dark Mode

Dark mode only. Do not implement light mode toggle. `bg-zinc-950` is the base. The dashboard assumes a dark environment (operator workspace, editing context).

---

## Animation

Minimal. Only transition-colors and transition-opacity. No bounce, no spring physics.

```
transition-colors duration-150
transition-opacity duration-150
```

For loading states, use `animate-spin` on spinner circles only.
