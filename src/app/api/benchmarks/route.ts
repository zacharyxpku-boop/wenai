import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

let cachedData: unknown = null;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (!cachedData) {
    try {
      const path = join(process.cwd(), 'src/data/industry-benchmarks.json');
      cachedData = JSON.parse(readFileSync(path, 'utf-8'));
    } catch {
      return NextResponse.json({ error: 'Benchmark data not available' }, { status: 404 });
    }
  }

  const data = cachedData as Record<string, unknown>;

  if (category) {
    const categories = data.categories as Record<string, unknown> | undefined;
    if (categories && categories[category]) {
      return NextResponse.json({ category, data: categories[category] });
    }
    return NextResponse.json({ error: `Category '${category}' not found` }, { status: 404 });
  }

  return NextResponse.json(data);
}
