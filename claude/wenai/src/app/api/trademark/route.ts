import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

interface TrademarkEntry {
  mark: string;
  owner: string;
  regNo: string;
  status: 'Live' | 'Dead' | 'Pending';
  classes: string[];
  risk?: 'high' | 'medium';
  categories?: string[];
}

// Lazy-load trademark database from JSON file
let trademarkDB: Map<string, TrademarkEntry> | null = null;

function getTrademarkDB(): Map<string, TrademarkEntry> {
  if (trademarkDB) return trademarkDB;

  trademarkDB = new Map();

  // Try loading expanded database first
  try {
    const expandedPath = join(process.cwd(), 'src/data/trademarks.json');
    const data = JSON.parse(readFileSync(expandedPath, 'utf-8'));
    const entries: TrademarkEntry[] = data.trademarks || data;
    for (const entry of entries) {
      trademarkDB.set(entry.mark.toUpperCase(), entry);
    }
  } catch {
    // Fallback to hardcoded essentials
    const fallback: TrademarkEntry[] = [
      { mark: 'APPLE', owner: 'Apple Inc.', regNo: '1078312', status: 'Live', classes: ['9', '35', '38'] },
      { mark: 'AIRPODS', owner: 'Apple Inc.', regNo: '5467585', status: 'Live', classes: ['9'] },
      { mark: 'IPHONE', owner: 'Apple Inc.', regNo: '3457218', status: 'Live', classes: ['9'] },
      { mark: 'NIKE', owner: 'Nike, Inc.', regNo: '1167867', status: 'Live', classes: ['25', '28'] },
      { mark: 'ADIDAS', owner: 'adidas AG', regNo: '1018614', status: 'Live', classes: ['25'] },
      { mark: 'GUCCI', owner: 'Gucci America, Inc.', regNo: '1004866', status: 'Live', classes: ['18', '25'] },
      { mark: 'SUPREME', owner: 'Supreme, Inc.', regNo: '3762146', status: 'Live', classes: ['25'] },
      { mark: 'YETI', owner: 'YETI Coolers, LLC', regNo: '3646271', status: 'Live', classes: ['21'] },
      { mark: 'LEGO', owner: 'LEGO Juris A/S', regNo: '1018178', status: 'Live', classes: ['28'] },
      { mark: 'MUJI', owner: 'Ryohin Keikaku Kabushiki Kaisha', regNo: '1659017', status: 'Live', classes: ['3', '16', '21'] },
      { mark: 'XIAOMI', owner: 'Xiaomi Inc.', regNo: '4775405', status: 'Live', classes: ['9'] },
      { mark: 'DYSON', owner: 'Dyson Technology Limited', regNo: '3090334', status: 'Live', classes: ['7', '11'] },
      { mark: 'BEATS', owner: 'Beats Electronics, LLC', regNo: '4277590', status: 'Live', classes: ['9'] },
      { mark: 'BOSE', owner: 'Bose Corporation', regNo: '1112396', status: 'Live', classes: ['9'] },
      { mark: 'SAMSUNG', owner: 'Samsung Electronics Co., Ltd.', regNo: '1235729', status: 'Live', classes: ['9'] },
    ];
    for (const entry of fallback) {
      trademarkDB.set(entry.mark, entry);
    }
  }

  return trademarkDB;
}

interface TrademarkResult {
  keyword: string;
  found: boolean;
  data?: {
    owner: string;
    regNo: string;
    status: 'Live' | 'Dead' | 'Pending';
    classes: string[];
  };
  source: 'local' | 'uspto';
  searchedAt: number;
}

// 提取疑似品牌词（大写开头/全大写/驼峰）
export function extractBrandKeywords(text: string): string[] {
  const words = text.match(/\b[A-Z][a-zA-Z]*\b/g) || [];
  const uniqueWords = Array.from(new Set(words.map(w => w.toUpperCase())));

  // 过滤常见词（非品牌）
  const commonWords = new Set(['THE', 'A', 'AN', 'FOR', 'WITH', 'STYLE', 'TYPE', 'LIKE', 'PRO', 'PLUS', 'MAX', 'MINI', 'AIR']);
  return uniqueWords.filter(w => w.length >= 3 && !commonWords.has(w));
}

// 节流控制：5 req/s
let lastRequestTime = 0;
const MIN_INTERVAL = 200; // 200ms = 5 req/s

async function throttle() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_INTERVAL - elapsed));
  }
  lastRequestTime = Date.now();
}

// 查询单个商标（先查本地库，再查USPTO）
export async function queryTrademark(keyword: string): Promise<TrademarkResult> {
  const normalizedKeyword = keyword.toUpperCase();
  const db = getTrademarkDB();

  // 先查本地库
  const localData = db.get(normalizedKeyword);
  if (localData) {
    return {
      keyword,
      found: true,
      data: {
        owner: localData.owner,
        regNo: localData.regNo,
        status: localData.status,
        classes: localData.classes,
      },
      source: 'local',
      searchedAt: Date.now(),
    };
  }

  // USPTO API查询（此处简化实现，生产环境需调用真实API）
  // 注：USPTO没有免费的keyword搜索API，TSDR API需要序列号
  // 这里返回未找到，实际可接入第三方API如Trademarkia
  await throttle();

  return {
    keyword,
    found: false,
    source: 'uspto',
    searchedAt: Date.now(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const { keywords } = await request.json();

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: '需要提供keywords数组' }, { status: 400 });
    }

    // 批量查询（最多20个）
    const limitedKeywords = keywords.slice(0, 20);
    const results = await Promise.all(limitedKeywords.map(k => queryTrademark(k)));

    return NextResponse.json({
      results,
      total: results.length,
      foundCount: results.filter(r => r.found).length,
    });
  } catch (error) {
    console.error('Trademark API error:', error);
    return NextResponse.json(
      { error: `商标查询失败: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    );
  }
}

// GET方法：从文本中提取品牌词并查询
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');

    if (!text) {
      return NextResponse.json({ error: '需要提供text参数' }, { status: 400 });
    }

    const keywords = extractBrandKeywords(text);
    const results = await Promise.all(keywords.map(k => queryTrademark(k)));

    return NextResponse.json({
      extractedKeywords: keywords,
      results,
      total: results.length,
      foundCount: results.filter(r => r.found).length,
    });
  } catch (error) {
    console.error('Trademark extraction error:', error);
    return NextResponse.json(
      { error: `提取失败: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    );
  }
}
