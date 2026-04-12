import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const uploadRequestSchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.string().min(1),
  bucket: z.enum(['assets', 'references']).default('assets'),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = uploadRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { fileName, bucket } = parsed.data
  const storagePath = `uploads/${user.id}/${Date.now()}-${fileName}`

  // STOR-01: createSignedUploadUrl returns token for TUS resumable upload
  // STOR-02: browser uploads directly to Supabase Storage — file never touches Next.js
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(storagePath)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    path: storagePath,
  })
}
