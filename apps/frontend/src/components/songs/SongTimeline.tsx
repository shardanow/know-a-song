'use client';

import { useMemo } from 'react';
import { usePlayerStore } from '@/stores/player-store';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function SongTimeline({
  songs,
  durationMinutes,
}: {
  songs: any[];
  durationMinutes?: number;
}) {
  const setSongs = usePlayerStore((s) => s.setSongs);
  const setCurrentIndex = usePlayerStore((s) => s.setCurrentIndex);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);

  const timedSongs = useMemo(
    () => songs.filter((s: any) => s.startTime != null),
    [songs],
  );

  if (timedSongs.length === 0) return null;

  const maxSeconds = durationMinutes ? durationMinutes * 60 : 0;

  return (
    <div className="px-2 sm:px-6 py-4">
      <div className="relative w-full h-8">
        <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-bg-overlay" />
        {timedSongs.map((s: any) => {
          const pct = maxSeconds > 0 ? (s.startTime / maxSeconds) * 100 : 0;
          return (
            <button
              key={s.id}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group cursor-pointer"
              style={{ left: `${maxSeconds > 0 ? Math.min(pct, 100) : 0}%` }}
              onClick={() => {
                setSongs(songs);
                setCurrentIndex(
                  songs.findIndex((x: any) => x.id === s.id),
                );
                setIsPlaying(true);
              }}
              title={`${s.title} — ${s.author} (${formatTime(s.startTime)})`}
            >
              <span className="block w-3 h-3 rounded-full bg-accent ring-2 ring-bg-primary transition-transform group-hover:scale-150" />
              <span className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {s.title} — {formatTime(s.startTime)}
              </span>
            </button>
          );
        })}
      </div>
      {durationMinutes && (
        <div className="flex justify-between mt-1 text-[10px] text-text-secondary">
          <span>0:00</span>
          <span>{formatDuration(durationMinutes)}</span>
        </div>
      )}
    </div>
  );
}
