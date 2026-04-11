'use client';

import { useState } from 'react';
import modulesConfig from '@/config/modules.json';
import clientConfig from '@/config/client.json';

const catDotColors: Record<string, string> = {
  execute: 'bg-cat-execute',
  content: 'bg-cat-content',
  intel: 'bg-cat-intel',
  service: 'bg-cat-service',
};

export default function SettingsPage() {
  const [config, setConfig] = useState(clientConfig);
  const [saved, setSaved] = useState(false);

  const toggleModule = (moduleId: string) => {
    setConfig(prev => {
      const enabled = new Set(prev.enabledModules);
      if (enabled.has(moduleId)) {
        enabled.delete(moduleId);
      } else {
        enabled.add(moduleId);
      }
      return { ...prev, enabledModules: Array.from(enabled) };
    });
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert('保存失败，本地部署环境请手动修改 src/config/client.json');
    }
  };

  const enabledCount = config.enabledModules.length;
  const totalCount = modulesConfig.modules.length;

  return (
    <div className="max-w-[800px] animate-fade-up">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-base font-semibold text-text-primary tracking-tight font-[family-name:var(--font-outfit)]">
          客户配置
        </h1>
        <p className="text-[13px] text-text-secondary mt-0.5">
          部署设置与模块开关
        </p>
      </div>

      {/* Client info */}
      <div className="bg-bg-surface border border-border-subtle rounded-md p-4 mb-3.5">
        <div className="flex items-center gap-2 mb-3">
          <span className="label-mono">基本信息</span>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label-mono block mb-1.5">客户名称</label>
            <input
              type="text"
              value={config.clientName}
              onChange={e => setConfig(prev => ({ ...prev, clientName: e.target.value }))}
              className="w-full bg-bg-root border border-border-subtle rounded-md px-3 py-2 text-[13px] text-text-primary transition-all focus:border-accent focus:shadow-[0_0_0_1px_rgba(200,151,90,0.2)]"
            />
          </div>
          <div>
            <label className="label-mono block mb-1.5">行业</label>
            <input
              type="text"
              value={config.industry}
              onChange={e => setConfig(prev => ({ ...prev, industry: e.target.value }))}
              className="w-full bg-bg-root border border-border-subtle rounded-md px-3 py-2 text-[13px] text-text-primary transition-all focus:border-accent focus:shadow-[0_0_0_1px_rgba(200,151,90,0.2)]"
            />
          </div>
        </div>
      </div>

      {/* Module toggles */}
      <div className="bg-bg-surface border border-border-subtle rounded-md p-4 mb-3.5">
        <div className="flex items-center gap-2 mb-3">
          <span className="label-mono">AI员工</span>
          <div className="flex-1 h-px bg-border-subtle" />
          <span className="text-[9px] font-mono text-accent tabular-nums">{enabledCount}/{totalCount}</span>
        </div>

        {modulesConfig.categories.map(cat => {
          const catModules = modulesConfig.modules.filter(m => m.category === cat.id);
          return (
            <div key={cat.id} className="mb-4 last:mb-0">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className={`w-1 h-1 rounded-full ${catDotColors[cat.id] || 'bg-text-tertiary'}`} />
                <span className="label-mono text-[9px]">
                  {cat.label}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {catModules.map(mod => {
                  const isEnabled = config.enabledModules.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      onClick={() => toggleModule(mod.id)}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-md border text-[11px] transition-all ${
                        isEnabled
                          ? 'border-accent/20 bg-accent-dim text-text-primary shadow-[0_0_0_1px_rgba(200,151,90,0.05)]'
                          : 'border-border-subtle bg-transparent text-text-tertiary hover:text-text-secondary hover:bg-bg-hover'
                      }`}
                    >
                      <span className="font-[family-name:var(--font-outfit)] font-medium">{mod.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8px] font-mono uppercase tracking-wider ${isEnabled ? 'text-accent' : 'text-text-tertiary'}`}>
                          {isEnabled ? 'ON' : 'OFF'}
                        </span>
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isEnabled ? 'bg-success' : 'bg-border-default'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className={`px-4 py-2 rounded-md font-medium text-[12px] transition-all font-[family-name:var(--font-outfit)] ${
            saved
              ? 'bg-success/10 text-success border border-success/30'
              : 'bg-accent text-bg-root hover:bg-accent-hover'
          }`}
        >
          {saved ? '✓ 已保存' : '保存配置'}
        </button>
        <p className="text-[9px] font-mono text-text-tertiary">
          修改后需重启服务
        </p>
      </div>
    </div>
  );
}
