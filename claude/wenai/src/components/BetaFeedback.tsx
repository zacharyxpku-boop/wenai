'use client';

import { useState } from 'react';

interface Props {
  moduleId: string;
  input?: string; // 用户输入，便于复现
}

type Verdict = 'good' | 'bad' | 'rant' | null;

/**
 * 客户端脱敏：避免用户 inputSample 把敏感信息带到 feedback 存储
 * 处理：邮箱、手机号、订单号（10+ 位数字）、身份证号、信用卡号
 */
function sanitize(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[EMAIL]')
    .replace(/(?:\+?86[-\s]?)?1[3-9]\d{9}/g, '[PHONE]')
    .replace(/\b\d{15,19}\b/g, '[LONG-NUM]')
    .replace(/\b[1-9]\d{9,}\b/g, '[ORDER#]')
    .replace(/\b\d{17}[\dXx]\b/g, '[ID]');
}

export default function BetaFeedback({ moduleId, input }: Props) {
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showBox, setShowBox] = useState(false);

  const submit = async (v: Verdict, text?: string) => {
    if (!v) return;
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'feedback',
          moduleId,
          data: {
            rating: v === 'good' ? 5 : v === 'bad' ? 1 : 3,
            verdict: v,
            comment: sanitize(text || ''),
            inputSample: sanitize((input || '').slice(0, 200)),
            timestamp: new Date().toISOString(),
          },
        }),
      });
      setSubmitted(true);
    } catch {
      // 静默失败，别打断用户
      setSubmitted(true);
    }
  };

  const handleClick = (v: Verdict) => {
    setVerdict(v);
    if (v === 'good') {
      submit(v);
    } else {
      setShowBox(true);
    }
  };

  if (submitted) {
    return (
      <div className="mt-4 py-3 px-4 border border-border-subtle rounded-md bg-bg-surface text-center">
        <span className="text-[11px] font-mono text-accent">
          已收到。作者会看每一条反馈。谢谢。
        </span>
      </div>
    );
  }

  return (
    <div className="mt-4 py-3 px-4 border border-border-subtle rounded-md bg-bg-surface">
      {!showBox && (
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-text-tertiary">
            这次结果怎么样？
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => handleClick('good')}
              className={`px-2.5 py-1 rounded text-[12px] border transition-all hover:scale-105 ${
                verdict === 'good'
                  ? 'bg-accent/10 border-accent text-accent'
                  : 'border-border-default text-text-secondary hover:border-accent/40'
              }`}
            >
              👍 有用
            </button>
            <button
              onClick={() => handleClick('bad')}
              className={`px-2.5 py-1 rounded text-[12px] border transition-all hover:scale-105 ${
                verdict === 'bad'
                  ? 'bg-accent/10 border-accent text-accent'
                  : 'border-border-default text-text-secondary hover:border-accent/40'
              }`}
            >
              👎 不准
            </button>
            <button
              onClick={() => handleClick('rant')}
              className="px-2.5 py-1 rounded text-[12px] border border-border-default text-text-secondary hover:border-accent/40 hover:scale-105 transition-all"
            >
              💬 吐槽一句
            </button>
          </div>
        </div>
      )}

      {showBox && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-text-tertiary">
              {verdict === 'bad' ? '哪里不准？一句话就行' : '随便说，作者看得到'}
            </span>
            <button
              onClick={() => setShowBox(false)}
              className="text-[10px] text-text-tertiary hover:text-text-secondary"
            >
              取消
            </button>
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="例：翻译漏了规格参数 / 邮件太硬广 / ..."
            maxLength={200}
            className="w-full px-3 py-2 text-[12px] bg-bg-root border border-border-default rounded resize-none focus:outline-none focus:border-accent/60 text-text-primary"
            rows={2}
            autoFocus
          />
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-text-tertiary">
              {comment.length}/200
            </span>
            <button
              onClick={() => submit(verdict, comment)}
              disabled={!comment.trim()}
              className="px-3 py-1 bg-accent hover:bg-accent-hover disabled:bg-border-subtle disabled:cursor-not-allowed text-bg-root text-[11px] font-semibold rounded transition-colors"
            >
              发送
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
