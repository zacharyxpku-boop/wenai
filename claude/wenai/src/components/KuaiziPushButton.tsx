'use client';

import { useEffect, useState } from 'react';
import {
  createKuaiziProductionTask,
  getKuaiziConfig,
  getKuaiziTaskStatus,
  type KuaiziBriefPayload,
  type KuaiziTaskStatus,
} from '@/lib/kuaizi-api';

export interface KuaiziPushButtonProps {
  payload: KuaiziBriefPayload;
  visible: boolean;
  onCompleted?: (assetUrls: string[]) => void;
}

function statusLabel(status: KuaiziTaskStatus) {
  const labels: Record<KuaiziTaskStatus, string> = {
    queued: '排队中',
    processing: '制作中',
    completed: '已完成',
    failed: '失败',
  };
  return labels[status];
}

const POLL_DELAYS = [5000, 10000, 30000];
const MAX_POLL_MS = 10 * 60 * 1000;

export default function KuaiziPushButton({ payload, visible, onCompleted }: KuaiziPushButtonProps) {
  const [configured, setConfigured] = useState(false);
  const [status, setStatus] = useState<KuaiziTaskStatus | null>(null);
  const [taskId, setTaskId] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setConfigured(Boolean(getKuaiziConfig()));
  }, []);

  useEffect(() => {
    if (!taskId || status === 'completed' || status === 'failed') return;
    let cancelled = false;
    let timeoutId = 0;
    const startedAt = Date.now();
    let attempt = 0;
    const poll = async () => {
      try {
        const task = await getKuaiziTaskStatus(taskId);
        if (cancelled) return;
        setStatus(task.status);
        setMessage(`任务状态：${statusLabel(task.status)}`);
        if (task.status === 'completed') {
          onCompleted?.(task.assetUrls);
          return;
        }
        if (task.status === 'failed') {
          setMessage('任务失败。请导出生产规格手动执行。');
          return;
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : '任务状态查询失败');
        setStatus('failed');
        return;
      }
      if (Date.now() - startedAt >= MAX_POLL_MS) {
        setStatus('failed');
        setMessage('任务轮询超过 10 分钟，请稍后重试或导出生产规格手动执行。');
        return;
      }
      const delay = POLL_DELAYS[Math.min(attempt, POLL_DELAYS.length - 1)];
      attempt += 1;
      timeoutId = window.setTimeout(poll, delay);
    };
    timeoutId = window.setTimeout(poll, POLL_DELAYS[0]);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [onCompleted, status, taskId]);

  if (!visible) return null;

  const push = async () => {
    setIsSubmitting(true);
    setMessage('正在推送生产任务...');
    try {
      const task = await createKuaiziProductionTask(payload);
      setTaskId(task.taskId);
      setStatus(task.status);
      setMessage(`任务状态：${statusLabel(task.status)}`);
      if (task.status === 'completed') onCompleted?.(task.assetUrls);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '筷子科技任务创建失败，请稍后重试或导出生产规格手动执行');
      setStatus('failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
      <button
        type="button"
        onClick={push}
        disabled={isSubmitting || !configured}
        title={configured ? '推送生产任务' : '请先前往设置页配置筷子科技 API'}
        className="w-full rounded-md bg-slate-950 px-4 py-3 text-[13px] font-black text-white disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? '正在推送...' : configured ? '一键推送到筷子科技生成素材' : '配置后推送生产任务'}
      </button>
      {!configured && <p className="mt-2 text-[12px] font-bold text-slate-700">请先前往设置页配置筷子科技 API。</p>}
      {message && <p className="mt-2 text-[12px] font-bold text-slate-700">{message}</p>}
      {taskId && <p className="mt-1 text-[11px] text-slate-500">任务 ID：{taskId}</p>}
      {status === 'failed' && (
        <p className="mt-2 text-[12px] font-bold text-rose-700">备选动作：导出生产规格，交给剪辑师或外部生产工具手动执行。</p>
      )}
    </div>
  );
}
