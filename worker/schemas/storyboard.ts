import { z } from 'zod'

export const StoryboardSceneSchema = z.object({
  index: z.number(),
  description: z.string(),
  duration_seconds: z.number(),
  caption_text: z.string(),
  prompt: z.string(),
})

export const StoryboardSchema = z.object({
  hook_type: z.enum(['question', 'statement', 'demo', 'story', 'shock']),
  scene_count: z.number().min(1).max(6),
  pacing: z.enum(['fast', 'medium', 'slow']),
  cta_position: z.enum(['early', 'middle', 'end']),
  emotional_arc: z.array(z.string()),
  scenes: z.array(StoryboardSceneSchema),
})

export type Storyboard = z.infer<typeof StoryboardSchema>
export type StoryboardScene = z.infer<typeof StoryboardSceneSchema>
