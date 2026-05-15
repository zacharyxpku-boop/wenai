'use client';

import { useEffect, useState } from 'react';

export function AnimatedMetric({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let frame = 0;
    const total = 28;
    const timer = window.setInterval(() => {
      frame += 1;
      setCurrent(Math.round((value * frame) / total));
      if (frame >= total) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [value]);

  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface p-5">
      <div className="text-2xl font-semibold text-text-primary">{current}{suffix}</div>
      <p className="mt-2 text-[13px] leading-6 text-text-secondary">{label}</p>
    </div>
  );
}
