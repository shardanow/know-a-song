import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { schema } from '@know-a-song/database';
import type { PaginationParams, PaginatedResult } from '@know-a-song/shared';

@Injectable()
export class FilmsService {
  constructor(
    @Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>,
  ) {}

  async findAll(params?: PaginationParams): Promise<PaginatedResult<any>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const search = params?.search;

    const conditions = search
      ? or(
          ilike(schema.films.slug, `%${search}%`),
          sql`${schema.films.apiTmdbId}::text ilike ${`%${search}%`}`,
          sql`${schema.films.apiShikiId}::text ilike ${`%${search}%`}`,
        )
      : undefined;

    const where = conditions ? conditions : undefined;

    const [data, countResult] = await Promise.all([
      this.db
        .select()
        .from(schema.films)
        .where(where)
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(schema.films.id),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.films)
        .where(where),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findById(id: number) {
    return this.db.select().from(schema.films).where(eq(schema.films.id, id)).limit(1);
  }

  findBySlug(slug: string) {
    return this.db.select().from(schema.films).where(eq(schema.films.slug, slug)).limit(1);
  }

  getFilmLikes(filmIds: number[]) {
    if (!filmIds.length) return Promise.resolve([]);
    return this.db
      .select({
        filmId: schema.songs.filmId,
        likes: sql<number>`COUNT(CASE WHEN ${schema.songRatings.ratingValue} = 1 THEN 1 END)::int`,
      })
      .from(schema.songs)
      .leftJoin(schema.songRatings, eq(schema.songRatings.songId, schema.songs.id))
      .where(inArray(schema.songs.filmId, filmIds))
      .groupBy(schema.songs.filmId);
  }

  create(data: any) {
    return this.db.insert(schema.films).values(data).returning();
  }

  update(id: number, data: any) {
    return this.db.update(schema.films).set(data).where(eq(schema.films.id, id)).returning();
  }

  delete(id: number) {
    return this.db.delete(schema.films).where(eq(schema.films.id, id)).returning();
  }
}
