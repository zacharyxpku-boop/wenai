---
name: asset-brief-pack
description: Generate production-grade visual asset briefs for covers, screenshots, charts, and case images. NOT pixel designs — detailed specs for production.
trigger: after multi-channel-content-pack generates content
---

# Asset Brief Pack

## Purpose
Define exactly what visual assets are needed for each content piece, with enough detail for production (human designer or automated tool).

## When to Use
- After content packs are generated
- When preparing visual materials for any campaign

## Inputs
- Content packs (from multi-channel-content-pack)
- Product design system tokens (if available)
- Current product screenshots

## Execution

### Step 1: Inventory Required Assets
For each content piece, list all visual assets needed:
- Cover images
- Product screenshots
- Result/data displays
- Comparison charts (radar, bar, table)
- Case/testimonial images

### Step 2: Generate Brief per Asset

Template:
```markdown
### Asset: {Name}
- Purpose: {what this image does in the content}
- Type: cover / screenshot / chart / case / comparison
- Dimensions: {W x H, platform-specific}
- Platform: {XHS / WeChat / Zhihu / Universal}
- Text Overlay: {exact text to show on image}
- Background: {color/gradient/photo direction}
- Key Visual Element: {what the eye should see first}
- Trust Signal: {what makes this believable}
- Screenshot Instructions: {if screenshot: which page, what state, what data}
- Chart Data: {if chart: data points, labels, format}
- Do NOT: {specific things to avoid}
```

### Step 3: Reference Design System
If product has design-system.md, pull tokens for:
- Colors (primary, secondary, accent)
- Typography (font family, weights)
- Spacing conventions
- Brand mood

### Step 4: Output
Write to `state/marketing/asset-briefs/{date}/`

## Output
- Asset brief files organized by content piece
- Asset manifest

## Risk Level
L1

## Anti-AI Visual Rules
- No purple-to-blue gradients
- No rounded-3xl + shadow-2xl combos
- No three equal-width card layouts
- Screenshots must show REAL product state
