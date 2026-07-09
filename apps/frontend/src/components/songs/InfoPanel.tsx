'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { usePlayerStore } from '@/stores/player-store';
import { useInfoStore } from '@/stores/info-store';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { X } from 'lucide-react';

function InfoContent({ songData, similar, onPlaySimilar }: {
  songData: any;
  similar: any[];
  onPlaySimilar: (s: any, all: any[]) => void;
}) {
  const t = useTranslations('common');
  return (
    <>
      <div className="rounded-[10px] overflow-hidden h-[200px] sm:h-[258px] relative border border-border shadow-[0_20px_45px_rgba(0,0,0,.34)]">
        <img
          src={`https://img.youtube.com/vi/${songData.youtubeId || ''}/hqdefault.jpg`}
          alt={songData.title}
          className="w-full h-full object-cover block"
        />
        <div
          className="absolute left-0 right-0 bottom-0 h-[48%]"
          style={{ background: 'linear-gradient(180deg, transparent, color-mix(in srgb, var(--bg-primary) 78%, transparent))' }}
        />
        <div className="absolute left-4 right-4 bottom-4 z-[2]">
          <h2 className="m-0 text-[22px] sm:text-[25px] leading-[1.08] tracking-[-0.04em] font-bold">{songData.title}</h2>
          <p className="mt-[7px] text-text-primary text-[15px]">{songData.author}</p>
        </div>
      </div>

      <div className="py-[22px] border-t border-border">
        <h3 className="m-0 mb-3 text-[17px] font-bold">{t('wherePlays')}</h3>
        <div className="flex justify-between items-center text-text-primary text-[15px]">
          <span>
            {songData.season > 0 ? `${t('season')} ${songData.season}` : ''}
            {songData.episode ? ` • ${t('episode')} ${songData.episode}` : ''}
          </span>
          <span className="text-text-muted bg-bg-overlay border border-border px-[11px] py-[6px] rounded-full font-bold">
            {songData.startTime != null ? formatTime(songData.startTime) : '--:--'}
          </span>
        </div>
      </div>

      <div className="py-[22px] border-t border-border">
        <h3 className="m-0 mb-3 text-[17px] font-bold">{t('infoType')}</h3>
        <span className="inline-flex text-text-muted border border-border rounded-[7px] px-[10px] py-[6px] text-[13px] font-semibold">
          {songData.isOpening ? t('opening') : songData.isEnding ? t('ending') : 'OST'}
        </span>
      </div>

      <div className="py-[22px] border-t border-border">
        <h3 className="m-0 mb-3 text-[17px] font-bold">{t('links')}</h3>
        <div className="flex gap-[10px] flex-wrap">
          {songData.youtubeLink && (
            <a href={songData.youtubeLink} target="_blank" rel="noopener noreferrer" className="h-[47px] px-3 border border-border bg-bg-overlay rounded-[8px] text-text-primary flex items-center gap-2 text-[13px] font-bold hover:bg-bg-elevated hover:scale-[1.02] transition-all duration-200 cursor-pointer">
              <span className="w-5 h-5 rounded-[5px] grid place-items-center text-[11px] font-black bg-[#ff1d2d]">▶</span>
              YouTube
            </a>
          )}
          {songData.spotifyLink && (
            <a href={songData.spotifyLink} target="_blank" rel="noopener noreferrer" className="h-[47px] px-3 border border-border bg-bg-overlay rounded-[8px] text-text-primary flex items-center gap-2 text-[13px] font-bold hover:bg-bg-elevated hover:scale-[1.02] transition-all duration-200 cursor-pointer">
              <span className="w-5 h-5 rounded-[5px] grid place-items-center text-[11px] font-black bg-[#19d86f] text-[#05140b]">●</span>
              Spotify
            </a>
          )}
          {songData.appleMLink && (
            <a href={songData.appleMLink} target="_blank" rel="noopener noreferrer" className="h-[47px] px-3 border border-border bg-bg-overlay rounded-[8px] text-text-primary flex items-center gap-2 text-[13px] font-bold hover:bg-bg-elevated hover:scale-[1.02] transition-all duration-200 cursor-pointer">
              <span className="w-5 h-5 rounded-[5px] grid place-items-center text-[11px] font-black bg-white text-[#e73a60]">♫</span>
              Apple Music
            </a>
          )}
        </div>
      </div>

      {similar && similar.length > 0 && (
        <div className="py-[22px] border-t border-border">
          <div className="flex justify-between items-center mb-[15px]">
            <h3 className="m-0 text-[17px] font-bold">{t('similarSongs')}</h3>
            <span className="text-accent text-[14px] font-extrabold cursor-pointer hover:opacity-80">{t('seeAll')}</span>
          </div>
          <div className="flex flex-col gap-[13px]">
            {similar.slice(0, 5).map((s: any) => (
              <button
                key={s.id}
                onClick={() => onPlaySimilar(s, similar)}
                className="grid grid-cols-[52px_minmax(0,1fr)_22px] gap-3 items-center text-left w-full cursor-pointer hover:opacity-80 transition-opacity"
              >
                <img
                  src={`https://img.youtube.com/vi/${s.youtubeId || ''}/default.jpg`}
                  alt={s.title}
                  className="w-[52px] h-[52px] object-cover rounded-[5px]"
                />
                <div className="min-w-0">
                  <div className="font-extrabold truncate text-[15px]">{s.title}</div>
                  <div className="text-text-muted text-[13px] mt-[4px]">{s.author}</div>
                </div>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7Z"/></svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export function InfoPanel() {
  const t = useTranslations('common');
  const { currentSongId, isOpen, close } = useInfoStore();
  const { songs, setSongs, setCurrentIndex, setIsPlaying } = usePlayerStore();
  const [hasSongs, setHasSongs] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setHasSongs(usePlayerStore.getState().songs.length > 0);
    const unsub = usePlayerStore.subscribe((state) => {
      setHasSongs(state.songs.length > 0);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1279px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const { data: song } = useQuery({
    queryKey: ['song', currentSongId],
    queryFn: () => api.songs.byId(currentSongId!),
    enabled: !!currentSongId,
  });

  const { data: similar } = useQuery({
    queryKey: ['similar', currentSongId],
    queryFn: () => api.songs.similar(currentSongId!),
    enabled: !!currentSongId,
  });

  const songData = Array.isArray(song) ? song[0] : song;

  const handlePlaySimilar = (s: any, all: any[]) => {
    setSongs(all as any);
    setCurrentIndex(all.indexOf(s));
    setIsPlaying(true);
  };

  return (
    <>
      {/* Mobile: Sheet */}
      {isMobile && (
        <Sheet open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
          <SheetContent side="right" className="w-[85vw] max-w-[425px] p-0 bg-bg-surface" showCloseButton={false}>
            <SheetHeader className="px-4 pt-4 pb-2 border-b border-border">
              <div className="flex items-center justify-between">
                <SheetTitle className="flex items-center gap-2 text-text-primary text-lg">
                  <span className="w-[24px] h-[24px] border-2 border-text-muted rounded-full grid place-items-center text-[15px]">i</span>
                  {t('info')}
                </SheetTitle>
                <button onClick={close} className="text-text-primary hover:opacity-70 transition-opacity cursor-pointer">
                  <X size={24} />
                </button>
              </div>
            </SheetHeader>
            <div className="overflow-y-auto flex-1 px-4 py-2">
              {songData && (
                <InfoContent songData={songData} similar={similar || []} onPlaySimilar={handlePlaySimilar} />
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop: inline sidebar */}
      <aside
        className={cn(
          'hidden xl:flex xl:flex-col xl:flex-shrink-0 xl:sticky xl:top-0 xl:border-l xl:border-border xl:z-40 xl:transition-all xl:duration-300 xl:ease-in-out',
          isOpen
            ? 'xl:w-[425px] xl:opacity-100'
            : 'xl:w-0 xl:opacity-0 xl:overflow-hidden',
          hasSongs ? 'xl:h-[calc(100vh-116px)]' : 'xl:h-screen',
        )}
        style={{
          background: 'linear-gradient(180deg, color-mix(in srgb, var(--bg-primary) 94%, transparent), color-mix(in srgb, var(--bg-primary) 97%, transparent))',
        }}
      >
        <div className="h-[70px] flex items-center gap-[14px] px-[22px] text-[23px] font-bold shrink-0">
          <button onClick={close} className="text-text-primary opacity-95 mr-[10px] hover:opacity-70 transition-opacity cursor-pointer">
            <X size={31} />
          </button>
          <span className="w-[24px] h-[24px] border-2 border-text-muted rounded-full grid place-items-center text-[15px]">i</span>
          <span>{t('info')}</span>
        </div>
        <div className="px-[22px] pt-3 overflow-y-auto flex-1">
          {isOpen && songData && (
            <InfoContent songData={songData} similar={similar || []} onPlaySimilar={handlePlaySimilar} />
          )}
        </div>
      </aside>
    </>
  );
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
