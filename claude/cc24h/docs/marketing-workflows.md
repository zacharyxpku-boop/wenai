# Marketing Automation Workflows

## Overview

These 9 workflows form the execution backbone of the Automated AI Marketing Team. Each can be triggered by Commander, Campaign Director, or directly by skill invocation.

All workflows follow the principle: **generate --> review --> publish**. Platform final publish is always human-confirmed unless explicitly overridden.

### Conventions

| Convention | Meaning |
|---|---|
| Automation: Full auto | No human input required for generation |
| Automation: Semi-auto | Human provides partial input (e.g., metrics data) |
| Risk: L1 | Internal-only output, low blast radius |
| Risk: L2 | External-facing output, requires review before publish |
| Risk: L3 | Paid media or irreversible action, requires explicit human confirmation |
| Handoff format | File path pattern where output is written for downstream consumption |

---

## MW1: campaign-brief-generator

| Field | Value |
|---|---|
| Purpose | Convert Commercialization Council conclusions into an actionable campaign brief |
| Trigger | After any Council review that produces a GO decision or growth-optimization output |
| Input | Council verdict (from commercialization-council-review workflow output), product stage (P0/P1/P2/P3), current priority from Commander |
| Roles | Campaign Director (primary), Audience Insight Lead (support) |
| Output | Campaign brief markdown file |
| Automation | Full auto (draft), human review recommended before execution |
| Risk | L1 |
| Handoff | `state/marketing/campaign-brief-{YYYY-MM-DD}.md` |

### Steps

1. **Parse Council verdict.** Extract: target user segment, value proposition, priority channel hints, business hypothesis, success criteria, and any constraints or warnings from Red Team.
2. **Draft campaign brief.** Campaign Director produces a structured brief containing:
   - Campaign objective (one sentence, measurable)
   - Primary KPI and secondary KPIs
   - Timeline (start date, milestones, end date)
   - Primary channel and secondary channels
   - Content pillars (3-5 themes that all content should map to)
   - Budget constraint (if applicable)
   - Audience definition (who, what they care about, where they are)
   - Competitive positioning (how we differ, what we do not say)
3. **Annotate with audience intelligence.** Audience Insight Lead adds:
   - User emotional triggers (what makes them click, what makes them share, what makes them buy)
   - Objection predictions (top 5 reasons a user would not convert, with pre-emptive responses)
   - Share motivation mapping (what intrinsic/extrinsic reward drives forwarding)
   - Language register notes (formal vs. casual, platform-specific tone)
4. **Write output file** to `state/marketing/campaign-brief-{YYYY-MM-DD}.md`.

### Output Schema

```
# Campaign Brief - {date}

## Objective
{one sentence}

## KPIs
- Primary: {metric} target {value}
- Secondary: {metric} target {value}

## Timeline
- Start: {date}
- Milestone 1: {date} - {what}
- End: {date}

## Target Audience
{segment description}

## Value Proposition
{one sentence}

## Content Pillars
1. {pillar}
2. {pillar}
3. {pillar}

## Channel Priority
1. {channel} - {rationale}
2. {channel} - {rationale}

## Audience Intelligence
### Emotional Triggers
- {trigger}

### Objection Map
| Objection | Pre-emptive Response |
|---|---|
| {objection} | {response} |

### Share Motivation
- {motivation}

## Constraints
- {constraint}
```

---

## MW2: content-angle-generator

| Field | Value |
|---|---|
| Purpose | Generate content angle trees from campaign brief |
| Trigger | After campaign-brief-generator (MW1) completes |
| Input | Campaign brief from MW1 |
| Roles | Content Strategy Lead (primary), Audience Insight Lead (challenge) |
| Output | Ranked content angle tree |
| Automation | Full auto |
| Risk | L1 |
| Handoff | `state/marketing/content-angles-{YYYY-MM-DD}.md` |

### Steps

