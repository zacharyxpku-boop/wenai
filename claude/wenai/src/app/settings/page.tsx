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
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-text-primary tracking-tight font-[family-name:var(--font-outfit)]">
          客户配置
        </h1>
        <p className="text-[13px] text-text-secondary mt-1">
          部署设置与模块开关
        </p>
      </div>

      {/* Client info */}
      <div className="bg-bg-surface border border-border-subtle rounded-md p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest">基本信息</span>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-mono text-text-tertiary block mb-1.5">客户名称</label>
            <input
              type="text"
              value={config.clientName}
              onChange={e => setConfig(prev => ({ ...prev, clientName: e.target.value }))}
              className="w-full bg-bg-root border border-border-subtle rounded-md px-3 py-2.5 text-[13px] text-text-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-text-tertiary block mb-1.5">行业</label>
            <input
              type="text"
              value={config.industry}
              onChange={e => setConfig(prev => ({ ...prev, industry: e.target.value }))}
              className="w-full bg-bg-root border border-border-subtle rounded-md px-3 py-2.5 text-[13px] text-text-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Module toggles */}
      <div className="bg-bg-surface border border-border-subtle rounded-md p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest">AI员工</span>
          <div className="flex-1 h-px bg-border-subtle" />
          <span className="text-[10px] font-mono text-accent">{enabledCount}/{totalCount} 已启用</span>
        </div>

        {modulesConfig.categories.map(cat => {
          const catModules = modulesConfig.modules.filter(m => m.category === cat.id);
          return (
            <div key={cat.id} className="mb-5 last:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-1 h-1 rounded-full ${catDotColors[cat.id] || 'bg-text-tertiary'}`} />
                <span className="text-[10px] font-mono font-medium text-text-tertiary uppercase tracking-widest">
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
                      className={`flex items-center justify-between px-3 py-2.5 rounded-md border text-[12px] transition-all ${
                        isEnabled
                          ? 'border-accent/20 bg-accent-dim text-text-primary'
                          : 'border-border-subtle bg-transparent text-text-tertiary hover:text-text-secondary hover:bg-bg-hover'
                      }`}
                    >
                      <span className="font-[family-name:var(--font-outfit)]">{mod.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-mono uppercase tracking-wider ${isEnabled ? 'text-accent' : 'text-text-tertiary'}`}>
                          {isEnabled ? 'ON' : 'OFF'}
                        </span>
                        <div className={`w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-success' : 'bg-border-default'}`} />
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
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className={`px-5 py-2.5 rounded-md font-medium text-[13px] transition-all font-[family-name:var(--font-outfit)] ${
            saved
              ? 'bg-success/15 text-success border border-success/30'
              : 'bg-accent text-bg-root hover:bg-accent-hover'
          }`}
        >
          {saved ? '已保存' : '保存配置'}
        </button>
        <p className="text-[10px] font-mono text-text-tertiary">
          修改后需重启服务生效
        </p>
      </div>
    </div>
  );
}
