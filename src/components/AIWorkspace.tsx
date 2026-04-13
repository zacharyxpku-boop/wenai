'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import ResultFeedback from './ResultFeedback';
import ExpertReview from './ExpertReview';

interface HistoryItem {
  id: string;
  input: string;
  result: string;
  params: Record<string, string>;
  timestamp: number;
}

interface AIWorkspaceProps {
  moduleId: string;
  moduleName: string;
  modulePrompt: string;
  placeholder?: string;
  fields?: { key: string; label: string; placeholder: string }[];
  supportCSV?: boolean;
  assistOnly?: boolean;
  assistOnlyReason?: string;
}

function useUserRole() {
  const [role, setRole] = useState<string>('viewer');
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setRole(d.role || 'viewer')).catch(() => {});
  }, []);
  return role;
}

export default function AIWorkspace({
  moduleId,
  moduleName,
  modulePrompt,
  placeholder = '请输入内容...',
  fields,
  supportCSV = false,
  assistOnly = false,
  assistOnlyReason,
}: AIWorkspaceProps) {
  const userRole = useUserRole();
  const canExport = userRole === 'admin' || userRole === 'editor';
  const [input, setInput] = useState('');
  const [params, setParams] = useState<Record<string, string>>({});
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [csvResults, setCsvResults] = useState<{ input: string; output: string }[]>([]);
  const [csvProcessing, setCsvProcessing] = useState(false);
  const [csvProgress, setCsvProgress] = useState({ current: 0, total: 0 });
  const [copied, setCopied] = useState(false);
  const [trademarkQuery, setTrademarkQuery] = useState<{
    results: Array<{ keyword: string; found: boolean; data?: { owner: string; regNo: string } }>;
    foundCount: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`wenai_history_${moduleId}`);
    if (stored) {
      try { setHistory(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, [moduleId]);

  const saveToHistory = (inp: string, res: string, p: Record<string, string>) => {
    const item: HistoryItem = {
      id: Date.now().toString(),
      input: inp.substring(0, 200),
      result: res,
      params: p,
      timestamp: Date.now(),
    };
    const updated = [item, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem(`wenai_history_${moduleId}`, JSON.stringify(updated));
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setResult('');

    try {
      let prompt = modulePrompt;
      const allParams = { ...params, input };
      for (const [key, value] of Object.entries(allParams)) {
        prompt = prompt.replaceAll(`{${key}}`, value);
      }

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, prompt, input, params }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 429) {
          throw new Error(`今日该模块调用次数已达上限。${data.error || ''}`);
        }
        throw new Error(data.error || '请求失败');
      }

      const data = await response.json();
      setResult(data.content);
      setTrademarkQuery(data.trademarkQuery || null);
      saveToHistory(input, data.content, params);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  const MAX_CSV_ROWS = 1000;
  const CSV_CONCURRENCY = 5;

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    result.push(current.trim());
    return result;
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('CSV文件不能超过10MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').filter(r => r.trim()).map(parseCSVLine);
      if (rows.length > MAX_CSV_ROWS + 1) {
        setError(`CSV最多支持${MAX_CSV_ROWS}行数据（当前${rows.length - 1}行）`);
        return;
      }
      setCsvData(rows);
      setCsvResults([]);
      setError('');
    };
    reader.readAsText(file, 'utf-8');
  };

  const processCSVBatch = async () => {
    if (csvData.length <= 1) return;
    setCsvProcessing(true);
    setCsvResults([]);
    const dataRows = csvData.slice(1);
    setCsvProgress({ current: 0, total: dataRows.length });
    const results: { input: string; output: string }[] = new Array(dataRows.length);
    let completed = 0;

    const processRow = async (i: number) => {
      const rowText = csvData[0].map((h, j) => `${h}: ${dataRows[i][j] || ''}`).join('\n');
      try {
        let prompt = modulePrompt;
        const allParams = { ...params, input: rowText };
        for (const [key, value] of Object.entries(allParams)) {
          prompt = prompt.replaceAll(`{${key}}`, value);
        }
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleId, prompt, input: rowText, params }),
        });
        const data = await response.json();
        results[i] = { input: rowText, output: data.content || data.error || '' };
      } catch {
        results[i] = { input: rowText, output: '[处理失败]' };
      }
      completed++;
      setCsvProgress({ current: completed, total: dataRows.length });
      setCsvResults(results.filter(Boolean));
    };

    // Process in batches of CSV_CONCURRENCY
    for (let batch = 0; batch < dataRows.length; batch += CSV_CONCURRENCY) {
      const batchEnd = Math.min(batch + CSV_CONCURRENCY, dataRows.length);
      const batchPromises = [];
      for (let i = batch; i < batchEnd; i++) {
        batchPromises.push(processRow(i));
      }
      await Promise.all(batchPromises);
    }

    setCsvResults(results.filter(Boolean));
    setCsvProcessing(false);
  };

  const exportCSV = (data: { input: string; output: string }[]) => {
    const header = '输入,AI结果\n';
    const rows = data.map(r =>
      `"${r.input.replace(/"/g, '""').replace(/\n/g, ' ')}","${r.output.replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ).join('\n');
    downloadFile(header + rows, `wenai_${moduleId}_${Date.now()}.csv`, 'text/csv;charset=utf-8');
  };

  const exportXLSX = async (data: { input: string; output: string }[]) => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet([
      ['输入', 'AI结果'],
      ...data.map(r => [r.input, r.output]),
    ]);
    ws['!cols'] = [{ wch: 60 }, { wch: 80 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, moduleId || 'results');
    XLSX.writeFile(wb, `wenai_${moduleId}_${Date.now()}.xlsx`);
  };

  const exportSingleResult = () => {
    if (!result) return;
    downloadFile(result, `wenai_${moduleId}_${Date.now()}.txt`, 'text/plain;charset=utf-8');
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-up">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-border-default">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-accent rounded-full" />
          <div>
            <h2 className="text-[15px] font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
              {moduleName}
            </h2>
            {assistOnly && (
              <span className="inline-block mt-1 text-[8px] font-mono text-accent/90 bg-accent/10 px-2 py-1 rounded border border-accent/20">
                ⚠️ 仅辅助模式
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {supportCSV && (
            <>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-mono text-text-tertiary hover:text-text-primary px-3 py-2 border border-border-subtle rounded-md hover:border-accent/30 hover:bg-accent/5 transition-all"
              >
                <span className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 1h8M2 5h8M2 9h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  CSV批量
                </span>
              </button>
            </>
          )}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`text-[10px] font-mono px-3 py-2 border rounded-md transition-all duration-200 ${
              showHistory
                ? 'text-accent border-accent/40 bg-accent/15 shadow-[0_0_8px_rgba(200,151,90,0.2)]'
                : 'text-text-tertiary border-border-subtle hover:text-text-primary hover:border-border-default hover:bg-bg-hover'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 3v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              历史 <span className="font-semibold">({history.length})</span>
            </span>
          </button>
        </div>
      </div>

      {/* Assist-only warning */}
      {assistOnly && assistOnlyReason && (
        <div className="mb-3.5 bg-accent-dim border border-accent/20 rounded-md px-3.5 py-2.5 animate-fade-up">
          <p className="text-[11px] text-accent/90 leading-relaxed">
            <span className="font-mono text-[9px] bg-accent/15 px-1 py-0.5 rounded mr-1.5">注意</span>
            {assistOnlyReason}
          </p>
        </div>
      )}

      {/* History panel */}
      {showHistory && (
        <div className="mb-3.5 bg-bg-surface border border-border-subtle rounded-md p-3 max-h-48 overflow-y-auto animate-fade-up">
          {history.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <p className="text-text-tertiary text-[11px] font-mono">暂无历史记录</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {history.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setInput(item.input); setResult(item.result); setShowHistory(false); }}
                  className="w-full text-left px-2.5 py-2 rounded-md hover:bg-bg-hover transition-all group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-text-secondary truncate flex-1 group-hover:text-text-primary transition-colors">
                      {item.input}
                    </span>
                    <span className="text-[9px] font-mono text-text-tertiary flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                      {new Date(item.timestamp).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </button>
              ))}
              <div className="pt-2 mt-1 border-t border-border-subtle">
                <button
                  onClick={() => { setHistory([]); localStorage.removeItem(`wenai_history_${moduleId}`); }}
                  className="text-[9px] font-mono text-error hover:text-error/80 px-2.5 py-1 transition-colors"
                >
                  清空全部
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CSV batch area */}
      {csvData.length > 0 && (
        <div className="mb-3.5 bg-bg-surface border border-accent/20 rounded-md p-3.5 animate-fade-up">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-accent animate-pulse-dot" />
              <span className="text-[11px] font-mono text-text-primary">{csvData.length - 1} 条数据</span>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => { setCsvData([]); setCsvResults([]); }}
                className="text-[9px] font-mono text-text-tertiary hover:text-text-primary px-2 py-1 border border-border-subtle rounded-md hover:border-border-default transition-colors"
              >
                清除
              </button>
              {csvResults.length > 0 && canExport && (
                <>
                  <button
                    onClick={() => exportCSV(csvResults)}
                    className="text-[9px] font-mono text-success px-2.5 py-1 border border-success/30 rounded-md hover:bg-success/10 transition-colors"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => exportXLSX(csvResults)}
                    className="text-[9px] font-mono text-success px-2.5 py-1 border border-success/30 rounded-md hover:bg-success/10 transition-colors"
                  >
                    XLSX
                  </button>
                </>
              )}
              <button
                onClick={processCSVBatch}
                disabled={csvProcessing}
                className="text-[10px] font-mono text-bg-root px-3 py-1 bg-accent rounded-md disabled:opacity-50 hover:bg-accent-hover transition-all"
              >
                {csvProcessing ? `${csvProgress.current}/${csvProgress.total}` : '开始'}
              </button>
            </div>
          </div>
          {/* Progress bar */}
          {csvProcessing && (
            <div className="w-full h-1 bg-bg-raised rounded-full mb-2 overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300 ease-out"
                style={{ width: `${(csvProgress.current / csvProgress.total) * 100}%` }}
              />
            </div>
          )}
          <p className="text-[9px] font-mono text-text-tertiary mb-2">
            表头: {csvData[0]?.join(' · ')}
          </p>
          {csvResults.length > 0 && (
            <div className="mt-2.5 max-h-28 overflow-y-auto space-y-1">
              {csvResults.map((r, i) => (
                <div key={i} className="text-[10px] font-mono p-2 bg-bg-raised rounded-md flex gap-2 hover:bg-bg-hover transition-colors">
                  <span className="text-text-tertiary w-4 flex-shrink-0 tabular-nums">#{i + 1}</span>
                  <span className="text-text-secondary truncate">{r.output.substring(0, 100)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main workspace: input + output */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        {/* 输入 */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-accent">
              <path d="M2 4h10M2 7h10M2 10h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <span className="label-mono text-[10px] font-bold">输入</span>
            <div className="flex-1 h-px bg-gradient-to-r from-border-subtle to-transparent" />
          </div>

          {fields && fields.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
              {fields.map(field => (
                <div key={field.key}>
                  <label className="text-[9px] font-mono text-text-tertiary mb-1.5 block uppercase tracking-[0.12em] font-semibold">{field.label}</label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={params[field.key] || ''}
                    onChange={e => setParams(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full bg-bg-surface border border-border-subtle rounded-md px-3.5 py-2.5 text-[13px] text-text-primary placeholder-text-tertiary/60 transition-all focus:border-accent focus:bg-bg-raised focus:shadow-[0_0_0_2px_rgba(200,151,90,0.15)]"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="relative flex-1 min-h-[180px]">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full h-full bg-bg-surface border border-border-subtle rounded-md p-4 text-[13px] text-text-primary placeholder-text-tertiary/60 resize-none transition-all leading-[1.75] focus:border-accent focus:bg-bg-raised focus:shadow-[0_0_0_2px_rgba(200,151,90,0.15)]"
            />
            {input.length > 0 && (
              <div className="absolute bottom-3 right-3 text-[8px] font-mono text-text-tertiary/60 bg-bg-root/80 px-2 py-1 rounded border border-border-subtle">
                {input.length} 字
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-[9px] font-mono text-text-tertiary tracking-wide bg-bg-surface px-2.5 py-1 rounded border border-border-subtle/50">
              {input.length === 0 ? '⌨️ Ctrl+Enter 提交' : '准备就绪'}
            </span>
            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 bg-accent text-bg-root rounded-md font-semibold text-[12px] hover:bg-accent-hover hover:shadow-[0_4px_12px_rgba(200,151,90,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-[family-name:var(--font-outfit)] active:scale-95"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 animate-spin-smooth" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                    <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  处理中
                </span>
              ) : '开始执行'}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:flex flex-col items-center py-8">
          <div className="w-px flex-1 bg-gradient-to-b from-transparent via-border-subtle to-transparent opacity-60" />
          <div className="my-3 w-6 h-6 border-2 border-accent/30 rounded-full flex items-center justify-center bg-bg-surface shadow-[0_0_12px_rgba(200,151,90,0.15)]">
            <span className="text-[10px] font-mono text-accent font-bold">→</span>
          </div>
          <div className="w-px flex-1 bg-gradient-to-b from-border-subtle via-border-subtle to-transparent opacity-60" />
        </div>

        {/* 输出 */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-success">
              <path d="M7 2v10M12 7H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span className="label-mono text-[10px] font-bold">输出</span>
            <div className="flex-1 h-px bg-gradient-to-r from-border-subtle to-transparent" />
            {result && (
              <div className="flex gap-1.5">
                <button
                  onClick={handleCopy}
                  className="text-[9px] font-mono text-text-tertiary hover:text-accent px-2.5 py-1.5 border border-border-subtle rounded-md hover:border-accent/30 hover:bg-accent/5 transition-all"
                >
                  {copied ? '✓ 已复制' : '复制'}
                </button>
                {canExport && (
                  <button
                    onClick={exportSingleResult}
                    className="text-[9px] font-mono text-text-tertiary hover:text-accent px-2.5 py-1.5 border border-border-subtle rounded-md hover:border-accent/30 hover:bg-accent/5 transition-all"
                  >
                    导出
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 min-h-[180px] bg-bg-surface border border-border-subtle rounded-md p-4 overflow-y-auto relative">
            {error && (
              <div className="text-[11px] font-mono text-error p-3.5 bg-error/5 border border-error/25 rounded-md mb-3 animate-fade-up">
                <div className="flex items-center gap-2 mb-1">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M6 3v3M6 8v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="font-semibold">错误</span>
                </div>
                {error}
              </div>
            )}
            {loading && (
              <div className="flex flex-col items-center gap-4 text-text-tertiary py-16 justify-center animate-fade-up">
                <div className="relative">
                  <svg className="w-8 h-8 animate-spin-smooth text-accent" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
                    <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse-dot" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[12px] font-mono text-text-primary font-semibold mb-1">AI 处理中</p>
                  <p className="text-[9px] font-mono text-text-tertiary">正在生成专业结果...</p>
                </div>
              </div>
            )}
            {result && (
              <div className="prose prose-invert prose-sm max-w-none text-[13px] text-text-secondary leading-[1.8] [&_table]:border-collapse [&_th]:border [&_th]:border-border-subtle [&_th]:px-2 [&_th]:py-1 [&_th]:bg-bg-raised [&_th]:text-[11px] [&_th]:font-mono [&_td]:border [&_td]:border-border-subtle [&_td]:px-2 [&_td]:py-1 [&_td]:text-[12px] [&_strong]:text-text-primary [&_h2]:text-[14px] [&_h2]:text-text-primary [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-[13px] [&_h3]:text-text-primary [&_h3]:mt-3 [&_h3]:mb-1 [&_ul]:pl-4 [&_ol]:pl-4 [&_li]:mb-1 [&_code]:bg-bg-raised [&_code]:px-1 [&_code]:rounded [&_code]:text-[11px] [&_code]:font-mono">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            )}
            {!result && !loading && !error && (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-12 h-12 border border-border-subtle rounded-md flex items-center justify-center opacity-40">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-text-tertiary">
                    <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M9 10h6M9 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-text-tertiary text-[11px] font-mono opacity-50">结果将在此显示</p>
              </div>
            )}
          </div>

          {result && (
            <>
              {/* USPTO商标查询状态指示器（仅ip-compliance模块） */}
              {moduleId === 'ip-compliance' && trademarkQuery && (
                <div className="mt-3 bg-bg-surface border border-border-subtle rounded-md p-3 animate-fade-up">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[10px] font-mono text-text-primary uppercase tracking-wide">USPTO商标实时查询</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-text-tertiary font-mono">检测品牌词</span>
                      <span className="text-text-secondary">{trademarkQuery.results.length} 个</span>
                    </div>
                    {trademarkQuery.foundCount > 0 && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-text-tertiary font-mono">已注册商标</span>
                        <span className="text-error font-semibold">{trademarkQuery.foundCount} 个 ⚠️</span>
                      </div>
                    )}
                    {trademarkQuery.foundCount === 0 && (
                      <div className="text-[10px] text-success font-mono flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                        未发现已注册商标冲突
                      </div>
                    )}
                    {trademarkQuery.foundCount > 0 && (
                      <div className="mt-2.5 pt-2.5 border-t border-border-subtle space-y-1.5">
                        {trademarkQuery.results.filter(r => r.found).map((mark, idx) => (
                          <div key={idx} className="text-[10px] font-mono bg-error/5 border border-error/20 rounded-md px-2.5 py-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-error">{mark.keyword}</span>
                              <span className="text-text-tertiary text-[9px]">US Reg. No. {mark.data?.regNo}</span>
                            </div>
                            <div className="text-text-tertiary text-[9px]">权利人：{mark.data?.owner}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* 免责声明 */}
              <div className="mt-3 px-3 py-2 border border-border-subtle rounded-md bg-bg-surface/50">
                <p className="text-[9px] font-mono text-text-tertiary leading-relaxed">
                  {moduleId === 'ip-compliance'
                    ? '⚠️ 本工具使用有限数据库进行初步筛查，不构成法律意见，不能替代专业商标检索服务。高风险项请咨询注册商标律师。'
                    : '⚠️ AI生成内容仅供参考，请结合实际业务判断。因使用AI建议产生的决策后果由使用者自行承担。'}
                </p>
              </div>
              <ExpertReview moduleId={moduleId} resultText={result} />
              <ResultFeedback moduleId={moduleId} resultText={result} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
