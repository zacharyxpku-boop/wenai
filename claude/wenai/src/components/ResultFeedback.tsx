'use client';

import { useState, useEffect, useCallback } from 'react';

interface ResultFeedbackProps {
  moduleId: string;
  resultText: string;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.26 5.06 16.7 6 11.21l-4-3.9 5.53-.8L10 1.5z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export default function ResultFeedback({ moduleId, resultText }: ResultFeedbackProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [stats, setStats] = useState({ avg: 0, total: 0 });

  const loadStats = useCallback(() => {
    fetch(`/api/feedback?type=feedback&moduleId=${moduleId}`)
      .then(r => r.json())
      .then(data => {
        if (data.total > 0) setStats({ avg: data.avg, total: data.total });
      })
      .catch(() => {});
  }, [moduleId]);

  // Reset state when result changes (using previous result as key)
  const [prevResult, setPrevResult] = useState(resultText);
  if (prevResult !== resultText) {
    setPrevResult(resultText);
    setRating(0);
    setFeedbackText('');
    setSubmitted(false);
  }

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleSubmit = () => {
    if (rating === 0) return;

    const entry = {
      rating,
      text: feedbackText.trim(),
      resultSnippet: resultText.substring(0, 100),
      timestamp: Date.now(),
    };

    // Save to server
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'feedback', moduleId, data: entry }),
    }).catch(() => {});

    // Also log to usage stats
    fetch('/api/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleId, tokens: 0, rating }),
    }).catch(() => {});

    setSubmitted(true);
    loadStats();
  };

  if (submitted) {
    return (
      <div className="mt-3 bg-bg-surface border border-border-subtle rounded-md p-3 animate-fade-up">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-accent">反馈已保存</span>
          {stats.total > 0 && (
            <span className="text-[10px] font-mono text-text-tertiary">
              均分{stats.avg}/5 ({stats.total} 条)
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 bg-bg-surface border border-border-subtle rounded-md p-3 animate-fade-up">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest">
          结果评分
        </span>
        {stats.total > 0 && (
          <span className="text-[10px] font-mono text-text-tertiary">
            均分{stats.avg}/5 ({stats.total})
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className={`transition-colors ${
              star <= (hoverRating || rating)
                ? 'text-accent'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            <StarIcon filled={star <= (hoverRating || rating)} />
          </button>
        ))}
        {rating > 0 && (
          <span className="text-[11px] font-mono text-text-secondary ml-2">{rating}/5</span>
        )}
      </div>

      {rating > 0 && (
        <>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="可选：描述哪里可以改进..."
            rows={2}
            className="w-full bg-bg-raised border border-border-subtle rounded-md px-3 py-2 text-[12px] text-text-secondary placeholder-text-tertiary resize-none mb-2"
          />
          <button
            onClick={handleSubmit}
            className="text-[11px] font-mono text-bg-root px-3 py-1.5 bg-accent rounded-md hover:bg-accent-hover transition-colors"
          >
            提交
          </button>
        </>
      )}
    </div>
  );
}
