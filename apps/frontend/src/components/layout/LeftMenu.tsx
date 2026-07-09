'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { Logo } from './Logo';
import { Home, LayoutGrid, Users, Music, Heart, Star, Shield } from 'lucide-react';

export function LeftMenu() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const mainNavItems = [
    { href: '/', label: t('home'), icon: Home },
    { href: '/films', label: t('films'), icon: LayoutGrid },
    { href: '/artists', label: t('artists'), icon: Users },
    { href: '/songs', label: t('songs'), icon: Music },
  ];

  const secondaryNavItems = [
    { href: '/favorites', label: t('favorites'), icon: Heart },
    { href: '/suggestions', label: t('suggestions'), icon: Star },
  ];

  const adminNavItems = [
    { href: '/admin', label: t('admin'), icon: Shield },
  ];

  const renderNavItem = (item: { href: string; label: string; icon: React.ElementType }) => {
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] transition-colors duration-150',
          isActive(item.href)
            ? 'bg-bg-overlay/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] text-accent-2 font-bold'
            : 'text-text-primary hover:bg-bg-overlay',
        )}
      >
        <Icon size={22} strokeWidth={1.9} className={cn(isActive(item.href) ? 'text-accent-2' : 'text-text-secondary', 'shrink-0')} />
        {item.label}
      </Link>
    );
  };

  return (
    <nav className="flex flex-col gap-6">
      <Logo />
      <div className="flex flex-col gap-1.5">
        {mainNavItems.map(renderNavItem)}
      </div>
      <div>
        <div className="h-px bg-border my-3" />
        <div className="flex flex-col gap-1.5 mt-3">
          {renderNavItem(secondaryNavItems[1])}
          {mounted && token && renderNavItem(secondaryNavItems[0])}
        </div>
      </div>
      {mounted && token && (
        <div>
          <div className="h-px bg-border my-3" />
          <div className="text-text-muted opacity-80 text-[13px] uppercase mx-3 mb-1.5">{t('admin')}</div>
          <div className="flex flex-col gap-1.5">
            {adminNavItems.map(renderNavItem)}
          </div>
        </div>
      )}
    </nav>
  );
}
