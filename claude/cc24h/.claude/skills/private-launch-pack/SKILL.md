---
name: private-launch-pack
description: Generate complete private domain launch kit — Moments posts, DM scripts, beta group welcome, feedback forms. Use for cold-start and internal launches.
trigger: pre-launch or launch phase
---

# Private Launch Pack

## Purpose
Generate everything needed to launch a product through private domain channels (WeChat Moments, DMs, beta groups).

## When to Use
- Before product launch for private domain seeding
- When building a beta test group
- When doing cold-start through personal network

## When NOT to Use
- For public platform content (use multi-channel-content-pack)
- When product is not ready for real users

## Inputs
- Campaign brief
- Product URL
- Key screenshots (3-5)
- Product one-liner

## Execution

### Step 1: Moments Posts

**Long Version (150-200 chars):**
Structure: personal story hook → what I discovered → why you should try → soft CTA
Tone: like telling a friend, not marketing

**Short Version (<=50 chars):**
Structure: curiosity hook + link
Tone: casual, intriguing

### Step 2: 9-Image Sequence
Define what each image should show (in order):
1. Hook image (most eye-catching result/insight)
2. Product overview / what this does
3. Personal result screenshot
4. Interesting data point / radar chart
5. Surprising insight
6. Comparison or contrast
7. Social proof or testimonial
8. How to try it yourself
9. CTA / QR code / link

### Step 3: DM Invite Scripts

**Close Friend Version:**
[Casual, personal, "I made something interesting"]

**Acquaintance Version:**
[Professional but warm, "thought you might find this interesting"]

**Professional Network Version:**
[Value-first, "this might be useful for your X"]

### Step 4: Beta Group Kit

**Welcome Message:**
- Thank them for joining
- Set expectations (what this group is for)
- Quick start guide (3 steps to try product)
- Ground rules (feedback welcome, be honest)

**Message 1 (after welcome, +1h):**
Share first interesting result/case to spark curiosity

**Message 2 (+4h or next day):**
Ask specific feedback question (not "what do you think" but "when you saw X, did you feel Y?")

**Message 3 (+1 day):**
Share most interesting feedback so far, ask for more

### Step 5: Feedback Collection

**Feedback Form (5 questions max):**
1. 你觉得哪个结果最准？为什么？
2. 哪里让你想发给朋友看？
3. 哪里让你困惑或想关掉？
4. 如果要花钱解锁完整版，你愿意付多少？
5. 你会怎么向朋友介绍这个？

**Follow-up DM (after someone gives feedback):**
Thank + dig deeper on most interesting point

### Step 6: Output
Write to `state/marketing/private-launch-pack-{date}.md`

## Output
- Complete private domain launch kit in one file
- Ready for copy-paste use

## Risk Level
L2 — private domain, high personal attribution

## Automation Boundary
- Generation: FULL AUTO
- Publishing: MANUAL CONFIRM (human copies and posts)