1. **Extract core selling points** from campaign brief: value proposition, content pillars, audience triggers, and differentiation claims.
2. **Generate 6 content angle categories**, each representing a distinct persuasion strategy:

   | Category | Description | Example Pattern |
   |---|---|---|
   | Controversy / Debate | Provoke discussion, take a position | "X is wrong about Y, here is why" |
   | User Pain Point | Lead with frustration, resolve with product | "Tired of Z? This changes everything" |
   | Gameplay / Interactive | Invite participation, gamify experience | "Try this yourself and see what happens" |
   | Case Study | Proof through story, real or constructed | "How [person] went from A to B" |
   | Opinion / Hot Take | Strong stance, personality-driven | "Unpopular opinion: X is overrated" |
   | Comparison / Contrast | Position against alternatives | "X vs Y: which actually works?" |

3. **For each category, generate 5-10 specific angles.** Each angle must include:
   - Angle title (descriptive, not the final headline)
   - Hook sentence (the first thing the user reads)
   - Target emotion (curiosity, fear, pride, surprise, validation, etc.)
   - Suitable platforms (which channels this angle works best on)
4. **Audience Insight Lead rates each angle** on three dimensions (1-5 scale):

   | Dimension | What It Measures |
   |---|---|
   | Click probability | How likely a user scrolls back up to read this |
   | Share probability | How likely a user forwards this to someone |
   | Conversion probability | How likely a user takes the CTA action |

5. **Compute composite score** using weighted formula: `composite = (click * 0.3) + (share * 0.4) + (conversion * 0.3)`. Rank all angles by composite score descending.
6. **Select top angles.** Mark top 3 per category as PRIMARY, next 3 as SECONDARY, remainder as BACKLOG.
7. **Write output file** to `state/marketing/content-angles-{YYYY-MM-DD}.md`.

### Output Schema

```
# Content Angles - {date}

## Source
Campaign brief: {path}

## Angle Tree

### Category: {name}

| Rank | Angle | Hook | Emotion | Platforms | Click | Share | Conv | Composite | Status |
|---|---|---|---|---|---|---|---|---|---|
| 1 | {angle} | {hook} | {emotion} | {platforms} | {n} | {n} | {n} | {n} | PRIMARY |
```

---

## MW3: multi-channel-content-pack

| Field | Value |
|---|---|
| Purpose | Generate platform-specific publish-ready content packs |
| Trigger | After content angles are selected from MW2 |
| Input | Selected content angles (PRIMARY status), campaign brief, product screenshots/assets |
| Roles | Conversion Copy Lead (primary), Channel Lead (platform rules), Creative Asset Lead (visual brief), Red Team (review) |
| Output | Platform-specific content packs |
| Automation | Full auto generation, semi-auto review, manual publish |
| Risk | L2 |
| Handoff | `state/marketing/content-packs/{platform}-{YYYY-MM-DD}/` |

### Steps

1. **For each selected angle, generate platform-specific content packs:**

#### Xiaohongshu (小红书) Pack -- per post

| Component | Spec |
|---|---|
| Title variants | 5 variants, each <=20 chars, curiosity hook mandatory |
| Body variants | 3 variants, each <=500 chars, line breaks every 2-3 sentences |
| Cover text suggestion | What text to overlay on cover image, <=10 chars |
| Image/screenshot brief | What screen to capture, what element to highlight, crop guidance |
| First comment (首评) | 1 comment to post immediately, adds context or social proof |
| Follow-up comment (追评) | 1 comment to post 2-4 hours later, answers anticipated question |
| Hashtag suggestions | 10 hashtags, mix of high-volume (>1M) and niche (<100K) |
| Risk word check | List of flagged terms that may trigger platform content filters |

#### Zhihu (知乎) Pack -- per answer

| Component | Spec |
|---|---|
| Question targeting | 3-5 existing questions to answer, with question URL pattern |
| Answer framework | Hook (first 2 sentences) --> Evidence --> Story --> Soft CTA |
| Long version | 800+ chars, authoritative tone, includes data or reasoning |
| Short version | 300 chars, conversational tone, for lower-effort questions |
| Comment follow-up template | Template for replying to comments on own answer |
| Traffic funnel | answer --> profile bio --> external link path |

#### WeChat Official Account (公众号) Pack -- per article

