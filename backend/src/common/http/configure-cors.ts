import type { INestApplication } from '@nestjs/common';
import type { CustomOrigin } from '@nestjs/common/interfaces/external/cors-options.interface';

const ALLOWED_METHODS = ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'];
const ALLOWED_HEADERS = ['Authorization', 'Content-Type'];

export function configureCors(app: INestApplication, allowedOrigin: string) {
  const validateOrigin: CustomOrigin = (origin, callback) => {
    const isAllowed = !origin || origin === allowedOrigin;
    callback(null, isAllowed);
  };

  app.enableCors({
    origin: validateOrigin,
    methods: ALLOWED_METHODS,
    allowedHeaders: ALLOWED_HEADERS,
  });
}
