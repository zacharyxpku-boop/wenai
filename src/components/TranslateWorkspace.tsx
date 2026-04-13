'use client';

import { useState, useRef } from 'react';
import ResultFeedback from './ResultFeedback';
import ExpertReview from './ExpertReview';

const LANGUAGES = [
  { code: 'en', label: '英语', flag: 'EN' },
  { code: 'ja', label: '日语', flag: 'JA' },
  { code: 'ko', label: '韩语', flag: 'KO' },
  { code: 'th', label: '泰语', flag: 'TH' },
  { code: 'vi', label: '越南语', flag: 'VI' },
  { code: 'ar', label: '阿拉伯语', flag: 'AR' },
  { code: 'es', label: '西班牙语', flag: 'ES' },
  { code: 'pt', label: '葡萄牙语', flag: 'PT' },
  { code: 'fr', label: '法语', flag: 'FR' },
  { code: 'de', label: '德语', flag: 'DE' },
  { code: 'ru', label: '俄语', flag: 'RU' },
  { code: 'id', label: '印尼语', flag: 'ID' },
];

interface TranslateResult {
  lang: string;
  langLabel: string;
  content: string;
  loading: boolean;
}

export default function TranslateWorkspace() {
  const [input, setInput] = useState('');
  const [glossary, setGlossary] = useState('');
  const [showGlossary, setShowGlossary] = useState(false);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['en']);
  const [results, setResults] = useState<TranslateResult[]>([]);
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [batchInput, setBatchInput] = useState('');
  const [batchResults, setBatchResults] = useState<string[]>([]);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchRunning, setBatchRunning] = useState(false);
  const abortRef = useRef(false);

  const toggleLang = (code: string) => {
    setSelectedLangs(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const buildPrompt = (targetLang: string) => {
    let prompt = `你是专业电商翻译专家，请将以下中文商品信息翻译为${targetLang}。

要求：
1. 保留电商关键词和卖点的营销力度
2. 符合目标市场的本地化表达习惯
3. 标题控制在合理字符数内
4. 品牌名、型号保留原文不翻译
5. 如有多个字段（标题/描述/卖点），分别翻译并标注`;

    if (glossary.trim()) {
      prompt += `\n\n术语表（必须按此翻译）：\n${glossary}`;
    }

    return prompt;
  };

  const handleTranslate = async () => {
    if (!input.trim() || selectedLangs.length === 0) return;

    const newResults: TranslateResult[] = selectedLangs.map(code => {
      const lang = LANGUAGES.find(l => l.code === code);
      return { lang: code, langLabel: lang?.label || code, content: '', loading: true };
    });
    setResults(newResults);

    // Fire all translations in parallel
    const promises = selectedLangs.map(async (code, idx) => {
      const lang = LANGUAGES.find(l => l.code === code);
      const prompt = buildPrompt(lang?.label || code);
      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleId: 'translate', prompt, input }),
        });
        const data = await res.json();
        setResults(prev => {
          const next = [...prev];
          next[idx] = { ...next[idx], content: data.content || data.error || '翻译失败', loading: false };
          return next;
        });
      } catch {
        setResults(prev => {
          const next = [...prev];
          next[idx] = { ...next[idx], content: '请求失败', loading: false };
          return next;
        });
      }
    });

    await Promise.all(promises);
  };

  const handleBatch = async () => {
    if (!batchInput.trim() || selectedLangs.length === 0) return;
    const lines = batchInput.split('\n').filter(l => l.trim());
    if (lines.length === 0) return;

    setBatchRunning(true);
    setBatchProgress(0);
    setBatchResults([]);
    abortRef.current = false;

    const allResults: string[] = [];
    const total = lines.length * selectedLangs.length;
    let done = 0;

    for (const line of lines) {
      if (abortRef.current) break;
      const langResults: string[] = [];
      for (const code of selectedLangs) {
        if (abortRef.current) break;
        const lang = LANGUAGES.find(l => l.code === code);
        const prompt = buildPrompt(lang?.label || code);
        try {
          const res = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ moduleId: 'translate', prompt, input: line }),
          });
          const data = await res.json();
          langResults.push(`[${lang?.flag}] ${data.content || '失败'}`);
        } catch {
          langResults.push(`[${lang?.flag}] 请求失败`);
        }
        done++;
        setBatchProgress(Math.round((done / total) * 100));
      }
      allResults.push(`原文：${line}\n${langResults.join('\n')}`);
      setBatchResults([...allResults]);
    }

    setBatchRunning(false);
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportAll = () => {
    const text = results.map(r => `=== ${r.langLabel} ===\n${r.content}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `翻译结果_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputCharCount = input.length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
        <div>
          <h2 className="text-[15px] font-semibold text-text-primary font-[family-name:var(--font-outfit)]">
            批量翻译 · Batch Translate
          </h2>
          <p className="text-[11px] text-text-tertiary font-mono mt-0.5">
            多语言并行翻译，术语锁定，批量处理
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('single')}
            className={`text-[11px] font-mono px-3 py-1.5 rounded-md border transition-colors ${
              mode === 'single'
                ? 'border-accent/30 bg-accent-dim text-accent'
                : 'border-border-subtle text-text-tertiary hover:text-text-secondary'
            }`}
          >
            单条翻译
          </button>
          <button
            onClick={() => setMode('batch')}
            className={`text-[11px] font-mono px-3 py-1.5 rounded-md border transition-colors ${
              mode === 'batch'
                ? 'border-accent/30 bg-accent-dim text-accent'
                : 'border-border-subtle text-text-tertiary hover:text-text-secondary'
            }`}
          >
            批量模式
          </button>
        </div>
      </div>

      {/* Language selector */}
      <div className="px-5 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono text-text-tertiary tracking-widest">目标语言</span>
          <span className="text-[10px] font-mono text-accent">{selectedLangs.length} 种</span>
          <div className="flex-1" />
          <button
            onClick={() => setShowGlossary(!showGlossary)}
            className="text-[10px] font-mono text-text-tertiary hover:text-accent px-2 py-1 border border-border-subtle rounded-md transition-colors"
          >
            {showGlossary ? '收起术语表' : '术语锁定'}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => toggleLang(lang.code)}
              className={`text-[11px] font-mono px-2.5 py-1.5 rounded-md border transition-all ${
                selectedLangs.includes(lang.code)
                  ? 'border-accent/30 bg-accent-dim text-accent'
                  : 'border-border-subtle text-text-tertiary hover:text-text-secondary hover:border-border-default'
              }`}
            >
              <span className="opacity-60 mr-1">{lang.flag}</span>
              {lang.label}
            </button>
          ))}
        </div>

        {showGlossary && (
          <div className="mt-3 animate-fade-up">
            <textarea
              value={glossary}
              onChange={e => setGlossary(e.target.value)}
              placeholder="品牌名 = Brand Name&#10;卖点A = Selling Point A&#10;每行一个术语对，用 = 分隔"
              rows={3}
              className="w-full bg-bg-root border border-border-subtle rounded-md px-3 py-2 text-[12px] text-text-primary placeholder:text-text-tertiary font-mono resize-none"
            />
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {mode === 'single' ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Input side */}
            <div className="w-[45%] flex flex-col border-r border-border-subtle">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle">
                <span className="text-[10px] font-mono text-text-tertiary tracking-widest">中文原文</span>
                <span className="text-[10px] font-mono text-text-tertiary">{inputCharCount} 字</span>
              </div>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleTranslate(); } }}
                placeholder="粘贴商品信息（标题、描述、卖点等）&#10;&#10;支持多字段，系统会自动识别并分别翻译"
                className="flex-1 bg-transparent px-4 py-3 text-[13px] text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none"
              />
              <div className="px-4 py-3 border-t border-border-subtle flex items-center gap-2">
                <button
                  onClick={handleTranslate}
                  disabled={!input.trim() || selectedLangs.length === 0}
                  className="bg-accent hover:bg-accent-hover text-bg-root text-[12px] font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-[family-name:var(--font-outfit)]"
                >
                  翻译 → {selectedLangs.length} 种语言
                </button>
                <span className="text-[10px] font-mono text-text-tertiary">Ctrl+Enter</span>
              </div>
            </div>

            {/* Output side */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle">
                <span className="text-[10px] font-mono text-text-tertiary tracking-widest">翻译结果</span>
                {results.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportAll}
                      className="text-[10px] font-mono text-text-tertiary hover:text-accent transition-colors"
                    >
                      全部导出
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto">
                {results.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-[12px] text-text-tertiary font-mono">选择语言，输入内容，点击翻译</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border-subtle">
                    {results.map(r => (
                      <div key={r.lang} className="px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-accent tracking-wider">{LANGUAGES.find(l => l.code === r.lang)?.flag}</span>
                            <span className="text-[11px] font-mono text-text-secondary">{r.langLabel}</span>
                          </div>
                          {!r.loading && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-text-tertiary">{r.content.length} 字符</span>
                              <button
                                onClick={() => copyText(r.content)}
                                className="text-[10px] font-mono text-text-tertiary hover:text-accent transition-colors"
                              >
                                复制
                              </button>
                            </div>
                          )}
                        </div>
                        {r.loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin-smooth" />
                            <span className="text-[11px] text-text-tertiary font-mono">翻译中</span>
                          </div>
                        ) : (
                          <div className="text-[13px] text-text-primary whitespace-pre-wrap leading-relaxed">
                            {r.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Feedback + Review */}
                {results.length > 0 && results.every(r => !r.loading) && (
                  <div className="px-4 pb-4">
                    <ResultFeedback
                      moduleId="translate"
                      resultText={results.map(r => r.content).join('\n')}
                    />
                    <ExpertReview
                      moduleId="translate"
                      resultText={results.map(r => r.content).join('\n')}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Batch mode */
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/2 flex flex-col border-r border-border-subtle">
                <div className="px-4 py-2 border-b border-border-subtle">
                  <span className="text-[10px] font-mono text-text-tertiary tracking-widest">批量输入（每行一条商品）</span>
                </div>
                <textarea
                  value={batchInput}
                  onChange={e => setBatchInput(e.target.value)}
                  placeholder="无线蓝牙耳机 降噪 长续航 运动防水&#10;智能手表 心率监测 NFC支付 GPS定位&#10;便携充电宝 20000mAh 快充 超薄"
                  className="flex-1 bg-transparent px-4 py-3 text-[13px] text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none font-mono"
                />
                <div className="px-4 py-3 border-t border-border-subtle flex items-center gap-3">
                  <button
                    onClick={batchRunning ? () => { abortRef.current = true; } : handleBatch}
                    disabled={!batchInput.trim() || selectedLangs.length === 0}
                    className={`text-[12px] font-medium px-4 py-2 rounded-md transition-colors font-[family-name:var(--font-outfit)] ${
                      batchRunning
                        ? 'bg-error/80 hover:bg-error text-white'
                        : 'bg-accent hover:bg-accent-hover text-bg-root disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    {batchRunning ? '停止' : `批量翻译 ${batchInput.split('\n').filter(l => l.trim()).length} 条`}
                  </button>
                  {batchRunning && (
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-bg-raised rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent transition-all rounded-full"
                          style={{ width: `${batchProgress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-text-tertiary">{batchProgress}%</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-1/2 flex flex-col">
                <div className="px-4 py-2 border-b border-border-subtle flex items-center justify-between">
                  <span className="text-[10px] font-mono text-text-tertiary tracking-widest">批量结果</span>
                  {batchResults.length > 0 && (
                    <button
                      onClick={() => {
                        const text = batchResults.join('\n\n---\n\n');
                        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `批量翻译_${new Date().toISOString().slice(0, 10)}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="text-[10px] font-mono text-text-tertiary hover:text-accent transition-colors"
                    >
                      导出全部
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-3">
                  {batchResults.length === 0 ? (
                    <p className="text-[12px] text-text-tertiary font-mono">每行一条商品信息，支持批量翻译到多种语言</p>
                  ) : (
                    <div className="space-y-4">
                      {batchResults.map((r, i) => (
                        <div key={i} className="text-[12px] text-text-primary whitespace-pre-wrap font-mono bg-bg-surface border border-border-subtle rounded-md p-3">
                          {r}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
