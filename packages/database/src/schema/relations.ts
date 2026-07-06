import { relations } from 'drizzle-orm';
import { films } from './films';
import { users } from './users';
import { userTypes } from './userTypes';
import { songs, episodeSeasonSongs, songSources, songRatings, songFavorites } from './songs';

export const filmsRelations = relations(films, ({ many }) => ({
  songs: many(songs),
}));

export const userTypesRelations = relations(userTypes, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  userType: one(userTypes, { fields: [users.userTypeId], references: [userTypes.id] }),
  songs: many(songs, { relationName: 'owner' }),
  songSources: many(songSources),
  songRatings: many(songRatings),
  songFavorites: many(songFavorites),
}));

export const songsRelations = relations(songs, ({ one, many }) => ({
  film: one(films, { fields: [songs.filmId], references: [films.id] }),
  owner: one(users, { fields: [songs.ownerId], references: [users.id], relationName: 'owner' }),
  episodes: many(episodeSeasonSongs),
  sources: many(songSources),
  ratings: many(songRatings),
  favorites: many(songFavorites),
}));

export const episodeSeasonSongsRelations = relations(episodeSeasonSongs, ({ one }) => ({
  song: one(songs, { fields: [episodeSeasonSongs.songId], references: [songs.id] }),
}));

export const songSourcesRelations = relations(songSources, ({ one }) => ({
  song: one(songs, { fields: [songSources.songId], references: [songs.id] }),
  owner: one(users, { fields: [songSources.ownerId], references: [users.id] }),
}));

export const songRatingsRelations = relations(songRatings, ({ one }) => ({
  song: one(songs, { fields: [songRatings.songId], references: [songs.id] }),
  owner: one(users, { fields: [songRatings.ownerId], references: [users.id] }),
}));

export const songFavoritesRelations = relations(songFavorites, ({ one }) => ({
  song: one(songs, { fields: [songFavorites.songId], references: [songs.id] }),
  owner: one(users, { fields: [songFavorites.ownerId], references: [users.id] }),
}));
