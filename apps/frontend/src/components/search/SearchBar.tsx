'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/navigation';
import { Search } from 'lucide-react';

export function SearchBar() {
  const t = useTranslations('common');
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/films?search=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, router],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('[data-search-input]');
        input?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-[13px] h-[46px] flex-1 min-w-0 w-full sm:flex-none sm:w-[min(320px,35vw)] rounded-[10px] border border-border bg-bg-surface px-[14px] shadow-[0_14px_35px_rgba(0,0,0,.22)] overflow-hidden"
    >
      <Search size={22} strokeWidth={1.9} className="text-text-secondary shrink-0" />
      <input
        data-search-input
        type="text"
        placeholder={t('searchPlaceholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 min-w-0 bg-transparent border-0 outline-0 text-text-primary text-[15px] placeholder:text-text-muted"
      />
      <span className="hidden sm:inline text-text-secondary bg-bg-overlay rounded-[7px] px-2 py-[3px] text-[13px] shrink-0">⌘ K</span>
    </form>
  );
}
