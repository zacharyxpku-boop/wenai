'use client';

import { useState } from 'react';
import {
  clearKuaiziConfig,
  getKuaiziConfig,
  saveKuaiziConfig,
  testKuaiziConnection,
  type KuaiziEndpoint,
} from '@/lib/kuaizi-api';

export default function KuaiziSettingsPage() {
  const initialConfig = typeof window === 'undefined' ? null : getKuaiziConfig();
  const [apiKey, setApiKey] = useState('');
  const [maskedKey, setMaskedKey] = useState(initialConfig?.maskedApiKey || '');
  const [endpoint, setEndpoint] = useState<KuaiziEndpoint>(initialConfig?.endpoint || 'sandbox');
  const [status, setStatus] = useState('尚未测试连接');
  const [isTesting, setIsTesting] = useState(false);
  const [savedAt, setSavedAt] = useState(initialConfig?.savedAt || '');

  const save = () => {
    const keyToSave = apiKey.trim();
    if (!keyToSave) {
      setStatus('请输入 API Key 后再保存');
      return;
    }
    saveKuaiziConfig({ apiKey: keyToSave, endpoint });
    const config = getKuaiziConfig();
    setMaskedKey(config?.maskedApiKey || '');
    setSavedAt(config?.savedAt || '');
    setApiKey('');
    setStatus('配置已保存');
  };

  const test = async () => {
    setIsTesting(true);
    setStatus('正在测试连接...');
    const result = await testKuaiziConnection();
    setStatus(result.message);
    setIsTesting(false);
  };

  const clear = () => {
    clearKuaiziConfig();
    setApiKey('');
    setMaskedKey('');
    setSavedAt('');
    setStatus('配置已清除');
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <section className="rounded-md border border-slate-200 bg-white p-6">
        <div className="text-[12px] font-black uppercase tracking-wide text-amber-700">Kuaizi API</div>
        <h1 className="mt-2 text-3xl font-black text-slate-950">筷子科技 API 配置</h1>
        <p className="mt-2 text-[13px] leading-6 text-slate-600">配置后，Wenai 可以把已确认的生产 Brief 推送到筷子科技创建素材生产任务。</p>

        <div className="mt-6 grid gap-4">
          <label className="block">
            <span className="text-[12px] font-bold text-slate-700">API Key</span>
            <input
              type="password"
              value={apiKey}
              onChange={event => setApiKey(event.target.value)}
              placeholder={maskedKey || '输入筷子科技 API Key'}
              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 text-[13px] outline-none focus:border-amber-400"
            />
            {maskedKey && <span className="mt-2 block text-[12px] text-slate-500">当前已保存：{maskedKey}</span>}
          </label>

          <label className="block">
            <span className="text-[12px] font-bold text-slate-700">Endpoint</span>
            <select
              value={endpoint}
              onChange={event => setEndpoint(event.target.value as KuaiziEndpoint)}
              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 text-[13px] outline-none focus:border-amber-400"
            >
              <option value="sandbox">沙盒环境</option>
              <option value="production">生产环境</option>
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={save} className="rounded-md bg-slate-950 px-4 py-3 text-[13px] font-black text-white">保存配置</button>
          <button type="button" onClick={test} disabled={isTesting} className="rounded-md bg-amber-600 px-4 py-3 text-[13px] font-black text-white disabled:opacity-60">
            {isTesting ? '测试中...' : '测试连接'}
          </button>
          <button type="button" onClick={clear} className="rounded-md border border-slate-200 px-4 py-3 text-[13px] font-bold text-slate-700">清除配置</button>
        </div>

        <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="text-[12px] font-black text-slate-900">连接状态</div>
          <p className="mt-2 text-[13px] text-slate-700">{status}</p>
          {savedAt && <p className="mt-1 text-[12px] text-slate-500">上次保存：{new Date(savedAt).toLocaleString('zh-CN')}</p>}
        </div>
      </section>
    </main>
  );
}