| Component | Spec |
|---|---|
| Title + subtitle | Title <=22 chars, subtitle <=30 chars |
| Article outline | H2/H3 structure, 800-1500 word target |
| Opening hook | First 3 sentences, must create reason to keep reading |
| CTA placement | Where in article to insert CTA (early/mid/end), what CTA says |
| Moments sharing summary | <=40 chars summary for when article is shared to Moments |

#### Private Domain (社群/私域) Pack

| Component | Spec |
|---|---|
| Group message sequence | Message 1 (context), Message 2 (value), Message 3 (CTA), with timing gaps |
| DM invite script | 3 variants by relationship distance (close/medium/distant) |
| Moments post (long) | 150+ chars, story-driven |
| Moments post (short) | <=50 chars, curiosity hook |

#### SEO Pack

| Component | Spec |
|---|---|
| Target keyword cluster | 1 primary keyword + 5-8 long-tail variants |
| Meta title + description | Title <=60 chars, description <=155 chars |
| Article outline with FAQ | H2/H3 structure + 3-5 FAQ entries with schema markup guidance |
| Internal linking suggestions | 3-5 pages to link to, with anchor text suggestions |

2. **Red Team reviews all packs.** Check against:

   | Check | Fail Criteria |
   |---|---|
   | AI-slop language | Contains banned words from CLAUDE.md copywriting rules |
   | Platform risk words | Contains terms known to trigger content filters |
   | Brand consistency | Contradicts positioning or makes unsupported claims |
   | Conversion clarity | CTA is missing, ambiguous, or asks too much too soon |
   | Tone mismatch | Copy tone does not match platform norms |

3. **Write output files** to `state/marketing/content-packs/{platform}-{YYYY-MM-DD}/`. One file per angle per platform.

---

## MW4: asset-brief-pack

| Field | Value |
|---|---|
| Purpose | Generate production-grade visual asset briefs for all content pieces |
| Trigger | After content packs (MW3) are generated |
| Input | Content packs, product screenshots, design system tokens |
| Roles | Creative Asset Lead (primary), Campaign Director (approval) |
| Output | Asset brief collection |
| Automation | Full auto |
| Risk | L1 |
| Handoff | `state/marketing/asset-briefs/{YYYY-MM-DD}/` |

### Steps

1. **For each content piece from MW3, define required assets:**

   | Asset Type | Brief Contents |
   |---|---|
   | Cover image | Dimensions (platform-specific), text overlay content, background style, mood/color direction, reference design tokens |
   | Product screenshot | Which screen to capture, app state (e.g., result page with specific data), elements to highlight (circle/arrow/blur), crop dimensions |
   | Result page display | What data to show, layout suggestion (card/full/split), which metrics to emphasize |
   | Comparison chart | What to compare (product vs competitor, before vs after), format (radar/bar/table/side-by-side), data points to include |
   | Case/testimonial image | Testimonial format (quote card, before/after, chat screenshot mock), attribution style, emotional tone |
   | Social proof element | Rating display, user count, endorsement badge |

2. **Map each asset to design system tokens:**

   | Token Category | What to Reference |
   |---|---|
   | Color | Primary, secondary, accent, background, text colors |
   | Typography | Font family, size scale, weight for headlines vs body |
   | Spacing | Padding, margins, gap values |
   | Border | Radius values, border widths |
   | Shadow | Elevation levels |

3. **Define asset naming convention:** `{platform}-{angle-slug}-{asset-type}-{variant}.{ext}`
4. **Write output files** to `state/marketing/asset-briefs/{YYYY-MM-DD}/`. One brief file per content piece.

### Asset Dimensions Reference

| Platform | Asset Type | Dimensions | Notes |
|---|---|---|---|
| 小红书 | Cover (3:4) | 1080x1440 | Vertical, text-safe area top 60% |
| 小红书 | Cover (1:1) | 1080x1080 | Square, for carousel |
| 知乎 | Article header | 1920x1080 | Landscape, minimal text |
| 公众号 | Article cover | 900x383 | 2.35:1 ratio, title overlaid |
| 公众号 | In-article image | 1080xAuto | Max width 1080, variable height |
| 朋友圈 | Share card | 1080x1080 | Square, must be readable at thumbnail |

