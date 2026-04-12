import { z } from 'zod'

export const HookVariantSchema = z.object({
  hook_script: z.string(),
  hook_prompt: z.string(),
  hook_type: z.enum(['question', 'statement', 'demo', 'story', 'shock']),
})

export const HookVariantsSchema = z.array(HookVariantSchema).min(1).max(5)
export type HookVariant = z.infer<typeof HookVariantSchema>
