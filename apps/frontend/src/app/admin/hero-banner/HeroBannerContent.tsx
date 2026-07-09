'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, unwrapData } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronUp, ChevronDown, X } from 'lucide-react';

export default function HeroBannerContent() {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const tf = useTranslations('adminFilms');
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: slidesData, isLoading } = useQuery({
    queryKey: ['heroBanner'],
    queryFn: () => api.films.heroBanner.getAll(),
    enabled: !!token,
  });

  const { data: filmsData } = useQuery({
    queryKey: ['admin-hero-banner-search', search],
    queryFn: () => api.films.list({ search: search || undefined, limit: 20 }),
    enabled: !!token && search.length >= 1,
  });
  const allFilms: any[] = unwrapData(filmsData) || [];

  const rawSlides: any[] = (slidesData as any) || [];

  const [slides, setSlides] = useState<{ filmId: number; position: number }[] | null>(null);

  const effectiveSlides = slides ?? rawSlides.map((s: any, i: number) => ({
    filmId: s.HeroBannerSlide?.filmId ?? s.filmId ?? s.id,
    position: s.HeroBannerSlide?.position ?? i,
    dbId: s.HeroBannerSlide?.id,
    film: s.Films ?? s,
  }));

  const saveMutation = useMutation({
    mutationFn: () =>
      api.films.heroBanner.replace(
        effectiveSlides.map((s: any, i: number) => ({ filmId: s.filmId, position: i })),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroBanner'] });
      setSlides(null);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (dbId: number) => api.films.heroBanner.remove(dbId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroBanner'] });
    },
  });

  const addSlide = (filmId: number) => {
    setSlides((prev) => {
      const current = prev ?? rawSlides.map((s: any, i: number) => ({
        filmId: s.HeroBannerSlide?.filmId ?? s.filmId,
        position: s.HeroBannerSlide?.position ?? i,
        dbId: s.HeroBannerSlide?.id,
        film: s.Films ?? s,
      }));
      if (current.some((s: any) => s.filmId === filmId)) return current;
      return [...current, { filmId, position: current.length }];
    });
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    setSlides((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return next;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeSlide = (index: number) => {
    setSlides((prev) => {
      if (!prev) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  if (!token) return <p className="text-text-secondary p-4">{t('heroBannerRequiresAuth')}</p>;
  if (isLoading) return <p className="text-text-secondary p-4">{tc('loading')}</p>;

  const hasChanges = slides !== null;

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{t('heroBanner')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder={t('heroBannerSearchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
          </div>

          {search && allFilms.length > 0 && (
            <div className="border border-border rounded-lg max-h-48 overflow-y-auto">
              {allFilms.map((film: any) => (
                <button
                  key={film.id}
                  onClick={() => { addSlide(film.id); setSearch(''); }}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-text-primary hover:bg-bg-elevated transition-colors text-left"
                >
                  <span>{film.slug}</span>
                  <span className="text-text-muted text-xs">
                    {film.apiTmdbId ? `TMDB: ${film.apiTmdbId}` : ''}
                    {film.tvSeries ? ` ${t('heroBannerSeries')}` : ''}
                    {film.apiShikiId ? ` ${t('heroBannerAnime')}` : ''}
                  </span>
                </button>
              ))}
            </div>
          )}

          {search && allFilms.length === 0 && search.length >= 1 && (
            <p className="text-text-muted text-sm">{t('heroBannerNothingFound')}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t('heroBannerSlides', { count: effectiveSlides.length })}
            {hasChanges && (
              <span className="text-accent text-sm ml-2">
                {t('heroBannerUnsaved')}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {effectiveSlides.length === 0 ? (
            <p className="text-text-muted text-sm">{t('heroBannerNoSlides')}</p>
          ) : (
            <div className="space-y-2">
              {effectiveSlides.map((slide: any, i: number) => (
                <div
                  key={slide.dbId ?? `new-${slide.filmId}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-bg-surface"
                >
                  <span className="text-text-muted text-sm font-mono w-6 text-right">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {slide.film?.slug || `Film #${slide.filmId}`}
                    </p>
                    <p className="text-xs text-text-muted">
                      ID: {slide.filmId}
                      {slide.film?.apiTmdbId ? ` · TMDB: ${slide.film.apiTmdbId}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      disabled={i === 0}
                      onClick={() => moveSlide(i, -1)}
                      className="w-8 h-8 grid place-items-center rounded-lg text-text-secondary hover:bg-bg-elevated transition-colors disabled:opacity-30"
                      aria-label={t('heroBannerUp')}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      disabled={i === effectiveSlides.length - 1}
                      onClick={() => moveSlide(i, 1)}
                      className="w-8 h-8 grid place-items-center rounded-lg text-text-secondary hover:bg-bg-elevated transition-colors disabled:opacity-30"
                      aria-label={t('heroBannerDown')}
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (slide.dbId && !hasChanges) {
                          removeMutation.mutate(slide.dbId);
                        } else {
                          removeSlide(i);
                        }
                      }}
                      className="w-8 h-8 grid place-items-center rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                      aria-label={tc('delete')}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex gap-2">
            {hasChanges && (
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="bg-accent hover:bg-accent-hover text-white"
              >
                {saveMutation.isPending ? t('heroBannerSaving') : t('heroBannerSave')}
              </Button>
            )}
            {hasChanges && (
              <Button onClick={() => setSlides(null)} variant="outline">
                {tf('cancel')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
