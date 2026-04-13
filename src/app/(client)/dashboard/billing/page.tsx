'use client'
import { useState } from 'react'
import { CheckCircle2, Loader2, Zap } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const PACKS = [
  { id: 'starter', credits: 100, label: '100 credits', price: 29, perCredit: '$0.29', highlight: false },
  { id: 'pro', credits: 300, label: '300 credits', price: 79, perCredit: '$0.26', highlight: true },
  { id: 'agency', credits: 1000, label: '1000 credits', price: 199, perCredit: '$0.20', highlight: false },
]

function SuccessBanner() {
  const searchParams = useSearchParams()
  if (!searchParams.get('success')) return null
  return (
    <div className="flex items-center gap-3 bg-emerald-950 border border-emerald-800 rounded-lg px-4 py-3 mb-6">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
      <p className="text-sm text-emerald-300">Payment successful — credits have been added to your account.</p>
    </div>
  )
}

function PackCard({ pack }: { pack: typeof PACKS[number] }) {
  const [loading, setLoading] = useState(false)

  async function handleBuy() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: pack.id }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        alert(body.error ?? 'Failed to create checkout session')
        return
      }
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`bg-zinc-900 border rounded-lg p-6 flex flex-col gap-4 ${
        pack.highlight ? 'border-emerald-600' : 'border-zinc-800'
      }`}
    >
      {pack.highlight && (
        <span className="inline-flex self-start items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-400">
          Most popular
        </span>
      )}
      <div>
        <p className="text-2xl font-bold text-zinc-50">{pack.credits.toLocaleString()}</p>
        <p className="text-sm text-zinc-400 mt-0.5">credits</p>
      </div>
      <div>
        <p className="text-xl font-semibold text-zinc-50">${pack.price}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{pack.perCredit} / credit</p>
      </div>
      <button
        onClick={handleBuy}
        disabled={loading}
        className="mt-auto bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Zap className="w-4 h-4" />
        )}
        {loading ? 'Redirecting…' : 'Buy credits'}
      </button>
    </div>
  )
}

export default function BillingPage() {
  return (
    <>
      <header className="h-14 border-b border-zinc-800 flex items-center px-6 sticky top-0 bg-zinc-950/80 backdrop-blur-sm z-10">
        <h1 className="text-base font-semibold text-zinc-50">Billing</h1>
      </header>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <Suspense>
            <SuccessBanner />
          </Suspense>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-zinc-50">Top up credits</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Credits are used to generate videos. Each hook variant uses 10 credits.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PACKS.map(pack => (
              <PackCard key={pack.id} pack={pack} />
            ))}
          </div>

          <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs text-zinc-500">
              Payments are processed securely by Stripe. Credits are added instantly after payment confirmation.
              Failed jobs are automatically refunded.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
