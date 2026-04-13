'use client'

export interface FailureRate {
  step: string
  total: number
  failed: number
  rate: number
}

export function QualityFailureChart({ data }: { data: FailureRate[] }) {
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center mb-3">
          <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-sm text-zinc-400">No failure data yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-zinc-50">Failure Rate by Step</h3>
      {data.map(item => (
        <div key={item.step} className="flex items-center gap-3">
          <span className="w-36 text-sm text-zinc-400 truncate capitalize">
            {item.step.replace(/_/g, ' ')}
          </span>
          <div className="flex-1 h-5 bg-zinc-800 rounded overflow-hidden">
            <div
              className="h-full bg-red-500 rounded transition-all duration-300"
              style={{ width: `${Math.min(item.rate * 100, 100)}%` }}
            />
          </div>
          <span className="w-14 text-sm text-right font-mono text-zinc-400">
            {(item.rate * 100).toFixed(1)}%
          </span>
          <span className="w-20 text-xs text-right text-zinc-500">
            {item.failed}/{item.total}
          </span>
        </div>
      ))}
    </div>
  )
}
