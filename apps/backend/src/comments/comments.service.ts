import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, sql } from 'drizzle-orm';
import { schema } from '@know-a-song/database';
import type { PaginatedResult } from '@know-a-song/shared';

@Injectable()
export class CommentsService {
  constructor(
    @Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>,
  ) {}

  async findByFilmId(
    filmId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<any>> {
    const where = eq(schema.comments.filmId, filmId);

    const [data, countResult] = await Promise.all([
      this.db
        .select({
          id: schema.comments.id,
          filmId: schema.comments.filmId,
          ownerId: schema.comments.ownerId,
          content: schema.comments.content,
          createdAt: schema.comments.createdAt,
          username: schema.users.username,
        })
        .from(schema.comments)
        .innerJoin(schema.users, eq(schema.comments.ownerId, schema.users.id))
        .where(where)
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(schema.comments.createdAt),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.comments)
        .where(where),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(data: { filmId: number; content: string; ownerId: number }) {
    return this.db.insert(schema.comments).values(data).returning();
  }

  async delete(id: number, ownerId: number) {
    const [comment] = await this.db
      .select()
      .from(schema.comments)
      .where(eq(schema.comments.id, id))
      .limit(1);

    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.ownerId !== ownerId) throw new ForbiddenException('You can only delete your own comments');

    return this.db.delete(schema.comments).where(eq(schema.comments.id, id)).returning();
  }
}
