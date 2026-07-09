import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, inArray, ilike, and, or, sql } from 'drizzle-orm';
import { schema } from '@know-a-song/database';
import type { PaginationParams, PaginatedResult } from '@know-a-song/shared';

@Injectable()
export class SongsService {
  constructor(
    @Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>,
  ) {}

  private songSelect = {
    id: schema.songs.id,
    filmId: schema.songs.filmId,
    apiTmdbId: schema.films.apiTmdbId,
    apiShikiId: schema.films.apiShikiId,
    slug: schema.films.slug,
    tvSeries: schema.films.tvSeries,
    ownerId: schema.songs.ownerId,
    title: schema.songs.title,
    author: schema.songs.author,
    artistId: schema.songs.artistId,
    artistName: schema.artists.name,
    artistImageUrl: schema.artists.imageUrl,
    season: schema.songs.season,
    episode: sql<number | null>`max(${schema.episodeSeasonSongs.episode})`,
    isOpening: schema.songs.isOpening,
    isEnding: schema.songs.isEnding,
    startTime: schema.songs.startTime,
    youtubeId: schema.songSources.youtubeId,
    youtubeLink: schema.songSources.youtubeLink,
    spotifyId: schema.songSources.spotifyId,
    spotifyLink: schema.songSources.spotifyLink,
    appleMId: schema.songSources.appleMId,
    appleMLink: schema.songSources.appleMLink,
  };

  private baseQuery() {
    return this.db
      .select(this.songSelect)
      .from(schema.songs)
      .leftJoin(schema.films, eq(schema.songs.filmId, schema.films.id))
      .leftJoin(schema.artists, eq(schema.songs.artistId, schema.artists.id))
      .leftJoin(schema.songSources, eq(schema.songs.id, schema.songSources.songId))
      .leftJoin(schema.episodeSeasonSongs, eq(schema.songs.id, schema.episodeSeasonSongs.songId))
      .groupBy(schema.songs.id, schema.films.id, schema.films.slug, schema.films.tvSeries, schema.artists.id, schema.songSources.id);
  }

  async findByFilmId(filmId: number, params?: PaginationParams): Promise<PaginatedResult<any>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const search = params?.search;

    const filmCondition = eq(schema.songs.filmId, filmId);
    const searchCondition = search
      ? or(ilike(schema.songs.title, `%${search}%`), ilike(schema.songs.author, `%${search}%`))
      : undefined;
    const where = searchCondition ? and(filmCondition, searchCondition) : filmCondition;

