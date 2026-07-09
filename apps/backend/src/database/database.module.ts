import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { schema } from '@know-a-song/database';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:root@localhost:5432/knowasong';

@Global()
@Module({
  providers: [
    {
      provide: 'DRIZZLE',
      useFactory: () => {
        const pool = new Pool({ connectionString: DATABASE_URL });
        return drizzle(pool, { schema });
      },
    },
  ],
  exports: ['DRIZZLE'],
})
export class DatabaseModule {}
