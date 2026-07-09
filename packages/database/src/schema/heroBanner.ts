import { pgTable, serial, integer, foreignKey } from 'drizzle-orm/pg-core';
import { films } from './films';

export const heroBannerSlides = pgTable('HeroBannerSlide', {
  id: serial('id').primaryKey(),
  filmId: integer('film_id').notNull(),
  position: integer('position').notNull().default(0),
}, (table) => [
  foreignKey({ columns: [table.filmId], foreignColumns: [films.id] }),
]);
