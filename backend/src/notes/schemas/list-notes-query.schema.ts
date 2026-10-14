import { z } from 'zod';

// Se este schema mudar, atualize também o modelo correspondente do Swagger.
export const listNotesQuerySchema = z
  .object({
    categoria: z.string().trim().min(1).max(50).optional(),
  })
  .strict();

export type ListNotesQuery = z.infer<typeof listNotesQuerySchema>;
