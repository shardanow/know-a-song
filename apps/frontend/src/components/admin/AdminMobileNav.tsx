'use client';

import { useTranslations } from 'next-intl';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/layout/Logo';
import { Link } from '@/lib/navigation';
import { Menu } from 'lucide-react';

const navLinks = [
  { href: '/admin/users', labelKey: 'users' },
  { href: '/admin/roles', labelKey: 'roles' },
  { href: '/admin/films', labelKey: 'films' },
  { href: '/admin/songs', labelKey: 'songs' },
  { href: '/admin/artists', labelKey: 'artists' },
];

export function AdminMobileNav() {
  const t = useTranslations('admin');
  const tc = useTranslations('common');

  return (
    <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-bg-surface">
      <Sheet>
        <SheetTrigger className="p-2 text-text-secondary hover:text-text-primary" aria-label={tc('openMenu')}>
          <Menu size={22} />
        </SheetTrigger>
        <SheetContent side="left" className="w-[85vw] max-w-72 p-0 bg-bg-surface">
          <SheetHeader className="px-4 pt-4 pb-2 border-b border-border">
            <SheetTitle className="text-left">
              <Logo />
            </SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50 transition-colors"
              >
                {t(link.labelKey as any)}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-border">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50 transition-colors"
              >
                {t('backToSite')}
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <span className="text-sm font-bold">{t('title')}</span>
      <div className="w-[22px]" />
    </div>
  );
}
