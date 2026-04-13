import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { JobProgressSSE } from '@/components/dashboard/JobProgressSSE'
import { VideoPlayer } from '@/components/dashboard/VideoPlayer'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import RegenerateButton from './RegenerateButton'

interface Props {
  params: Promise<{ jobId: string }>
}

export default async function JobDetailPage({ params }: Props) {
  const { jobId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const orgId = user.app_metadata?.org_id as string | undefined

  // Fetch job
  const { data: job } = await supabase
    .from('jobs')
    .select('id, product_name, reference_video_url, status, delivery_url, parent_job_id, created_at, org_id')
    .eq('id', jobId)
    .single()

  if (!job) notFound()

  // Ownership check
  if (orgId && job.org_id !== orgId) notFound()

  // Fetch steps
  const { data: steps } = await supabase
    .from('job_steps')
    .select('step, status, started_at, completed_at')
    .eq('job_id', jobId)
    .order('started_at', { ascending: true })

  // Generate presigned URL for delivered jobs (server-side)
  let signedUrl: string | null = null
  if (job.status === 'delivered' && job.delivery_url) {
    const { data: signed } = await supabase.storage
      .from('videos')
      .createSignedUrl(job.delivery_url, 3600) // 1 hour
    signedUrl = signed?.signedUrl ?? null
  }

  const isInProgress = ['queued', 'processing'].includes(job.status)
  const isDelivered = job.status === 'delivered'
  const isFailed = job.status === 'failed'

  return (
    <>
      <header className="h-14 border-b border-zinc-800 flex items-center gap-3 px-6 sticky top-0 bg-zinc-950/80 backdrop-blur-sm z-10">
        <Link
          href="/dashboard/jobs"
          className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 p-2 rounded-md transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-base font-semibold text-zinc-50 truncate">{job.product_name}</h1>
        <div className="ml-auto">
          {job.status === 'delivered' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-950 text-blue-400">
              delivered
            </span>
          )}
          {job.status === 'processing' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-950 text-amber-400">
              processing
            </span>
          )}
          {job.status === 'failed' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-950 text-red-400">
              failed
            </span>
          )}
          {job.status === 'queued' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400">
              queued
            </span>
          )}
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: progress or video */}
          <div>
            {isDelivered && signedUrl ? (
              <div>
                <h2 className="text-sm font-medium text-zinc-300 mb-3">Your video</h2>
                <VideoPlayer
                  signedUrl={signedUrl}
                  downloadFilename={`${job.product_name.replace(/\s+/g, '-').toLowerCase()}.mp4`}
                />
              </div>
            ) : isDelivered && !signedUrl ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
                <p className="text-sm text-zinc-400">Video is ready but the download link has expired. Please refresh the page.</p>
              </div>
            ) : isFailed ? (
              <div className="bg-red-950 border border-red-800 rounded-lg p-6">
                <h2 className="text-sm font-medium text-red-300 mb-2">Generation failed</h2>
                <p className="text-sm text-zinc-400 mb-4">
                  Something went wrong during video generation. Your credits have been refunded.
                </p>
                <RegenerateButton
                  productName={job.product_name}
                  referenceVideoUrl={job.reference_video_url}
                  parentJobId={job.id}
                />
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h2 className="text-sm font-medium text-zinc-300 mb-4">Generation progress</h2>
                <JobProgressSSE jobId={jobId} />
              </div>
            )}
          </div>

          {/* Right: job details */}
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <h2 className="text-sm font-medium text-zinc-300 mb-3">Job details</h2>
              <dl className="space-y-2">
                <div className="flex justify-between text-sm">
                  <dt className="text-zinc-500">Product</dt>
                  <dd className="text-zinc-300 text-right">{job.product_name}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-zinc-500">Submitted</dt>
                  <dd className="text-zinc-300">
                    {new Date(job.created_at).toLocaleString()}
                  </dd>
                </div>
                {job.reference_video_url && (
                  <div className="flex justify-between text-sm gap-4">
                    <dt className="text-zinc-500 flex-shrink-0">Reference</dt>
                    <dd className="text-zinc-300 truncate">
                      <a
                        href={job.reference_video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-500 hover:text-emerald-400 truncate"
                      >
                        {job.reference_video_url}
                      </a>
                    </dd>
                  </div>
                )}
                {job.parent_job_id && (
                  <div className="flex justify-between text-sm">
                    <dt className="text-zinc-500">Regenerated from</dt>
                    <dd>
                      <Link
                        href={`/dashboard/jobs/${job.parent_job_id}`}
                        className="text-emerald-500 hover:text-emerald-400 text-xs font-mono"
                      >
                        {job.parent_job_id.slice(0, 8)}…
                      </Link>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {steps && steps.length > 0 && !isInProgress && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h2 className="text-sm font-medium text-zinc-300 mb-3">Steps</h2>
                <div className="space-y-2">
                  {steps.map(s => (
                    <div key={s.step} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400 capitalize">{s.step.replace(/_/g, ' ')}</span>
                      <span className={s.status === 'complete' ? 'text-emerald-400' : s.status === 'failed' ? 'text-red-400' : 'text-zinc-500'}>
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
