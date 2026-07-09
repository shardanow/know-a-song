import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, ilike, or, sql } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { schema } from '@know-a-song/database';
import type { PaginationParams, PaginatedResult } from '@know-a-song/shared';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>,
  ) {}

  async createUser(data: { username: string; email: string; password: string }) {
    const hash = await bcrypt.hash(data.password, 12);
    const token = randomBytes(32).toString('hex');
    return this.db
      .insert(schema.users)
      .values({ username: data.username, email: data.email, password: hash, token })
      .returning();
  }

  private userSelect = {
    id: schema.users.id,
    username: schema.users.username,
    email: schema.users.email,
    lastLogin: schema.users.lastLogin,
    userType: schema.userTypes.title,
    userIsActive: schema.users.userIsActive,
  };

  async findAll(params?: PaginationParams): Promise<PaginatedResult<any>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const search = params?.search;

    const conditions = search
      ? or(
          ilike(schema.users.username, `%${search}%`),
          ilike(schema.users.email, `%${search}%`),
        )
      : undefined;

    const where = conditions ? conditions : undefined;

    const [data, countResult] = await Promise.all([
      this.db
        .select(this.userSelect)
        .from(schema.users)
        .leftJoin(schema.userTypes, eq(schema.users.userTypeId, schema.userTypes.id))
        .where(where)
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(schema.users.id),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.users)
        .where(where),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findById(id: number) {
    return this.db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        lastLogin: schema.users.lastLogin,
        userType: schema.userTypes.title,
        userIsActive: schema.users.userIsActive,
      })
      .from(schema.users)
      .leftJoin(schema.userTypes, eq(schema.users.userTypeId, schema.userTypes.id))
      .where(eq(schema.users.id, id));
  }

  findByUsername(username: string) {
    return this.db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        lastLogin: schema.users.lastLogin,
        userType: schema.userTypes.title,
        userIsActive: schema.users.userIsActive,
      })
      .from(schema.users)
      .leftJoin(schema.userTypes, eq(schema.users.userTypeId, schema.userTypes.id))
      .where(eq(schema.users.username, username));
  }

  update(id: number, data: any) {
    if (data.password) data.password = bcrypt.hashSync(data.password, 12);
    return this.db.update(schema.users).set(data).where(eq(schema.users.id, id)).returning();
  }

  updateUserType(id: number, userTypeId: number) {
    return this.db.update(schema.users).set({ userTypeId }).where(eq(schema.users.id, id)).returning();
  }

  delete(id: number) {
    return this.db.delete(schema.users).where(eq(schema.users.id, id)).returning();
  }
}
