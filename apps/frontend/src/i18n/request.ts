import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, type Locale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !['en', 'ru'].includes(locale)) {
    locale = defaultLocale;
  }

  return {
    locale: locale as Locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
