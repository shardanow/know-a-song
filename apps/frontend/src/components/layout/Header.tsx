'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { MobileNav } from '@/components/layout/MobileNav';
import { SearchBar } from '@/components/search/SearchBar';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { useTheme } from '@/components/ThemeProvider';
import { Moon, Sun } from 'lucide-react';

const UserInfoCompact = dynamic(
  () => import('@/components/user/UserInfoCompact').then((m) => ({ default: m.UserInfoCompact })),
  { ssr: false },
);

export function Header() {
  const { theme, toggle } = useTheme();
  const tc = useTranslations('common');

  return (
    <header className="sticky top-0 z-10 h-16 flex items-center gap-3 px-4 border-b border-[rgba(148,163,184,.13)] bg-[rgba(7,12,20,.74)] backdrop-blur-[18px]">
      <MobileNav />
      <Breadcrumbs />
      <div className="flex-1 min-w-[12px]" />
      <SearchBar />
      <div className="hidden lg:flex items-center gap-2 shrink-0">
        <button
          onClick={toggle}
          className="w-[34px] h-[34px] grid place-items-center rounded-[8px] text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          aria-label={theme === 'dark' ? tc('switchToLightMode') : tc('switchToDarkMode')}
        >
          {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <LocaleSwitcher />
      </div>
      <UserInfoCompact />
    </header>
  );
}