---

## MW5: private-launch-pack

| Field | Value |
|---|---|
| Purpose | Generate complete private domain launch kit for product releases |
| Trigger | Pre-launch or launch phase |
| Input | Campaign brief, product URL, key screenshots |
| Roles | Channel Lead (primary), Conversion Copy Lead (copy), Campaign and Referral Lead (mechanics) |
| Output | Complete private domain launch kit |
| Automation | Full auto generation, manual publish |
| Risk | L2 |
| Handoff | `state/marketing/private-launch-pack-{YYYY-MM-DD}.md` |

### Steps

1. **Generate Moments post (long version).** 150+ chars, story-driven hook, personal angle, ends with soft CTA. Must not read like an advertisement.
2. **Generate Moments post (short version).** <=50 chars, pure curiosity hook, no product name if possible. Goal: make people ask "what is this?"
3. **Generate 9-image sequence suggestion.** Define what each image should show, in viewing order:

   | Image | Purpose | Content Suggestion |
   |---|---|---|
   | 1 | Hook / pattern interrupt | Bold statement or surprising result |
   | 2 | Context / problem | What problem this solves |
   | 3 | Product reveal | First look at the product |
   | 4 | Core feature demo | Most compelling feature in action |
   | 5 | Result / output example | What user gets (result page, report, etc.) |
   | 6 | Social proof | User reaction, testimonial, or metric |
   | 7 | Comparison | Before/after or vs-alternative |
   | 8 | How to access | Clear instruction on how to try it |
   | 9 | CTA / share prompt | What to do next, why to share |

4. **Generate DM invite scripts.** 3 variants by relationship:

   | Variant | Tone | Length | Key Technique |
   |---|---|---|---|
   | Close friend | Casual, excited | 2-3 sentences | Personal recommendation, "you have to try this" |
   | Acquaintance | Helpful, low-pressure | 3-4 sentences | "Thought of you because..." framing |
   | Professional contact | Respectful, value-focused | 4-5 sentences | Industry relevance, mutual benefit |

5. **Generate beta group welcome message.** For a 50-person initial group:
   - Who we are (1 sentence)
   - What this product does (1 sentence)
   - What we need from them (specific feedback request)
   - What they get (exclusive access, input on roadmap, etc.)
   - Ground rules (2-3 rules max)
6. **Generate group message sequence:**

   | Message | Timing | Content |
   |---|---|---|
   | Message 1 | Immediately after welcome | Context: why this exists, what problem it solves |
   | Message 2 | 30 minutes later | How-to: step-by-step to first value moment |
   | Message 3 | 2 hours later | Feedback request: specific questions, not open-ended |

7. **Generate feedback form copy.** 5 questions max, conversational tone:
   - Q1: First impression (open-ended, 1 sentence)
   - Q2: Most useful part (multiple choice)
   - Q3: Most confusing part (multiple choice)
   - Q4: Would you share this? Why or why not? (open-ended)
   - Q5: What would make you pay for this? (open-ended)
8. **Generate feedback follow-up DM script.** Sent 24 hours after access:
   - Thank them for trying
   - Ask one specific question based on their usage
   - Offer to walk them through any confusion
9. **Write output file** to `state/marketing/private-launch-pack-{YYYY-MM-DD}.md`.

---

## MW6: referral-campaign-pack

| Field | Value |
|---|---|
| Purpose | Generate referral/viral campaign materials to maximize organic spread |
| Trigger | After product has share mechanics implemented |
| Input | Product share flow, result page design, campaign brief |
| Roles | Campaign and Referral Lead (primary), Conversion Copy Lead (copy), Audience Insight Lead (motivation) |
| Output | Complete referral campaign kit |
| Automation | Full auto generation, semi-auto review |
| Risk | L2 |
| Handoff | `state/marketing/referral-pack-{YYYY-MM-DD}/` |

### Steps

