'use client';

import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { NextIntlClientProvider, useLocale } from 'next-intl';
import { defaultLocale, locales, type Locale } from '@/i18n/config';
import { LocaleContext, useSetLocale } from '@/lib/locale-context';
import { ThemeProvider } from '@/components/ThemeProvider';
import { usePlayerStore } from '@/stores/player-store';
import { ChunkErrorHandler } from '@/components/ChunkErrorHandler';

type Theme = 'dark' | 'light';

function LocaleSync() {
  const nextLocale = useLocale();
  const setLocale = useSetLocale();
  const queryClient = useQueryClient();

  useEffect(() => {
    setLocale(nextLocale as Locale);
    queryClient.invalidateQueries();
  }, [nextLocale, setLocale, queryClient]);

  return null;
}

export function Providers({ children, initialLocale, initialTheme, initialMessages }: {
  children: React.ReactNode;
  initialLocale?: Locale;
  initialTheme?: Theme;
  initialMessages?: Record<string, any>;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 5 * 60_000,
            gcTime: 30 * 60_000,
          },
        },
      }),
  );

  const [locale, setLocale] = useState<Locale>(initialLocale || defaultLocale);
  const [messages, setMessages] = useState<Record<string, any> | undefined>(initialMessages);

  useEffect(() => {
    import(`../../messages/${locale}.json`).then(m => setMessages(m.default));
  }, [locale]);

  const [hasSongs, setHasSongs] = useState(false);

  useEffect(() => {
    setHasSongs(usePlayerStore.getState().songs.length > 0);
    const unsub = usePlayerStore.subscribe((state) => {
      setHasSongs(state.songs.length > 0);
    });
    return unsub;
  }, []);

  const sync = useCallback(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('locale');
    if (stored && (locales as readonly string[]).includes(stored) && stored !== locale) {
      setLocale(stored as Locale);
    }
  }, [locale]);

  useEffect(() => {
    window.addEventListener('focus', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('focus', sync);
      window.removeEventListener('storage', sync);
    };
  }, [sync]);

  return (
    <ChunkErrorHandler>
      <LocaleContext.Provider value={{ locale, setLocale }}>
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
          <ThemeProvider initialTheme={initialTheme}>
            <QueryClientProvider client={queryClient}>
              <LocaleSync />
              {children}
              {hasSongs && <div className="h-[116px]" />}
            </QueryClientProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </LocaleContext.Provider>
    </ChunkErrorHandler>
  );
}
