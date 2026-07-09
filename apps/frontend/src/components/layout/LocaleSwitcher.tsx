'use client';

import { useLocale } from 'next-intl';
import { locales } from '@/i18n/config';
import { useRouter, usePathname } from '@/lib/navigation';
import { useSetLocale } from '@/lib/locale-context';
import { cn } from '@/lib/utils';

export function LocaleSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const setLocale = useSetLocale();

  const switchLocale = (locale: string) => {
    localStorage.setItem('locale', locale);
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;SameSite=Lax`;
    setLocale(locale as any);
    router.push(pathname, { locale });
  };

  return (
    <div className="flex items-center gap-1.5">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          className={cn(
            'px-2 py-1 rounded-[7px] text-[13px] font-bold border transition-colors',
            currentLocale === locale
              ? 'bg-accent text-white border-transparent'
              : 'bg-bg-overlay text-text-secondary border-border hover:bg-bg-overlay',
          )}
        >
          {locale === 'en' ? 'EN' : 'RU'}
        </button>
      ))}
    </div>
  );
}