1. **Define share trigger points.** Map which user actions trigger a share prompt:

   | Trigger Point | User State | Share Motivation |
   |---|---|---|
   | After result generation | Surprised/delighted by output | "This is so accurate, others need to see" |
   | After comparison/合盘 result | Curious about relationship dynamic | "I want to compare with my friend" |
   | After saving/exporting | Invested, sees value | "This is useful, my friend would want this" |
   | After achieving milestone | Accomplished, proud | "Look what I discovered" |

2. **Generate comparison/合盘 image copy.** For results that involve two people:
   - Result title text (what the comparison shows)
   - Key metric highlight (the most shareable data point)
   - Tease text (what is revealed vs. what requires the friend to also try)
   - Visual layout suggestion (side-by-side, overlay, versus format)
3. **Generate share text variants:**

   | Variant | Length | Use Case |
   |---|---|---|
   | Ultra-short | <=15 chars | Button label, in-app share text |
   | Short | <=30 chars | Quick share, tweet-style |
   | Medium | 50-80 chars | Moments caption, group share |
   | Long | 100+ chars | Story-driven, DM forwarding |
   | DM script | 2-3 sentences | Personal message to specific person |

4. **Generate 3 platform-specific versions:**

   | Platform | Optimization Focus |
   |---|---|
   | 小红书 | Visual-first, cover image must be share-worthy, hashtags for discovery |
   | 朋友圈 | Personal tone, social proof, curiosity hook, no hard-sell |
   | 私聊 | Intimate, specific to recipient, curiosity-driven, feels like a personal tip |

5. **Generate receiver landing experience brief.** What happens when someone clicks a shared link:
   - First screen: what they see (result preview, teaser, or full content)
   - Value delivery: what they get without signing up (must be meaningful per altruistic principle)
   - Conversion prompt: what asks them to try it themselves
   - Re-share prompt: what encourages them to share their own result
6. **Generate re-share CTA for receivers.** The chain must continue:
   - CTA copy after receiver sees shared content
   - CTA copy after receiver generates their own result
   - CTA copy for receiver to invite a third person
7. **Write output files** to `state/marketing/referral-pack-{YYYY-MM-DD}/`.

### Viral Loop Diagram

```
Sharer generates result
    |
    v
Share prompt appears (with pre-filled text)
    |
    v
Receiver clicks link
    |
    v
Receiver sees teaser (value without signup)
    |
    v
Receiver tries product (low-friction entry)
    |
    v
Receiver generates own result
    |
    v
Receiver becomes new Sharer --> loop repeats
```

---

## MW7: seo-content-matrix

| Field | Value |
|---|---|
| Purpose | Generate SEO content matrix for long-tail organic traffic acquisition |
| Trigger | After initial launch when organic growth becomes priority |
| Input | Product keywords, target audience, competitor content gaps |
| Roles | Content Strategy Lead (primary), Marketing Analyst (keyword data), Channel Lead (priority) |
| Output | 20-topic SEO content matrix with outlines |
| Automation | Full auto |
| Risk | L1 |
| Handoff | `state/marketing/seo-matrix-{YYYY-MM-DD}.md` |

### Steps

1. **Generate 20 topic ideas** based on the intersection of product capabilities and audience search behavior. Topics must cover three intent layers:

   | Intent Layer | Ratio | Example |
   |---|---|---|
   | Awareness (informational) | 50% (10 topics) | "What is [concept]", "How does [thing] work" |
   | Consideration (navigational) | 30% (6 topics) | "[Product] vs [alternative]", "Best [category] tools" |
   | Decision (transactional) | 20% (4 topics) | "How to use [product]", "[Product] review" |

2. **For each topic, define the content specification:**

   | Field | Description |
   |---|---|
   | Primary keyword | The main keyword to target, based on volume and difficulty |
   | Secondary keywords | 3-5 related long-tail keywords |
   | Search intent | Informational / Navigational / Transactional |
   | Title | <=60 chars, primary keyword near front |
   | Meta description | <=155 chars, includes primary keyword and CTA |
   | Article outline | H2/H3 structure, 800-1500 words target length |
   | FAQ section | 3-5 questions in "People Also Ask" style |
   | CTA | Contextual, not hard-sell, placed after value delivery |
   | Internal link targets | 3-5 existing pages to link to, with suggested anchor text |

