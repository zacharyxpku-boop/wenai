'use client'
import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, AlertCircle, Clock } from 'lucide-react'

type StepStatus = {
  step: string
  status: string
  started_at?: string
  completed_at?: string
}

const STEP_LABELS: Record<string, string> = {
  analysis: 'Analysing reference video',
  storyboard: 'Generating storyboard',
  video_gen: 'Generating video clips',
  assembly: 'Assembling final video',
}

const STEP_ORDER = ['analysis', 'storyboard', 'video_gen', 'assembly']

function StepIcon({ status }: { status: string }) {
  if (status === 'complete') {
    return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
  }
  if (status === 'processing') {
    return <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
  }
  if (status === 'failed') {
    return <AlertCircle className="w-5 h-5 text-red-400" />
  }
  return <Clock className="w-5 h-5 text-zinc-600" />
}

function statusBadge(status: string) {
  switch (status) {
    case 'complete':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-400">
          complete
        </span>
      )
    case 'processing':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-950 text-amber-400">
          processing
        </span>
      )
    case 'failed':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-950 text-red-400">
          failed
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400">
          pending
        </span>
      )
  }
}

export function JobProgressSSE({ jobId }: { jobId: string }) {
  const [steps, setSteps] = useState<StepStatus[]>([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const es = new EventSource(`/api/status/${jobId}`)
    setConnected(true)

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'snapshot') {
          setSteps(data.steps ?? [])
        } else if (data.type === 'update') {
          setSteps(prev => {
            const idx = prev.findIndex(s => s.step === data.step)
            if (idx >= 0) {
              const next = [...prev]
              next[idx] = { ...next[idx], ...data }
              return next
            }
            return [...prev, data]
          })
        }
      } catch {
        // ignore parse errors
      }
    }

    es.addEventListener('done', () => {
      es.close()
      setConnected(false)
    })

    es.onerror = () => {
      setError('Lost connection to job status stream.')
      es.close()
      setConnected(false)
    }

    // CRITICAL: cleanup on unmount to prevent connection leak
    return () => es.close()
  }, [jobId])

  // Merge known steps with received steps so all 4 always show
  const allSteps = STEP_ORDER.map(stepKey => {
    const found = steps.find(s => s.step === stepKey)
    return found ?? { step: stepKey, status: 'pending' }
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        {connected ? (
          <>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-400">Live</span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full bg-zinc-600" />
            <span className="text-xs text-zinc-500">Disconnected</span>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-amber-950 border border-amber-800 rounded-md px-3 py-2 mb-3">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-300">{error}</p>
        </div>
      )}

      {allSteps.map((s, i) => (
        <div key={s.step} className="flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0">
            <StepIcon status={s.status} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-300">
                {STEP_LABELS[s.step] ?? s.step}
              </span>
              {statusBadge(s.status)}
            </div>
            {s.completed_at && (
              <p className="text-xs text-zinc-500 mt-0.5">
                Done {new Date(s.completed_at).toLocaleTimeString()}
              </p>
            )}
          </div>
          {/* Connector line */}
          {i < allSteps.length - 1 && (
            <div className="absolute left-[18px] mt-6 w-px h-6 bg-zinc-800" style={{ position: 'relative', marginLeft: '-40px', marginTop: '20px', width: '1px', height: '12px', backgroundColor: '#27272a' }} />
          )}
        </div>
      ))}
    </div>
  )
}
