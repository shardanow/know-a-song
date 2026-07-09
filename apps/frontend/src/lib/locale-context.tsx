'use client';

import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';
import type { Locale } from '@/i18n/config';

export const LocaleContext = createContext<{
  locale: Locale;
  setLocale: Dispatch<SetStateAction<Locale>>;
} | null>(null);

export function useSetLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useSetLocale must be used within LocaleContext.Provider');
  }
  return ctx.setLocale;
}

export function useLocaleValue() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocaleValue must be used within LocaleContext.Provider');
  }
  return ctx.locale;
}