3. **Rank topics by priority score:**

   | Factor | Weight | Scale |
   |---|---|---|
   | Search volume estimate | 0.3 | 1-5 (1=low, 5=high) |
   | Competition level (inverse) | 0.3 | 1-5 (1=high competition, 5=low) |
   | Conversion potential | 0.4 | 1-5 (1=low, 5=high) |

   Priority score = `(volume * 0.3) + (competition_inverse * 0.3) + (conversion * 0.4)`

4. **Assign publish waves:**

   | Wave | Criteria | Timeline |
   |---|---|---|
   | Wave 1 | Top 7 by priority score | Week 1-2 |
   | Wave 2 | Next 7 | Week 3-4 |
   | Wave 3 | Remaining 6 | Week 5-6 |

5. **Write output file** to `state/marketing/seo-matrix-{YYYY-MM-DD}.md`.

### Output Schema

```
# SEO Content Matrix - {date}

## Summary
- Total topics: 20
- Wave 1: {count} topics
- Wave 2: {count} topics
- Wave 3: {count} topics

## Topic Matrix

| # | Wave | Keyword | Intent | Title | Priority Score |
|---|---|---|---|---|---|
| 1 | 1 | {keyword} | {intent} | {title} | {score} |

## Detailed Outlines

### Topic 1: {title}

**Keyword cluster:** {primary}, {secondary1}, {secondary2}
**Intent:** {intent}
**Word count target:** {n}

#### Outline
- H2: {heading}
  - H3: {subheading}
  - H3: {subheading}

#### FAQ
- Q: {question}
  A: {answer summary}

#### CTA
{cta text and placement}

#### Internal Links
- [{anchor text}]({target page})
```

---

## MW8: qa-comment-reply-pack

| Field | Value |
|---|---|
| Purpose | Generate ammunition for Q&A platforms and comment sections |
| Trigger | After content is published and engagement begins |
| Input | Product FAQ, user objections list, published content references |
| Roles | Conversion Copy Lead (primary), Audience Insight Lead (objection map), Red Team (risk check) |
| Output | QA ammunition library |
| Automation | Full auto |
| Risk | L1 |
| Handoff | `state/marketing/qa-pack-{YYYY-MM-DD}.md` |

### Steps

1. **Generate question pool.** 20 questions users are likely to ask, distributed across:

   | Question Type | Count | Example Pattern |
   |---|---|---|
   | How it works | 4 | "How does this calculate X?" |
   | Accuracy/trust | 4 | "Is this actually accurate?" |
   | Comparison | 3 | "How is this different from Y?" |
   | Pricing/access | 3 | "Is this free? What does paid get me?" |
   | Use case | 3 | "Can I use this for Z?" |
   | Skepticism | 3 | "This looks like AI-generated garbage" |

2. **Generate answer frameworks.** Each answer follows: hook (acknowledge the question) --> evidence (data, logic, or experience) --> experience (personal or user story) --> soft CTA (if natural, never forced).

3. **For each question, generate two answer versions:**

   | Version | Length | Tone | Use Case |
   |---|---|---|---|
   | Long answer | 300+ chars | Authoritative, detailed | Zhihu answers, blog comments |
   | Short answer | 100 chars | Conversational, quick | Xiaohongshu comments, DM replies |

   Plus a **comment follow-up**: anticipates the next question the asker will have and pre-answers it.

4. **Generate objection handling scripts.** Dedicated responses for high-frequency objections:

   | Objection | Response Strategy |
   |---|---|
   | "Is this accurate?" | Acknowledge limitations + show methodology + cite user validation |
   | "How is this different from X?" | Avoid attacking competitor + highlight unique angle + invite them to compare |
   | "Is this free?" | Lead with free value + explain what premium adds + no pressure |
   | "Looks like AI garbage" | Acknowledge AI skepticism is valid + show human curation layer + offer specific example |
   | "I tried it and it was wrong" | Thank for feedback + ask for specific case + explain what might have happened |
   | "Is my data safe?" | Explain data handling + what is stored vs. not + link to privacy policy |

