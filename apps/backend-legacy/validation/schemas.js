const { z } = require('zod');

const createUserSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(50),
    password: z.string().min(4, 'Password must be at least 4 characters').max(100),
    email: z.string().email('Invalid email format'),
});

const authorizeSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

module.exports = { createUserSchema, authorizeSchema };
