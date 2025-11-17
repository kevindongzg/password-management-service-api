import { z } from 'zod';
import { ValidationError } from './errors';

export const initiateSchema = z.object({
  email: z
    .string({ required_error: 'Missing email' })
    .transform(s => s.trim())
    .pipe(z.string().email('Invalid email')),
});

export const executeSchema = z.object({
  email: z
    .string({ required_error: 'Missing email' })
    .transform(s => s.trim())
    .pipe(z.string().email('Invalid email')),
  code: z
    .string({ required_error: 'Missing code' })
    .transform(s => s.trim())
    .pipe(z.string().regex(/^\d{6}$/, 'Invalid code format')),
  newPassword: z
    .string({ required_error: 'Missing newPassword' })
    .min(8, 'Password too short'),
});

export function parseOrThrow<T>(schema: z.ZodType<T>, body: object): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }));
    throw new ValidationError(details);
  }
  return parsed.data as T;
}
