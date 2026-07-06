import { z } from 'zod';

export const userTypeSchema = z.object({
  id: z.number(),
  title: z.string().max(50),
  rights: z.record(z.boolean()),
});

export const userSchema = z.object({
  id: z.number(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string(),
  token: z.string(),
  lastLogin: z.string().datetime().nullable(),
  userTypeId: z.number().default(1),
  userIsActive: z.number().min(0).max(1).default(0),
});

export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(4).max(100),
});

export const authorizeSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UserType = z.infer<typeof userTypeSchema>;
