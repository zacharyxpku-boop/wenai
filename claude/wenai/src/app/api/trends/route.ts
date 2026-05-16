import { NextRequest, NextResponse } from 'next/server';

// Google Trends data via SerpAPI (free tier: 100 searches/month)
// Alternative: direct scraping via unofficial endpoints
export async function POST(request: NextRequest) {
  const { keywords, region, timeframe } = await request.json();

  const serpApiKey = process.env.SERPAPI_KEY;

  if (serpApiKey) {
    try {
      const params = new URLSearchParams({
        engine: 'google_trends',
        q: Array.isArray(keywords) ? keywords.join(',') : keywords,
        geo: region || '',
        date: timeframe || 'today 3-m',
        api_key: serpApiKey,
      });

      const res = await fetch(`https://serpapi.com/search.json?${params}`);
      const data = await res.json();

      return NextResponse.json({
        source: 'google_trends',
        keywords,
        interest_over_time: data.interest_over_time?.timeline_data || [],
        related_queries: data.related_queries || {},
        related_topics: data.related_topics || {},
      });
    } catch (error) {
      return NextResponse.json(
        { error: `趋势数据获取失败: ${error instanceof Error ? error.message : '未知错误'}` },
        { status: 500 }
      );
    }
  }

  // Fallback: return curated trend data for common e-commerce categories
  return NextResponse.json({
    source: 'built_in',
    keywords,
    note: '当前使用内置趋势参考数据，启用实时趋势服务后会自动切换。',
    built_in_trends: getBuiltInTrends(Array.isArray(keywords) ? keywords[0] : keywords),
  });
}

function getBuiltInTrends(keyword: string): object {
  const trendDb: Record<string, object> = {
    '蓝牙耳机': {
      trend: 'stable_high',
      seasonality: '双11/618/圣诞前1月为峰值',
      growth_yoy: '+8%',
      top_markets: ['美国', '欧洲', '东南亚'],
      price_range: '$15-80（主力带$25-45）',
      competition: 'high',
      opportunity: '差异化方向：骨传导、开放式、睡眠专用',
    },
    '保温杯': {
      trend: 'seasonal',
      seasonality: '9-12月旺季，夏季低谷',
      growth_yoy: '+12%（品质升级驱动）',
      top_markets: ['日本', '韩国', '欧洲', '美国'],
      price_range: '$10-50（主力带$18-35）',
      competition: 'medium',
      opportunity: 'Stanley/YETI效应带动全品类增长，国产品牌出海机会大',
    },
    '充电宝': {
      trend: 'stable',
      seasonality: '旅行季（5-8月）+ 年末送礼',
      growth_yoy: '+5%',
      top_markets: ['东南亚', '中东', '非洲'],
      price_range: '$8-40（主力带$12-25）',
      competition: 'very_high',
      opportunity: '磁吸无线充+充电宝一体化、迷你口袋款',
    },
    'default': {
      trend: 'unknown',
      note: '该品类暂无内置数据，启用实时趋势服务后可获取实时趋势。',
      general_advice: '建议关注：1)品类搜索量趋势 2)竞品数量变化 3)平均售价走势 4)评论增速',
    },
  };

  return trendDb[keyword] || trendDb['default'];
}
