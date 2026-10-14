import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodError, ZodType } from 'zod';

export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const fields = error.issues.map((issue) => ({
          field: issue.path.join('.') || 'body',
          message: issue.message,
        }));

        throw new BadRequestException({
          message: 'Dados inválidos',
          fields,
        });
      }

      throw error;
    }
  }
}
