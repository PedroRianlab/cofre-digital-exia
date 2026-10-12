import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as argon2 from 'argon2';
import type { Server } from 'node:http';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/common/prisma/prisma.service';

type ErrorResponse = {
  statusCode: number;
  message: string;
  fields?: Array<{ field: string; message: string }>;
};

type RegisterResponse = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type LoginResponse = {
  accessToken: string;
};

type JwtHeader = {
  alg: string;
};

@Controller('__test')
class InternalErrorController {
  @Get('error')
  throwError(): never {
    throw new Error('detalhe interno que nao pode vazar');
  }
}

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let prisma: PrismaService;
  let createdUserId: string | undefined;

  const uniquePart = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const emailInput = ` E2E-${uniquePart}@Example.COM `;
  const normalizedEmail = emailInput.trim().toLowerCase();
  const password = 'Senha-e2e-segura-123';

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [InternalErrorController],
    }).compile();

    app = moduleFixture.createNestApplication();
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
  });

  it('retorna 400 e os campos invalidos', async () => {
    const response = await request(httpServer)
      .post('/auth/register')
      .send({ email: 'email-invalido', senha: 'curta', extra: true })
      .expect(400);
    const body = response.body as unknown as ErrorResponse;
    const invalidFields = body.fields?.map((field) => field.field);

    expect(body.message).toBe('Dados inválidos');
    expect(invalidFields).toEqual(expect.arrayContaining(['email', 'senha']));
  });

  it('cadastra com e-mail normalizado e senha Argon2', async () => {
    const response = await request(httpServer)
      .post('/auth/register')
      .send({ email: emailInput, senha: password })
      .expect(201);
    const body = response.body as unknown as RegisterResponse;

    createdUserId = body.id;
    expect(body.email).toBe(normalizedEmail);
    expect(body).not.toHaveProperty('senhaHash');

    const savedUser = await prisma.user.findUnique({
      where: { id: createdUserId },
    });

    expect(savedUser?.senhaHash).toMatch(/^\$argon2id\$/);
    expect(savedUser?.senhaHash).not.toBe(password);
    await expect(argon2.verify(savedUser!.senhaHash, password)).resolves.toBe(
      true,
    );
  });

  it('retorna 409 para e-mail repetido', async () => {
    const response = await request(httpServer)
      .post('/auth/register')
      .send({ email: normalizedEmail, senha: password })
      .expect(409);
    const body = response.body as unknown as ErrorResponse;

    expect(body.message).toBe('E-mail já cadastrado');
  });

  it('devolve JWT para credenciais corretas', async () => {
    const response = await request(httpServer)
      .post('/auth/login')
      .send({ email: emailInput, senha: password })
      .expect(200);
    const body = response.body as unknown as LoginResponse;
    const encodedHeader = body.accessToken.split('.')[0];
    const header = JSON.parse(
      Buffer.from(encodedHeader, 'base64url').toString('utf8'),
    ) as JwtHeader;

    expect(typeof body.accessToken).toBe('string');
    expect(body.accessToken.split('.')).toHaveLength(3);
    expect(header.alg).toBe('HS256');
  });

  it('usa a mesma mensagem para senha errada e e-mail inexistente', async () => {
    const wrongPasswordResponse = await request(httpServer)
      .post('/auth/login')
      .send({ email: normalizedEmail, senha: 'senha-incorreta' })
      .expect(401);
    const missingEmailResponse = await request(httpServer)
      .post('/auth/login')
      .send({ email: `ausente-${uniquePart}@example.com`, senha: password })
      .expect(401);
    const wrongPasswordBody =
      wrongPasswordResponse.body as unknown as ErrorResponse;
    const missingEmailBody =
      missingEmailResponse.body as unknown as ErrorResponse;

    expect(wrongPasswordBody.message).toBe('credenciais inválidas');
    expect(missingEmailBody.message).toBe('credenciais inválidas');
  });

  it('nao expoe detalhes internos em erros 500', async () => {
    const response = await request(httpServer).get('/__test/error').expect(500);
    const body = response.body as unknown as ErrorResponse;

    expect(body.message).toBe('Erro interno do servidor');
    expect(JSON.stringify(body)).not.toContain('detalhe interno');
  });
});
