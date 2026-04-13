'use client'
import { Download } from 'lucide-react'

interface VideoPlayerProps {
  signedUrl: string
  poster?: string
  downloadFilename?: string
}

export function VideoPlayer({ signedUrl, poster, downloadFilename = 'clico-video.mp4' }: VideoPlayerProps) {
  return (
    <div className="space-y-3">
      <video
        src={signedUrl}
        controls
        playsInline
        poster={poster}
        className="w-full aspect-[9/16] rounded-lg bg-black max-w-xs mx-auto block"
      />
      <div className="flex justify-center">
        <a
          href={signedUrl}
          download={downloadFilename}
          className="flex items-center gap-2 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-zinc-50 text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          <Download className="w-4 h-4" />
          Download MP4
        </a>
      </div>
    </div>
  )
}
