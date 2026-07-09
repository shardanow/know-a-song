import { pgTable, serial, integer, varchar, text } from 'drizzle-orm/pg-core';

export const artists = pgTable('Artists', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  tmdbPersonId: integer('tmdb_person_id').unique(),
  imageUrl: varchar('image_url', { length: 255 }),
  biography: text('biography'),
});
