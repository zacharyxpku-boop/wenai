'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'

const COST_PER_JOB = 10 // credits per job (base cost)

interface JobSubmitFormProps {
  initialBalance: number
}

export function JobSubmitForm({ initialBalance }: JobSubmitFormProps) {
  const router = useRouter()
  const [productName, setProductName] = useState('')
  const [referenceVideoUrl, setReferenceVideoUrl] = useState('')
  const [hookVariantCount, setHookVariantCount] = useState(3)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const { data: balance } = useQuery({
    queryKey: ['credit-balance'],
    queryFn: () =>
      fetch('/api/credits/balance')
        .then(r => r.json())
        .then(d => d.balance as number),
    initialData: initialBalance,
    refetchInterval: 10_000,
  })

  const estimatedCost = hookVariantCount * COST_PER_JOB
  const currentBalance = balance ?? initialBalance
  const canAfford = currentBalance >= estimatedCost

  function validate() {
    const errors: Record<string, string> = {}
    if (!productName.trim()) errors.productName = 'Product name is required'
    else if (productName.trim().length > 200) errors.productName = 'Max 200 characters'
    if (!referenceVideoUrl.trim()) {
      errors.referenceVideoUrl = 'Reference video URL is required'
    } else {
      try { new URL(referenceVideoUrl) } catch {
        errors.referenceVideoUrl = 'Must be a valid URL'
      }
    }
    if (hookVariantCount < 1 || hookVariantCount > 5) errors.hookVariantCount = 'Must be 1–5'
    return errors
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return
    if (!canAfford) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, referenceVideoUrl, hookVariantCount }),
      })

      if (res.status === 402) {
        setError('Insufficient credits. Please top up your balance.')
        return
      }
      if (res.status === 429) {
        setError('Too many jobs running at once. Please wait for current jobs to complete.')
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Failed to submit job. Please try again.')
        return
      }

      const { jobId } = await res.json()
      router.push(`/dashboard/jobs/${jobId}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Product name */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Product name
        </label>
        <input
          type="text"
          value={productName}
          onChange={e => setProductName(e.target.value)}
          placeholder="e.g. Portable Bluetooth Speaker"
          maxLength={200}
          className="w-full bg-zinc-900 border border-zinc-700 text-zinc-50 placeholder-zinc-500 text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
        />
        {fieldErrors.productName && (
          <p className="text-xs text-red-400 mt-1">{fieldErrors.productName}</p>
        )}
      </div>

      {/* Reference TikTok URL */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Reference TikTok URL
        </label>
        <input
          type="url"
          value={referenceVideoUrl}
          onChange={e => setReferenceVideoUrl(e.target.value)}
          placeholder="https://www.tiktok.com/@user/video/..."
          className="w-full bg-zinc-900 border border-zinc-700 text-zinc-50 placeholder-zinc-500 text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
        />
        {fieldErrors.referenceVideoUrl && (
          <p className="text-xs text-red-400 mt-1">{fieldErrors.referenceVideoUrl}</p>
        )}
      </div>

      {/* Hook variant count */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Hook variants
        </label>
        <select
          value={hookVariantCount}
          onChange={e => setHookVariantCount(Number(e.target.value))}
          className="w-full bg-zinc-900 border border-zinc-700 text-zinc-50 text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {[1, 2, 3, 4, 5].map(n => (
            <option key={n} value={n}>{n} variant{n > 1 ? 's' : ''}</option>
          ))}
        </select>
        {fieldErrors.hookVariantCount && (
          <p className="text-xs text-red-400 mt-1">{fieldErrors.hookVariantCount}</p>
        )}
      </div>

      {/* Cost estimate */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-md px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Estimated cost</span>
          <span className="font-mono font-medium text-zinc-50">{estimatedCost} credits</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-zinc-500">Your balance</span>
          <span className={`font-mono font-medium ${canAfford ? 'text-zinc-400' : 'text-red-400'}`}>
            {currentBalance} credits
          </span>
        </div>
        {!canAfford && (
          <p className="text-xs text-red-400 mt-2">
            Insufficient credits.{' '}
            <a href="/dashboard/billing" className="text-emerald-500 hover:text-emerald-400 underline">
              Buy more
            </a>
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-950 border border-red-800 rounded-md px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || !canAfford}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {submitting ? 'Submitting…' : 'Submit Job'}
      </button>
    </form>
  )
}
