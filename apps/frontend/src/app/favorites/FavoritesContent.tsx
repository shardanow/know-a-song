'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/navigation';
import { usePlayerStore } from '@/stores/player-store';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip } from '@/components/Tooltip';

type FavoriteSong = {
  id: number;
  filmId: number;
  apiTmdbId: number | null;
  apiShikiId: number | null;
  title: string;
  author: string;
  season: number;
  isOpening: boolean;
  isEnding: boolean;
  youtubeId: string | null;
  youtubeLink: string | null;
  spotifyId: string | null;
  spotifyLink: string | null;
  appleMId: string | null;
  appleMLink: string | null;
};

export default function FavoritesContent() {
  const t = useTranslations('favorites');
  const tc = useTranslations('common');
  const { user } = useAuthStore();
  const router = useRouter();
  const { songs, currentIndex, isPlaying, setIsPlaying, setCurrentIndex, setSongs } = usePlayerStore();
  const [mounted, setMounted] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteSong[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setMounted(true); }, []);

  const loadFavorites = () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    api.songs.getFavorites()
      .then((data: any) => {
        setFavorites(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const handlePlay = (index: number) => {
    setSongs(favorites as any);
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const handleRemove = async (songId: number) => {
    try {
      await api.songs.toggleFavorite(songId);
      setFavorites((prev) => prev.filter((s) => s.id !== songId));
    } catch {}
  };

  if (!mounted) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
        <h1 className="text-xl font-bold text-text-primary">{t('title')}</h1>
        <p className="text-text-secondary">{tc('loading')}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-text-secondary">{t('signInRequired')}</p>
            <Button onClick={() => router.push('/login')}>{tc('login')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filmPath = (s: FavoriteSong) =>
    s.apiTmdbId ? `/films/movie/${s.apiTmdbId}` : null;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-text-primary">{t('title')}</h1>
      {loading ? (
        <p className="text-text-secondary">{tc('loading')}</p>
      ) : favorites.length === 0 ? (
        <p className="text-text-secondary">{t('empty')}</p>
      ) : (
        <div className="space-y-1">
          {favorites.map((s, i) => {
            const playing = songs[currentIndex]?.id === s.id && isPlaying;
            const fp = filmPath(s);
            return (
              <div key={s.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-bg-elevated text-sm">
                <button
                  onClick={() => handlePlay(i)}
                  className="text-text-secondary hover:text-accent transition-colors"
                  aria-label={playing ? 'Pause' : 'Play'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    {playing
                      ? <><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></>
                      : <><path d="M8 5v14l11-7z" /></>
                    }
                  </svg>
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-text-primary truncate">{s.title} — {s.author}</p>
                </div>

                <div className="flex items-center gap-2">
                  {s.youtubeLink && (
                    <Tooltip text={t('youtube')}>
                      <a href={s.youtubeLink} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-red-500">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z" /></svg>
                      </a>
                    </Tooltip>
                  )}
                  {s.spotifyLink && (
                    <Tooltip text={t('spotify')}>
                      <a href={s.spotifyLink} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-green-500">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.72.48-1.08.24-2.88-1.8-6.48-2.16-10.68-1.2-.48.12-.84-.24-.96-.72-.12-.48.24-.84.72-.96 4.68-1.08 8.64-.6 11.88 1.44.36.24.48.72.12 1.2zm1.44-3.24c-.3.42-.84.6-1.32.3-3.24-2.04-8.28-2.64-12.12-1.44-.48.18-1.02-.06-1.2-.54-.18-.48.06-1.02.54-1.2 4.44-1.32 9.96-.72 13.68 1.68.48.3.6.84.3 1.32v-.12zm.12-3.36c-3.96-2.4-10.44-2.64-14.16-1.44-.6.18-1.2-.12-1.38-.72-.18-.6.12-1.2.72-1.38 4.44-1.44 11.52-1.08 16.08 1.68.48.3.72.96.42 1.44-.3.48-.96.72-1.44.42h-.24z" /></svg>
                      </a>
                    </Tooltip>
                  )}
                  {s.appleMLink && (
                    <Tooltip text={t('appleMusic')}>
                      <a href={s.appleMLink} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-pink-500">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.08 6.5 2.08 12s4.5 10 9.96 10 10-4.5 10-10S17.5 2 12.04 2zm3.35 14.68c-.18.3-.54.42-.84.24-2.28-1.38-5.16-1.68-8.58-.9-.36.06-.72-.18-.78-.54-.06-.36.18-.72.54-.78 3.78-.84 6.96-.48 9.54 1.08.3.18.42.54.24.84v.06zm.96-3.12c-.24.36-.72.54-1.14.3-2.58-1.56-6.48-2.04-9.48-1.08-.42.12-.84-.12-.96-.54-.12-.42.12-.84.54-.96 3.48-1.08 7.68-.54 10.68 1.26.36.24.48.72.24 1.08v-.06zm.06-3.36c-3.06-1.8-8.1-1.98-10.98-1.08-.48.18-.96-.06-1.14-.48-.18-.48.06-.96.48-1.14 3.36-1.02 8.88-.84 12.48 1.26.42.24.54.72.3 1.14-.24.3-.72.42-1.14.3v0z" /></svg>
                      </a>
                    </Tooltip>
                  )}
                </div>

                <button
                  onClick={() => handleRemove(s.id)}
                  className="text-accent hover:text-accent-hover transition-colors"
                  aria-label={t('remove')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
