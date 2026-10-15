import { z } from 'zod';

export const fileIdSchema = z
  .object({
    id: z.uuid(),
  })
  .strict();

export type FileIdInput = z.infer<typeof fileIdSchema>;
