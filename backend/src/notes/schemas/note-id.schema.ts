import { z } from 'zod';

export const noteIdSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();

export type NoteIdInput = z.infer<typeof noteIdSchema>;
