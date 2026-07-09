'use client';

import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LeftMenu } from '@/components/layout/LeftMenu';

const UserInfoSmall = dynamic(
  () => import('@/components/user/UserInfoSmall').then((m) => ({ default: m.UserInfoSmall })),
  { ssr: false },
);

export function MobileNav() {
  const t = useTranslations('common');
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden p-2 text-text-secondary hover:text-text-primary" aria-label={t('openMenu')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-72 p-0 bg-bg-surface">
        <SheetHeader className="px-4 pt-4">
          <SheetTitle className="text-text-primary">{t('menu')}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-2">
          <LeftMenu />
          <UserInfoSmall />
        </div>
      </SheetContent>
    </Sheet>
  );
}
