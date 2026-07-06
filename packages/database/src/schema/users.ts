import { pgTable, serial, integer, varchar, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { userTypes } from './userTypes';

export const users = pgTable('Users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  email: varchar('email', { length: 100 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  token: varchar('token', { length: 50 }).unique().notNull(),
  lastLogin: timestamp('last_login').defaultNow(),
  userTypeId: integer('user_type_id').notNull().default(1),
  userIsActive: integer('user_is_active').notNull().default(0),
}, (table) => [
  foreignKey({ columns: [table.userTypeId], foreignColumns: [userTypes.id] }),
]);
