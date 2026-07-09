import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { headers } from 'next/headers';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Player } from '@/components/songs/DynamicPlayer';
import { CanonicalUrl } from '@/components/seo/CanonicalUrl';
import { type Locale } from '@/i18n/config';
import { JsonLd, websiteJsonLd } from '@/lib/json-ld';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
});

const baseUrl = 'https://know-a-song.com';

export const metadata: Metadata = {
  title: 'Know A Song',
  description: 'Discover songs from your favorite films and TV series',
  metadataBase: new URL(baseUrl),
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KnowASong',
  },
  openGraph: {
    type: 'website',
    locale: 'en',
    siteName: 'Know A Song',
    title: 'Know A Song',
    description: 'Discover songs from your favorite films and TV series',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Know A Song',
    description: 'Discover songs from your favorite films and TV series',
  },
  other: {
    'theme-color': '#070b13',
  },
};

type Theme = 'dark' | 'light';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const theme = headersList.get('x-theme') as Theme | null;
  const themeClass = theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : '';

  const initialLocale = (await getLocale()) as Locale;

  const initialMessages = (await import(`../../messages/${initialLocale}.json`)).default as Record<string, any>;

  return (
    <html lang={initialLocale} className={`${inter.variable} ${themeClass}`} suppressHydrationWarning>
      <head>
        <link rel="alternate" hrefLang="en" href={`${baseUrl}/en`} />
        <link rel="alternate" hrefLang="ru" href={`${baseUrl}/ru`} />
        <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/en`} />
      </head>
      <body className="bg-bg-primary text-text-primary font-sans antialiased overflow-x-hidden">
        <JsonLd data={websiteJsonLd(baseUrl)} />
        <Providers initialLocale={initialLocale} initialTheme={theme || undefined} initialMessages={initialMessages}>
          <CanonicalUrl />
          {children}
          <Player />
        </Providers>
      </body>
    </html>
  );
}
