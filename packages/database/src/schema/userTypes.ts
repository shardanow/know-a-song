import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const userTypes = pgTable('UserType', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 50 }).notNull().unique(),
  rights: varchar('rights', { length: 255 }).notNull().default('{}'),
});
