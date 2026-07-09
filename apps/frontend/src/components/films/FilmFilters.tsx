'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Heart, Flame, Clock, Film, Tv, Shapes } from 'lucide-react';

export type ViewFilter = 'all' | 'favorites' | 'popular' | 'recent';
export type TypeFilter = 'all' | 'movies' | 'tv' | 'anime';

interface FilmFiltersProps {
  viewFilter: ViewFilter;
  typeFilter: TypeFilter;
  onViewChange: (v: ViewFilter) => void;
  onTypeChange: (t: TypeFilter) => void;
  isAuthenticated: boolean;
}

const viewChips: { key: ViewFilter; labelKey: string; icon?: React.ElementType }[] = [
  { key: 'all', labelKey: 'allTypes' },
  { key: 'favorites', labelKey: 'favorites', icon: Heart },
  { key: 'popular', labelKey: 'popular', icon: Flame },
  { key: 'recent', labelKey: 'recentlyAdded', icon: Clock },
];

const typeChips: { key: TypeFilter; labelKey: string; icon?: React.ElementType }[] = [
  { key: 'all', labelKey: 'allTypes' },
  { key: 'movies', labelKey: 'movies', icon: Film },
  { key: 'tv', labelKey: 'tv', icon: Tv },
  { key: 'anime', labelKey: 'anime', icon: Shapes },
];

export function FilmFilters({ viewFilter, typeFilter, onViewChange, onTypeChange, isAuthenticated }: FilmFiltersProps) {
  const t = useTranslations('films');

  return (
    <div className="flex items-center flex-wrap gap-[10px] mt-[22px] mb-[18px]">
      {viewChips.map((chip) => {
        const disabled = chip.key === 'favorites' && !isAuthenticated;
        const isActive = viewFilter === chip.key;
        const Icon = chip.icon;

        return (
          <button
            key={chip.key}
            onClick={() => { if (!disabled) onViewChange(chip.key); }}
            disabled={disabled}
            className={cn(
              'inline-flex items-center gap-[6px] h-[40px] px-4 rounded-[13px] text-[14px] transition-[.18s_ease] border shadow-[inset_0_1px_0_rgba(255,255,255,.03)]',
              isActive
                ? 'text-white bg-gradient-to-r from-[#ff4868] to-[#ff244d] border-transparent shadow-[0_12px_26px_rgba(255,59,95,.25)] font-extrabold'
                : 'text-[#d7e0ee] bg-[rgba(10,16,26,.7)] border-[rgba(148,163,184,.13)] hover:border-[rgba(148,163,184,.26)] hover:-translate-y-px',
              disabled && 'opacity-50',
            )}
          >
            {Icon && <Icon size={16} />}
            {t(chip.labelKey as any)}
          </button>
        );
      })}

      <span className="w-px h-[30px] bg-[rgba(148,163,184,.22)] mx-2 shrink-0" />

      {typeChips.map((chip) => {
        const isActive = typeFilter === chip.key;
        const Icon = chip.icon;

        return (
          <button
            key={chip.key}
            onClick={() => onTypeChange(chip.key)}
            className={cn(
              'inline-flex items-center gap-[6px] h-[40px] px-4 rounded-[13px] text-[14px] transition-[.18s_ease] border shadow-[inset_0_1px_0_rgba(255,255,255,.03)]',
              isActive
                ? 'text-[#ff6f88] bg-[rgba(255,59,95,.14)] border-[rgba(255,59,95,.24)] font-bold'
                : 'text-[#d7e0ee] bg-[rgba(10,16,26,.7)] border-[rgba(148,163,184,.13)] hover:border-[rgba(148,163,184,.26)] hover:-translate-y-px',
            )}
          >
            {Icon && <Icon size={16} />}
            {t(chip.labelKey as any)}
          </button>
        );
      })}
    </div>
  );
}
