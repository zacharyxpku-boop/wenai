'use client';

import Image from 'next/image';
import { useState, useRef, useCallback } from 'react';
import { assessClientFile } from '@/lib/client-file-guard';

const TARGET_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'es', label: 'Espanol' },
  { code: 'fr', label: 'Francais' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Portugues' },
  { code: 'ar', label: 'العربية' },
  { code: 'th', label: 'ไทย' },
  { code: 'vi', label: 'Tieng Viet' },
  { code: 'zh', label: '中文' },
];

export default function OCRTranslatePage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [extractedText, setExtractedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'idle' | 'ocr' | 'translate' | 'done'>('idle');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [copiedField, setCopiedField] = useState<'ocr' | 'translate' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const guard = assessClientFile(file, {
      kind: 'image',
      largeBytes: 5 * 1024 * 1024,
      hardBytes: 12 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    });
    if (guard.message) setError(guard.message);
    if (!guard.ok) {
      return;
    }
    setImageFile(file);
    if (!guard.shouldOptimize) setError('');
    setExtractedText('');
    setTranslatedText('');
    setStep('idle');
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleExtractAndTranslate = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError('');
    setExtractedText('');
    setTranslatedText('');

    // Step 1: OCR
    setStep('ocr');
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const ocrRes = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!ocrRes.ok) {
        const data = await ocrRes.json();
        throw new Error(data.error || '图片识别失败');
      }

      const ocrData = await ocrRes.json();
      const text = ocrData.text || ocrData.message || '';
      setExtractedText(text);

      // Step 2: Translate
      setStep('translate');
      const langLabel = TARGET_LANGUAGES.find(l => l.code === targetLang)?.label || targetLang;
      const translateRes = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: 'ocr-translate',
          prompt: `你是一个专业的电商翻译专家。以下是从商品图片中OCR识别出的文字，请翻译成${langLabel}：\n\n${text}`,
          input: text,
        }),
      });

      if (!translateRes.ok) {
        const data = await translateRes.json();
        throw new Error(data.error || '翻译失败');
      }

      const translateData = await translateRes.json();
      setTranslatedText(translateData.content || '');
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
      setStep('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, field: 'ocr' | 'translate') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const clearAll = () => {
    setImageFile(null);
    setImagePreview('');
    setExtractedText('');
    setTranslatedText('');
    setStep('idle');
    setError('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-text-primary font-[family-name:var(--font-outfit)]">
            图片OCR翻译 &middot; Image OCR Translate
          </h2>
          <p className="text-[11px] font-mono text-text-tertiary mt-1">
            Upload product image, extract text via OCR, translate to target language
          </p>
        </div>
        <div className="flex items-center gap-2">
          {imageFile && (
            <button
              onClick={clearAll}
              className="text-[11px] font-mono text-text-tertiary hover:text-text-primary px-3 py-1.5 border border-border-subtle rounded-md hover:border-border-default transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* Left: Upload + Controls */}
        <div className="lg:w-[380px] flex-shrink-0 flex flex-col gap-3">
          {/* Upload area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !imagePreview && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-md transition-all cursor-pointer overflow-hidden ${
              isDragging
                ? 'border-accent bg-accent-dim'
                : imagePreview
                  ? 'border-border-subtle'
                  : 'border-border-subtle hover:border-text-tertiary'
            } ${imagePreview ? 'h-auto' : 'h-48 flex items-center justify-center'}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative group">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={900}
                  height={300}
                  unoptimized
                  className="w-full max-h-[300px] object-contain bg-bg-root"
                />
                <div className="absolute inset-0 bg-bg-root/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="text-[11px] font-mono text-text-primary px-3 py-1.5 border border-border-subtle rounded-md bg-bg-surface"
                  >
                    Replace
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <svg className="w-8 h-8 text-text-tertiary mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <p className="text-[12px] text-text-secondary mb-1">Drag & drop or click to upload</p>
                <p className="text-[10px] font-mono text-text-tertiary">JPG, PNG, WebP (max 10MB)</p>
              </div>
            )}
          </div>

          {/* File info */}
          {imageFile && (
            <div className="text-[10px] font-mono text-text-tertiary px-1">
              {imageFile.name} ({(imageFile.size / 1024).toFixed(1)}KB)
            </div>
          )}

          {/* Language selector */}
          <div>
            <label className="text-[11px] font-mono text-text-tertiary mb-1.5 block">Target Language</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full bg-bg-surface border border-border-subtle rounded-md px-3 py-2 text-[13px] text-text-primary appearance-none cursor-pointer transition-colors"
            >
              {TARGET_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>

          {/* Extract button */}
          <button
            onClick={handleExtractAndTranslate}
            disabled={!imageFile || loading}
            className="w-full px-5 py-2.5 bg-accent text-bg-root rounded-md font-medium text-[13px] hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-[family-name:var(--font-outfit)]"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                  <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {step === 'ocr' ? 'Extracting text...' : 'Translating...'}
              </span>
            ) : 'Extract & Translate'}
          </button>

          {/* Status */}
          {step !== 'idle' && (
            <div className="flex items-center gap-2 px-1">
              <div className={`w-1.5 h-1.5 rounded-full ${step === 'done' ? 'bg-green-500' : 'bg-accent animate-pulse'}`} />
              <span className="text-[10px] font-mono text-text-tertiary">
                {step === 'ocr' && 'Step 1/2: OCR extracting...'}
                {step === 'translate' && 'Step 2/2: Translating...'}
                {step === 'done' && 'Complete'}
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-[12px] font-mono text-red-400 p-3 bg-red-400/8 border border-red-400/20 rounded-md">
              {error}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden lg:flex flex-col items-center py-6">
          <div className="w-px flex-1 bg-border-subtle" />
          <span className="text-[10px] font-mono text-text-tertiary my-2">&rarr;</span>
          <div className="w-px flex-1 bg-border-subtle" />
        </div>

        {/* Right: Results side by side */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
          {/* OCR result */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest">Extracted Text</span>
              <div className="flex-1 h-px bg-border-subtle" />
              {extractedText && (
                <button
                  onClick={() => handleCopy(extractedText, 'ocr')}
                  className="text-[10px] font-mono text-text-tertiary hover:text-text-primary px-2 py-1 border border-border-subtle rounded-md transition-colors"
                >
                    {copiedField === 'ocr' ? '已复制' : '复制'}
                </button>
              )}
            </div>
            <div className="flex-1 min-h-[160px] bg-bg-surface border border-border-subtle rounded-md p-4 overflow-y-auto">
              {extractedText ? (
                <div className="text-[13px] text-text-secondary whitespace-pre-wrap leading-[1.7]">{extractedText}</div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-text-tertiary text-[12px] font-mono">OCR text will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Translated result */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest">Translation</span>
              <div className="flex-1 h-px bg-border-subtle" />
              {translatedText && (
                <button
                  onClick={() => handleCopy(translatedText, 'translate')}
                  className="text-[10px] font-mono text-text-tertiary hover:text-text-primary px-2 py-1 border border-border-subtle rounded-md transition-colors"
                >
                    {copiedField === 'translate' ? '已复制' : '复制'}
                </button>
              )}
            </div>
            <div className="flex-1 min-h-[160px] bg-bg-surface border border-border-subtle rounded-md p-4 overflow-y-auto">
              {translatedText ? (
                <div className="text-[13px] text-text-secondary whitespace-pre-wrap leading-[1.7]">{translatedText}</div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-text-tertiary text-[12px] font-mono">Translation will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
