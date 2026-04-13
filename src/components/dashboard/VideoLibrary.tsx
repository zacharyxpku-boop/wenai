'use client'
import Link from 'next/link'
import { Video, Clock } from 'lucide-react'

interface Job {
  id: string
  product_name: string
  status: string
  created_at: string
  delivery_url: string | null
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'delivered':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-950 text-blue-400">
          delivered
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
    case 'complete':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-400">
          complete
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400">
          {status}
        </span>
      )
  }
}

interface VideoLibraryProps {
  jobs: Job[]
}

export function VideoLibrary({ jobs }: VideoLibraryProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4">
          <Video className="w-5 h-5 text-zinc-500" />
        </div>
        <h3 className="text-sm font-medium text-zinc-50 mb-1">No videos yet</h3>
        <p className="text-sm text-zinc-400 mb-4">Submit your first job to get started.</p>
        <Link
          href="/dashboard"
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          New Job
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {jobs.map(job => (
        <Link
          key={job.id}
          href={`/dashboard/jobs/${job.id}`}
          className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-colors group"
        >
          {/* Thumbnail placeholder — no signed URL at render time */}
          <div className="aspect-[9/16] bg-zinc-800 flex items-center justify-center">
            <Video className="w-8 h-8 text-zinc-600 group-hover:text-zinc-500 transition-colors" />
          </div>

          {/* Card body */}
          <div className="p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-zinc-50 truncate">{job.product_name}</p>
              <StatusBadge status={job.status} />
            </div>
            <div className="flex items-center gap-1 mt-1.5">
              <Clock className="w-3 h-3 text-zinc-500" />
              <p className="text-xs text-zinc-500">
                {new Date(job.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