5. **Generate traffic funnels** that are not hard-sell:

   | Funnel Stage | Technique |
   |---|---|
   | Comment reply | Answer thoroughly, profile bio has product link |
   | Follow-up reply | Offer more detail, mention resource (not product) |
   | Profile visit | Bio contains clear value proposition + link |
   | Link click | Landing page delivers value before asking for anything |

6. **Red Team reviews** all answers for:
   - Platform risk (does this look like astroturfing?)
   - Tone consistency (does this sound like a real person?)
   - Claim accuracy (are we making promises we cannot keep?)
   - Banned language check (per CLAUDE.md copy rules)

7. **Write output file** to `state/marketing/qa-pack-{YYYY-MM-DD}.md`.

---

## MW9: marketing-retro-pack

| Field | Value |
|---|---|
| Purpose | Synthesize marketing results and generate next-round recommendations |
| Trigger | End of campaign cycle (typically weekly or bi-weekly) |
| Input | Published content list, engagement data (manual input), user feedback |
| Roles | Marketing Analyst (primary), Campaign Director (synthesis), Red Team (challenge) |
| Output | Marketing retrospective with actionable recommendations |
| Automation | Semi-auto (data input manual, analysis auto) |
| Risk | L1 |
| Handoff | `state/marketing/retro-{YYYY-MM-DD}.md` |

### Steps

1. **Collect data per content piece.** Each entry requires:

   | Field | Source |
   |---|---|
   | Platform | Which channel was this published on |
   | Format | Post, article, answer, comment, DM, etc. |
   | Angle | Which content angle from MW2 was used |
   | Copy variant | Which variant from MW3 was published |
   | Asset type | Which visual assets were used |
   | Impressions | Platform-reported views/impressions |
   | Engagement | Likes, comments, saves, shares (platform-specific) |
   | Click-through | Clicks to product link |
   | Conversion | Sign-ups, trials, purchases attributed |
   | Cost | Time spent, paid promotion amount (if any) |

2. **Cluster content into performance tiers:**

   | Tier | Criteria | Action |
   |---|---|---|
   | High-performing | Top 20% by engagement rate AND conversion | Analyze why, replicate pattern |
   | Average | Middle 60% | Identify what held it back |
   | Low-performing | Bottom 20% by engagement rate OR zero conversion | Identify what went wrong, consider killing |

3. **Identify patterns across dimensions:**

   | Dimension | Analysis Question |
   |---|---|
   | Angle effectiveness | Which angle categories generated most engagement? Most conversion? |
   | Copy style | Which tone/length/hook style performed best per platform? |
   | Channel ROI | Which channels delivered best conversion per unit of effort? |
   | Asset impact | Which visual formats correlated with higher engagement? |
   | Timing | Did publish time/day affect performance? |
   | Audience segment | Did different segments respond to different content? |

4. **Generate four-quadrant recommendations:**

   | Quadrant | Definition | Action |
   |---|---|---|
   | CONTINUE | Working well, maintain current approach | List specific strategies to keep running |
   | STOP | Not working, consuming resources | List specific strategies to kill immediately |
   | AMPLIFY | Working well, deserves more investment | List specific strategies to scale up (2x budget, higher frequency, etc.) |
   | TEST | Untested hypotheses based on patterns observed | List 3-5 new experiments with clear success criteria |

5. **Red Team challenge.** Review the analysis and ask:
   - Are we optimizing for vanity metrics (likes, views) or business outcomes (conversion, revenue)?
   - Is there survivorship bias in our high-performing analysis?
   - Are we attributing correctly, or is correlation masquerading as causation?
   - What are we NOT measuring that might matter?

6. **Write output file** to `state/marketing/retro-{YYYY-MM-DD}.md`.

### Output Schema

