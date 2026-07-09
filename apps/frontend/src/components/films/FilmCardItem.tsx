'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/lib/navigation';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Heart } from 'lucide-react';

interface FilmCardItemProps {
  film: { id: number; apiTmdbId: number | null; tvSeries: boolean; slug: string };
  size: 'normal' | 'small';
  songCount?: number;
  className?: string;
  isFavorited?: boolean;
  onToggleFavorite?: (filmId: number) => void;
  onPlayFilm?: (filmId: number) => void;
}

export function FilmCardItem({ film, size, songCount, className, isFavorited, onToggleFavorite, onPlayFilm }: FilmCardItemProps) {
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
    ? `https://image.tmdb.org/t/p/${size === 'normal' ? 'w780' : 'w500'}${info.backdrop_path}`
    : null;

  const year = info?.release_date?.slice(0, 4) ?? info?.first_air_date?.slice(0, 4);

  return (
    <Link
      href={`/films/${type}/${tmdbId}`}
      className={cn(
        'relative overflow-hidden rounded-[20px]',
        'transition-all duration-200 hover:-translate-y-1',
        size === 'normal' ? 'min-h-[250px]' : 'min-h-[222px]',
        className,
      )}
      style={
        backdrop
          ? { backgroundImage: `url(${backdrop})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : undefined
      }
    >
      {!backdrop && <div className="absolute inset-0 bg-gradient-to-br from-[#172033] to-[#2e465d]" />}

      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(3,7,18,.95)] via-[rgba(3,7,18,.80)_50%] to-[rgba(3,7,18,.35)] z-0" />

      <div className="absolute z-[3] right-3.5 top-3.5 flex gap-2">
        {onPlayFilm && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPlayFilm(film.id);
            }}
            className="w-[38px] h-[38px] grid place-items-center rounded-full text-white bg-[rgba(5,9,16,.56)] border border-[rgba(255,255,255,.22)] backdrop-blur-[10px] transition-all duration-200 hover:text-[#ff7189] hover:border-[rgba(255,59,95,.4)] hover:scale-105"
            aria-label={t('listen')}
          >
            <Play size={16} fill="currentColor" />
          </button>
        )}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(film.id);
            }}
            className="w-[38px] h-[38px] grid place-items-center rounded-full text-white bg-[rgba(5,9,16,.56)] border border-[rgba(255,255,255,.22)] backdrop-blur-[10px] transition-all duration-200 hover:text-[#ff7189] hover:border-[rgba(255,59,95,.4)] hover:scale-105"
            aria-label={t('addToFavorites')}
          >
            <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      <div className="absolute z-[2] left-[18px] right-[18px] bottom-4">
        {!tmdbId || info || isError ? (
          <h3
            className="m-0 mb-[5px] text-[18px] leading-[1.2] tracking-[-0.035em] text-white truncate"
            style={{ textShadow: '0 8px 22px rgba(0,0,0,.5)' }}
          >
            {info?.title || info?.name || film.slug}
          </h3>
        ) : (
          <Skeleton className="h-[22px] w-3/4 mb-[5px] rounded" />
        )}
        <div className="flex items-center gap-2 text-[14px] text-[#d4dfed]">
          {year && <span>{year}</span>}
          {songCount !== undefined && (
            <>
              {year && <span className="w-1 h-1 rounded-full bg-[#94a3b8]" />}
              <span>{t('songCount', { count: songCount })}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
