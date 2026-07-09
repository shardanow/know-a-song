import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, sql } from 'drizzle-orm';
import { schema } from '@know-a-song/database';
import type { PaginatedResult } from '@know-a-song/shared';

@Injectable()
export class SuggestionsService {
  constructor(
    @Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>,
  ) {}

  async findByFilmId(
    filmId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<any>> {
    const where = eq(schema.suggestions.filmId, filmId);

    const [data, countResult] = await Promise.all([
      this.db
        .select()
        .from(schema.suggestions)
        .where(where)
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(schema.suggestions.createdAt),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.suggestions)
        .where(where),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(data: {
    filmId: number;
    title: string;
    author: string;
    type?: string;
    link?: string;
    ownerId: number;
  }) {
    return this.db.insert(schema.suggestions).values(data).returning();
  }

  async updateStatus(id: number, status: string) {
    const [existing] = await this.db
      .select()
      .from(schema.suggestions)
      .where(eq(schema.suggestions.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException('Suggestion not found');

    return this.db
      .update(schema.suggestions)
      .set({ status })
      .where(eq(schema.suggestions.id, id))
      .returning();
  }

  async delete(id: number, ownerId: number) {
    const [suggestion] = await this.db
      .select()
      .from(schema.suggestions)
      .where(eq(schema.suggestions.id, id))
      .limit(1);

    if (!suggestion) throw new NotFoundException('Suggestion not found');
    if (suggestion.ownerId !== ownerId) throw new ForbiddenException('You can only delete your own suggestions');

    return this.db.delete(schema.suggestions).where(eq(schema.suggestions.id, id)).returning();
  }
}
