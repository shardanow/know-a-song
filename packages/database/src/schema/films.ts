import { pgTable, serial, integer, varchar, boolean } from 'drizzle-orm/pg-core';

export const films = pgTable('Films', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull(),
  apiTmdbId: integer('api_tmdb_id').unique(),
  apiShikiId: integer('api_shiki_id').unique(),
  tvSeries: boolean('tv_series').notNull().default(false),
});
