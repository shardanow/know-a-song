import { api, unwrapData } from './api';

export { unwrapData };

const TMDB_TOKEN = process.env.NEXT_PUBLIC_TMDB_TOKEN || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';

async function fetchTmdb<T>(path: string): Promise<T> {
  const res = await fetch(`${TMDB_BASE}${path}`, {
    headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
  });
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

function tmdbLang(locale?: string): string {
  return locale === 'ru' ? 'ru-RU' : 'en-US';
}

export const apiClient = {
  getFilms: () => api.films.list({ limit: 9999 }),
  getFilmSongs: (filmId: number) => api.songs.byFilm(filmId, { limit: 9999 }),
  getSongsByTmdbId: (tmdbId: number) => api.songs.byTmdbId(tmdbId),
  getBatchSongs: (filmIds: number[]) => api.songs.byFilms(filmIds),
  getFilmLikes: (filmIds: number[]) => api.films.songLikes(filmIds),
  getFilmInfo: (id: number, type: 'movie' | 'tv', locale?: string) =>
    fetchTmdb<any>(`/${type}/${id}?language=${tmdbLang(locale)}`),
  getTVEpisodeData: (seriesId: number, season: number, episode: number, locale?: string) =>
    fetchTmdb<any>(`/tv/${seriesId}/season/${season}/episode/${episode}?language=${tmdbLang(locale)}`),
  getPersonInfo: (personId: number, locale?: string) =>
    fetchTmdb<any>(`/person/${personId}?language=${tmdbLang(locale)}`),
  searchPerson: (query: string, locale?: string) =>
    fetchTmdb<any>(`/search/person?query=${encodeURIComponent(query)}&language=${tmdbLang(locale)}`),
};
