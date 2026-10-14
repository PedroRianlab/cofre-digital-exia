import { z } from 'zod';

// Se este schema mudar, atualize também o modelo correspondente do Swagger.
export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    senha: z.string().min(1).max(128),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;
