'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { SongItem } from '@/components/songs/SongItem';
import { Pagination } from '@/components/Pagination';

const TYPE_CHIPS = [
  { key: '', labelKey: 'all' },
  { key: 'opening', labelKey: 'opening' },
  { key: 'ending', labelKey: 'ending' },
  { key: 'ost', labelKey: 'ost' },
] as const;

export function SongsContent({ q, type, pageQuery }: { q?: string; type?: string; pageQuery?: string }) {
  const t = useTranslations('common');
  const [search, setSearch] = useState(q || '');
  const [typeFilter, setTypeFilter] = useState(type || '');
  const [page, setPage] = useState(Number(pageQuery) || 1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['songs', search, typeFilter, page],
    queryFn: () => api.songs.search({ q: search || undefined, type: typeFilter || undefined, page, limit: 24 }),
  });

  const songs = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  }, []);

  const handleTypeChange = (key: string) => {
    setTypeFilter(key);
    setPage(1);
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search')}
          className="w-full max-w-md h-10 px-4 rounded-lg border border-border bg-bg-surface text-foreground placeholder:text-text-muted outline-none focus:border-ring"
        />
      </form>

      <div className="flex items-center gap-2 mb-6">
        {TYPE_CHIPS.map((chip) => (
          <button
            key={chip.key}
            onClick={() => handleTypeChange(chip.key)}
            className={cn(
              'h-8 px-3 rounded-lg border text-sm font-medium transition-colors',
              typeFilter === chip.key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border bg-bg-surface text-foreground hover:border-ring',
            )}
          >
            {t(chip.labelKey)}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg bg-bg-elevated h-14" />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-text-secondary p-8">{t('errorOccurred')}</div>
      )}

      {!isLoading && !isError && songs.length === 0 && (
        <div className="text-text-secondary p-8">{t('noData')}</div>
      )}

      {!isLoading && !isError && songs.length > 0 && (
        <>
          <div className="rounded-xl bg-bg-surface border border-border overflow-hidden">
            <div className="flex flex-col">
              {songs.map((song: any, idx: number) => (
                <SongItem
                  key={song.id}
                  song={song}
                  allSongs={songs}
                  index={idx}
                />
              ))}
            </div>
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
