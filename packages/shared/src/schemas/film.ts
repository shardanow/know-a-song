import { z } from 'zod';

export const filmSchema = z.object({
  id: z.number(),
  slug: z.string().max(100),
  apiTmdbId: z.number().int().nullable(),
  apiShikiId: z.number().int().nullable(),
  tvSeries: z.boolean(),
});

export const createFilmSchema = filmSchema.omit({ id: true });

export type Film = z.infer<typeof filmSchema>;
export type CreateFilm = z.infer<typeof createFilmSchema>;
