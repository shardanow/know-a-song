import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, asc } from 'drizzle-orm';
import { schema } from '@know-a-song/database';

@Injectable()
export class HeroBannerService {
  constructor(
    @Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>,
  ) {}

  async findAll() {
    return this.db
      .select()
      .from(schema.heroBannerSlides)
      .innerJoin(schema.films, eq(schema.heroBannerSlides.filmId, schema.films.id))
      .orderBy(asc(schema.heroBannerSlides.position));
  }

  async replace(slides: { filmId: number; position: number }[]) {
    await this.db.delete(schema.heroBannerSlides);
    if (slides.length > 0) {
      await this.db.insert(schema.heroBannerSlides).values(slides);
    }
    return { updated: true };
  }

  async remove(id: number) {
    await this.db.delete(schema.heroBannerSlides).where(eq(schema.heroBannerSlides.id, id));
    return { removed: true };
  }
}
