import { z } from 'zod';

// Se este schema mudar, atualize também o modelo correspondente do Swagger.
export const createNoteSchema = z
  .object({
    titulo: z.string().trim().min(1).max(120),
    conteudo: z.string().max(10_000),
    categoria: z.string().trim().min(1).max(50).optional(),
  })
  .strict();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
