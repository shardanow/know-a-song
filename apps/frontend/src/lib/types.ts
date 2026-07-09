export interface Film {
  id: number;
  slug: string;
  apiTmdbId: number | null;
  apiShikiId: number | null;
  tvSeries: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  lastLogin: string | null;
  userType: string | null;
  userIsActive: number;
}

export interface Song {
  id: number;
  apiTmdbId: number | null;
  apiShikiId: number | null;
  ownerId: number;
  title: string;
  author: string;
  season: number;
  isOpening: boolean;
  isEnding: boolean;
  youtubeId: string | null;
  youtubeLink: string | null;
  spotifyId: string | null;
  spotifyLink: string | null;
  appleMId: string | null;
  appleMLink: string | null;
}

export interface UserType {
  id: number;
  title: string;
  rights: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}
