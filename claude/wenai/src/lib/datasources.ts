export interface DataSourceConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  enabled: boolean;
}

export interface DataSourceResult {
  source: string;
  data: Record<string, unknown> | string;
  timestamp: number;
  cached: boolean;
}

const DATA_SOURCES: Record<string, DataSourceConfig> = {
  chanmama: {
    name: '蝉妈妈',
    baseUrl: 'https://api.chanmama.com',
    apiKey: process.env.CHANMAMA_API_KEY || '',
    enabled: !!process.env.CHANMAMA_API_KEY,
  },
  feigua: {
    name: '飞瓜',
    baseUrl: 'https://api.feigua.cn',
    apiKey: process.env.FEIGUA_API_KEY || '',
    enabled: !!process.env.FEIGUA_API_KEY,
  },
  custom: {
    name: 'Custom',
    baseUrl: '',
    apiKey: '',
    enabled: false,
  },
};

function notConfiguredResult(sourceName: string): DataSourceResult {
  return {
    source: sourceName,
    data: `${sourceName} 外部数据源暂未启用。当前可继续使用本地 CSV 决策工作台完成复盘。`,
    timestamp: Date.now(),
    cached: false,
  };
}

function apiResult(sourceName: string, payload: Record<string, unknown>): DataSourceResult {
  return {
    source: sourceName,
    data: payload,
    timestamp: Date.now(),
    cached: false,
  };
}

export class DataSourceManager {
  private sources: Record<string, DataSourceConfig>;

  constructor(overrides?: Record<string, DataSourceConfig>) {
    this.sources = { ...DATA_SOURCES, ...overrides };
  }

  getSource(name: string): DataSourceConfig | undefined {
    return this.sources[name];
  }

  listSources(): DataSourceConfig[] {
    return Object.values(this.sources);
  }

  async fetchProductData(keyword: string): Promise<DataSourceResult[]> {
    const results: DataSourceResult[] = [];

    for (const [key, src] of Object.entries(this.sources)) {
      if (key === 'custom') continue;

      if (!src.enabled || !src.apiKey) {
        results.push(notConfiguredResult(src.name));
        continue;
      }

      try {
        const res = await fetch(`${src.baseUrl}/product/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${src.apiKey}`,
          },
          body: JSON.stringify({ keyword }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        results.push(apiResult(src.name, data));
      } catch {
        results.push({
          source: src.name,
          data: `[请求失败] ${src.name} API 调用出错`,
          timestamp: Date.now(),
          cached: false,
        });
      }
    }

    return results;
  }

  async fetchCompetitorData(url: string): Promise<DataSourceResult> {
    // Try chanmama first, then feigua
    for (const key of ['chanmama', 'feigua'] as const) {
      const src = this.sources[key];
      if (!src || !src.enabled || !src.apiKey) continue;

      try {
        const res = await fetch(`${src.baseUrl}/competitor/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${src.apiKey}`,
          },
          body: JSON.stringify({ url }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return apiResult(src.name, data);
      } catch {
        // fall through to next source
      }
    }

    return notConfiguredResult('蝉妈妈/飞瓜');
  }

  async fetchTrendData(category: string): Promise<DataSourceResult> {
    const src = this.sources.chanmama;
    if (!src?.enabled || !src.apiKey) {
      return notConfiguredResult('蝉妈妈');
    }

    try {
      const res = await fetch(`${src.baseUrl}/trend/category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${src.apiKey}`,
        },
        body: JSON.stringify({ category }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return apiResult(src.name, data);
    } catch {
      return {
        source: src.name,
        data: `[请求失败] ${src.name} 趋势 API 调用出错`,
        timestamp: Date.now(),
        cached: false,
      };
    }
  }
}
