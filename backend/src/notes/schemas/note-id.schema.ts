import { z } from 'zod';

// Se este schema mudar, atualize também o modelo correspondente do Swagger.
export const noteIdSchema = z
  .object({
    id: z.uuid(),
  })
  .strict();

export type NoteIdInput = z.infer<typeof noteIdSchema>;
