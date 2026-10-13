import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Server } from 'node:http';
import * as request from 'supertest';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { configureBodyParser } from '../src/common/http/configure-body-parser';
import { PrismaService } from '../src/common/prisma/prisma.service';

type ErrorResponse = {
  statusCode: number;
  message: string;
  path: string;
  timestamp: string;
};

describe('Hardening de requisições (e2e)', () => {
  let app: NestExpressApplication;
  let httpServer: Server;
  let prisma: PrismaService;
  let createdUserId: string | undefined;
  let accessToken = '';

  const previousGlobalLimit = process.env.GLOBAL_THROTTLE_LIMIT;
  const previousLoginLimit = process.env.LOGIN_THROTTLE_LIMIT;
  const uniquePart = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const email = `hardening-${uniquePart}@example.com`;
  const password = 'Senha-valida-123';

  beforeAll(async () => {
    process.env.GLOBAL_THROTTLE_LIMIT = '1';
    process.env.LOGIN_THROTTLE_LIMIT = '3';

    const { AppModule } = await import('../src/app.module');
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    configureBodyParser(app);
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    httpServer = app.getHttpServer();
    prisma = app.get(PrismaService);

    const registerResponse = await request(httpServer)
      .post('/auth/register')
      .send({ email, senha: password })
      .expect(201);
    createdUserId = (registerResponse.body as { id: string }).id;

    const loginResponse = await request(httpServer)
      .post('/auth/login')
      .send({ email, senha: password })
      .expect(200);
    accessToken = (loginResponse.body as { accessToken: string }).accessToken;
  });

  afterAll(async () => {
    if (createdUserId) {
      await prisma.user.deleteMany({ where: { id: createdUserId } });
    }

    if (app) {
      await app.close();
    }
    setEnvironmentValue('GLOBAL_THROTTLE_LIMIT', previousGlobalLimit);
    setEnvironmentValue('LOGIN_THROTTLE_LIMIT', previousLoginLimit);
  });

  it('mantém o limite do login separado do limite global', async () => {
    await request(httpServer)
      .post('/auth/login')
      .send({ email, senha: password })
      .expect(200);

    await request(httpServer)
      .post('/auth/login')
      .send({ email, senha: password })
      .expect(200);

    const response = await request(httpServer)
      .post('/auth/login')
      .send({ email, senha: password })
      .expect(429);
    const body = response.body as unknown as ErrorResponse;

    expectStandardError(body, 429, '/auth/login');
  });

  it('retorna 429 acima do limite global em rota autenticada', async () => {
    await request(httpServer)
      .get('/notes')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const response = await request(httpServer)
      .get('/notes')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(429);
    const body = response.body as unknown as ErrorResponse;

    expectStandardError(body, 429, '/notes');
  });

  it('retorna 413 no formato global para body acima de 100 KB', async () => {
    const response = await request(httpServer)
      .post('/auth/register')
      .send({
        email: `grande-${uniquePart}@example.com`,
        senha: password,
        texto: 'a'.repeat(101 * 1024),
      })
      .expect(413);
    const body = response.body as unknown as ErrorResponse;

    expectStandardError(body, 413, '/auth/register');
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

  function setEnvironmentValue(name: string, value: string | undefined) {
    if (value === undefined) {
      delete process.env[name];
      return;
    }

    process.env[name] = value;
  }
});
