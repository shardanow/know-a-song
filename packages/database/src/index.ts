import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export function createDb(url?: string) {
  const pool = new Pool({ connectionString: url || process.env.DATABASE_URL });
  return drizzle(pool, { schema });
}

export { schema };
