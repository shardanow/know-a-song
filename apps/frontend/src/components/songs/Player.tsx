'use client';

import { useCallback, useState, useRef, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePlayerStore } from '@/stores/player-store';
import { useAuthStore } from '@/stores/auth-store';
import { Notice } from '@/components/notice/Notice';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { Shuffle, SkipBack, SkipForward, Repeat, Volume2, List, Settings, Heart, ThumbsUp, ThumbsDown } from 'lucide-react';

const ReactPlayer = dynamic(() => import('react-player/youtube'), { ssr: false });

export function Player() {
  const t = useTranslations('player');
  const user = useAuthStore((s) => s.user);
  const {
    songs, currentIndex, isPlaying, isLooping, isShuffling, volume, muted,
    setIsPlaying, setIsLooping, setIsShuffling, setVolume, setMuted, playNext, playPrev,
  } = usePlayerStore();
  const [error, setError] = useState<string | null>(null);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [counts, setCounts] = useState({ up: 0, down: 0 });
  const playerRef = useRef<any>(null);

  const current = songs[currentIndex];

  const loadVotes = useCallback(() => {
    if (!current?.id) return;
    api.songs.getRatingCounts(current.id).then(setCounts).catch(() => {});
    if (user) {
      api.songs.getRating(current.id)
        .then((ratings) => {
          if (ratings.length > 0) {
            setRating(ratings[0].ratingValue === 1 ? 'up' : 'down');
          }
        })
        .catch(() => {});
      api.songs.getFavorites()
        .then((favorites) => {
          setFavorited(favorites.some((f: any) => f.id === current.id));
        })
        .catch(() => {});
    }
  }, [current?.id, user]);

  useEffect(() => { loadVotes(); }, [current?.id]);

  const togglePlay = useCallback(() => {
    if (songs.length === 0) return;
    setIsPlaying(!isPlaying);
  }, [songs.length, isPlaying, setIsPlaying]);

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    if (!seeking) {
      setPlayed(state.played);
      setCurrentTime(state.playedSeconds);
    }
  };

  const handleDuration = (sec: number) => setDuration(sec);

  const handleEnded = () => {
    if (!isLooping) playNext();
  };

  const handleSeekMouseDown = () => setSeeking(true);
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setPlayed(val);
    setCurrentTime(val * duration);
  };
  const handleSeekMouseUp = () => {
    setSeeking(false);
    playerRef.current?.seekTo(played);
  };

  const handleLike = async () => {
    if (!user || !current) return;
    const prev = favorited;
    setFavorited(!prev);
    try {
      await api.songs.toggleFavorite(current.id);
    } catch {
      setFavorited(prev);
    }
  };

  const handleRating = async (value: 'up' | 'down') => {
    if (!user || !current) return;
    const prev = rating;
    const newRating = prev === value ? null : value;
    setRating(newRating);
    try {
      if (newRating) {
        await api.songs.setRating(current.id, value === 'up' ? 1 : -1);
      } else {
        await api.songs.deleteRating(current.id);
      }
      api.songs.getRatingCounts(current.id).then(setCounts).catch(() => {});
    } catch {
      setRating(prev);
    }
  };

  if (songs.length === 0) return null;

  const currentYoutubeId = current?.youtubeId;
  const youtubeUrl = currentYoutubeId ? `https://www.youtube.com/watch?v=${currentYoutubeId}` : null;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getTypeLabel = () => {
    if (!current) return '';
    if (current.isOpening) return 'OP';
    if (current.isEnding) return 'ED';
    return 'OST';
  };

  const PlayIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7Z" /></svg>
  );
  const PauseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
  );

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bg-primary shadow-[0_-18px_52px_rgba(0,0,0,.35)] sm:h-[116px]"
    >
      {youtubeUrl && (
        <ReactPlayer
          ref={playerRef}
          url={youtubeUrl}
          playing={isPlaying}
          volume={muted ? 0 : volume}
          loop={isLooping}
          width={0}
          height={0}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onEnded={handleEnded}
          onError={() => setError(t('failedToLoadVideo'))}
        />
      )}

      {/* Mobile Layout */}
      <div className="flex flex-col sm:hidden">
        <div className="flex items-center gap-2 px-2 pt-2">
          <button
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center shrink-0 cursor-pointer"
            aria-label={isPlaying ? t('pause') : t('play')}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <img
            src={`https://img.youtube.com/vi/${currentYoutubeId}/default.jpg`}
            alt={current.title}
            className="w-[50px] h-[50px] object-cover rounded-[7px] shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="text-[16px] font-extrabold truncate pr-1">{current.title}</div>
            <div className="text-text-secondary text-[14px] truncate">{current.author}</div>
          </div>
          <button
            onClick={handleLike}
            className={cn('flex items-center justify-center shrink-0 cursor-pointer', favorited ? 'text-accent' : 'text-text-muted')}
          >
            <Heart size={20} fill={favorited ? 'currentColor' : 'none'} strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-col gap-1 px-2 pb-2">
          <div className="flex items-center justify-center gap-[18px] text-text-primary">
            <button onClick={() => setIsShuffling(!isShuffling)} className={cn('cursor-pointer hover:opacity-70 transition-opacity', isShuffling ? 'text-accent' : '')}>
              <Shuffle size={20} strokeWidth={1.9} />
            </button>
            <button onClick={playPrev} className="cursor-pointer hover:opacity-70 transition-opacity">
              <SkipBack size={22} strokeWidth={1.9} />
            </button>
            <button
              onClick={togglePlay}
              className="w-[44px] h-[44px] rounded-full border border-[rgba(255,87,102,.72)] grid place-items-center cursor-pointer hover:opacity-90 transition-opacity"
              style={{
                background: 'radial-gradient(circle, #ff5b66 0%, #df3548 58%, rgba(224,53,72,.22) 62%)',
              }}
            >
              {isPlaying ? (
                <span className="flex gap-[5px]">
                  <span className="w-[4px] bg-white rounded-[2px]" style={{ height: 16 }} />
                  <span className="w-[4px] bg-white rounded-[2px]" style={{ height: 16 }} />
                </span>
              ) : (
                <PlayIcon />
              )}
            </button>
            <button onClick={playNext} className="cursor-pointer hover:opacity-70 transition-opacity">
              <SkipForward size={22} strokeWidth={1.9} />
            </button>
            <button onClick={() => setIsLooping(!isLooping)} className={cn('cursor-pointer hover:opacity-70 transition-opacity', isLooping ? 'text-accent' : '')}>
              <Repeat size={20} strokeWidth={1.9} />
            </button>
            <button onClick={() => setShowQueue(!showQueue)} className="cursor-pointer hover:opacity-70 transition-opacity">
              <List size={20} strokeWidth={1.9} />
            </button>
          </div>
          <div className="flex items-center gap-2 text-text-secondary text-[12px]">
            <span className="w-8 text-right shrink-0">{formatTime(currentTime)}</span>
            <div className="relative flex-1 h-[5px] bg-bg-overlay rounded-full">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={played}
                onMouseDown={handleSeekMouseDown}
                onMouseUp={handleSeekMouseUp}
                onTouchStart={handleSeekMouseDown}
                onTouchEnd={handleSeekMouseUp}
                onChange={handleSeekChange}
                className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
              />
              <div
                className="absolute left-0 top-0 bottom-0 rounded-full"
                style={{
                  width: `${played * 100}%`,
                  background: 'linear-gradient(90deg, #ff4a5b, #ff6872)',
                }}
              />
            </div>
            <span className="w-8 shrink-0">{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex h-full items-center gap-2 px-[26px]">
        <div className="flex items-center gap-4">
          <img
            src={`https://img.youtube.com/vi/${currentYoutubeId}/default.jpg`}
            alt={current.title}
            className="w-[74px] h-[74px] object-cover rounded-[7px]"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-[11px] text-[20px] font-extrabold whitespace-nowrap truncate max-w-[180px] xl:max-w-none">
              {current.title}
              <span className="text-text-muted border border-border rounded-[7px] px-[9px] py-[2px] text-[12px] font-semibold">
                {getTypeLabel()}
              </span>
            </div>
            <div className="text-text-secondary mt-2 text-[16px]">{current.author}</div>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-center gap-[15px] flex-1">
          <div className="flex items-center gap-[34px] text-text-primary">
            <button onClick={() => setIsShuffling(!isShuffling)} className={cn('cursor-pointer hover:opacity-70 transition-opacity', isShuffling ? 'text-accent' : 'opacity-92')}>
              <Shuffle size={24} strokeWidth={1.9} />
            </button>
            <button onClick={playPrev} className="opacity-92 cursor-pointer hover:opacity-70 transition-opacity">
              <SkipBack size={24} strokeWidth={1.9} />
            </button>
            <button
              onClick={togglePlay}
              className="w-[66px] h-[66px] rounded-full border border-[rgba(255,87,102,.72)] grid place-items-center cursor-pointer hover:opacity-90 transition-opacity"
              style={{
                background: 'radial-gradient(circle, #ff5b66 0%, #df3548 58%, rgba(224,53,72,.22) 62%)',
                boxShadow: '0 0 0 9px rgba(255,70,88,.14), 0 0 40px rgba(255,70,88,.42)',
              }}
            >
              {isPlaying ? (
                <span className="flex gap-[6px]" style={{ transform: 'scale(1.12)' }}>
                  <span className="w-[5px] bg-white rounded-[2px]" style={{ height: 22 }} />
                  <span className="w-[5px] bg-white rounded-[2px]" style={{ height: 22 }} />
                </span>
              ) : (
                <span className="w-0 h-0 border-l-[18px] border-solid border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-[3px]" />
              )}
            </button>
            <button onClick={playNext} className="opacity-92 cursor-pointer hover:opacity-70 transition-opacity">
              <SkipForward size={24} strokeWidth={1.9} />
            </button>
            <button onClick={() => setIsLooping(!isLooping)} className={cn('cursor-pointer hover:opacity-70 transition-opacity', isLooping ? 'text-accent' : 'opacity-92')}>
              <Repeat size={24} strokeWidth={1.9} />
            </button>
          </div>
          <div
            className="grid grid-cols-[50px_1fr_50px] items-center gap-3"
            style={{ width: 'min(590px, 46vw)' }}
          >
            <span className="text-text-primary text-[14px] font-semibold text-right">{formatTime(currentTime)}</span>
            <div className="relative h-[6px] bg-bg-overlay rounded-full">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={played}
                onMouseDown={handleSeekMouseDown}
                onMouseUp={handleSeekMouseUp}
                onTouchStart={handleSeekMouseDown}
                onTouchEnd={handleSeekMouseUp}
                onChange={handleSeekChange}
                className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
              />
              <div
                className="absolute left-0 top-0 bottom-0 rounded-full"
                style={{
                  width: `${played * 100}%`,
                  background: 'linear-gradient(90deg, #ff4a5b, #ff6872)',
                }}
              />
              <div
                className="absolute top-1/2 w-[22px] h-[22px] rounded-full bg-accent-hover shadow-[0_0_0_7px_rgba(255,70,88,.15)]"
                style={{
                  left: `${played * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </div>
            <span className="text-text-primary text-[14px] font-semibold">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="hidden xl:flex items-center justify-end gap-[22px] text-text-primary">
          <div className="flex items-center gap-[10px] mr-[28px]">
            <button onClick={handleLike} className={cn('cursor-pointer hover:opacity-70 transition-opacity', favorited ? 'text-accent' : '')}>
              <Heart size={20} fill={favorited ? 'currentColor' : 'none'} strokeWidth={2} />
            </button>
            <button onClick={() => handleRating('up')} className={cn('flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity', rating === 'up' ? 'text-green' : '')}>
              <ThumbsUp size={20} fill={rating === 'up' ? 'currentColor' : 'none'} strokeWidth={2} />
              {counts.up}
            </button>
            <button onClick={() => handleRating('down')} className={cn('flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity', rating === 'down' ? 'text-accent' : '')}>
              <ThumbsDown size={20} fill={rating === 'down' ? 'currentColor' : 'none'} strokeWidth={2} />
              {counts.down}
            </button>
          </div>

          <button onClick={() => setMuted(!muted)} className="cursor-pointer hover:opacity-70 transition-opacity">
            <Volume2 size={24} strokeWidth={1.9} />
          </button>
          <div className="relative w-[120px] h-[5px] bg-bg-overlay rounded-full">
            <div
              className="absolute left-0 top-0 bottom-0 rounded-full bg-accent"
              style={{ width: `${(muted ? 0 : volume) * 100}%` }}
            />
            <div
              className="absolute top-1/2 w-[12px] h-[12px] rounded-full bg-accent"
              style={{
                left: `${(muted ? 0 : volume) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
          <button onClick={() => setShowQueue(!showQueue)} className="cursor-pointer hover:opacity-70 transition-opacity">
            <List size={24} strokeWidth={1.9} />
          </button>
          <Settings size={24} strokeWidth={1.9} className="cursor-pointer hover:opacity-70 transition-opacity" />
        </div>
      </div>

      {showQueue && (
        <div className="absolute bottom-full right-0 mb-2 w-72 sm:w-96 bg-bg-primary border border-border rounded-lg shadow-xl max-h-80 overflow-y-auto z-50">
          <div className="p-3 font-bold text-sm text-text-muted uppercase tracking-wider">{t('queue')}</div>
          {songs.map((s, i) => (
            <button
              key={s.id}
              onClick={() => { usePlayerStore.getState().setCurrentIndex(i); setShowQueue(false); }}
            className={cn(
              'w-full text-left px-3 py-2 flex items-center gap-3 text-sm transition-colors cursor-pointer',
              i === currentIndex ? 'bg-accent/10 text-accent' : 'text-text-primary hover:bg-bg-elevated',
            )}
            >
              <span className="text-text-muted text-xs w-5">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{s.title}</div>
                <div className="text-xs text-text-muted truncate">{s.author}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {error && <Notice title={t('playbackError')} text={error} onClose={() => setError(null)} />}
    </div>
  );
}
