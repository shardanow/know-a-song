import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { schema } from '@know-a-song/database';

@Injectable()
export class FilmFavoritesService {
  constructor(
    @Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>,
  ) {}

  async getFavorites(ownerId: number) {
    return this.db
      .select()
      .from(schema.filmFavorites)
      .innerJoin(schema.films, eq(schema.filmFavorites.filmId, schema.films.id))
      .where(eq(schema.filmFavorites.ownerId, ownerId));
  }

  async toggleFavorite(filmId: number, ownerId: number) {
    const existing = await this.db
      .select()
      .from(schema.filmFavorites)
      .where(
        and(
          eq(schema.filmFavorites.filmId, filmId),
          eq(schema.filmFavorites.ownerId, ownerId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      await this.db
        .delete(schema.filmFavorites)
        .where(
          and(
            eq(schema.filmFavorites.filmId, filmId),
            eq(schema.filmFavorites.ownerId, ownerId),
          ),
        );
      return { favorited: false };
    }

    await this.db.insert(schema.filmFavorites).values({ filmId, ownerId });
    return { favorited: true };
  }
}
