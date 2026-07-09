import { createNavigation } from 'next-intl/navigation';
import { locales } from '@/i18n/config';

export const { Link, useRouter, usePathname, redirect, permanentRedirect } = createNavigation({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always',
});
