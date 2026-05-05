import { NextRequest, NextResponse } from 'next/server';
import { buildStandardPack, formatStandardPackMarkdown } from '@/lib/sop-workflows';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const pack = buildStandardPack({
    goal: typeof body.goal === 'string' ? body.goal.slice(0, 1200) : '',
    brand: typeof body.brand === 'string' ? body.brand.slice(0, 1200) : '',
    sku: typeof body.sku === 'string' ? body.sku.slice(0, 1200) : '',
    links: typeof body.links === 'string' ? body.links.slice(0, 1600) : '',
    workflowId: typeof body.workflowId === 'string' ? body.workflowId : '',
  });

  return NextResponse.json({
    ok: true,
    pack,
    markdown: formatStandardPackMarkdown(pack),
  });
}
