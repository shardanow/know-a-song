'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface NoticeProps {
  title: string;
  text: string;
  onClose?: () => void;
}

export function Notice({ title, text, onClose }: NoticeProps) {
  const t = useTranslations('common');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-bg-elevated border border-border rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary">{title}</p>
          <p className="text-xs text-text-secondary mt-1">{text}</p>
        </div>
        <button
          onClick={() => { setVisible(false); onClose?.(); }}
          className="text-text-secondary hover:text-text-primary"
          aria-label={t('close')}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
