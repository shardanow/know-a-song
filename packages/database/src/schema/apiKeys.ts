import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const apiKeys = pgTable('APIKeys', {
  id: serial('id').primaryKey(),
  apiTmdbKey: varchar('api_tmdb_key', { length: 50 }).unique(),
  apiShikiKey: varchar('api_shiki_key', { length: 50 }).unique(),
});
