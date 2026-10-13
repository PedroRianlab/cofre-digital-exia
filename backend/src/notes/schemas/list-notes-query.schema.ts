import { z } from 'zod';

export const listNotesQuerySchema = z
  .object({
    categoria: z.string().trim().min(1).max(50).optional(),
  })
  .strict();

export type ListNotesQuery = z.infer<typeof listNotesQuerySchema>;
