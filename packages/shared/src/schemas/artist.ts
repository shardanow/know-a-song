import { z } from 'zod';

export const artistSchema = z.object({
  id: z.number(),
  name: z.string().max(100),
  tmdbPersonId: z.number().int().nullable(),
  imageUrl: z.string().max(255).nullable(),
  biography: z.string().nullable(),
});

export const createArtistSchema = z.object({
  name: z.string().min(1).max(100),
  tmdbPersonId: z.number().int().optional(),
});

export type Artist = z.infer<typeof artistSchema>;
export type CreateArtist = z.infer<typeof createArtistSchema>;
