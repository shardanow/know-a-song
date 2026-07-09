'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, unwrapData } from '@/lib/api-client';
import { api } from '@/lib/api';
import { Link, useRouter, usePathname } from '@/lib/navigation';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { usePlayerStore } from '@/stores/player-store';
import dynamic from 'next/dynamic';
import { FilmCardItem } from './FilmCardItem';

const FilmHeroCard = dynamic(() => import('./FilmHeroCard').then((m) => ({ default: m.FilmHeroCard })), {
  ssr: true,
  loading: () => <div className="h-[clamp(310px,29vw,410px)] rounded-[28px] bg-bg-elevated animate-pulse" />,
});
import { FilmFilters, type ViewFilter, type TypeFilter } from './FilmFilters';
import { FilmListSkeleton } from '@/components/ui/skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Film {
  id: number;
  apiTmdbId: number | null;
  apiShikiId: number | null;
  tvSeries: boolean;
  slug: string;
}

const PER_PAGE = 12;

export function FilmList({ searchQuery }: { searchQuery?: string }) {
  const t = useTranslations('films');
  const locale = useLocale();
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { data: result, isLoading, isError } = useQuery({
    queryKey: ['films'],
    queryFn: () => apiClient.getFilms(),
  });

  const films: Film[] = unwrapData(result) || [];

  const { data: favoritesData } = useQuery({
    queryKey: ['filmFavorites'],
    queryFn: () => api.filmFavorites.list(),
    enabled: !!token,
  });
  const favoriteIds = useMemo(
    () => new Set((favoritesData as any[] || []).map((f: any) => f.FilmFavorite.filmId)),
    [favoritesData],
  );

  const [songCounts, setSongCounts] = useState<Record<number, number>>({});
  const [songLikes, setSongLikes] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!films.length) return;
    const ids = films.map((f) => f.id);

    apiClient.getBatchSongs(ids).then((songs: any[]) => {
      const counts: Record<number, number> = {};
      for (const song of songs) {
        if (song.filmId) {
          counts[song.filmId] = (counts[song.filmId] || 0) + 1;
        }
      }
      setSongCounts(counts);
    }).catch(() => {});

    apiClient.getFilmLikes(ids).then((likes: { filmId: number; likes: number }[]) => {
      const map: Record<number, number> = {};
      for (const l of likes) {
        map[l.filmId] = l.likes;
      }
      setSongLikes(map);
    }).catch(() => {});
  }, [films]);

  const pathname = usePathname();
  const urlKey = `${pathname}?${searchParams.toString()}`;

  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchQuery || '');

  useEffect(() => {
    setSearch(searchQuery || '');
  }, [searchQuery]);

  useEffect(() => {
    const v = (searchParams.get('view') as ViewFilter) || 'all';
    const t = (searchParams.get('type') as TypeFilter) || 'all';
    if (v !== viewFilter) {
      setViewFilter(v);
      setPage(1);
    }
    if (t !== typeFilter) setTypeFilter(t);
  }, [urlKey]);

  const toggleFavorite = useCallback(
    async (filmId: number) => {
      if (!token) return;
      try {
        await api.filmFavorites.toggle(filmId);
        queryClient.invalidateQueries({ queryKey: ['filmFavorites'] });
      } catch {
        /* silently fail */
      }
    },
    [token, queryClient],
  );

  const handlePlayFilm = useCallback(
    async (filmId: number) => {
      const film = films.find((f) => f.id === filmId);
      if (!film?.apiTmdbId) return;
      try {
        const songs = await apiClient.getSongsByTmdbId(film.apiTmdbId);
        if (songs?.length) {
          usePlayerStore.getState().setSongs(songs);
          usePlayerStore.getState().setIsPlaying(true);
        }
      } catch {
        /* silently fail */
      }
    },
    [films],
  );

  const replaceUrl = useCallback((v: string | null, t: string | null) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (v) params.set('view', v);
    if (t) params.set('type', t);
    const qs = params.toString();
    router.replace(qs ? `/films?${qs}` : '/films');
  }, [search, router]);

  const handleViewChange = useCallback((v: ViewFilter) => {
    setViewFilter(v);
    setPage(1);
    const typeVal = typeFilter === 'all' ? null : typeFilter;
    replaceUrl(v === 'all' ? null : v, typeVal);
  }, [replaceUrl, typeFilter]);

  const handleTypeChange = useCallback((t: TypeFilter) => {
    setTypeFilter(t);
    setPage(1);
    const viewVal = viewFilter === 'all' ? null : viewFilter;
    replaceUrl(viewVal, t === 'all' ? null : t);
  }, [replaceUrl, viewFilter]);

  const filtered = useMemo(() => {
    let list = [...films];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((f) => f.slug.toLowerCase().includes(q));
    }

    if (typeFilter === 'movies') {
      list = list.filter((f) => !f.tvSeries);
    } else if (typeFilter === 'tv') {
      list = list.filter((f) => f.tvSeries);
    } else if (typeFilter === 'anime') {
      list = list.filter((f) => {
        if (f.apiShikiId !== null) return true;
        if (f.apiTmdbId === null) return false;
        const tt = f.tvSeries ? 'tv' : 'movie';
        const cached = queryClient.getQueryData<any>(['filmInfo', f.apiTmdbId, tt, locale]);
        return cached?.genres?.some((g: any) => g.id === 16) ?? false;
      });
    }

    if (viewFilter === 'favorites') {
      list = list.filter((f) => favoriteIds.has(f.id));
    }

    if (viewFilter === 'popular') {
      list.sort((a, b) => (songLikes[b.id] || 0) - (songLikes[a.id] || 0));
    } else if (viewFilter === 'recent') {
      list.sort((a, b) => b.id - a.id);
    } else {
      list.sort((a, b) => a.id - b.id);
    }

    return list;
  }, [films, search, typeFilter, viewFilter, favoriteIds, songLikes, queryClient, locale]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const shown = useMemo(
    () => (viewFilter !== 'all' ? filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE) : filtered),
    [filtered, viewFilter, page],
  );

  const { data: bannerConfig } = useQuery({
    queryKey: ['heroBanner'],
    queryFn: () => api.films.heroBanner.getAll(),
    staleTime: 60000,
  });

  const heroSlides = useMemo(() => {
    const rawBanner: any[] = (bannerConfig as any) || [];
    if (rawBanner.length > 0) {
      const bannerFilmIds = rawBanner.map((s: any) => s.HeroBannerSlide?.filmId ?? s.filmId);
      const ordered: Film[] = [];
      for (const fid of bannerFilmIds) {
        const film = filtered.find((f) => f.id === fid);
        if (film && film.apiTmdbId !== null) ordered.push(film);
      }
      if (ordered.length > 0) return ordered;
    }
    return filtered
      .filter((f) => f.apiTmdbId !== null)
      .sort((a, b) => (songLikes[b.id] || 0) - (songLikes[a.id] || 0))
      .slice(0, 3);
  }, [filtered, songLikes, bannerConfig]);

  const popular = useMemo(
    () => [...filtered]
      .sort((a, b) => (songLikes[b.id] || 0) - (songLikes[a.id] || 0))
      .slice(0, 3),
    [filtered, songLikes],
  );

  const recent = useMemo(
    () => [...filtered]
      .sort((a, b) => b.id - a.id)
      .slice(0, 4),
    [filtered],
  );

  if (isLoading) {
    if (viewFilter !== 'all') {
      return (
        <div className="pt-[18px] pb-6">
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[18px]">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="min-h-[222px] rounded-[20px] bg-bg-elevated animate-pulse" />
            ))}
          </div>
        </div>
      );
    }
    return <FilmListSkeleton />;
  }
  if (isError) return <div className="text-text-secondary p-8">{t('failedToLoad')}</div>;
  if (!films.length) return <div className="text-text-secondary p-8">{t('noFilms')}</div>;
  if (search && filtered.length === 0) {
    return <div className="text-text-secondary p-8">{t('noResults', { query: search })}</div>;
  }

  const isListView = viewFilter !== 'all';

  return (
    <div className="min-w-0">
      <div className="pt-[6px] pb-6">
        <header className="max-w-[1180px]">
          <h1 className="m-0 text-[clamp(34px,4vw,48px)] leading-[1] tracking-[-0.06em]">
            {t('title')}
          </h1>
          <p className="mt-[10px] mb-0 max-w-[740px] text-[#aab7ca] text-[15px] leading-[1.55]">
            {t('subtitle')}
          </p>

          <FilmFilters
            viewFilter={viewFilter}
            typeFilter={typeFilter}
            onViewChange={handleViewChange}
            onTypeChange={handleTypeChange}
            isAuthenticated={!!token}
          />
        </header>

        {isListView ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[18px] mt-4">
              {shown.map((film) => (
                <FilmCardItem
                  key={film.id}
                  film={film}
                  size="small"
                  songCount={songCounts[film.id]}
                  isFavorited={favoriteIds.has(film.id)}
                  onToggleFavorite={toggleFavorite}
                  onPlayFilm={handlePlayFilm}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-[40px] px-4 rounded-[13px] text-[#d7e0ee] bg-[rgba(10,16,26,.7)] border border-[rgba(148,163,184,.13)] hover:border-[rgba(148,163,184,.26)] disabled:opacity-40 disabled:cursor-not-allowed transition-[.18s_ease]"
                >
                  <ChevronLeft size={16} /> {t('prevPage')}
                </button>
                <span className="text-[#aab7ca] text-[14px]">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-[40px] px-4 rounded-[13px] text-[#d7e0ee] bg-[rgba(10,16,26,.7)] border border-[rgba(148,163,184,.13)] hover:border-[rgba(148,163,184,.26)] disabled:opacity-40 disabled:cursor-not-allowed transition-[.18s_ease]"
                >
                  {t('nextPage')} <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {heroSlides.length > 0 && (
              <div className="mb-6">
                <FilmHeroCard
                  films={heroSlides}
                  songCounts={songCounts}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={toggleFavorite}
                  onPlayFilm={handlePlayFilm}
                />
              </div>
            )}

            {popular.length > 0 && (
              <section className="max-w-[1396px] mt-6">
                <div className="flex items-center justify-between gap-6 mb-3">
                  <h2 className="m-0 text-[22px] tracking-[-0.04em]">{t('popular')}</h2>
                  <Link
                    href="/films?view=popular"
                    className="inline-flex items-center gap-2 text-[#e5edf8] text-[14px] hover:text-[#ff7189] transition-[.18s_ease] no-underline"
                  >
                    {t('seeAll')} <span>›</span>
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
                  {popular.map((film) => (
                    <FilmCardItem
                      key={film.id}
                      film={film}
                      size="normal"
                      songCount={songCounts[film.id]}
                      isFavorited={favoriteIds.has(film.id)}
                      onToggleFavorite={toggleFavorite}
                      onPlayFilm={handlePlayFilm}
                    />
                  ))}
                </div>
              </section>
            )}

            {recent.length > 0 && (
              <section className="max-w-[1396px] mt-6">
                <div className="flex items-center justify-between gap-6 mb-3">
                  <h2 className="m-0 text-[22px] tracking-[-0.04em]">{t('recentlyAdded')}</h2>
                  <Link
                    href="/films?view=recent"
                    className="inline-flex items-center gap-2 text-[#e5edf8] text-[14px] hover:text-[#ff7189] transition-[.18s_ease] no-underline"
                  >
                    {t('seeAll')} <span>›</span>
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
                  {recent.map((film) => (
                    <FilmCardItem
                      key={film.id}
                      film={film}
                      size="small"
                      songCount={songCounts[film.id]}
                      isFavorited={favoriteIds.has(film.id)}
                      onToggleFavorite={toggleFavorite}
                      onPlayFilm={handlePlayFilm}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
