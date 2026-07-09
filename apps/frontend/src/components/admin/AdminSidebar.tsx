'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { Logo } from '@/components/layout/Logo';
import { ThemeSwitcher } from '@/components/layout/ThemeSwitcher';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { UserInfoSmallWrapper } from '@/components/user/UserInfoSmallWrapper';

const navLinks = [
  { href: '/admin/users', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z', key: 'users' },
  { href: '/admin/roles', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', key: 'roles' },
  { href: '/admin/films', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z', key: 'films' },
  { href: '/admin/songs', icon: 'M9 18V5l12-2v13M9 18a3 3 0 01-6 0m6 0a3 3 0 006 0m0 0V3', key: 'songs' },
  { href: '/admin/artists', icon: 'M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75', key: 'artists' },
  { href: '/admin/hero-banner', icon: 'M8 5.25v13.5L18.5 12 8 5.25Z', key: 'heroBanner' },
];

export function AdminSidebar() {
  const t = useTranslations('admin');

  return (
    <nav className="hidden lg:flex w-64 bg-bg-surface border-r border-border flex-col min-h-screen shrink-0">
      <div className="p-4 border-b border-border">
        <Logo />
      </div>

      <div className="flex-1 p-4 space-y-1">
        <h2 className="text-lg font-bold mb-3">{t('title')}</h2>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={link.icon} />
            </svg>
            {t(link.key as any)}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-border space-y-2">
        <div className="flex items-center justify-between">
          <ThemeSwitcher />
          <LocaleSwitcher />
        </div>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {t('backToSite')}
        </Link>
        <UserInfoSmallWrapper />
      </div>
    </nav>
  );
}
