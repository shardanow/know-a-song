import type { ReactNode } from 'react';

export function Tooltip({ children, text }: { children: ReactNode; text: string }) {
  return (
    <span className="relative group">
      {children}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-bg-surface border border-border text-xs text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
        {text}
      </span>
    </span>
  );
}
