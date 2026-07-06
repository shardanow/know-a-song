import { pgTable, serial, integer, boolean, varchar, foreignKey } from 'drizzle-orm/pg-core';
import { films } from './films';
import { users } from './users';

export const songs = pgTable('Songs', {
  id: serial('id').primaryKey(),
  ownerId: integer('owner_id').notNull(),
  filmId: integer('film_id').notNull(),
  season: integer('season').default(0),
  isOpening: boolean('is_opening').notNull().default(false),
  isEnding: boolean('is_ending').notNull().default(false),
  author: varchar('author', { length: 50 }).notNull(),
  title: varchar('title', { length: 50 }).notNull(),
}, (table) => [
  foreignKey({ columns: [table.filmId], foreignColumns: [films.id] }),
  foreignKey({ columns: [table.ownerId], foreignColumns: [users.id] }),
]);

export const episodeSeasonSongs = pgTable('EpisodeSeasonSongs', {
  id: serial('id').primaryKey(),
  songId: integer('song_id').notNull(),
  season: integer('season').default(0),
  episode: integer('episode').default(0),
}, (table) => [
  foreignKey({ columns: [table.songId], foreignColumns: [songs.id] }),
]);

export const songSources = pgTable('SongSources', {
  id: serial('id').primaryKey(),
  songId: integer('song_id').notNull(),
  ownerId: integer('owner_id').notNull(),
  youtubeId: varchar('youtube_id', { length: 50 }),
  spotifyId: varchar('spotify_id', { length: 50 }),
  appleMId: varchar('apple_m_id', { length: 50 }),
  youtubeLink: varchar('youtube_link', { length: 100 }),
  spotifyLink: varchar('spotify_link', { length: 100 }),
  appleMLink: varchar('apple_m_link', { length: 100 }),
}, (table) => [
  foreignKey({ columns: [table.songId], foreignColumns: [songs.id] }),
  foreignKey({ columns: [table.ownerId], foreignColumns: [users.id] }),
]);

export const songRatings = pgTable('SongRating', {
  id: serial('id').primaryKey(),
  songId: integer('song_id').notNull(),
  ownerId: integer('owner_id').notNull(),
  ratingValue: integer('rating_value').notNull(),
}, (table) => [
  foreignKey({ columns: [table.songId], foreignColumns: [songs.id] }),
  foreignKey({ columns: [table.ownerId], foreignColumns: [users.id] }),
]);

export const songFavorites = pgTable('SongFavorite', {
  id: serial('id').primaryKey(),
  songId: integer('song_id').notNull(),
  ownerId: integer('owner_id').notNull(),
}, (table) => [
  foreignKey({ columns: [table.songId], foreignColumns: [songs.id] }),
  foreignKey({ columns: [table.ownerId], foreignColumns: [users.id] }),
]);