```
# Marketing Retrospective - {date}
## Period: {start_date} to {end_date}

## Summary Metrics
| Metric | This Period | Last Period | Change |
|---|---|---|---|
| Total impressions | {n} | {n} | {+/-%} |
| Total engagement | {n} | {n} | {+/-%} |
| Total click-through | {n} | {n} | {+/-%} |
| Total conversion | {n} | {n} | {+/-%} |

## Performance Tiers
### High-Performing
{list with analysis}

### Low-Performing
{list with diagnosis}

## Pattern Analysis
{findings per dimension}

## Recommendations
### CONTINUE
- {strategy}: {rationale}

### STOP
- {strategy}: {rationale}

### AMPLIFY
- {strategy}: {rationale}, suggested scale: {2x/3x/etc.}

### TEST
- {hypothesis}: success criteria = {metric} > {threshold} within {timeframe}

## Red Team Notes
- {challenge point}
```

---

## Workflow Dependency Map

```
Council Verdict
    |
    v
MW1: campaign-brief-generator
    |
    +--------> MW2: content-angle-generator
    |              |
    |              +--------> MW3: multi-channel-content-pack
    |              |              |
    |              |              +--------> MW4: asset-brief-pack
    |              |
    |              +--------> MW7: seo-content-matrix
    |              |
    |              +--------> MW8: qa-comment-reply-pack
    |
    +--------> MW5: private-launch-pack
    |
    +--------> MW6: referral-campaign-pack
    |
    +--------> MW9: marketing-retro-pack (post-execution, end of cycle)
```

### Dependency Rules

| Workflow | Depends On | Can Run In Parallel With |
|---|---|---|
| MW1 | Council verdict | Nothing (entry point) |
| MW2 | MW1 | MW5, MW6 |
| MW3 | MW2 | MW7, MW8 |
| MW4 | MW3 | MW7, MW8 |
| MW5 | MW1 | MW2, MW6 |
| MW6 | MW1 | MW2, MW5 |
| MW7 | MW2 | MW3, MW8 |
| MW8 | MW2 | MW3, MW7 |
| MW9 | All others (post-execution) | Nothing (closing workflow) |

---

## Quick Reference Table

| ID | Workflow | Primary Role | Auto Level | Risk | Trigger | Output Path |
|---|---|---|---|---|---|---|
| MW1 | campaign-brief-generator | Campaign Director | Full auto | L1 | After Council GO | `state/marketing/campaign-brief-{date}.md` |
| MW2 | content-angle-generator | Content Strategy Lead | Full auto | L1 | After MW1 | `state/marketing/content-angles-{date}.md` |
| MW3 | multi-channel-content-pack | Conversion Copy Lead | Full auto gen + manual publish | L2 | After MW2 | `state/marketing/content-packs/{platform}-{date}/` |
| MW4 | asset-brief-pack | Creative Asset Lead | Full auto | L1 | After MW3 | `state/marketing/asset-briefs/{date}/` |
| MW5 | private-launch-pack | Channel Lead | Full auto gen + manual publish | L2 | Pre-launch | `state/marketing/private-launch-pack-{date}.md` |
| MW6 | referral-campaign-pack | Campaign and Referral Lead | Full auto gen + semi-auto review | L2 | After share mechanics | `state/marketing/referral-pack-{date}/` |
| MW7 | seo-content-matrix | Content Strategy Lead | Full auto | L1 | Post-launch | `state/marketing/seo-matrix-{date}.md` |
| MW8 | qa-comment-reply-pack | Conversion Copy Lead | Full auto | L1 | After publish | `state/marketing/qa-pack-{date}.md` |
| MW9 | marketing-retro-pack | Marketing Analyst | Semi-auto | L1 | End of cycle | `state/marketing/retro-{date}.md` |

---

## Execution Protocol

1. Commander or Campaign Director initiates MW1 after a Council GO decision.
2. Downstream workflows are triggered automatically based on the dependency map.
3. All L2 risk outputs require human review before external publish.
4. All output files are written to `state/marketing/` subdirectories.
5. Each workflow logs its execution to `state/marketing/workflow-log.md` with timestamp, workflow ID, status, and output path.
6. If any workflow fails, it writes an error entry to the log and does not trigger downstream workflows.
7. MW9 runs at the end of each campaign cycle and feeds insights back into the next MW1 execution.
