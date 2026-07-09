'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/lib/navigation';
import { apiClient } from '@/lib/api-client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Heart } from 'lucide-react';

interface Film {
  id: number;
  apiTmdbId: number | null;
  tvSeries: boolean;
  slug: string;
}

interface FilmHeroCardProps {
  films: Film[];
  songCounts: Record<number, number>;
  favoriteIds: Set<number>;
  onToggleFavorite: (filmId: number) => void;
  onPlayFilm: (filmId: number) => void;
}

function HeroSlide({
  film,
  songCount,
  isFavorited,
  onToggleFavorite,
  onPlayFilm,
  isActive,
}: {
  film: Film;
  songCount?: number;
  isFavorited: boolean;
  onToggleFavorite: (filmId: number) => void;
  onPlayFilm: (filmId: number) => void;
  isActive: boolean;
}) {
  const t = useTranslations('films');
  const locale = useLocale();
  const type = film.tvSeries ? 'tv' : 'movie';
  const tmdbId = film.apiTmdbId;

  const { data: info, isError } = useQuery({
    queryKey: ['filmInfo', tmdbId, type, locale],
    queryFn: () => (tmdbId ? apiClient.getFilmInfo(tmdbId, type as 'movie' | 'tv', locale) : null),
    enabled: !!tmdbId,
  });

  const backdrop = info?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${info.backdrop_path}`
    : null;

  const year = info?.release_date?.slice(0, 4) ?? info?.first_air_date?.slice(0, 4);

  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (isActive) {
      setZoomed(false);
      const raf = requestAnimationFrame(() => setZoomed(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setZoomed(false);
    }
  }, [isActive]);

  return (
    <div className="absolute inset-0">
      {backdrop && (
        <Image
          key={film.id}
          src={backdrop}
          alt={info?.title || film.slug}
          fill
          sizes="(max-width: 860px) 100vw, 1396px"
          priority={isActive}
          className="object-cover"
          style={{
            transform: isActive && zoomed ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 6s ease-out',
          }}
        />
      )}

      {!backdrop && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2832] via-[#2d424d] to-[#101720]" />
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: backdrop
            ? `linear-gradient(90deg, rgba(3,7,18,.85) 0%, rgba(3,7,18,.4) 35%, rgba(3,7,18,.15) 60%, rgba(3,7,18,0) 80%), linear-gradient(to top, rgba(2,6,13,.85) 0%, rgba(2,6,13,.3) 50%, rgba(2,6,13,0) 80%)`
            : `linear-gradient(90deg, rgba(3,7,18,.95) 0%, rgba(3,7,18,.7) 40%, rgba(3,7,18,.3) 100%), linear-gradient(to top, rgba(2,6,13,.85) 0%, rgba(2,6,13,.3) 50%, rgba(2,6,13,0) 80%)`,
        }}
      />

      <div className="relative z-[2] h-full flex flex-col justify-center max-w-[520px] px-[58px] py-12 tracking-[-0.06em]">
        {!tmdbId || info || isError ? (
          <h2
            className="m-0 text-[clamp(38px,4vw,58px)] leading-none text-white line-clamp-3"
            style={{ textShadow: '0 10px 30px rgba(0,0,0,.35)' }}
          >
            {info?.title || info?.name || film.slug}
          </h2>
        ) : (
          <Skeleton className="h-[clamp(38px,4vw,58px)] w-3/4 rounded-lg" />
        )}
        <div className="flex items-center gap-[9px] text-[#d6deeb] text-base mb-[6px]">
          {year && <span>{year}</span>}
          <span className="w-1 h-1 rounded-full bg-[#94a3b8]" />
          <span>{songCount !== undefined ? t('songCount', { count: songCount }) : ''}</span>
        </div>
        <div className="flex items-center gap-3 mt-[26px]">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPlayFilm(film.id); }}
            className="h-[50px] px-6 inline-flex items-center justify-center gap-[10px] rounded-[13px] text-white font-extrabold bg-gradient-to-r from-[#ff4a69] to-[#ff244d] shadow-[0_14px_32px_rgba(255,59,95,.34)] hover:-translate-y-0.5 hover:brightness-110 transition-[.18s_ease]"
          >
            <Play size={20} fill="currentColor" /> {t('listen')}
          </button>
          <Link
            href={`/films/${type}/${tmdbId}`}
            className="h-[50px] px-6 inline-flex items-center justify-center gap-[10px] rounded-[13px] text-white font-extrabold bg-[rgba(255,255,255,.1)] border border-[rgba(255,255,255,.12)] shadow-[inset_0_1px_0_rgba(255,255,255,.06)] hover:-translate-y-0.5 hover:brightness-110 transition-[.18s_ease]"
          >
            {t('open')}
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(film.id);
            }}
            className="w-[50px] h-[50px] inline-grid place-items-center rounded-[13px] text-white bg-[rgba(255,255,255,.1)] border border-[rgba(255,255,255,.12)] shadow-[inset_0_1px_0_rgba(255,255,255,.06)] hover:-translate-y-0.5 hover:brightness-110 transition-[.18s_ease] shrink-0"
            aria-label={t('addToFavorites')}
          >
            <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function FilmHeroCard({ films, songCounts, favoriteIds, onToggleFavorite, onPlayFilm }: FilmHeroCardProps) {
  const th = useTranslations('films');
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const total = films.length;

  const startAuto = useCallback(() => {
    stopAuto();
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 6000);
  }, [total]);

  const stopAuto = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (total <= 1) return;
    startAuto();
    return stopAuto;
  }, [total, startAuto, stopAuto]);

  if (total === 0) return null;

  const film = films[current];
  if (!film) return null;

  return (
    <section
      ref={sectionRef}
      onMouseEnter={stopAuto}
      onMouseLeave={() => { if (total > 1) startAuto(); }}
      className="relative h-[clamp(310px,29vw,410px)] max-w-[1396px] overflow-hidden rounded-[28px] shadow-[0_24px_70px_rgba(0,0,0,.35)]"
    >
      {films.map((f, i) => (
        <div
          key={f.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-500',
            i === current ? 'opacity-100 z-[1]' : 'opacity-0 z-0',
          )}
        >
          <HeroSlide
            film={f}
            songCount={songCounts[f.id]}
            isFavorited={favoriteIds.has(f.id)}
            onToggleFavorite={onToggleFavorite}
            onPlayFilm={onPlayFilm}
            isActive={i === current}
          />
        </div>
      ))}

      {total > 1 && (
        <div className="absolute z-[3] left-1/2 bottom-[26px] -translate-x-1/2 flex gap-3">
          {films.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setCurrent(i)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                i === current
                  ? 'bg-[#ff4658] shadow-[0_0_20px_rgba(255,59,95,.9)] scale-110'
                  : 'bg-[rgba(226,232,240,.4)] hover:bg-[rgba(226,232,240,.6)]',
              )}
              aria-label={th('slide', { n: i + 1 })}
            />
          ))}
        </div>
      )}
    </section>
  );
}
