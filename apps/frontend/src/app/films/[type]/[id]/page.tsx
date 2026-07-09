import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { AppShell } from '@/components/layout/AppShell';
import { FilmDetail } from '@/components/films/FilmDetail';
import { JsonLd, movieJsonLd, tvSeriesJsonLd, breadcrumbJsonLd } from '@/lib/json-ld';

const baseUrl = 'https://know-a-song.com';
const TMDB_TOKEN = process.env.NEXT_PUBLIC_TMDB_TOKEN || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';

type TmdbFilm = {
  id?: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  first_air_date?: string;
  genres?: { id: number; name: string }[];
  vote_average?: number;
  vote_count?: number;
};

async function fetchTmdbFilm(id: number, type: 'movie' | 'tv', locale?: string): Promise<TmdbFilm | null> {
  const lang = locale === 'ru' ? 'ru-RU' : 'en-US';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${TMDB_BASE}/${type}/${id}?language=${lang}`, {
      headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
      next: { revalidate: 86400 },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}): Promise<Metadata> {
  const { type, id } = await params;
  const locale = await getLocale().catch(() => 'en');
  const tmdbType = type === 'tv' ? 'tv' : 'movie';
  const film = await fetchTmdbFilm(Number(id), tmdbType, locale);

  if (film) {
    const title = film.title || film.name || '';
    const ogImage = film.poster_path
      ? {
          url: `https://image.tmdb.org/t/p/w780${film.poster_path}`,
          width: 780,
          height: 1170,
          alt: title,
        }
      : undefined;
    return {
      title: `${title} — Know A Song`,
      description: film.overview?.substring(0, 160) || '',
      openGraph: {
        title: `${title} — Know A Song`,
        description: film.overview?.substring(0, 160) || '',
        type: tmdbType === 'movie' ? 'video.movie' : 'video.tv_show',
        url: `${baseUrl}/${locale}/films/${tmdbType}/${id}`,
        images: ogImage ? [ogImage] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} — Know A Song`,
        description: film.overview?.substring(0, 160) || '',
        images: ogImage ? [ogImage.url] : undefined,
      },
    };
  }

  return {
    title: `${tmdbType === 'movie' ? 'Film' : 'Series'} — Know A Song`,
    description: '',
  };
}

export default async function FilmDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  const localePage = await getLocale().catch(() => 'en');
  const tmdbType = type === 'tv' ? 'tv' : 'movie';
  const film = await fetchTmdbFilm(Number(id), tmdbType, localePage);
  const filmName = film?.title || film?.name;
  const filmYear = film?.release_date?.substring(0, 4) || film?.first_air_date?.substring(0, 4);

  const aggregateRating =
    film?.vote_average && film?.vote_count
      ? { ratingValue: film.vote_average, ratingCount: film.vote_count, bestRating: 10 }
      : undefined;
  const genre = film?.genres?.map((g) => g.name);

  const commonJsonProps = {
    name: filmName || '',
    description: film?.overview,
    image: film?.poster_path
      ? `https://image.tmdb.org/t/p/w780${film.poster_path}`
      : undefined,
    url: `${baseUrl}/${localePage}/films/${type}/${id}`,
    datePublished: filmYear,
    aggregateRating,
    genre,
  };

  const jsonLd =
    film && filmName
      ? tmdbType === 'movie'
        ? movieJsonLd(commonJsonProps)
        : tvSeriesJsonLd(commonJsonProps)
      : null;

  const breadcrumb = breadcrumbJsonLd([
    { name: 'Know A Song', url: `${baseUrl}/${localePage}` },
    { name: 'Films', url: `${baseUrl}/${localePage}/films` },
    { name: filmName || 'Film' },
  ]);

  const preloadBackdrop = film?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${film.backdrop_path}`
    : null;

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <JsonLd data={breadcrumb} />
      {preloadBackdrop && <link rel="preload" as="image" href={preloadBackdrop} />}
      <AppShell>
        <FilmDetail type={tmdbType} filmId={Number(id)} />
      </AppShell>
    </>
  );
}
