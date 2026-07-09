'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { usePlayerStore } from '@/stores/player-store';
import { useAuthStore } from '@/stores/auth-store';
import { useInfoStore } from '@/stores/info-store';
import { ThumbsUp, ThumbsDown, Heart } from 'lucide-react';

interface Song {
  id: number;
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
}

interface SongItemProps {
  song: Song;
  allSongs?: Song[];
  index: number;
}

export function SongItem({ song, allSongs, index }: SongItemProps) {
  const t = useTranslations();
  const { currentIndex, isPlaying, songs, setIsPlaying, setCurrentIndex, setSongs } = usePlayerStore();
  const user = useAuthStore((s) => s.user);
  const openInfo = useInfoStore((s) => s.open);
  const [favorited, setFavorited] = useState(false);
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [counts, setCounts] = useState({ up: 0, down: 0 });
  const isCurrent = songs[currentIndex]?.id === song.id;

  const loadCounts = () => {
    api.songs.getRatingCounts(song.id).then(setCounts).catch(() => {});
  };

  const handlePlay = () => {
    if (isCurrent) {
      setIsPlaying(!isPlaying);
    } else {
      if (allSongs) setSongs(allSongs as any);
      setCurrentIndex(index);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (!user) return;
    api.songs.getRating(song.id)
      .then((ratings) => {
        if (ratings.length > 0) {
          setRating(ratings[0].ratingValue === 1 ? 'up' : 'down');
        }
      })
      .catch(() => {});
    loadCounts();
    api.songs.getFavorites()
      .then((favorites) => {
        if (favorites.some((f: any) => f.id === song.id)) {
          setFavorited(true);
        }
      })
      .catch(() => {});
  }, [user, song.id]);

  const handleLike = async () => {
    if (!user) return;
    const prev = favorited;
    setFavorited(!prev);
    try {
      await api.songs.toggleFavorite(song.id);
    } catch {
      setFavorited(prev);
    }
  };

  const handleRating = async (value: 'up' | 'down') => {
    if (!user) return;
    const prev = rating;
    const newRating = prev === value ? null : value;
    setRating(newRating);
    try {
      if (newRating) {
        await api.songs.setRating(song.id, value === 'up' ? 1 : -1);
      } else {
        await api.songs.deleteRating(song.id);
      }
      loadCounts();
    } catch {
      setRating(prev);
    }
  };

  const getTypeLabel = () => {
    if (song.isOpening) return 'OP';
    if (song.isEnding) return 'ED';
    return 'OST';
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 sm:px-[14px] sm:pl-8 h-[55px] border-t border-border-soft overflow-hidden',
        isCurrent ? 'bg-gradient-to-r from-accent/37 via-accent/22 to-accent/14' : '',
      )}
    >
      <span className="text-text-muted border border-border rounded-[7px] px-[9px] py-[5px] text-center text-[13px] font-semibold shrink-0 w-[46px]">
        {getTypeLabel()}
      </span>

      <button onClick={handlePlay} className="w-[30px] h-[30px] flex items-center justify-center shrink-0 cursor-pointer hover:opacity-80 transition-opacity" aria-label={isCurrent && isPlaying ? t('player.pause') : t('player.play')}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          {isCurrent && isPlaying
            ? <><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></>
            : <path d="M8 5v14l11-7Z" />
          }
        </svg>
      </button>

      <div className="min-w-0 flex-1">
        <div className="font-extrabold text-[14px] sm:text-[16px] truncate">{song.title}</div>
        <div className="text-text-secondary text-[13px] sm:text-[15px] truncate">{song.author}</div>
      </div>

      <div className="flex items-center gap-[9px] text-text-primary shrink-0">
        <button
          onClick={() => handleRating('up')}
          className={cn('flex items-center gap-1 font-bold cursor-pointer hover:opacity-70 transition-opacity', rating === 'up' ? 'text-green' : '')}
        >
          <ThumbsUp size={16} fill={rating === 'up' ? 'currentColor' : 'none'} strokeWidth={2} />
          {counts.up}
        </button>
        <button
          onClick={() => handleRating('down')}
          className={cn('flex items-center gap-1 font-bold cursor-pointer hover:opacity-70 transition-opacity', rating === 'down' ? 'text-accent' : '')}
        >
          <ThumbsDown size={16} fill={rating === 'down' ? 'currentColor' : 'none'} strokeWidth={2} />
          {counts.down}
        </button>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button onClick={handleLike} className={cn('cursor-pointer hover:opacity-70 transition-opacity', favorited ? 'text-accent' : 'text-text-muted')}>
          <Heart size={20} fill={favorited ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>
        <button
          onClick={() => openInfo(song.id)}
          className="w-[23px] h-[23px] border-2 border-text-muted rounded-full grid place-items-center text-[14px] font-black opacity-95 cursor-pointer hover:opacity-70 transition-opacity"
        >
          i
        </button>
      </div>
    </div>
  );
}
