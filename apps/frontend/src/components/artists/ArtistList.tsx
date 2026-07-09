'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Link } from '@/lib/navigation';
import { Pagination } from '@/components/Pagination';

const AVATAR_COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#e67e22', '#34495e', '#16a085', '#c0392b',
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function ArtistList({ searchQuery, pageQuery }: { searchQuery?: string; pageQuery?: string }) {
  const t = useTranslations('common');
  const [search, setSearch] = useState(searchQuery || '');
  const [page, setPage] = useState(Number(pageQuery) || 1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['artists', search, page],
    queryFn: () => api.artists.list({ search: search || undefined, page, limit: 24 }),
  });

  const artists = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  }, []);

  return (
    <div className="p-6">
      <form onSubmit={handleSearch} className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search')}
          className="w-full max-w-md h-10 px-4 rounded-lg border border-border bg-bg-surface text-foreground placeholder:text-text-muted outline-none focus:border-ring"
        />
      </form>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-bg-elevated h-32" />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-text-secondary p-8">{t('errorOccurred')}</div>
      )}

      {!isLoading && !isError && artists.length === 0 && (
        <div className="text-text-secondary p-8">{t('noData')}</div>
      )}

      {!isLoading && !isError && artists.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {artists.map((artist: any) => (
              <Link
                key={artist.author}
                href={`/artists/${encodeURIComponent(artist.author)}`}
                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-bg-surface border border-border hover:border-ring transition-colors"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: getColor(artist.author) }}
                >
                  {artist.author.charAt(0).toUpperCase()}
                </div>
                <div className="text-center min-w-0">
                  <div className="font-semibold text-sm truncate">{artist.author}</div>
                  <div className="text-text-secondary text-xs mt-1">
                    {artist.songCount} {artist.songCount === 1 ? 'song' : 'songs'}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
