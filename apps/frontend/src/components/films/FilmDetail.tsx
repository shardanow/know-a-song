'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { api } from '@/lib/api';
import { FilmInfo } from './FilmInfo';
import { SongList } from '@/components/songs/SongList';
import { SongTimeline } from '@/components/songs/SongTimeline';
import { SuggestionsTab } from '@/components/songs/SuggestionsTab';
import { CommentsTab } from '@/components/songs/CommentsTab';
import { FilmDetailSkeleton } from '@/components/ui/skeletons';
import { useAuthStore } from '@/stores/auth-store';
import { usePlayerStore } from '@/stores/player-store';

interface FilmDetailProps {
  filmId: number;
  type: 'movie' | 'tv';
}

type Tab = 'songs' | 'suggestions' | 'comments';

export function FilmDetail({ filmId, type }: FilmDetailProps) {
  const t = useTranslations('film');
  const locale = useLocale();
  const token = useAuthStore((s) => s.token);
  const [activeTab, setActiveTab] = useState<Tab>('songs');

  const { data: tmdbInfo, isLoading: tmdbLoading, isError: tmdbError } = useQuery({
    queryKey: ['tmdbFilm', filmId, type, locale],
    queryFn: () => apiClient.getFilmInfo(filmId, type, locale),
  });

  const { data: songs, isLoading: songsLoading, isError: songsError } = useQuery({
    queryKey: ['filmSongs', filmId],
    queryFn: () => apiClient.getSongsByTmdbId(filmId),
  });

  const { data: suggestionsData } = useQuery({
    queryKey: ['suggestions', filmId],
    queryFn: () => api.suggestions.byFilm(filmId),
    enabled: activeTab === 'suggestions',
  });

  const { data: commentsData } = useQuery({
    queryKey: ['comments', filmId],
    queryFn: () => api.comments.byFilm(filmId),
    enabled: activeTab === 'comments',
  });

  const handlePlayAll = () => {
    if (songs && songs.length > 0) {
      usePlayerStore.getState().setSongs(songs as any);
      usePlayerStore.getState().setIsPlaying(true);
    }
  };

  if (tmdbLoading) return <FilmDetailSkeleton />;
  if (tmdbError) return <div className="p-8 text-text-secondary">{t('failedToLoad')}</div>;
  if (!tmdbInfo) return <div className="p-8 text-text-secondary">{t('notFound')}</div>;

  const durationMinutes = type === 'movie' ? tmdbInfo.runtime : undefined;
  const episodeCount = type === 'tv' ? tmdbInfo.number_of_episodes : undefined;
  const genres = tmdbInfo.genres?.map((g: any) => ({ id: g.id, name: g.name })) || [];
  const dbFilmId = songs?.[0]?.filmId ?? undefined;
  const songsCount = songs?.length ?? 0;
  const suggestionsCount = suggestionsData?.total ?? 0;
  const commentsCount = commentsData?.total ?? 0;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'songs', label: t('songsTab') || 'Songs' },
    { key: 'suggestions', label: t('suggestionsTab') || 'Suggestions', count: suggestionsCount },
    { key: 'comments', label: t('commentsTab') || 'Comments', count: commentsCount },
  ];

  return (
    <>
      <FilmInfo
        title={tmdbInfo.title || tmdbInfo.name}
        year={(tmdbInfo.release_date || tmdbInfo.first_air_date || '').slice(0, 4)}
        backdropPath={tmdbInfo.backdrop_path}
        tmdbId={filmId}
        type={type}
        songsCount={songsCount}
        episodeCount={episodeCount}
        genres={genres}
        japaneseTitle={tmdbInfo.original_name || tmdbInfo.original_title}
        dbFilmId={dbFilmId}
        onPlayAll={handlePlayAll}
      />

      <div className="relative" style={{ height: 59 }}>
        <div className="flex items-end gap-4 sm:gap-8 px-4 sm:px-8 border-t border-border-soft absolute inset-0 overflow-hidden">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`h-[44px] text-text-muted font-bold flex items-center gap-2 relative cursor-pointer hover:text-text-primary transition-colors group ${
                activeTab === tab.key ? 'text-accent-2' : ''
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-bg-overlay text-text-muted px-2 py-0.5 rounded-full text-[13px]">
                  {tab.count}
                </span>
              )}
              <span
                className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-full transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-accent shadow-[0_0_18px_rgba(255,70,88,.55)]'
                    : 'bg-transparent group-hover:bg-accent/30'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {activeTab === 'songs' && (
          <>
            {songsError ? (
              <div className="p-6 text-text-secondary">{t('failedToLoadSongs')}</div>
            ) : (
              <>
                {type === 'movie' && (
                  <SongTimeline songs={songs || []} durationMinutes={durationMinutes} />
                )}
                <SongList filmId={filmId} songs={songs || []} isLoading={songsLoading} />
              </>
            )}
          </>
        )}
        {activeTab === 'suggestions' && (
          <SuggestionsTab filmId={filmId} />
        )}
        {activeTab === 'comments' && (
          <CommentsTab filmId={filmId} />
        )}
      </div>
    </>
  );
}
