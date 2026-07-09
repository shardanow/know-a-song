'use client';

import { useEffect } from 'react';

export function ChunkErrorHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.name === 'ChunkLoadError' ||
        event.reason?.message?.includes('Failed to load chunk') ||
        event.reason?.message?.includes('Loading chunk')
      ) {
        window.location.reload();
      }
    };
    window.addEventListener('unhandledrejection', handler);
    return () => window.removeEventListener('unhandledrejection', handler);
  }, []);

  return children;
}
