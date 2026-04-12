import { ffmpeg } from './ffmpeg.js'
import { statSync } from 'fs'

export interface ValidationResult {
  valid: boolean
  error?: string
  metadata?: {
    width: number
    height: number
    duration: number
    fileSize: number
  }
}

export function validateOutput(videoPath: string): Promise<ValidationResult> {
  return new Promise((resolve) => {
    // QC-01: Check non-zero file size first
    try {
      const { size } = statSync(videoPath)
      if (size === 0) {
        return resolve({ valid: false, error: 'Output file is zero bytes' })
      }
    } catch {
      return resolve({ valid: false, error: 'Output file does not exist' })
    }

    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        return resolve({ valid: false, error: `ffprobe failed: ${err.message}` })
      }

      const videoStream = metadata.streams.find(s => s.codec_type === 'video')
      if (!videoStream) {
        return resolve({ valid: false, error: 'No video stream found' })
      }

      const width = videoStream.width ?? 0
      const height = videoStream.height ?? 0

      // QC-01: Resolution must be 1080x1920 (9:16)
      if (width !== 1080 || height !== 1920) {
        return resolve({ valid: false, error: `Wrong resolution: ${width}x${height}, expected 1080x1920` })
      }

      const duration = parseFloat(metadata.format.duration ?? '0')
      // QC-01: Duration must be at least 1 second
      if (duration < 1) {
        return resolve({ valid: false, error: `Duration too short: ${duration}s` })
      }

      const fileSize = parseInt(metadata.format.size ?? '0')
      resolve({
        valid: true,
        metadata: { width, height, duration, fileSize },
      })
    })
  })
}
