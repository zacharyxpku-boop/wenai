import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { path } = await params
  const storagePath = decodeURIComponent(path)

  // STOR-03: serve via presigned URL, not direct storage link
  const { data, error } = await supabase.storage
    .from('deliveries')
    .createSignedUrl(storagePath, 3600) // 1-hour expiry

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json({ url: data.signedUrl })
}
