import { pgTable, serial, integer, varchar, text, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { films } from './films';
import { users } from './users';

export const comments = pgTable('Comments', {
  id: serial('id').primaryKey(),
  filmId: integer('film_id').notNull(),
  ownerId: integer('owner_id').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  foreignKey({ columns: [table.filmId], foreignColumns: [films.id] }),
  foreignKey({ columns: [table.ownerId], foreignColumns: [users.id] }),
]);
