'use client';

import { useEffect } from 'react';
import { track } from '@/lib/local-analytics';

export default function PageViewTracker({ page, properties }: { page: string; properties?: Record<string, unknown> }) {
  useEffect(() => {
    track('page_view', { page, ...(properties || {}) });
  }, [page, properties]);

  return null;
}
