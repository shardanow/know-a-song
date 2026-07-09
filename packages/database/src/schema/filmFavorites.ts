import { pgTable, serial, integer, foreignKey } from 'drizzle-orm/pg-core';
import { films } from './films';
import { users } from './users';

export const filmFavorites = pgTable('FilmFavorite', {
  id: serial('id').primaryKey(),
  filmId: integer('film_id').notNull(),
  ownerId: integer('owner_id').notNull(),
}, (table) => [
  foreignKey({ columns: [table.filmId], foreignColumns: [films.id] }),
  foreignKey({ columns: [table.ownerId], foreignColumns: [users.id] }),
]);
