import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, ilike, sql } from 'drizzle-orm';
import { schema } from '@know-a-song/database';
import type { PaginationParams, PaginatedResult } from '@know-a-song/shared';

@Injectable()
export class ArtistsService {
  constructor(
    @Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>,
  ) {}

  private getTmdbToken(): string {
    return process.env.NEXT_PUBLIC_TMDB_TOKEN || process.env.TMDB_TOKEN || '';
  }

  async searchTmdb(query: string) {
    const token = this.getTmdbToken();
    const res = await fetch(
      `https://api.themoviedb.org/3/search/person?query=${encodeURIComponent(query)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) throw new Error(`TMDB search failed: ${res.statusText}`);
    const data = await res.json();
    return data.results ?? [];
  }

  async getTmdbPerson(id: number) {
    const token = this.getTmdbToken();
    const res = await fetch(
      `https://api.themoviedb.org/3/person/${id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) throw new Error(`TMDB person failed: ${res.statusText}`);
    return res.json();
  }

  async findAll(params?: PaginationParams): Promise<PaginatedResult<any>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const search = params?.search;

    const condition = search
      ? ilike(schema.artists.name, `%${search}%`)
      : undefined;

    const [data, countResult] = await Promise.all([
      this.db
        .select()
        .from(schema.artists)
        .where(condition)
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(schema.artists.name),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.artists)
        .where(condition),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(body: { name: string; tmdbPersonId?: number }) {
    if (body.tmdbPersonId) {
      const person = await this.getTmdbPerson(body.tmdbPersonId);
      return this.db
        .insert(schema.artists)
        .values({
          name: person.name,
          tmdbPersonId: body.tmdbPersonId,
          imageUrl: person.profile_path
            ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
            : null,
          biography: person.biography || null,
        })
        .returning();
    }
    return this.db.insert(schema.artists).values({ name: body.name }).returning();
  }

  update(id: number, data: any) {
    return this.db.update(schema.artists).set(data).where(eq(schema.artists.id, id)).returning();
  }

  delete(id: number) {
    return this.db.delete(schema.artists).where(eq(schema.artists.id, id)).returning();
  }
}
