'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { usePathname } from '@/lib/navigation';
import { Link } from '@/lib/navigation';
import { apiClient } from '@/lib/api-client';

const labelKeys: Record<string, string> = {
  films: 'films',
  songs: 'songs',
  artists: 'artists',
  favorites: 'favorites',
  suggestions: 'suggestions',
  settings: 'settings',
  admin: 'admin',
};

export function Breadcrumbs() {
  const tc = useTranslations('common');
  const t = useTranslations('films');
  const ta = useTranslations('admin');
  const tau = useTranslations('adminUsers');
  const tar = useTranslations('adminRoles');
  const locale = useLocale();
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const cleanSegments = segments.filter((s) => s !== 'ru' && s !== 'en');

  const isHome = pathname === '/' || pathname === `/${locale}` || pathname === `/${locale}/` || cleanSegments.length === 0;

  const filmIdx = cleanSegments.indexOf('films');
  const isFilmDetail = filmIdx >= 0 && cleanSegments.length >= filmIdx + 3;

  const filmType = isFilmDetail ? (cleanSegments[filmIdx + 1] as 'movie' | 'tv') : undefined;
  const filmId = isFilmDetail ? Number(cleanSegments[filmIdx + 2]) : undefined;

  const { data: filmInfo } = useQuery({
    queryKey: ['filmInfo', filmId, filmType, locale],
    queryFn: () => (filmId && filmType ? apiClient.getFilmInfo(filmId, filmType, locale) : null),
    enabled: isFilmDetail && !!filmId && !!filmType,
    staleTime: 60000,
  });

  if (isHome || cleanSegments.length === 0) return null;

  const crumbs: { href: string; label: string; isLast: boolean }[] = [];

  if (isFilmDetail) {
    const segmentsArr = segments;
    const filmSegIdx = segmentsArr.indexOf('films');
    const filmHref = '/' + segmentsArr.slice(0, filmSegIdx + 1).join('/');
    crumbs.push({ href: filmHref, label: tc('films'), isLast: false });

    const lastHref = '/' + segmentsArr.slice(0).join('/');
    crumbs.push({
      href: lastHref,
      label: filmInfo?.title || filmInfo?.name || t('title'),
      isLast: true,
    });
  } else {
    for (let i = 0; i < cleanSegments.length; i++) {
      const segment = cleanSegments[i];
      const href = '/' + segments.slice(0, segments.indexOf(segment) + 1).join('/');
      let label: string;
      if (segment === 'login' || segment === 'register') {
        label = tc(segment as 'login' | 'register');
      } else if (segment === 'hero-banner') {
        label = ta('heroBanner');
      } else if (segment === 'users') {
        label = tau('title');
      } else if (segment === 'roles') {
        label = tar('title');
      } else if (labelKeys[segment]) {
        label = tc(labelKeys[segment] as any);
      } else {
        label = decodeURIComponent(segment.charAt(0).toUpperCase() + segment.slice(1));
      }
      crumbs.push({ href, label, isLast: i === cleanSegments.length - 1 });
    }
  }

  return (
    <nav className="hidden sm:flex items-center gap-1.5 text-[14px] text-text-secondary min-w-0">
      <Link href="/" className="hover:text-text-primary transition-colors shrink-0 whitespace-nowrap">
        {tc('home')}
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5 min-w-0">
          <span className="text-text-muted">/</span>
          {crumb.isLast ? (
            <span className="text-text-primary truncate max-w-[180px]">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-text-primary transition-colors truncate">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
