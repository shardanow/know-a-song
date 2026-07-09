import { pgTable, serial, integer, varchar, text, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { films } from './films';
import { users } from './users';

export const suggestions = pgTable('Suggestions', {
  id: serial('id').primaryKey(),
  filmId: integer('film_id').notNull(),
  ownerId: integer('owner_id').notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  author: varchar('author', { length: 50 }).notNull(),
  type: varchar('type', { length: 20 }),
  link: varchar('link', { length: 255 }),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  foreignKey({ columns: [table.filmId], foreignColumns: [films.id] }),
  foreignKey({ columns: [table.ownerId], foreignColumns: [users.id] }),
]);
