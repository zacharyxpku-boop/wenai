'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Loader2 } from 'lucide-react'

interface RegenerateButtonProps {
  productName: string
  referenceVideoUrl: string
  parentJobId: string
}

export default function RegenerateButton({
  productName,
  referenceVideoUrl,
  parentJobId,
}: RegenerateButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRegenerate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          referenceVideoUrl,
          hookVariantCount: 3,
          parentJobId,
        }),
      })

      if (res.status === 402) {
        setError('Insufficient credits. Please top up your balance.')
        return
      }
      if (res.status === 429) {
        setError('Too many active jobs. Please wait before regenerating.')
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Failed to create regeneration job.')
        return
      }

      const { jobId } = await res.json()
      router.push(`/dashboard/jobs/${jobId}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleRegenerate}
        disabled={loading}
        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        {loading ? 'Submitting…' : 'Regenerate video'}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
