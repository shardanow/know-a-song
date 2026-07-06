import { z } from 'zod';

export const apiKeySchema = z.object({
  id: z.number(),
  apiTmdbKey: z.string().max(50).nullable(),
  apiShikiKey: z.string().max(50).nullable(),
});

export type ApiKey = z.infer<typeof apiKeySchema>;
