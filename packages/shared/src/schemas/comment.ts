import { z } from 'zod';

export const commentSchema = z.object({
  id: z.number(),
  filmId: z.number(),
  ownerId: z.number(),
  content: z.string(),
  createdAt: z.string().datetime().nullable(),
});

export const createCommentSchema = z.object({
  filmId: z.number(),
  content: z.string().min(1).max(1000),
});

export type Comment = z.infer<typeof commentSchema>;
export type CreateComment = z.infer<typeof createCommentSchema>;
