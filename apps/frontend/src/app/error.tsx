'use client';

import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-bold text-accent">{t('errorOccurred')}</h1>
      <p className="text-text-secondary text-sm text-center max-w-md">
        {error.message || t('unexpectedError')}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors text-sm mt-4"
      >
        {t('tryAgain')}
      </button>
    </div>
  );
}
