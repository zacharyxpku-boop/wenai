# wenai 10 SKU POC Delivery SOP

This SOP is the operating standard for turning one inbound inquiry into a repeatable SKU launch-material POC. The product is not a broad AI OS. The product is a focused delivery system for 10 real SKUs.

## Positioning

wenai sells proof of workflow fit before any larger implementation.

Customer input:
- 10 real SKUs
- Target platform
- Existing product images, parameters, selling points, competitor links
- Restricted terms, brand words, compliance concerns
- Acceptance target

wenai output:
- SKU brief
- Main-image direction and scene prompts
- Listing/detail-page copy
- Compliance and trademark reminders
- Customer-service scripts
- Content benchmark and growth test pack
- 30-day review checklist
- POC acceptance report

Not promised:
- GMV lift
- Conversion-rate guarantee
- Legal clearance
- Final platform approval
- Full replacement of human review

## Stage 0: Qualify The Inquiry

Do not start delivery until the inquiry has enough context.

Minimum required:
- Company and contact
- SKU count or clear willingness to provide 10 SKUs
- Platform
- Category
- Main pain point

Lead score:
- 80-100: ready for POC call
- 60-79: ask for missing materials
- 30-59: nurture, do not spend delivery time
- 0-29: reject or defer

Admin action:
- Set owner
- Set next action
- Set next action due date
- Copy the POC follow-up script from `/admin/inquiries`

## Stage 1: Intake Call

Goal: decide whether the customer has a real SKU launch workflow problem.

Ask these questions:
- How many SKUs do you launch per month?
- Which platform matters most in this POC?
- What currently creates the most rework?
- Who is the final reviewer before publishing?
- What materials already exist?
- Which categories or claims are legally sensitive?
- What would count as a successful POC?

Disqualify if:
- The customer only wants cheap image generation
- They cannot provide real SKUs
- They demand guaranteed sales results
- They want to copy competitors 1:1
- They want platform-rule or legal responsibility transferred to wenai

## Stage 2: Material Intake

Ask for one table with these columns:
- SKU name
- Category
- Price band
- Platform
- Core selling points
- Current product image link
- Competitor reference link
- Restricted terms
- Notes

Acceptance rule:
- 10 SKUs preferred
- 5 SKUs can be used for demo only
- At least 2-3 subcategories preferred
- Any high-risk claim must be flagged before generation

## Stage 3: Generate The POC Pack

Use `/pipelines/batch-launch`.

Required settings:
- Platform: match customer target
- Selected stages: discovery, photoshoot, listing, customer-service/review where applicable
- Brand context: include category, customer profile, forbidden terms, platform constraints

Export:
- Use `Export POC acceptance pack`
- Store the Markdown as the delivery record
- Keep the raw SKU table as source material

## Stage 4: Human Review

Review every SKU before sending.

Check:
- Is each prompt category-specific?
- Are compliance reminders concrete?
- Are any trademark or brand terms risky?
- Are claims too strong?
- Does each SKU have a clear acceptance criterion?
- Does each priority SKU have benchmark evidence, not just a generic viral promise?
- Does the report say what is missing?

Never send:
- Fake performance proof
- Guaranteed revenue language
- "Copy competitor" language
- Unreviewed medical, food, children, or beauty-efficacy claims

## Stage 5: Delivery

Delivery message:
- State that this is a POC acceptance pack
- State what is covered
- State what still needs human review
- Ask for rework feedback using structured categories

Feedback categories:
- SKU information wrong
- Main-image direction unusable
- Listing copy off-brand
- Benchmark or content angle not aligned with customer audience
- Compliance risk
- Missing customer-service scenario
- Missing review/follow-up action

## Stage 5.5: Content Benchmark And Growth Test Pack

This stage borrows the useful part of PostPlus without turning wenai into a broad social-media OS.

Goal:
- Turn each SKU launch plan into a benchmark-based testable content package.
- Help the customer decide which SKU and angle deserves more budget after the POC.

Required output:
- Product read: category, claims, purchase drivers
- Search map: exact, pain, audience, lifestyle, competitor, high-intent terms
- Benchmark shortlist or benchmark collection plan
- Video deconstruction: audience, product, context, hook, timeline, visual proof, CTA
- 3 hook angles per priority SKU
- First-frame direction
- 15-30 second script outline or shot-by-shot plan
- Required source assets
- Platform fit: TikTok / Instagram Reels / Xiaohongshu / Douyin / Shopify
- 7-day test schedule
- Review metrics: CTR, 3-second hold, watch-through, save rate, valuable comments, add-to-cart or inquiry

Do not promise:
- Viral performance
- GMV lift
- Guaranteed follower growth
- Automatic publishing without customer authorization

Review rule:
- If the customer has no usable product footage or photos, mark this as a blocker.
- If there are no real benchmark URLs or evidence, mark the output as a search map and hypothesis, not completed research.
- If the product category is legally sensitive, keep content claims conservative and flag human review.

## Stage 6: Review Call

Review after the customer reads the pack.

Score the POC:
- SKU coverage
- Stage coverage
- Rework reduction
- Human-review confidence
- Compliance clarity
- Customer willingness to continue

Decision:
- Contract: customer sees value and has repeat SKU volume
- Needs info: customer has real pain but materials are incomplete
- Dropped: customer only wants cheap generation or asks for impossible guarantees

Admin record:
- Status
- Acceptance score
- Review notes
- Next action
- Due date

## Operating Metrics

Track weekly:
- Inquiries
- Qualified POCs
- POCs delivered
- Review calls completed
- Contracts entered
- Dropped reasons
- Average acceptance score
- Benchmark completed count
- Content test completed count
- Top missing-material reason
- Top compliance-risk category

The moat is not model output. The moat is accumulated category SOPs, acceptance data, missing-material patterns, and review outcomes.