    const [data, countResult] = await Promise.all([
      this.baseQuery().where(where).limit(limit).offset((page - 1) * limit),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.songs)
        .where(where),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findByTmdbId(tmdbId: number) {
    return this.baseQuery().where(eq(schema.films.apiTmdbId, tmdbId));
  }

  findById(id: number) {
    return this.baseQuery().where(eq(schema.songs.id, id));
  }

  findByFilmIds(filmIds: number[]) {
    return this.baseQuery().where(inArray(schema.songs.filmId, filmIds));
  }

  create(data: any) {
    return this.db.insert(schema.songs).values(data).returning();
  }

  createSource(data: any) {
    return this.db.insert(schema.songSources).values(data).returning();
  }

  update(id: number, data: any) {
    return this.db.update(schema.songs).set(data).where(eq(schema.songs.id, id)).returning();
  }

  updateSource(songId: number, data: any) {
    return this.db.update(schema.songSources).set(data).where(eq(schema.songSources.songId, songId)).returning();
  }

  delete(id: number) {
    return this.db.delete(schema.songs).where(eq(schema.songs.id, id)).returning();
  }

  deleteSource(songId: number) {
    return this.db.delete(schema.songSources).where(eq(schema.songSources.songId, songId)).returning();
  }

  upsertEpisode(songId: number, season: number, episode: number) {
    return this.db
      .insert(schema.episodeSeasonSongs)
      .values({ songId, season, episode })
      .onConflictDoNothing()
      .returning();
  }

  deleteEpisode(songId: number) {
    return this.db
      .delete(schema.episodeSeasonSongs)
      .where(eq(schema.episodeSeasonSongs.songId, songId))
      .returning();
  }

  findFilms() {
    return this.db.select().from(schema.films);
  }

  // ─── Artists ─────────────────────────────────
  async getArtists(params?: { search?: string; page?: number; limit?: number }): Promise<PaginatedResult<any>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const search = params?.search;

    const condition = search
      ? ilike(schema.songs.author, `%${search}%`)
      : undefined;

    const [data, countResult] = await Promise.all([
      this.db
        .select({
          author: schema.songs.author,
          songCount: sql<number>`count(*)::int`,
        })
        .from(schema.songs)
        .where(condition)
        .groupBy(schema.songs.author)
        .orderBy(schema.songs.author)
        .limit(limit)
        .offset((page - 1) * limit),
      this.db
        .select({
          count: sql<number>`count(distinct ${schema.songs.author})`,
        })
        .from(schema.songs)
        .where(condition),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getArtistSongs(author: string, params?: { page?: number; limit?: number }): Promise<PaginatedResult<any>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;

    const condition = ilike(schema.songs.author, author);

    const [data, countResult] = await Promise.all([
      this.baseQuery().where(condition).limit(limit).offset((page - 1) * limit),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.songs)
        .leftJoin(schema.artists, eq(schema.songs.artistId, schema.artists.id))
        .where(condition),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByArtistId(artistId: number, params?: { page?: number; limit?: number }): Promise<PaginatedResult<any>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;

    const condition = eq(schema.songs.artistId, artistId);

    const [data, countResult] = await Promise.all([
      this.baseQuery().where(condition).limit(limit).offset((page - 1) * limit),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.songs)
        .where(condition),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Search ─────────────────────────────────
  async searchSongs(params?: { q?: string; type?: string; page?: number; limit?: number }): Promise<PaginatedResult<any>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const q = params?.q;
    const type = params?.type;

    const conditions: any[] = [];
    if (q) {
      conditions.push(
        or(ilike(schema.songs.title, `%${q}%`), ilike(schema.songs.author, `%${q}%`)),
      );
    }
    if (type === 'opening') {
      conditions.push(eq(schema.songs.isOpening, true));
    } else if (type === 'ending') {
      conditions.push(eq(schema.songs.isEnding, true));
    } else if (type === 'ost') {
      conditions.push(and(eq(schema.songs.isOpening, false), eq(schema.songs.isEnding, false)));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      this.baseQuery().where(where).limit(limit).offset((page - 1) * limit),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.songs)
        .where(where),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Similar Songs ──────────────────────────
  async getSimilar(songId: number) {
    const song = await this.db
      .select()
      .from(schema.songs)
      .where(eq(schema.songs.id, songId))
      .limit(1);

    if (song.length === 0) return [];

    const { author, filmId } = song[0];

    return this.baseQuery()
      .where(
        and(
          eq(schema.songs.author, author),
          sql`${schema.songs.id} != ${songId}`,
        ),
      )
      .limit(10);
  }

  // ─── Ratings ─────────────────────────────────
  async setRating(songId: number, ownerId: number, value: number) {
    const existing = await this.db
      .select()
      .from(schema.songRatings)
      .where(and(
        eq(schema.songRatings.songId, songId),
        eq(schema.songRatings.ownerId, ownerId),
      ))
      .limit(1);

    if (existing.length > 0) {
      return this.db
        .update(schema.songRatings)
        .set({ ratingValue: value })
        .where(and(
          eq(schema.songRatings.songId, songId),
          eq(schema.songRatings.ownerId, ownerId),
        ))
        .returning();
    }
    return this.db
      .insert(schema.songRatings)
      .values({ songId, ownerId, ratingValue: value })
      .returning();
  }

  async deleteRating(songId: number, ownerId: number) {
    return this.db
      .delete(schema.songRatings)
      .where(and(
        eq(schema.songRatings.songId, songId),
        eq(schema.songRatings.ownerId, ownerId),
      ))
      .returning();
  }

  async getRating(songId: number, ownerId: number) {
    return this.db
      .select()
      .from(schema.songRatings)
      .where(and(
        eq(schema.songRatings.songId, songId),
        eq(schema.songRatings.ownerId, ownerId),
      ));
  }

  async getRatingCounts(songId: number) {
    const result = await this.db
      .select({
        ratingValue: schema.songRatings.ratingValue,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.songRatings)
      .where(eq(schema.songRatings.songId, songId))
      .groupBy(schema.songRatings.ratingValue);

    const up = result.find(r => r.ratingValue === 1)?.count ?? 0;
    const down = result.find(r => r.ratingValue === -1)?.count ?? 0;
    return { up, down };
  }

  // ─── Favorites ───────────────────────────────
  async toggleFavorite(songId: number, ownerId: number) {
    const existing = await this.db
      .select()
      .from(schema.songFavorites)
      .where(and(
        eq(schema.songFavorites.songId, songId),
        eq(schema.songFavorites.ownerId, ownerId),
      ))
      .limit(1);

    if (existing.length > 0) {
      await this.db
        .delete(schema.songFavorites)
        .where(and(
          eq(schema.songFavorites.songId, songId),
          eq(schema.songFavorites.ownerId, ownerId),
        ));
      return { favorited: false };
    }
    await this.db
      .insert(schema.songFavorites)
      .values({ songId, ownerId });
    return { favorited: true };
  }

  async getFavorites(ownerId: number) {
    return this.db
      .select(this.songSelect)
      .from(schema.songFavorites)
      .innerJoin(schema.songs, eq(schema.songFavorites.songId, schema.songs.id))
      .leftJoin(schema.films, eq(schema.songs.filmId, schema.films.id))
      .leftJoin(schema.artists, eq(schema.songs.artistId, schema.artists.id))
      .leftJoin(schema.songSources, eq(schema.songs.id, schema.songSources.songId))
      .leftJoin(schema.episodeSeasonSongs, eq(schema.songs.id, schema.episodeSeasonSongs.songId))
      .where(eq(schema.songFavorites.ownerId, ownerId))
      .groupBy(schema.songs.id, schema.films.id, schema.films.slug, schema.films.tvSeries, schema.artists.id, schema.songSources.id);
  }
}
