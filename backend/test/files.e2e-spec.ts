import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { existsSync } from 'node:fs';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import type { Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as request from 'supertest';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/common/prisma/prisma.service';

type TestUser = {
  id: string;
  accessToken: string;
};

type FileResponse = {
  id: string;
  nomeOriginal: string;
  mimeType: string;
  tamanho: number;
  createdAt: string;
  storageKey?: string;
  userId?: string;
};

type ErrorResponse = {
  statusCode: number;
  message: string;
  path: string;
  timestamp: string;
};

const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF');
const wavBuffer = Buffer.from(
  '524946462400000057415645666d74201000000001000100401f0000803e0000020010006461746100000000',
  'hex',
);
const pngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);
const truncatedPngBuffer = Buffer.from('89504e470d0a1a0a', 'hex');

describe('Files (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let prisma: PrismaService;
  let storageDir: string;
  let userA: TestUser;
  let userB: TestUser;
  let pdfA: FileResponse;
  let audioA: FileResponse;
  let imageA: FileResponse;
  let pdfB: FileResponse;

  const previousStorageDir = process.env.STORAGE_DIR;
  const previousMaxUploadMb = process.env.MAX_UPLOAD_MB;
  const uniquePart = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const password = 'Senha-e2e-segura-123';

  beforeAll(async () => {
    storageDir = await mkdtemp(join(tmpdir(), 'cofre-files-e2e-'));
    process.env.STORAGE_DIR = storageDir;
    process.env.MAX_UPLOAD_MB = '1';

    const { AppModule } = await import('../src/app.module');
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    httpServer = app.getHttpServer() as Server;
    prisma = app.get(PrismaService);
    userA = await createUser(`arquivos-a-${uniquePart}@example.com`);
    userB = await createUser(`arquivos-b-${uniquePart}@example.com`);
  });

  afterAll(async () => {
    const userIds = [userA?.id, userB?.id].filter(
      (id): id is string => typeof id === 'string',
    );

    if (userIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }

    await app.close();
    await rm(storageDir, { recursive: true, force: true });
    restoreEnvironment('STORAGE_DIR', previousStorageDir);
    restoreEnvironment('MAX_UPLOAD_MB', previousMaxUploadMb);
  });

  async function createUser(email: string): Promise<TestUser> {
    const registerResponse = await request(httpServer)
      .post('/auth/register')
      .send({ email, senha: password })
      .expect(201);
    const loginResponse = await request(httpServer)
      .post('/auth/login')
      .send({ email, senha: password })
      .expect(200);

    return {
      id: (registerResponse.body as { id: string }).id,
      accessToken: (loginResponse.body as { accessToken: string }).accessToken,
    };
  }

  it('retorna 401 sem token em todas as rotas', async () => {
    const id = '3c45891e-92a2-44d6-a4fb-c2058f5c0ac3';

    await request(httpServer)
      .post('/files')
      .attach('file', pdfBuffer, 'documento.pdf')
      .expect(401);
    await request(httpServer).get('/files').expect(401);
    await request(httpServer).get(`/files/${id}`).expect(401);
    await request(httpServer).get(`/files/${id}/download`).expect(401);
    await request(httpServer).delete(`/files/${id}`).expect(401);
  });

  it('retorna 400 sem arquivo ou com dois arquivos', async () => {
    await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(400);

    await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .attach('file', pdfBuffer, 'primeiro.pdf')
      .attach('file', pdfBuffer, 'segundo.pdf')
      .expect(400);
  });

  it('rejeita texto renomeado, SVG e conteúdo truncado com 415', async () => {
    const fakePdfResponse = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .attach('file', Buffer.from('isto não é um PDF'), 'falso.pdf')
      .expect(415);

    expectStandardError(fakePdfResponse.body as ErrorResponse, 415, '/files');

    const svgResponse = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .attach(
        'file',
        Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
        'imagem.svg',
      )
      .expect(415);

    expectStandardError(svgResponse.body as ErrorResponse, 415, '/files');

    const truncatedResponse = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .attach('file', truncatedPngBuffer, 'imagem-truncada.png')
      .expect(415);

    expectStandardError(truncatedResponse.body as ErrorResponse, 415, '/files');
  });

  it('retorna 413 acima de MAX_UPLOAD_MB', async () => {
    const response = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .attach('file', Buffer.alloc(1024 * 1024 + 1), 'grande.pdf')
      .expect(413);

    expectStandardError(response.body as ErrorResponse, 413, '/files');
  });

  it('envia PDF, áudio e imagem válidos sem expor campos internos', async () => {
    const pdfResponse = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .attach('file', pdfBuffer, '../documento.pdf')
      .expect(201);
    const audioResponse = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .attach('file', wavBuffer, 'áudio-final.wav')
      .expect(201);
    const imageResponse = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .attach('file', pngBuffer, 'imagem.png')
      .expect(201);

    pdfA = pdfResponse.body as FileResponse;
    audioA = audioResponse.body as FileResponse;
    imageA = imageResponse.body as FileResponse;

    expect(pdfA).toMatchObject({
      nomeOriginal: 'documento.pdf',
      mimeType: 'application/pdf',
      tamanho: pdfBuffer.length,
    });
    expect(audioA).toMatchObject({
      nomeOriginal: 'áudio-final.wav',
      mimeType: 'audio/wav',
    });
    expect(imageA.mimeType).toBe('image/png');
    expectPublicMetadata(pdfA);
    expectPublicMetadata(audioA);
    expectPublicMetadata(imageA);

    const saved = await prisma.arquivo.findUnique({ where: { id: pdfA.id } });
    expect(saved?.userId).toBe(userA.id);
    expect(saved?.storageKey).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(existsSync(join(storageDir, saved?.storageKey ?? ''))).toBe(true);
    expect(existsSync(join(storageDir, '..', 'documento.pdf'))).toBe(false);
  });

  it('cria um arquivo para o usuário B', async () => {
    const response = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .attach('file', pdfBuffer, 'privado-b.pdf')
      .expect(201);

    pdfB = response.body as FileResponse;
  });

  it('lista somente os arquivos próprios e sem campos internos', async () => {
    const response = await request(httpServer)
      .get('/files')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);
    const files = response.body as FileResponse[];

    expect(files.map((file) => file.id)).toEqual(
      expect.arrayContaining([pdfA.id, audioA.id, imageA.id]),
    );
    expect(files.some((file) => file.id === pdfB.id)).toBe(false);
    expect(
      files.every(
        (file, index) =>
          index === 0 ||
          new Date(files[index - 1].createdAt).getTime() >=
            new Date(file.createdAt).getTime(),
      ),
    ).toBe(true);
    files.forEach(expectPublicMetadata);
  });

  it('consulta metadados próprios e oculta arquivo alheio', async () => {
    const ownResponse = await request(httpServer)
      .get(`/files/${pdfA.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);

    expect((ownResponse.body as FileResponse).id).toBe(pdfA.id);
    expectPublicMetadata(ownResponse.body as FileResponse);

    const otherResponse = await request(httpServer)
      .get(`/files/${pdfB.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(404);

    expect((otherResponse.body as ErrorResponse).message).toBe(
      'Arquivo não encontrado',
    );
  });

  it('retorna 400 para UUID inválido em rotas com id', async () => {
    const authorization = `Bearer ${userA.accessToken}`;

    await request(httpServer)
      .get('/files/id-invalido')
      .set('Authorization', authorization)
      .expect(400);
    await request(httpServer)
      .get('/files/id-invalido/download')
      .set('Authorization', authorization)
      .expect(400);
    await request(httpServer)
      .delete('/files/id-invalido')
      .set('Authorization', authorization)
      .expect(400);
  });

  it('faz download próprio com cabeçalhos seguros e oculta o alheio', async () => {
    const response = await request(httpServer)
      .get(`/files/${pdfA.id}/download`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);

    expect(response.headers['content-type']).toContain('application/pdf');
    expect(response.headers['content-disposition']).toContain('attachment');
    expect(response.headers['content-disposition']).toContain('documento.pdf');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['cache-control']).toBe('private, no-store');

    await request(httpServer)
      .get(`/files/${pdfB.id}/download`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(404);

    const audioResponse = await request(httpServer)
      .get(`/files/${audioA.id}/download`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);

    expect(audioResponse.headers['content-disposition']).toContain(
      "filename*=UTF-8''%C3%A1udio-final.wav",
    );
  });

  it('não permite excluir arquivo alheio', async () => {
    await request(httpServer)
      .delete(`/files/${pdfB.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(404);

    await expect(
      prisma.arquivo.findUnique({ where: { id: pdfB.id } }),
    ).resolves.not.toBeNull();
  });

  it('exclui registro e arquivo físico próprios', async () => {
    const saved = await prisma.arquivo.findUnique({
      where: { id: imageA.id },
      select: { storageKey: true },
    });
    const physicalPath = join(storageDir, saved?.storageKey ?? '');

    await request(httpServer)
      .delete(`/files/${imageA.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(204);

    expect(existsSync(physicalPath)).toBe(false);
    await expect(
      prisma.arquivo.findUnique({ where: { id: imageA.id } }),
    ).resolves.toBeNull();
  });

  it('salva no disco somente nomes UUID dentro de STORAGE_DIR', async () => {
    const names = await readdir(storageDir);

    expect(names.length).toBeGreaterThan(0);
    expect(
      names.every((name) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          name,
        ),
      ),
    ).toBe(true);
  });

  function expectPublicMetadata(file: FileResponse) {
    expect(file).not.toHaveProperty('storageKey');
    expect(file).not.toHaveProperty('userId');
    expect(typeof file.createdAt).toBe('string');
  }

  function expectStandardError(
    body: ErrorResponse,
    statusCode: number,
    path: string,
  ) {
    expect(body.statusCode).toBe(statusCode);
    expect(typeof body.message).toBe('string');
    expect(body.path).toBe(path);
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  }
});

function restoreEnvironment(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
