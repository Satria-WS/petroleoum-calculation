import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid engineering corporate email'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid corporate email'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['ENGINEER', 'REVIEWER', 'ADMIN']).default('ENGINEER'),
  preferredUnitSystem: z.enum(['FIELD', 'SI']).default('FIELD'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
