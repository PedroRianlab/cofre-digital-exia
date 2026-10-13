import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import helmet from 'helmet';
import type { Server } from 'node:http';
import * as request from 'supertest';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/common/prisma/prisma.service';

type ErrorResponse = {
  statusCode: number;
  message: string;
  path: string;
  timestamp: string;
};

describe('Throttling e Helmet (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let prisma: PrismaService;
  let createdUserId: string | undefined;

  const previousLoginLimit = process.env.LOGIN_THROTTLE_LIMIT;
  const previousRegisterLimit = process.env.REGISTER_THROTTLE_LIMIT;
  const uniquePart = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const email = `throttle-${uniquePart}@example.com`;
  const password = 'Senha-valida-123';

  beforeAll(async () => {
    process.env.LOGIN_THROTTLE_LIMIT = '5';
    process.env.REGISTER_THROTTLE_LIMIT = '2';

    const { AppModule } = await import('../src/app.module');
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(helmet());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    httpServer = app.getHttpServer() as Server;
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (createdUserId) {
      await prisma.user.deleteMany({ where: { id: createdUserId } });
    }

    await app.close();
    restoreEnvironment();
  });

  it('aplica os cabeçalhos de segurança do Helmet', async () => {
    const response = await request(httpServer).get('/').expect(404);

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('retorna 429 na sexta tentativa de login por IP', async () => {
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      await request(httpServer)
        .post('/auth/login')
        .send({
          email: `inexistente-${uniquePart}@example.com`,
          senha: password,
        })
        .expect(401);
    }

    const response = await request(httpServer)
      .post('/auth/login')
      .send({ email: `inexistente-${uniquePart}@example.com`, senha: password })
      .expect(429);
    const body = response.body as unknown as ErrorResponse;

    expectStandardError(body, 429, '/auth/login');
  });

  it('limita também as tentativas de cadastro', async () => {
    const registerResponse = await request(httpServer)
      .post('/auth/register')
      .send({ email, senha: password })
      .expect(201);
    createdUserId = (registerResponse.body as { id: string }).id;

    await request(httpServer)
      .post('/auth/register')
      .send({ email, senha: password })
      .expect(409);

    const response = await request(httpServer)
      .post('/auth/register')
      .send({ email, senha: password })
      .expect(429);
    const body = response.body as unknown as ErrorResponse;

    expectStandardError(body, 429, '/auth/register');
  });

  function expectStandardError(
    body: ErrorResponse,
    statusCode: number,
    path: string,
  ) {
    expect(body.statusCode).toBe(statusCode);
    expect(typeof body.message).toBe('string');
    expect(body.path).toBe(path);
    expect(typeof body.timestamp).toBe('string');
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  }

  function restoreEnvironment() {
    setEnvironmentValue('LOGIN_THROTTLE_LIMIT', previousLoginLimit);
    setEnvironmentValue('REGISTER_THROTTLE_LIMIT', previousRegisterLimit);
  }

  function setEnvironmentValue(name: string, value: string | undefined) {
    if (value === undefined) {
      delete process.env[name];
      return;
    }

    process.env[name] = value;
  }
});
