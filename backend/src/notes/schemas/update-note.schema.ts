import { z } from 'zod';

// Se este schema mudar, atualize também o modelo correspondente do Swagger.
export const updateNoteSchema = z
  .object({
    titulo: z.string().trim().min(1).max(120).optional(),
    conteudo: z.string().max(10_000).optional(),
    categoria: z.string().trim().min(1).max(50).optional(),
  })
  .strict()
  .refine(
    (input) =>
      input.titulo !== undefined ||
      input.conteudo !== undefined ||
      input.categoria !== undefined,
    { message: 'Informe ao menos um campo' },
  );

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
