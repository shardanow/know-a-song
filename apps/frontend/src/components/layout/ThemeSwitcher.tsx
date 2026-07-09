'use client';

import { useTheme } from '@/components/ThemeProvider';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';

export function ThemeSwitcher() {
  const { theme, toggle } = useTheme();
  const t = useTranslations('common');

  return (
    <div className="flex items-center justify-between text-[13px] text-text-muted">
      <Moon size={18} strokeWidth={1.9} className="inline-block mr-1.5" />
      <span className="text-text-muted">{theme === 'dark' ? t('darkTheme') : t('lightTheme')}</span>
      <button
        onClick={toggle}
        className="relative w-[42px] h-[22px] rounded-full bg-[#664bdb] transition-colors cursor-pointer"
        aria-label={theme === 'dark' ? t('lightTheme') : t('darkTheme')}
      >
        <span
          className={cn(
            'absolute top-[3px] w-[16px] h-[16px] rounded-full bg-white transition-all',
            theme === 'dark' ? 'right-[3px]' : 'left-[3px]',
          )}
        />
      </button>
    </div>
  );
}
