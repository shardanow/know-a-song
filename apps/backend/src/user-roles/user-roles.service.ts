import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, ilike, or, sql } from 'drizzle-orm';
import { schema } from '@know-a-song/database';
import type { PaginationParams, PaginatedResult } from '@know-a-song/shared';

@Injectable()
export class UserRolesService {
  constructor(
    @Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>,
  ) {}

  async findAll(params?: PaginationParams): Promise<PaginatedResult<any>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const search = params?.search;

    const conditions = search ? ilike(schema.userTypes.title, `%${search}%`) : undefined;
    const where = conditions ? conditions : undefined;

    const [data, countResult] = await Promise.all([
      this.db
        .select()
        .from(schema.userTypes)
        .where(where)
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(schema.userTypes.id),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.userTypes)
        .where(where),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findById(id: number) {
    return this.db.select().from(schema.userTypes).where(eq(schema.userTypes.id, id));
  }

  create(data: any) {
    return this.db.insert(schema.userTypes).values(data).returning();
  }

  update(id: number, data: any) {
    return this.db.update(schema.userTypes).set(data).where(eq(schema.userTypes.id, id)).returning();
  }

  delete(id: number) {
    return this.db.delete(schema.userTypes).where(eq(schema.userTypes.id, id)).returning();
  }
}
