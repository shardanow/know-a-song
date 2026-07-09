'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery, useQueries } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { apiClient } from '@/lib/api-client';
import { SongItem } from '@/components/songs/SongItem';
import { Pagination } from '@/components/Pagination';
import { Link } from '@/lib/navigation';

export function ArtistDetail({ name, pageQuery }: { name: string; pageQuery?: string }) {
  const t = useTranslations('common');
  const locale = useLocale();
  const [page, setPage] = useState(Number(pageQuery) || 1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['artistSongs', name, page],
    queryFn: () => api.artists.songs(name, { page, limit: 24 }),
  });

  const songs = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const groupedByFilm = useMemo(() => {
    const groups: Record<string, { filmId: number; slug: string; apiTmdbId: number | null; tvSeries: boolean; songs: any[] }> = {};
    for (const song of songs) {
      const key = song.filmId ? `film-${song.filmId}` : `other-${song.id}`;
      if (!groups[key]) {
        groups[key] = {
          filmId: song.filmId || 0,
          slug: song.slug || `Film #${song.filmId}`,
          apiTmdbId: song.apiTmdbId || null,
          tvSeries: song.tvSeries || false,
          songs: [],
        };
      }
      groups[key].songs.push(song);
    }
    return Object.values(groups);
  }, [songs]);

  const tmdbQueries = useQueries({
    queries: groupedByFilm
      .filter((g) => g.apiTmdbId)
      .map((g) => ({
        queryKey: ['filmInfo', g.apiTmdbId, g.tvSeries ? 'tv' : 'movie', locale],
        queryFn: () => apiClient.getFilmInfo(g.apiTmdbId!, g.tvSeries ? 'tv' as const : 'movie' as const, locale),
        staleTime: 30000,
      })),
  });

  const tmdbMap = useMemo(() => {
    const map: Record<number, any> = {};
    let idx = 0;
    for (const group of groupedByFilm) {
      if (group.apiTmdbId) {
        const data = tmdbQueries[idx]?.data;
        if (data) map[group.filmId] = data;
        idx++;
      }
    }
    return map;
  }, [groupedByFilm, tmdbQueries]);

  const filmTitle = (group: typeof groupedByFilm[0]) => {
    const tmdb = tmdbMap[group.filmId];
    return tmdb?.title || tmdb?.name || group.slug;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{name}</h1>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-bg-elevated h-20" />
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
          <div className="space-y-8">
            {groupedByFilm.map((group) => (
              <section key={group.filmId || group.slug}>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-lg font-semibold">{filmTitle(group)}</h2>
                  {group.apiTmdbId && (
                    <Link
                      href={`/films/${group.tvSeries ? 'tv' : 'movie'}/${group.apiTmdbId}`}
                      className="text-sm text-accent hover:underline"
                    >
                      {t('open')}
                    </Link>
                  )}
                </div>
                <div className="rounded-xl bg-bg-surface border border-border overflow-hidden">
                  <div className="flex flex-col">
                    {group.songs.map((song: any, idx: number) => (
                      <SongItem
                        key={song.id}
                        song={song}
                        allSongs={group.songs}
                        index={idx}
                      />
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
