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
    <div className="max-w-[900px] animate-fade-up">
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-accent rounded-full" />
          <h1 className="text-[16px] font-bold text-text-primary tracking-tight font-[family-name:var(--font-outfit)]">
            客户配置
          </h1>
        </div>
        <p className="text-[13px] text-text-secondary/90 ml-4">
          部署设置与AI员工模块管理
        </p>
      </div>

      {/* Client info */}
      <div className="bg-bg-surface border border-border-default rounded-md p-5 mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-2 mb-4">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-accent">
            <rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 5v4M5 7h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="label-mono text-[10px] font-bold">基本信息</span>
          <div className="flex-1 h-px bg-gradient-to-r from-border-subtle to-transparent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-mono block mb-2 text-[9px] font-semibold">客户名称</label>
            <input
              type="text"
              value={config.clientName}
              onChange={e => setConfig(prev => ({ ...prev, clientName: e.target.value }))}
              className="w-full bg-bg-raised border border-border-subtle rounded-md px-4 py-3 text-[13px] text-text-primary transition-all focus:border-accent focus:bg-bg-surface focus:shadow-[0_0_0_2px_rgba(200,151,90,0.15)]"
            />
          </div>
          <div>
            <label className="label-mono block mb-2 text-[9px] font-semibold">行业</label>
            <input
              type="text"
              value={config.industry}
              onChange={e => setConfig(prev => ({ ...prev, industry: e.target.value }))}
              className="w-full bg-bg-raised border border-border-subtle rounded-md px-4 py-3 text-[13px] text-text-primary transition-all focus:border-accent focus:bg-bg-surface focus:shadow-[0_0_0_2px_rgba(200,151,90,0.15)]"
            />
          </div>
        </div>
      </div>

      {/* Module toggles */}
      <div className="bg-bg-surface border border-border-default rounded-md p-5 mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-2 mb-5">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-accent">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 4v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="label-mono text-[10px] font-bold">AI员工配置</span>
          <div className="flex-1 h-px bg-gradient-to-r from-border-subtle to-transparent" />
          <div className="flex items-center gap-2 bg-bg-raised border border-border-subtle rounded-md px-2.5 py-1.5">
            <span className="text-[9px] font-mono text-text-tertiary">已启用</span>
            <span className="text-[11px] font-mono text-accent font-bold tabular-nums">{enabledCount}</span>
            <span className="text-[9px] font-mono text-text-tertiary/60">/</span>
            <span className="text-[11px] font-mono text-text-secondary tabular-nums">{totalCount}</span>
          </div>
        </div>

        {modulesConfig.categories.map(cat => {
          const catModules = modulesConfig.modules.filter(m => m.category === cat.id);
          const catEnabled = catModules.filter(m => config.enabledModules.includes(m.id)).length;
          return (
            <div key={cat.id} className="mb-5 last:mb-0">
              <div className="flex items-center gap-2 mb-2.5">
                <div className={`w-1.5 h-1.5 rounded-full ${catDotColors[cat.id] || 'bg-text-tertiary'} shadow-[0_0_4px_currentColor]`} style={{ color: `var(--color-cat-${cat.id})` }} />
                <span className="label-mono text-[9px] font-semibold">
                  {cat.label}
                </span>
                <div className="flex-1 h-px bg-border-subtle/50" />
                <span className="text-[8px] font-mono text-text-tertiary/70 tabular-nums">
                  {catEnabled}/{catModules.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {catModules.map(mod => {
                  const isEnabled = config.enabledModules.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      onClick={() => toggleModule(mod.id)}
                      className={`group flex items-center justify-between px-3.5 py-2.5 rounded-md border text-[12px] transition-all duration-200 ${
                        isEnabled
                          ? 'border-accent/40 bg-accent/15 text-text-primary shadow-[0_2px_8px_rgba(200,151,90,0.15)]'
                          : 'border-border-subtle bg-bg-raised text-text-tertiary hover:text-text-primary hover:bg-bg-hover hover:border-border-default'
                      }`}
                    >
                      <span className="font-[family-name:var(--font-outfit)] font-semibold">{mod.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-mono uppercase tracking-[0.1em] font-semibold ${isEnabled ? 'text-accent' : 'text-text-tertiary/70'}`}>
                          {isEnabled ? 'ON' : 'OFF'}
                        </span>
                        <div className={`w-8 h-4 rounded-full transition-all duration-200 relative ${
                          isEnabled ? 'bg-accent/30 border border-accent/50' : 'bg-bg-surface border border-border-subtle'
                        }`}>
                          <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200 ${
                            isEnabled ? 'left-4 bg-accent shadow-[0_0_6px_rgba(200,151,90,0.6)]' : 'left-0.5 bg-text-tertiary/50'
                          }`} />
                        </div>
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
      <div className="flex items-center justify-between bg-bg-surface border border-border-default rounded-md p-4 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-text-tertiary">
            <path d="M7 2v10M12 7H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <div>
            <p className="text-[11px] font-mono text-text-tertiary font-semibold">系统提示</p>
            <p className="text-[9px] font-mono text-text-tertiary/70 mt-0.5">修改后需重启服务生效</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className={`px-6 py-2.5 rounded-md font-semibold text-[12px] transition-all duration-200 font-[family-name:var(--font-outfit)] ${
            saved
              ? 'bg-success/15 text-success border border-success/40 shadow-[0_2px_8px_rgba(74,222,128,0.2)]'
              : 'bg-accent text-bg-root border border-accent hover:bg-accent-hover hover:shadow-[0_4px_12px_rgba(200,151,90,0.3)] active:scale-95'
          }`}
        >
          <span className="flex items-center gap-2">
            {saved ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                已保存
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11 13H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h5.5L11 3.5V11c0 1.1-.9 2-2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M4 1v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                保存配置
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
