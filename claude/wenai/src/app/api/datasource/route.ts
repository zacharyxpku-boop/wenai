import { NextRequest, NextResponse } from 'next/server';
import { DataSourceManager } from '@/lib/datasources';

type Action = 'product' | 'competitor' | 'trend';

interface RequestBody {
  source?: string;
  action: Action;
  params: Record<string, string>;
}

const manager = new DataSourceManager();

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const { action, params } = body;

    if (!action) {
      return NextResponse.json(
        { error: '缺少 action 参数，可选值: product, competitor, trend' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'product': {
        const keyword = params?.keyword;
        if (!keyword) {
          return NextResponse.json(
            { error: '缺少 params.keyword 参数' },
            { status: 400 }
          );
        }
        const results = await manager.fetchProductData(keyword);
        return NextResponse.json({ action, results });
      }

      case 'competitor': {
        const url = params?.url;
        if (!url) {
          return NextResponse.json(
            { error: '缺少 params.url 参数' },
            { status: 400 }
          );
        }
        const result = await manager.fetchCompetitorData(url);
        return NextResponse.json({ action, result });
      }

      case 'trend': {
        const category = params?.category;
        if (!category) {
          return NextResponse.json(
            { error: '缺少 params.category 参数' },
            { status: 400 }
          );
        }
        const result = await manager.fetchTrendData(category);
        return NextResponse.json({ action, result });
      }

      default:
        return NextResponse.json(
          { error: `不支持的 action: ${action}，可选值: product, competitor, trend` },
          { status: 400 }
        );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : '服务器内部错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
