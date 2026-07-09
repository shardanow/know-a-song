import { z } from 'zod';

export const songSchema = z.object({
  id: z.number(),
  ownerId: z.number(),
  filmId: z.number(),
  season: z.number().default(0),
  isOpening: z.boolean().default(false),
  isEnding: z.boolean().default(false),
  author: z.string().max(50),
  title: z.string().max(50),
  startTime: z.number().int().nullable().optional(),
});

export const episodeSeasonSongSchema = z.object({
  id: z.number(),
  songId: z.number(),
  season: z.number().default(0),
  episode: z.number().default(0),
});

export const songSourceSchema = z.object({
  id: z.number(),
  songId: z.number(),
  ownerId: z.number(),
  youtubeId: z.string().nullable(),
  spotifyId: z.string().nullable(),
  appleMId: z.string().nullable(),
  youtubeLink: z.string().nullable(),
  spotifyLink: z.string().nullable(),
  appleMLink: z.string().nullable(),
});

export const songRatingSchema = z.object({
  id: z.number(),
  songId: z.number(),
  ownerId: z.number(),
  ratingValue: z.number().int(),
});

export const songFavoriteSchema = z.object({
  id: z.number(),
  songId: z.number(),
  ownerId: z.number(),
});

export type Song = z.infer<typeof songSchema>;
export type SongSource = z.infer<typeof songSourceSchema>;
export type SongWithSources = Song & { sources: SongSource[] };
