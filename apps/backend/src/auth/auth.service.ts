import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { schema } from '@know-a-song/database';

const REFRESH_TOKEN_BYTES = 24;

@Injectable()
export class AuthService {
  constructor(
    @Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
  ) {}

  async register(username: string, email: string, password: string) {
    const existing = await this.db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.username, username));

    if (existing.length) throw new ConflictException('Username already exists');

    let [userType] = await this.db
      .select({ id: schema.userTypes.id })
      .from(schema.userTypes)
      .where(eq(schema.userTypes.title, 'User'))
      .limit(1);

    if (!userType) {
      const [created] = await this.db
        .insert(schema.userTypes)
        .values({ title: 'User', rights: '{}' })
        .returning({ id: schema.userTypes.id });
      userType = created;
    }

    const hash = await bcrypt.hash(password, 12);
    const [user] = await this.db
      .insert(schema.users)
      .values({ username, email, password: hash, token: '', userTypeId: userType.id })
      .returning({ id: schema.users.id });

    return this.generateTokens(user.id);
  }

  async validateUser(username: string, password: string) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username));

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user.id);
  }

  async refresh(refreshToken: string) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.token, refreshToken));

    if (!user) throw new UnauthorizedException('Invalid refresh token');

    return this.generateTokens(user.id);
  }

  async logout(userId: number) {
    await this.db
      .update(schema.users)
      .set({ token: '' })
      .where(eq(schema.users.id, userId));
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!user) throw new UnauthorizedException('User not found');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    const hash = await bcrypt.hash(newPassword, 12);
    await this.db
      .update(schema.users)
      .set({ password: hash })
      .where(eq(schema.users.id, userId));

    return { message: 'Password updated' };
  }

  private async generateTokens(userId: number) {
    const accessToken = this.jwtService.sign({ sub: userId });
    const refreshToken = randomBytes(REFRESH_TOKEN_BYTES).toString('hex');

    await this.db
      .update(schema.users)
      .set({ token: refreshToken })
      .where(eq(schema.users.id, userId));

    return { accessToken, refreshToken };
  }
}
