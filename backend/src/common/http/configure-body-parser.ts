import { PayloadTooLargeException } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';

type BodyParserError = {
  status?: number;
  type?: string;
};

function isPayloadTooLargeError(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const bodyParserError = error as BodyParserError;

  return (
    bodyParserError.status === 413 &&
    bodyParserError.type === 'entity.too.large'
  );
}

export function configureBodyParser(app: NestExpressApplication) {
  app.useBodyParser('json', { limit: '100kb' });
  app.use(
    (
      error: unknown,
      _request: Request,
      _response: Response,
      next: NextFunction,
    ) => {
      if (isPayloadTooLargeError(error)) {
        next(
          new PayloadTooLargeException(
            'Corpo da requisição excede o limite de 100 KB',
          ),
        );
        return;
      }

      next(error);
    },
  );
}
