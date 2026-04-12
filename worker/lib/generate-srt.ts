import type { StoryboardScene } from '../schemas/storyboard.js'

export function generateSrt(scenes: StoryboardScene[]): string {
  let timeOffset = 0
  return scenes.map((scene, i) => {
    const start = formatSrtTime(timeOffset)
    timeOffset += scene.duration_seconds
    const end = formatSrtTime(timeOffset)
    return `${i + 1}\n${start} --> ${end}\n${scene.caption_text}\n`
  }).join('\n')
}

function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`
}

function pad(n: number, width = 2) { return String(n).padStart(width, '0') }
