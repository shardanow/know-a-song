import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '@know-a-song/database';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'know-a-song-dev-secret';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: { sub: number }) {
    const [user] = await this.db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        userTypeId: schema.users.userTypeId,
        rights: schema.userTypes.rights,
      })
      .from(schema.users)
      .leftJoin(schema.userTypes, eq(schema.users.userTypeId, schema.userTypes.id))
      .where(eq(schema.users.id, payload.sub));

    if (!user) throw new UnauthorizedException();
    return { ...user, rights: JSON.parse(user.rights || '{}') };
  }
}
