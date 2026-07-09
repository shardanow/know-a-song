'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { Link, usePathname } from '@/lib/navigation';
import { LeftMenu } from '@/components/layout/LeftMenu';
import { usePlayerStore } from '@/stores/player-store';
import { useTheme } from '@/components/ThemeProvider';
import { useLocale } from 'next-intl';
import { Home, LayoutGrid, Users, Music, Heart, Star, Shield, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import { useRouter } from '@/lib/navigation';
import { locales } from '@/i18n/config';
import { useSetLocale } from '@/lib/locale-context';

function CollapsedMiniIcon({ href, icon: Icon, isActive }: { href: string; icon: any; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'w-9 h-9 flex items-center justify-center rounded-lg transition-colors',
        isActive
          ? 'text-accent-2 bg-bg-overlay'
          : 'text-text-secondary hover:bg-bg-overlay',
      )}
    >
      <Icon size={20} strokeWidth={1.9} />
    </Link>
  );
}

export function LeftBar() {
  const [collapsed, setCollapsed] = useState(false);
  const [hasSongs, setHasSongs] = useState(false);
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const currentLocale = useLocale();
  const setLocale = useSetLocale();
  const router = useRouter();

  useEffect(() => {
    setHasSongs(usePlayerStore.getState().songs.length > 0);
    const unsub = usePlayerStore.subscribe((state) => {
      setHasSongs(state.songs.length > 0);
    });
    return unsub;
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const switchLocale = (locale: string) => {
    localStorage.setItem('locale', locale);
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;SameSite=Lax`;
    setLocale(locale as any);
    router.push(pathname, { locale });
  };

  const miniIcons = [
    { href: '/', icon: Home },
    { href: '/films', icon: LayoutGrid },
    { href: '/artists', icon: Users },
    { href: '/songs', icon: Music },
  ];

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-shrink-0 sticky top-0 border-r border-border transition-[width] duration-300 flex-col z-40',
        collapsed ? 'w-[50px]' : 'w-[278px]',
        hasSongs ? 'h-[calc(100vh-116px)]' : 'h-screen',
      )}
      style={{
        background: 'linear-gradient(180deg, color-mix(in srgb, var(--bg-primary) 94%, transparent), color-mix(in srgb, var(--bg-primary) 96%, transparent))',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
    >
      <div className={cn('flex flex-col flex-1', collapsed ? '' : 'overflow-y-auto min-h-0')}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-1 py-3 px-1">
            <button
              onClick={() => setCollapsed(false)}
              className="mb-1 p-1 text-text-secondary hover:text-text-primary rounded-md transition-colors self-end"
              aria-label="Expand sidebar"
            >
              <ChevronRight size={14} />
            </button>
            <span className="w-[24px] h-[24px] rounded-full bg-gradient-to-br from-[#ff5160] to-[#ff2037] grid place-items-center shrink-0">
              <span className="w-0 h-0 border-l-[6px] border-solid border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-[1px]" />
            </span>

            <div className="flex flex-col items-center gap-2 mt-3">
              {miniIcons.map(({ href, icon }) => (
                <CollapsedMiniIcon key={href} href={href} icon={icon} isActive={isActive(href)} />
              ))}
            </div>

            <div className="flex flex-col items-center gap-2 pt-3 border-t border-border w-full mt-2">
              <CollapsedMiniIcon href="/favorites" icon={Heart} isActive={isActive('/favorites')} />
              <CollapsedMiniIcon href="/suggestions" icon={Star} isActive={isActive('/suggestions')} />
              <CollapsedMiniIcon href="/admin" icon={Shield} isActive={isActive('/admin')} />
            </div>

            <div className="mt-auto flex flex-col items-center gap-2 pt-3 border-t border-border w-full">
              <button
                onClick={toggle}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:bg-bg-overlay transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
              <button
                onClick={() => switchLocale(currentLocale === 'en' ? 'ru' : 'en')}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-[11px] font-bold text-text-secondary hover:bg-bg-overlay transition-colors"
              >
                {currentLocale === 'en' ? 'RU' : 'EN'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto min-h-0 px-[22px] py-[18px]">
              <div className="flex justify-end mb-1">
                <button
                  onClick={() => setCollapsed(true)}
                  className="p-1 text-text-secondary hover:text-text-primary rounded-md transition-colors"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft size={14} />
                </button>
              </div>
              <LeftMenu />
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
