import type { MetadataRoute } from 'next';

const baseUrl = 'https://know-a-song.com';
const locales = ['en', 'ru'] as const;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

type PageDef = {
  path: string;
  changeFrequency: 'weekly' | 'monthly';
  priority: number;
};

const pages: PageDef[] = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: 'films', changeFrequency: 'weekly', priority: 0.8 },
  { path: 'songs', changeFrequency: 'weekly', priority: 0.7 },
  { path: 'artists', changeFrequency: 'weekly', priority: 0.7 },
  { path: 'login', changeFrequency: 'monthly', priority: 0.3 },
  { path: 'register', changeFrequency: 'monthly', priority: 0.3 },
  { path: 'settings', changeFrequency: 'monthly', priority: 0.3 },
  { path: 'favorites', changeFrequency: 'monthly', priority: 0.3 },
  { path: 'suggestions', changeFrequency: 'monthly', priority: 0.3 },
];

type Film = {
  id: number;
  apiTmdbId: number | null;
  tvSeries: boolean;
  slug: string;
};

async function fetchFilms(): Promise<Film[]> {
  try {
    const res = await fetch(`${API_URL}/films?limit=9999`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || json || [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const films = await fetchFilms();

  const filmEntries: MetadataRoute.Sitemap = films
    .filter((f) => f.apiTmdbId !== null)
    .map((film) => {
      const type = film.tvSeries ? 'tv' : 'movie';
      const path = `films/${type}/${film.apiTmdbId}`;

      const localizedUrls: Record<string, string> = {};
      for (const locale of locales) {
        localizedUrls[locale] = `${baseUrl}/${locale}/${path}`;
      }
      localizedUrls['x-default'] = `${baseUrl}/en/${path}`;

      return {
        url: `${baseUrl}/en/${path}`,
        alternates: { languages: localizedUrls },
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      };
    });

  const staticEntries: MetadataRoute.Sitemap = pages.flatMap(({ path, changeFrequency, priority }) => {
    const localizedUrls: Record<string, string> = {};
    for (const locale of locales) {
      localizedUrls[locale] = path ? `${baseUrl}/${locale}/${path}` : `${baseUrl}/${locale}`;
    }
    localizedUrls['x-default'] = `${baseUrl}/en`;

    const primaryUrl = path ? `${baseUrl}/en/${path}` : `${baseUrl}/en`;

    return {
      url: primaryUrl,
      alternates: { languages: localizedUrls },
      lastModified: new Date(),
      changeFrequency,
      priority,
    };
  });

  return [...staticEntries, ...filmEntries];
}
