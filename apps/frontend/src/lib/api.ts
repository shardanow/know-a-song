import { useAuthStore } from '@/stores/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.accessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      localStorage.setItem('token', newToken);
      const authState = useAuthStore.getState();
      if (authState.user) authState.setAuth(newToken, authState.user);
      headers['Authorization'] = `Bearer ${newToken}`;
      const retryRes = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: 'include' });
      if (!retryRes.ok) throw new ApiError(retryRes.status, await retryRes.text());
      return retryRes.json();
    }
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new ApiError(401, 'Session expired');
  }

  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json();
}

export function unwrapData<T>(response: any): T[] {
  if (Array.isArray(response)) return response;
  return response?.data ?? [];
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      request<{ accessToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    register: (username: string, email: string, password: string) =>
      request<{ accessToken: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      }),
    logout: () =>
      request<{ message: string }>('/auth/logout', { method: 'POST' }),
    changePassword: (currentPassword: string, newPassword: string) =>
      request<{ message: string }>('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
  },
  films: {
    list: (params?: { search?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.search) q.set('search', params.search);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      const qs = q.toString();
      return request<any>(`/films${qs ? `?${qs}` : ''}`);
    },
    byId: (id: number) => request<any>(`/film/${id}/by_id`),
    bySlug: (slug: string) => request<any>(`/film/${slug}/by_slug`),
    create: (data: { slug: string; apiTmdbId?: number | null; apiShikiId?: number | null; tvSeries?: boolean }) =>
      request<any>('/film', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: { slug?: string; apiTmdbId?: number | null; apiShikiId?: number | null; tvSeries?: boolean }) =>
      request<any>(`/film/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/film/${id}`, { method: 'DELETE' }),
    heroBanner: {
      getAll: () => request<any[]>('/hero-banner'),
      replace: (slides: { filmId: number; position: number }[]) =>
        request<any>('/hero-banner', {
          method: 'POST',
          body: JSON.stringify({ slides }),
        }),
      remove: (id: number) => request<any>(`/hero-banner/${id}`, { method: 'DELETE' }),
    },
    songLikes: (filmIds: number[]) => {
      const q = new URLSearchParams();
      q.set('ids', filmIds.join(','));
      return request<{ filmId: number; likes: number }[]>(`/films/song-likes?${q}`);
    },
  },
  songs: {
    byFilm: (filmId: number, params?: { search?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.search) q.set('search', params.search);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      const qs = q.toString();
      return request<any>(`/songs/${filmId}${qs ? `?${qs}` : ''}`);
    },
    byFilms: (filmIds: number[]) => request<any[]>(`/songs?filmIds=${filmIds.join(',')}`),
    byTmdbId: (tmdbId: number) => request<any[]>(`/songs/tmdb/${tmdbId}`),
    byId: (id: number) => request<any>(`/song/${id}`),
    toggleFavorite: (songId: number) =>
      request<any>(`/song/${songId}/favorite`, { method: 'POST' }),
    setRating: (songId: number, value: number) =>
      request<any>(`/song/${songId}/rating`, {
        method: 'POST',
        body: JSON.stringify({ value }),
      }),
    deleteRating: (songId: number) =>
      request<any>(`/song/${songId}/rating`, { method: 'DELETE' }),
    getRating: (songId: number) =>
      request<any[]>(`/song/${songId}/rating`),
    getRatingCounts: (songId: number) =>
      request<{ up: number; down: number }>(`/song/${songId}/rating/counts`),
    getFavorites: () =>
      request<any[]>('/favorites'),
    search: (params?: { q?: string; type?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.q) q.set('q', params.q);
      if (params?.type) q.set('type', params.type);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      const qs = q.toString();
      return request<any>(`/songs/search${qs ? `?${qs}` : ''}`);
    },
    similar: (id: number) => request<any[]>(`/song/${id}/similar`),
  },
  artists: {
    list: (params?: { search?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.search) q.set('search', params.search);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      const qs = q.toString();
      return request<any>(`/artists${qs ? `?${qs}` : ''}`);
    },
    dbList: (params?: { search?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.search) q.set('search', params.search);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      const qs = q.toString();
      return request<any>(`/artists/db${qs ? `?${qs}` : ''}`);
    },
    songs: (name: string, params?: { page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      const qs = q.toString();
      return request<any>(`/artists/${encodeURIComponent(name)}/songs${qs ? `?${qs}` : ''}`);
    },
    tmdbSearch: (query: string) => request<any[]>(`/artists/tmdb/${encodeURIComponent(query)}`),
    tmdbPerson: (id: number) => request<any>(`/artists/tmdb/person/${id}`),
    dbSongs: (artistId: number, params?: { page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      const qs = q.toString();
      return request<any>(`/artists/db/${artistId}/songs${qs ? `?${qs}` : ''}`);
    },
    create: (data: { name: string; tmdbPersonId?: number }) =>
      request<any>('/artists/db', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      request<any>(`/artists/db/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/artists/db/${id}`, { method: 'DELETE' }),
  },
  comments: {
    byFilm: (filmId: number, params?: { page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      const qs = q.toString();
      return request<any>(`/comments/film/${filmId}${qs ? `?${qs}` : ''}`);
    },
    create: (filmId: number, content: string) =>
      request<any>('/comments', {
        method: 'POST',
        body: JSON.stringify({ filmId, content }),
      }),
    delete: (id: number) => request<any>(`/comments/${id}`, { method: 'DELETE' }),
  },
  suggestions: {
    byFilm: (filmId: number, params?: { page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      const qs = q.toString();
      return request<any>(`/suggestions/film/${filmId}${qs ? `?${qs}` : ''}`);
    },
    create: (data: { filmId: number; title: string; author: string; type?: string; link?: string }) =>
      request<any>('/suggestions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: { status: string }) =>
      request<any>(`/suggestions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/suggestions/${id}`, { method: 'DELETE' }),
  },
  filmFavorites: {
    list: () => request<any[]>('/film/favorites'),
    toggle: (filmId: number) =>
      request<{ favorited: boolean }>(`/film/${filmId}/favorite`, { method: 'POST' }),
  },
  users: {
    list: (params?: { search?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.search) q.set('search', params.search);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      const qs = q.toString();
      return request<any>(`/users${qs ? `?${qs}` : ''}`);
    },
    byId: (id: number) => request<any>(`/user/id/${id}`),
    byUsername: (username: string) => request<any>(`/user/username/${username}`),
  },
  userTypes: {
    list: (params?: { search?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.search) q.set('search', params.search);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      const qs = q.toString();
      return request<any>(`/user-types${qs ? `?${qs}` : ''}`);
    },
  },
};
