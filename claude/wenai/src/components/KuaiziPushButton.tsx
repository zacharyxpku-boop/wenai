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
    const timer = window.setInterval(async () => {
      try {
        const task = await getKuaiziTaskStatus(taskId);
        setStatus(task.status);
        setMessage(`任务状态：${statusLabel(task.status)}`);
        if (task.status === 'completed') {
          onCompleted?.(task.assetUrls);
          window.clearInterval(timer);
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : '任务状态查询失败');
        window.clearInterval(timer);
      }
    }, 3000);
    return () => window.clearInterval(timer);
  }, [onCompleted, status, taskId]);

  if (!visible || !configured) return null;

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
      setMessage(error instanceof Error ? error.message : '筷子科技任务创建失败，请稍后重试');
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
        disabled={isSubmitting}
        className="w-full rounded-md bg-slate-950 px-4 py-3 text-[13px] font-black text-white disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? '正在推送...' : '一键推送到筷子科技生成素材'}
      </button>
      {message && <p className="mt-2 text-[12px] font-bold text-slate-700">{message}</p>}
      {taskId && <p className="mt-1 text-[11px] text-slate-500">任务 ID：{taskId}</p>}
    </div>
  );
}
