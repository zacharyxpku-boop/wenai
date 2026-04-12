---
name: competitive-teardown
description: "Analyze competitor products by extracting their design tokens, payment funnels, viral mechanics, and copywriting patterns. Use when: planning ANY new feature (check if competitors do it better), auditing product quality (compare our output to theirs), designing pricing (see what competitors charge), or the user mentions any competitor name. Invoke with /competitive-teardown <url> or trigger automatically when task references competing products, market research, or 'how does X do it'. Tools: WebFetch, firecrawl, or manual URL analysis."
---

# Competitive Teardown — 竞品拆解

## Input
A competitor URL. Common targets: taotaoxi.com, cece.com, lingji.com, personality-database.com, zuoyebang.com, duolingo.com

## Execution (5 steps, all required)

### Step 1: Scrape 5 Key Pages
Use WebFetch to grab: homepage, core product, results page, pricing/paywall, share page

### Step 2: Design Extraction
For each page extract: font family + sizes, color palette, spacing, animations, layout pattern

### Step 3: Payment Funnel Map
```
FREE: what users get for ¥0
TEASE: what's visible but locked
TRIGGER: the moment users WANT to pay
PRICE: amount + model (subscription/one-time)
FRICTION: clicks from "want" to "paid"
```

### Step 4: Viral Mechanics
- Share button placement + prominence
- What gets shared (text/image/card/link)
- Does shared content create CURIOSITY in receiver?
- Two-player/pair mechanic?
- Referral tracking?

### Step 5: Copy DNA
- Hero headline (exact words)
- CTA text (exact words)
- 10-word product description
- Trust-building approach
- Tone: playful / mystical / scientific / casual

## Mandatory Output

```
TEARDOWN:
  competitor: [name]
  url: [url]

  DESIGN:
    font: [family]
    palette: [colors]
    vibe: [one word]

  PAYMENT:
    free: [what's free]
    price: [amount + model]
    trigger: [when users want to pay]
    friction: [click count]

  VIRAL:
    share_type: [what gets shared]
    pair_mechanic: YES/NO
    receiver_hook: [what makes receiver try]

  COPY:
    hero: "[exact headline]"
    cta: "[exact button text]"
    tone: [one word]

  STEAL: [3 things to copy immediately]
  WE_WIN: [1 thing we already do better]
  VERDICT: AHEAD / EVEN / BEHIND
```
