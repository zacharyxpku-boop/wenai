---
name: motion-design
description: "ALWAYS apply when building landing pages, hero sections, or any page with multiple sections. Adds entrance animations, scroll-driven effects, hover states, and page transitions. Static pages are dead pages."
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
argument-hint: "<component or page to animate>"
---

# Motion Design — Make Pages Alive

**Static pages feel like PDFs.** This skill teaches WHEN to animate, WHAT to animate, and HOW to implement it.

## Core Principle: Motion Is Communication

Animation is not decoration. It tells the user:
- Where to look (entrance stagger guides reading order)
- What's interactive (hover states signal clickability)
- What happened (transitions confirm actions)
- How content relates (scroll-linked reveals show narrative flow)

## When to Apply (Mandatory Triggers)

| Building This | MUST Add These |
|--------------|----------------|
| Landing page | Hero entrance, section scroll reveals, CTA pulse/glow |
| Hero section | Text stagger (heading → subtitle → CTA), background subtle motion |
| Card grid | Staggered entrance, hover lift + shadow, click feedback |
| Navigation | Scroll-hide/show, mobile menu slide, active indicator slide |
| Form | Field focus glow, submit loading state, success celebration |
| Modal/Dialog | Backdrop fade, content scale-up, exit reverse |
| Page transition | Fade or slide between routes |
| Data display | Number count-up, chart draw-in, skeleton → content |

## Animation Library: Copy-Paste Patterns

### Pattern 1: Entrance Stagger (Hero/Sections)

```css
/* CSS-only entrance animation */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-in {
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}

.animate-in:nth-child(1) { animation-delay: 0ms; }
.animate-in:nth-child(2) { animation-delay: 120ms; }
.animate-in:nth-child(3) { animation-delay: 240ms; }
.animate-in:nth-child(4) { animation-delay: 360ms; }
```

Tailwind version:
```html
<h1 class="animate-fade-in-up">Title</h1>
<p class="animate-fade-in-up [animation-delay:120ms]">Subtitle</p>
<button class="animate-fade-in-up [animation-delay:240ms]">CTA</button>
```

Add to `tailwind.config.js`:
```js
extend: {
  keyframes: {
    'fade-in-up': {
      '0%': { opacity: '0', transform: 'translateY(24px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
  },
  animation: {
    'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
  },
}
```

### Pattern 2: Scroll-Triggered Reveals

```tsx
// React hook for scroll-triggered animation
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// Usage
function Section({ children }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </div>
  );
}
```

### Pattern 3: CSS-Only Scroll Reveal (No JS)

```css
/* Modern CSS scroll-driven animation (2025+) */
@keyframes reveal {
  from { opacity: 0; transform: translateY(32px); }
  to { opacity: 1; transform: translateY(0); }
}

.scroll-reveal {
  animation: reveal linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 30%;
}
```

### Pattern 4: Hover States (Cards, Buttons, Links)

```css
/* Card hover — subtle lift */
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

/* Button hover — color shift + slight scale */
.btn-primary {
  transition: background-color 0.15s ease, transform 0.1s ease;
}
.btn-primary:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
}
.btn-primary:active {
  transform: scale(0.98);
}

/* Link hover — underline slide */
.link {
  position: relative;
}
.link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: width 0.3s ease;
}
.link:hover::after {
  width: 100%;
}
```

### Pattern 5: Number Count-Up

```tsx
function CountUp({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useScrollReveal();

  useEffect(() => {
    if (!visible) return;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}
```

### Pattern 6: Staggered Grid Entrance

```tsx
function StaggeredGrid({ items }: { items: React.ReactNode[] }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item, i) => (
        <div
          key={i}
          className={`transition-all duration-500 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transitionDelay: visible ? `${i * 100}ms` : '0ms' }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
```

### Pattern 7: Loading/Skeleton States

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(90deg,
    var(--color-muted) 25%,
    var(--color-muted-light, #f0f0f0) 50%,
    var(--color-muted) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
}
```

### Pattern 8: Page Transitions (Next.js/React Router)

```tsx
// Layout wrapper with page transition
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in-up" key={typeof window !== 'undefined' ? window.location.pathname : ''}>
      {children}
    </div>
  );
}
```

## Performance Rules (HARD CONSTRAINTS)

1. **NEVER animate layout properties** (width, height, top, left, margin, padding)
   - Only animate: `transform`, `opacity`, `filter`, `clip-path`
2. **ALWAYS use `will-change` sparingly** — only on elements about to animate
3. **60fps or nothing** — if animation janks, remove it entirely
4. **Respect `prefers-reduced-motion`**:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
5. **Duration guide**: micro-interactions 100-200ms, entrances 300-600ms, page transitions 200-400ms
6. **Easing**: ease-out for entrances, ease-in for exits, ease-in-out for state changes. NEVER use linear for UI.

## Framer Motion Patterns (if installed)

```tsx
import { motion } from 'framer-motion';

// Entrance stagger container
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

<motion.div variants={container} initial="hidden" animate="show">
  <motion.h1 variants={item}>Title</motion.h1>
  <motion.p variants={item}>Subtitle</motion.p>
  <motion.button variants={item}>CTA</motion.button>
</motion.div>
```

## Checklist Before Submitting UI Work

- [ ] Hero section has entrance stagger?
- [ ] Below-fold sections have scroll reveals?
- [ ] Cards/interactive elements have hover states?
- [ ] Buttons have hover + active states?
- [ ] Links have hover indication?
- [ ] Numbers/stats have count-up animation?
- [ ] Loading states use skeleton shimmer?
- [ ] `prefers-reduced-motion` respected?
- [ ] All animations use transform/opacity only?
- [ ] No animation exceeds 600ms?
