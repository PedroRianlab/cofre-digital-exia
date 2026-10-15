import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { mkdtemp, rm } from 'node:fs/promises';
import type { Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as request from 'supertest';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/common/prisma/prisma.service';

const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF');

describe('Upload throttling (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let prisma: PrismaService;
  let storageDir: string;
  let userId: string;
  let accessToken: string;

  const previousStorageDir = process.env.STORAGE_DIR;
  const previousUploadLimit = process.env.UPLOAD_THROTTLE_LIMIT;
  const uniquePart = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

  beforeAll(async () => {
    storageDir = await mkdtemp(join(tmpdir(), 'cofre-files-throttle-e2e-'));
    process.env.STORAGE_DIR = storageDir;
    process.env.UPLOAD_THROTTLE_LIMIT = '2';

    const { AppModule } = await import('../src/app.module');
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    httpServer = app.getHttpServer() as Server;
    prisma = app.get(PrismaService);

    const email = `upload-throttle-${uniquePart}@example.com`;
    const registerResponse = await request(httpServer)
      .post('/auth/register')
      .send({ email, senha: 'Senha-e2e-segura-123' })
      .expect(201);
    const loginResponse = await request(httpServer)
      .post('/auth/login')
      .send({ email, senha: 'Senha-e2e-segura-123' })
      .expect(200);

    userId = (registerResponse.body as { id: string }).id;
    accessToken = (loginResponse.body as { accessToken: string }).accessToken;
  });

  afterAll(async () => {
    if (userId) {
      await prisma.user.deleteMany({ where: { id: userId } });
    }

    await app.close();
    await rm(storageDir, { recursive: true, force: true });
    restoreEnvironment('STORAGE_DIR', previousStorageDir);
    restoreEnvironment('UPLOAD_THROTTLE_LIMIT', previousUploadLimit);
  });

  it('retorna 429 ao ultrapassar UPLOAD_THROTTLE_LIMIT', async () => {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', pdfBuffer, `documento-${attempt}.pdf`)
        .expect(201);
    }

    const response = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', pdfBuffer, 'bloqueado.pdf')
      .expect(429);
    const body = response.body as {
      statusCode: number;
      message: string;
      path: string;
    };

    expect(body.statusCode).toBe(429);
    expect(body.path).toBe('/files');
    expect(typeof body.message).toBe('string');
  });
});

function restoreEnvironment(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
