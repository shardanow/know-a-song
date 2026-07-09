'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { SongItem } from './SongItem';
import { SongTimeline } from './SongTimeline';
import { SongListSkeleton } from '@/components/ui/skeletons';
import { cn } from '@/lib/utils';
import { Search, SlidersHorizontal, Music, ChevronDown } from 'lucide-react';

interface Song {
  id: number;
  title: string;
  author: string;
  season: number;
  episode: number | null;
  isOpening: boolean;
  isEnding: boolean;
  youtubeId: string | null;
  youtubeLink: string | null;
  spotifyId: string | null;
  spotifyLink: string | null;
  appleMId: string | null;
  appleMLink: string | null;
}

interface SongListProps {
  filmId: number;
  songs: Song[];
  isLoading: boolean;
}

type SongTypeFilter = 'all' | 'opening' | 'ending' | 'ost';

export function SongList({ filmId, songs, isLoading }: SongListProps) {
  const t = useTranslations();
  const tc = useTranslations('common');
  const locale = useLocale();
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<SongTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const hasSeasons = songs.some((s) => s.season > 0);
  const hasEpisodes = songs.some((s) => s.episode !== null && s.episode !== 0);
  const epLabel = t('song.episode');
  const seasonLabel = t('song.season');

  const filteredSongs = useMemo(() => {
    let result = songs;
    if (typeFilter === 'opening') result = result.filter((s) => s.isOpening);
    else if (typeFilter === 'ending') result = result.filter((s) => s.isEnding);
    else if (typeFilter === 'ost') result = result.filter((s) => !s.isOpening && !s.isEnding);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) => s.title.toLowerCase().includes(q) || s.author.toLowerCase().includes(q),
      );
    }
    return result;
  }, [songs, typeFilter, searchQuery]);

  const uniqueKeys = useMemo(() => {
    const set = new Set<string>();
    for (const song of filteredSongs) {
      if (hasEpisodes && song.episode) {
        set.add(`${song.season}-${song.episode}`);
      } else {
        set.add(`${song.season}-0`);
      }
    }
    return Array.from(set).sort();
  }, [filteredSongs, hasEpisodes]);

  const { data: episodeMeta } = useQuery<Record<string, { name: string; stillPath: string | null; runtime?: number }>>({
    queryKey: ['episodeMeta', filmId, uniqueKeys],
    queryFn: async () => {
      const meta: Record<string, { name: string; stillPath: string | null; runtime?: number }> = {};
      for (const key of uniqueKeys) {
        const [seasonStr, episodeStr] = key.split('-');
        const season = Number(seasonStr);
        const episode = Number(episodeStr);
        if (episode > 0) {
          try {
            const epData = await apiClient.getTVEpisodeData(filmId, season, episode, locale);
            meta[key] = {
              name: epData?.name ? `${epLabel} ${episode}: ${epData.name}` : `${epLabel} ${episode}`,
              stillPath: epData?.still_path ? `https://image.tmdb.org/t/p/w300${epData.still_path}` : null,
              runtime: epData?.runtime,
            };
          } catch {
            meta[key] = { name: `${epLabel} ${episode}`, stillPath: null, runtime: undefined };
          }
        } else {
          meta[key] = { name: `${seasonLabel} ${season}`, stillPath: null };
        }
      }
      return meta;
    },
    enabled: uniqueKeys.length > 0 && !!filmId && hasEpisodes,
  });

  const grouped = useMemo(() => {
    const groups: Record<string, Song[]> = {};
    for (const song of filteredSongs) {
      const key = hasEpisodes && song.episode ? `${song.season}-${song.episode}` : `${song.season}-0`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(song);
    }
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => {
        if (a.isOpening && !b.isOpening) return -1;
        if (!a.isOpening && b.isOpening) return 1;
        if (a.isEnding && !b.isEnding) return 1;
        if (!a.isEnding && b.isEnding) return -1;
        return 0;
      });
    }
    return groups;
  }, [filteredSongs, hasEpisodes]);

  const seasonKeys = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const key of Object.keys(grouped)) {
      const season = key.split('-')[0];
      if (!map[season]) map[season] = [];
      map[season].push(key);
    }
    return Object.entries(map).sort(([a], [b]) => Number(a) - Number(b));
  }, [grouped]);

  const toggleKey = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (isLoading) return <SongListSkeleton />;
  if (songs.length === 0) return <div className="p-6 text-text-secondary">{t('song.noSongs')}</div>;

  const renderSongItem = (song: Song) => {
    const globalIndex = filteredSongs.indexOf(song);
    return (
      <SongItem
        key={song.id}
        song={song}
        allSongs={filteredSongs}
        index={globalIndex}
      />
    );
  };

  const typeChips: { key: SongTypeFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'opening', label: 'Opening' },
    { key: 'ending', label: 'Ending' },
    { key: 'ost', label: 'OST' },
  ];

  return (
    <div className="px-4 sm:px-8 py-[18px] pb-6">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {seasonKeys.map(([season]) => (
          <button
            key={season}
            className="h-[40px] px-3 rounded-[9px] border border-border bg-bg-elevated text-text-secondary flex items-center gap-2 font-semibold text-[14px] whitespace-nowrap cursor-pointer hover:bg-bg-overlay transition-colors"
          >
            {seasonLabel} {season}
          </button>
        ))}
        <div className="flex-1" />
        <SlidersHorizontal size={16} className="text-text-muted shrink-0" />
        {typeChips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setTypeFilter(chip.key)}
            className={cn(
              'h-[40px] px-3 rounded-[9px] border flex items-center gap-2 font-semibold text-[14px] whitespace-nowrap transition-colors cursor-pointer',
              typeFilter === chip.key
                ? 'text-accent-2 border-accent/60 bg-accent/15'
                : 'border-border bg-bg-elevated text-text-secondary hover:bg-bg-overlay',
            )}
          >
            {chip.label}
          </button>
        ))}
        <div className="flex items-center gap-2 h-[40px] rounded-[9px] border border-border bg-bg-elevated text-text-secondary px-3 w-[120px] sm:w-[155px]">
          <input
            type="text"
            placeholder={tc('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-0 outline-0 text-[14px] text-text-secondary placeholder:text-text-muted w-full"
          />
          <Search size={18} className="ml-auto shrink-0" />
        </div>
      </div>

      <div className="flex flex-col gap-[9px]">
        {!hasSeasons ? (
          <div className="flex flex-col gap-[9px]">
            <div className="rounded-[10px] border border-border overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,.14)]" style={{ background: 'linear-gradient(to bottom, var(--bg-elevated), var(--bg-surface))' }}>
              <div className="flex flex-col">
                {filteredSongs.map(renderSongItem)}
              </div>
            </div>
          </div>
        ) : (
          seasonKeys.map(([season, keys]) => (
            <div key={season}>
              <div className="flex flex-col gap-[9px]">
                {keys.map((key) => {
                  const episodeSongs = grouped[key];
                  const meta = episodeMeta?.[key];
                  const isExpanded = expandedKeys.has(key);
                  return (
                    <article
                      key={key}
                      className="rounded-[10px] border border-border overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,.14)]"
                      style={{ background: 'linear-gradient(to bottom, var(--bg-elevated), var(--bg-surface))' }}
                    >
                      <button
                        onClick={() => toggleKey(key)}
                        className="w-full text-left grid grid-cols-[100px_minmax(0,1fr)_28px] sm:grid-cols-[134px_minmax(0,1fr)_36px] items-center gap-2 sm:gap-[14px] p-[10px_10px_10px_8px] sm:p-[10px_14px_10px_12px] min-h-[80px] sm:min-h-[92px] cursor-pointer hover:bg-bg-overlay transition-colors"
                      >
                        {meta?.stillPath && (
                          <img
                            src={meta.stillPath}
                            alt={meta.name}
                            className="w-[100px] h-[60px] sm:w-[134px] sm:h-[76px] object-cover rounded-[7px] shadow-[0_8px_28px_rgba(0,0,0,.35)]"
                          />
                        )}
                        {!meta?.stillPath && (
                          <div className="w-[100px] h-[60px] sm:w-[134px] sm:h-[76px] rounded-[7px] bg-bg-overlay" />
                        )}
                        <div className="min-w-0">
                          <div className="text-text-muted text-[14px] mb-[3px]">
                            {hasEpisodes ? `${epLabel} ${key.split('-')[1]}` : `${seasonLabel} ${key.split('-')[0]}`}
                          </div>
                          <div className="text-[17px] font-extrabold truncate">
                            {meta?.name?.split(': ').slice(1).join(': ') || `${seasonLabel} ${key.split('-')[0]}`}
                          </div>
                          <div className="text-text-muted text-[14px] mt-[4px] flex items-center gap-1">
                            <Music size={14} />
                            {episodeSongs.length} {t('film.songs', { count: episodeSongs.length })}
                          </div>
                        </div>
                        <ChevronDown size={22} className={cn('text-text-primary transition-transform duration-300', isExpanded ? 'rotate-180' : '')} />
                      </button>
                      <div
                        className={cn(
                          'transition-all duration-300 ease-in-out overflow-hidden',
                          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0',
                        )}
                      >
                        <div className="border-t border-border-soft">
                          <SongTimeline songs={episodeSongs} durationMinutes={meta?.runtime} />
                          <div className="flex flex-col">
                            {episodeSongs.map(renderSongItem)}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {modalImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8 cursor-pointer"
          onClick={() => setModalImage(null)}
        >
          <img src={modalImage} alt={t('song.episodeStill')} className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </div>
  );
}
