'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { BackButton } from '@/components/layout/BackButton';
import { SearchBar } from '@/components/search/SearchBar';
import { Heart, Play } from 'lucide-react';
import { useMouseGradient } from '@/hooks/use-mouse-gradient';

interface FilmInfoProps {
  title: string;
  year: string;
  backdropPath: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  songsCount: number;
  episodeCount?: number;
  genres?: { id: number; name: string }[];
  japaneseTitle?: string;
  dbFilmId?: number;
  onPlayAll?: () => void;
}

export function FilmInfo({
  title,
  year,
  backdropPath,
  tmdbId,
  type,
  songsCount,
  episodeCount,
  genres,
  japaneseTitle,
  dbFilmId,
  onPlayAll,
}: FilmInfoProps) {
  const t = useTranslations('film');
  const tc = useTranslations('common');
  const token = useAuthStore((s) => s.token);
  const favBtn = useMouseGradient();
  const playBtn = useMouseGradient();
  const tmdbBtn = useMouseGradient();

  const { data: favData } = useQuery({
    queryKey: ['filmFavorites'],
    queryFn: () => api.filmFavorites.list(),
    enabled: !!token,
  });

  const isFavorited = favData?.some((f: any) => f.filmId === dbFilmId) ?? false;

  const toggleFilmFav = async () => {
    if (!token || !dbFilmId) return;
    await api.filmFavorites.toggle(dbFilmId);
  };

  const mediaType = type === 'tv' ? tc('mediaTv') : tc('mediaMovie');

  return (
    <div className="relative min-h-[300px] sm:h-[424px] px-4 sm:px-8 pt-[18px] pb-0 isolate overflow-hidden border-b border-border-soft">
      <div
        className="absolute inset-0 -z-[3] bg-cover bg-center saturate-[0.9] opacity-62"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/w1280${backdropPath})`,
          filter: 'blur(0px)',
        }}
      />
      <div
        className="absolute inset-0 -z-[2]"
        style={{
          background: `
            linear-gradient(90deg, color-mix(in srgb, var(--bg-primary) 98%, transparent) 0%, color-mix(in srgb, var(--bg-primary) 78%, transparent) 28%, color-mix(in srgb, var(--bg-primary) 35%, transparent) 62%, color-mix(in srgb, var(--bg-primary) 94%, transparent) 100%),
            linear-gradient(180deg, color-mix(in srgb, var(--bg-primary) 15%, transparent) 0%, color-mix(in srgb, var(--bg-primary) 82%, transparent) 100%)
          `,
        }}
      />

<div className="mt-[53px] max-w-[720px] relative z-[2]">
        <h1 className="m-0 text-[clamp(24px,2.1vw,42px)] leading-[1.07] tracking-[-0.05em] font-extrabold">
          {title}
        </h1>
        {japaneseTitle && (
          <div className="text-[19px] mt-[10px] text-text-primary opacity-86">{japaneseTitle}</div>
        )}
        <div className="flex items-center gap-[10px] text-text-secondary mt-[18px] text-[16px] flex-wrap">
          <span>{mediaType}</span>
          <span className="w-[4px] h-[4px] rounded-full bg-text-muted opacity-90" />
          <span>{year}</span>
          {episodeCount && (
            <>
              <span className="w-[4px] h-[4px] rounded-full bg-text-muted opacity-90" />
              <span>{tc('episodes', { count: episodeCount })}</span>
            </>
          )}
          <span className="w-[4px] h-[4px] rounded-full bg-text-muted opacity-90" />
          <span>{tc('songCount', { count: songsCount })}</span>
        </div>
        {genres && genres.length > 0 && (
          <div className="flex gap-[10px] mt-[16px] flex-wrap">
            {genres.map((genre) => (
              <span
                key={genre.id}
                className="border border-accent/30 text-text-secondary bg-accent/8 rounded-[10px] px-3 py-[7px] text-[14px]"
              >
                {genre.name}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-[14px] mt-[24px] flex-wrap">
          <button
            ref={favBtn.ref}
            onMouseEnter={favBtn.handleMouseEnter}
            onMouseMove={favBtn.handleMouseMove}
            onMouseLeave={favBtn.handleMouseLeave}
            onClick={toggleFilmFav}
            className="relative overflow-hidden h-[52px] px-[16px] sm:px-[23px] rounded-[9px] border border-accent/70 text-accent-2 flex items-center gap-[11px] font-bold text-[16px] cursor-pointer transition-colors"
            style={{
              background: favBtn.isHovered
                ? 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,70,88,.2), rgba(255,70,88,.045) 60%)'
                : 'rgba(255,70,88,.045)',
            }}
          >
            <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} strokeWidth={1.9} />
            {tc('addToFavorites')}
          </button>
          <button
            ref={playBtn.ref}
            onMouseEnter={playBtn.handleMouseEnter}
            onMouseMove={playBtn.handleMouseMove}
            onMouseLeave={playBtn.handleMouseLeave}
            onClick={onPlayAll}
            className="relative overflow-hidden h-[52px] px-[16px] sm:px-[23px] rounded-[9px] border-transparent text-white flex items-center gap-[11px] font-bold text-[16px] cursor-pointer transition-opacity"
            style={{
              background: 'linear-gradient(180deg, #ff6170, #ff394f)',
              boxShadow: '0 18px 38px rgba(255,56,75,.23)',
            }}
          >
            {playBtn.isHovered && (
              <span className="absolute inset-0 pointer-events-none transition-opacity duration-200" style={{ background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,.25), transparent 60%)' }} />
            )}
            <Play size={20} fill="currentColor" className="relative z-[1]" />
            <span className="relative z-[1]">{t('playAll')}</span>
          </button>
          <a
            ref={tmdbBtn.ref as any}
            onMouseEnter={tmdbBtn.handleMouseEnter}
            onMouseMove={tmdbBtn.handleMouseMove}
            onMouseLeave={tmdbBtn.handleMouseLeave}
            href={`https://www.themoviedb.org/${type}/${tmdbId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative overflow-hidden h-[52px] min-w-[106px] px-[16px] sm:px-[23px] rounded-[9px] border border-border text-text-primary flex items-center justify-center gap-[11px] font-bold text-[16px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.025)] cursor-pointer transition-colors bg-bg-surface"
          >
            {tmdbBtn.isHovered && (
              <span className="absolute inset-0 pointer-events-none transition-opacity duration-200" style={{ background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,.12), transparent 60%)' }} />
            )}
            <svg width="44" height="18" viewBox="0 0 200 72" fill="none" className="shrink-0">
              <rect width="200" height="72" rx="14" fill="#0d8b6b"/>
              <text x="100" y="50" textAnchor="middle" fill="white" fontSize="40" fontWeight="800" fontFamily="Arial,Helvetica,sans-serif">TMDB</text>
            </svg>
            TMDB
          </a>
        </div>
      </div>
    </div>
  );
}
