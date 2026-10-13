import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  INestApplication,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import * as request from 'supertest';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

type ErrorResponse = {
  statusCode: number;
  message: string;
  path: string;
  timestamp: string;
};

@Controller('__test/errors')
class ErrorTestController {
  @Get('bad-request')
  badRequest(): never {
    throw new BadRequestException('Dados inválidos');
  }

  @Get('unauthorized')
  unauthorized(): never {
    throw new UnauthorizedException('Não autorizado');
  }

  @Get('forbidden')
  forbidden(): never {
    throw new ForbiddenException('Acesso proibido');
  }

  @Get('not-found')
  notFound(): never {
    throw new NotFoundException('Recurso não encontrado');
  }

  @Get('internal')
  internal(): never {
    throw new Error('detalhe interno secreto');
  }
}

describe('HttpExceptionFilter (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      controllers: [ErrorTestController],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    httpServer = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  const httpErrors = [
    {
      route: 'bad-request',
      statusCode: 400,
      message: 'Dados inválidos',
    },
    {
      route: 'unauthorized',
      statusCode: 401,
      message: 'Não autorizado',
    },
    {
      route: 'forbidden',
      statusCode: 403,
      message: 'Acesso proibido',
    },
    {
      route: 'not-found',
      statusCode: 404,
      message: 'Recurso não encontrado',
    },
  ] as const;

  it.each(httpErrors)(
    'padroniza o erro $statusCode',
    async ({ route, statusCode, message }) => {
      const path = `/__test/errors/${route}`;
      const response = await request(httpServer).get(path).expect(statusCode);
      const body = response.body as unknown as ErrorResponse;

      expectStandardError(body, statusCode, message, path);
    },
  );

  it('padroniza, oculta e registra o erro 500', async () => {
    const loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const path = '/__test/errors/internal';

    try {
      const response = await request(httpServer).get(path).expect(500);
      const body = response.body as unknown as ErrorResponse;

      expectStandardError(body, 500, 'Erro interno do servidor', path);
      expect(JSON.stringify(body)).not.toContain('detalhe interno secreto');
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Erro interno em GET ${path}`,
        expect.stringContaining('detalhe interno secreto'),
      );
    } finally {
      loggerErrorSpy.mockRestore();
    }
  });

  function expectStandardError(
    body: ErrorResponse,
    statusCode: number,
    message: string,
    path: string,
  ) {
    expect(body.statusCode).toBe(statusCode);
    expect(body.message).toBe(message);
    expect(body.path).toBe(path);
    expect(typeof body.timestamp).toBe('string');
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  }
});
