import { z } from 'zod';

export const suggestionSchema = z.object({
  id: z.number(),
  filmId: z.number(),
  ownerId: z.number(),
  title: z.string().max(100),
  author: z.string().max(50),
  type: z.string().max(20).nullable(),
  link: z.string().max(255).nullable(),
  status: z.string().max(20),
  createdAt: z.string().datetime().nullable(),
});

export const createSuggestionSchema = z.object({
  filmId: z.number(),
  title: z.string().min(1).max(100),
  author: z.string().min(1).max(50),
  type: z.string().max(20).optional(),
  link: z.string().max(255).optional(),
});

export type Suggestion = z.infer<typeof suggestionSchema>;
export type CreateSuggestion = z.infer<typeof createSuggestionSchema>;
