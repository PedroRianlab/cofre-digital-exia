import { z } from 'zod';

export const updateNoteSchema = z
  .object({
    titulo: z.string().trim().min(1).max(120).optional(),
    conteudo: z.string().max(10_000).optional(),
  })
  .strict()
  .refine(
    (input) => input.titulo !== undefined || input.conteudo !== undefined,
    { message: 'Informe ao menos um campo' },
  );

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
