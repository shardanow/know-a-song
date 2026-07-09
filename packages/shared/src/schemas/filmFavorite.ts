import { z } from 'zod';

export const filmFavoriteSchema = z.object({
  id: z.number(),
  filmId: z.number(),
  ownerId: z.number(),
});

export type FilmFavorite = z.infer<typeof filmFavoriteSchema>;
