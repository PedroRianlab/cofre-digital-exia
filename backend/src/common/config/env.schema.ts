import { z } from 'zod';

const environmentSchema = z
  .object({
    JWT_SECRET: z
      .string()
      .min(32, 'JWT_SECRET deve ter ao menos 32 caracteres'),
    JWT_EXPIRES_IN: z.string().min(1),
    LOGIN_THROTTLE_LIMIT: z.coerce.number().int().positive().default(5),
    REGISTER_THROTTLE_LIMIT: z.coerce.number().int().positive().default(10),
    AUTH_THROTTLE_TTL_MS: z.coerce.number().int().positive().default(60_000),
  })
  .passthrough();

export function validateEnvironment(config: Record<string, unknown>) {
  const result = environmentSchema.safeParse(config);

  if (!result.success) {
    const fields = result.error.issues
      .map((issue) => issue.path.join('.'))
      .join(', ');

    throw new Error(`Variáveis de ambiente inválidas: ${fields}`);
  }

  return result.data;
}
