# wenai Launch Readiness Checklist

## Production Environment

- `NEXT_PUBLIC_APP_URL` points to the deployed wenai subsite.
- `AI_API_KEY`, `AI_MODEL`, and `AI_ENDPOINT` are configured and tested.
- `JWT_SECRET`, `PASSWORD_SALT`, and `ADMIN_KEY` are configured with production-strength values.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are configured for inquiries, share links, and rate limits.
- Media provider keys are configured only for modules you intend to expose.
- Payment and formal contract flow points to the independent main site unless Stripe is intentionally enabled here.

## Customer-Facing QA

- `/` clearly says wenai is an ecommerce AI commercial delivery system.
- `/poc` can be completed by a new customer in one sitting.
- `/pricing` explains POC, Team, and Enterprise commercial paths.
- `/inquire` captures the customer without forcing payment in the subsite.
- `/share/[id]` and `/share/[id]/executive` are shareable and read-only.
- `/docs`, `/roadmap`, `/enterprise`, `/tools`, and `/changelog` have no mojibake or old positioning.

## Demo Room

- Keep three demo SKU categories ready: home decor, auto parts, and electronics.
- Keep one 10 SKU POC sample with category, SKU input, Brand IQ notes, content direction, and acceptance score.
- Keep one executive report link for founder, partner, or customer review.
- Keep one CRM inquiry sample with owner, SLA, contract stage, quote status, payment status, and next action.

## Commercial Boundary

- AI output is not final legal, medical, compliance, trademark, or platform policy advice.
- Human review is required for high-risk categories, regulated claims, trademarks, and final publication.
- Cost and ROI calculators are estimates, not promises.
- Payment, contract, refund, invoice, and SLA terms are controlled by the main commercial flow.
