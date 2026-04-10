'use client';

import { useState, useEffect, useCallback } from 'react';

type ReviewStatus = 'pending' | 'approved' | 'revision_needed' | 'rejected';

interface ExpertReviewProps {
  moduleId: string;
  resultText: string;
}

const STATUS_CONFIG: Record<ReviewStatus, { label: string; color: string; bg: string }> = {
  pending: { label: '待审核', color: 'text-text-tertiary', bg: 'bg-bg-raised' },
  approved: { label: '已通过', color: 'text-success', bg: 'bg-success/10' },
  revision_needed: { label: '需修改', color: 'text-warning', bg: 'bg-warning/10' },
  rejected: { label: '已驳回', color: 'text-error', bg: 'bg-error/10' },
};

const STATUS_CYCLE: ReviewStatus[] = ['pending', 'approved', 'revision_needed', 'rejected'];

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < Math.min(str.length, 200); i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export default function ExpertReview({ moduleId, resultText }: ExpertReviewProps) {
  const resultHash = hashString(resultText);
  const reviewKey = `${moduleId}_${resultHash}`;

  const [status, setStatus] = useState<ReviewStatus>('pending');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadReview = useCallback(() => {
    fetch(`/api/feedback?type=review&key=${reviewKey}`)
      .then(r => r.json())
      .then(resp => {
        if (resp.data) {
          setStatus(resp.data.status);
          setNotes(resp.data.notes || '');
          setSaved(true);
        } else {
          setStatus('pending');
          setNotes('');
          setSaved(false);
        }
      })
      .catch(() => {
        setStatus('pending');
      });
  }, [reviewKey]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  const cycleStatus = () => {
    const idx = STATUS_CYCLE.indexOf(status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    setStatus(next);
    setSaved(false);
  };

  const saveReview = () => {
    const data = {
      status,
      notes: notes.trim(),
      timestamp: Date.now(),
    };
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'review', key: reviewKey, data }),
    }).catch(() => {});
    setSaved(true);
  };

  const cfg = STATUS_CONFIG[status];

  return (
    <div className="mt-3 bg-bg-surface border border-border-subtle rounded-md p-3 animate-fade-up">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest">
          专家审核
        </span>
        {saved && (
          <span className="text-[10px] font-mono text-text-tertiary">已保存</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={cycleStatus}
          className={`${cfg.bg} ${cfg.color} text-[11px] font-mono px-3 py-1.5 rounded-md border border-border-subtle hover:border-border-default transition-colors`}
        >
          {cfg.label}
        </button>

        <button
          onClick={() => setShowNotes(!showNotes)}
          className="text-[10px] font-mono text-text-tertiary hover:text-text-primary px-2 py-1.5 border border-border-subtle rounded-md hover:border-border-default transition-colors"
        >
          {showNotes ? '收起备注' : '备注'}
        </button>

        {!saved && status !== 'pending' && (
          <button
            onClick={saveReview}
            className="text-[11px] font-mono text-bg-root px-3 py-1.5 bg-accent rounded-md hover:bg-accent-hover transition-colors"
          >
            保存
          </button>
        )}
      </div>

      {showNotes && (
        <div className="mt-2 animate-fade-up">
          <textarea
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
            placeholder="审核备注..."
            rows={2}
            className="w-full bg-bg-raised border border-border-subtle rounded-md px-3 py-2 text-[12px] text-text-secondary placeholder-text-tertiary resize-none"
          />
          {notes.trim() && !saved && (
            <button
              onClick={saveReview}
              className="mt-1 text-[11px] font-mono text-bg-root px-3 py-1.5 bg-accent rounded-md hover:bg-accent-hover transition-colors"
            >
              保存
            </button>
          )}
        </div>
      )}
    </div>
  );
}
