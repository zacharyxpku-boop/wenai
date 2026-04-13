import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QualityFailureChart, type FailureRate } from '@/components/admin/QualityFailureChart'

export default async function QualityPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (user.app_metadata?.role !== 'admin') redirect('/dashboard')

  // QC-03: Aggregate per-step failure rates from job_steps
  const { data: steps } = await supabase
    .from('job_steps')
    .select('step, status')

  const stepMap = new Map<string, { total: number; failed: number }>()

  for (const row of steps ?? []) {
    const entry = stepMap.get(row.step) ?? { total: 0, failed: 0 }
    entry.total++
    if (row.status === 'failed') entry.failed++
    stepMap.set(row.step, entry)
  }

  const failureRates: FailureRate[] = Array.from(stepMap.entries())
    .map(([step, counts]) => ({
      step,
      total: counts.total,
      failed: counts.failed,
      rate: counts.total > 0 ? counts.failed / counts.total : 0,
    }))
    .sort((a, b) => b.rate - a.rate)

  // Summary stats
  const totalJobs = (await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })).count ?? 0

  const failedJobs = (await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed')).count ?? 0

  const overallRate = totalJobs > 0 ? ((failedJobs / totalJobs) * 100).toFixed(1) : '0.0'

  return (
    <div className="p-6 max-w-4xl">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-50">Quality Monitoring</h1>
        <p className="text-sm text-zinc-400 mt-1">Pipeline failure rates across all jobs</p>
      </div>

      {/* Summary metric cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Jobs</p>
          <p className="text-3xl font-bold text-zinc-50 mt-1">{totalJobs}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Failed Jobs</p>
          <p className="text-3xl font-bold text-red-400 mt-1">{failedJobs}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Overall Failure Rate</p>
          <p className="text-3xl font-bold text-zinc-50 mt-1">{overallRate}%</p>
        </div>
      </div>

      {/* Per-step failure chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <QualityFailureChart data={failureRates} />
      </div>
    </div>
  )
}
