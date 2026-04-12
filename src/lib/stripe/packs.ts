import 'server-only'

export const CREDIT_PACKS = {
  starter: { priceId: process.env.STRIPE_PRICE_STARTER!, credits: 100, label: '100 credits', price: 29 },
  pro:     { priceId: process.env.STRIPE_PRICE_PRO!,     credits: 300, label: '300 credits', price: 79 },
  agency:  { priceId: process.env.STRIPE_PRICE_AGENCY!,  credits: 1000, label: '1000 credits', price: 199 },
} as const

export type PackId = keyof typeof CREDIT_PACKS

// Client-safe pack info (no priceId exposed)
export const PACK_DISPLAY = Object.entries(CREDIT_PACKS).map(([id, pack]) => ({
  id,
  credits: pack.credits,
  label: pack.label,
  price: pack.price,
}))
