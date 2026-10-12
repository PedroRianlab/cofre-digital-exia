import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    senha: z.string().min(8).max(128),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
