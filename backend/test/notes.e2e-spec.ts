import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/common/prisma/prisma.service';

type TestUser = {
  id: string;
  accessToken: string;
};

type NoteResponse = {
  id: string;
  titulo: string;
  conteudo: string;
  categoria: string | null;
  createdAt: string;
  updatedAt: string;
  userId?: string;
};

type ErrorResponse = {
  statusCode: number;
  message: string;
  fields?: Array<{ field: string; message: string }>;
};

describe('Notes (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let prisma: PrismaService;
  let userA: TestUser;
  let userB: TestUser;
  let noteA: NoteResponse;
  let noteB: NoteResponse;
  let noteWithoutCategoryA: NoteResponse;

  const uniquePart = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const password = 'Senha-e2e-segura-123';

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    httpServer = app.getHttpServer() as Server;
    prisma = app.get(PrismaService);
    userA = await createUser(`notas-a-${uniquePart}@example.com`);
    userB = await createUser(`notas-b-${uniquePart}@example.com`);
  });

  afterAll(async () => {
    const userIds = [userA?.id, userB?.id].filter(
      (id): id is string => typeof id === 'string',
    );

    if (userIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }

    await app.close();
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
    const id = randomUUID();

    await request(httpServer)
      .post('/notes')
      .send({ titulo: 'Título', conteudo: 'Conteúdo' })
      .expect(401);
    await request(httpServer).get('/notes').expect(401);
    await request(httpServer).get(`/notes/${id}`).expect(401);
    await request(httpServer)
      .patch(`/notes/${id}`)
      .send({ titulo: 'Novo título' })
      .expect(401);
    await request(httpServer).delete(`/notes/${id}`).expect(401);
  });

  it('retorna 400 para id que não é UUID', async () => {
    const response = await request(httpServer)
      .get('/notes/id-invalido')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(400);
    const body = response.body as unknown as ErrorResponse;

    expect(body.fields).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'id' })]),
    );
  });

  it('retorna 400 quando a criação viola o limite do Zod', async () => {
    const response = await request(httpServer)
      .post('/notes')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({ titulo: 'a'.repeat(121), conteudo: 'Conteúdo' })
      .expect(400);
    const body = response.body as unknown as ErrorResponse;

    expect(body.fields).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'titulo' })]),
    );
  });

  it('retorna 400 quando a criação recebe campo extra', async () => {
    const response = await request(httpServer)
      .post('/notes')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({ titulo: 'Título', conteudo: 'Conteúdo', userId: userB.id })
      .expect(400);
    const body = response.body as unknown as ErrorResponse;

    expect(body.fields).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'body' })]),
    );
  });

  it('RF03 cria nota com o userId obtido do token', async () => {
    const response = await request(httpServer)
      .post('/notes')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({
        titulo: 'Nota do usuário A',
        conteudo: 'Conteúdo original',
        categoria: ' Trabalho ',
      })
      .expect(201);
    const body = response.body as unknown as NoteResponse;

    noteA = body;
    expect(noteA).toMatchObject({
      titulo: 'Nota do usuário A',
      conteudo: 'Conteúdo original',
      categoria: 'Trabalho',
    });
    expect(noteA).not.toHaveProperty('userId');

    const savedNote = await prisma.note.findUnique({
      where: { id: noteA.id },
    });
    expect(savedNote?.userId).toBe(userA.id);
  });

  it('cria nota sem categoria', async () => {
    const response = await request(httpServer)
      .post('/notes')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({ titulo: 'Nota sem categoria', conteudo: 'Conteúdo livre' })
      .expect(201);

    const body = response.body as unknown as NoteResponse;

    noteWithoutCategoryA = body;
    expect(noteWithoutCategoryA.categoria).toBeNull();
  });

  it('cria uma nota para o segundo usuário', async () => {
    const response = await request(httpServer)
      .post('/notes')
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .send({
        titulo: 'Nota do usuário B',
        conteudo: 'Conteúdo privado B',
        categoria: 'Trabalho',
      })
      .expect(201);
    const body = response.body as unknown as NoteResponse;

    noteB = body;
  });

  it('RF04 lista somente as notas do usuário autenticado', async () => {
    const response = await request(httpServer)
      .get('/notes')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);
    const notes = response.body as unknown as NoteResponse[];

    expect(notes.some((note) => note.id === noteA.id)).toBe(true);
    expect(notes.some((note) => note.id === noteWithoutCategoryA.id)).toBe(
      true,
    );
    expect(notes.some((note) => note.id === noteB.id)).toBe(false);
    expect(notes.every((note) => !('userId' in note))).toBe(true);
  });

  it('filtra por categoria mantendo o isolamento por usuário', async () => {
    const response = await request(httpServer)
      .get('/notes')
      .query({ categoria: 'Trabalho' })
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);
    const notes = response.body as unknown as NoteResponse[];

    expect(notes.map((note) => note.id)).toEqual([noteA.id]);
    expect(notes.some((note) => note.id === noteB.id)).toBe(false);
  });

  it('retorna 400 para categoria longa ou parâmetro desconhecido na query', async () => {
    await request(httpServer)
      .get('/notes')
      .query({ categoria: 'a'.repeat(51) })
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(400);

    await request(httpServer)
      .get('/notes')
      .query({ desconhecido: 'valor' })
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(400);
  });

  it('RF05 retorna a própria nota', async () => {
    const response = await request(httpServer)
      .get(`/notes/${noteA.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);
    const body = response.body as unknown as NoteResponse;

    expect(body.id).toBe(noteA.id);
    expect(body).not.toHaveProperty('userId');
  });

  it('RF05 retorna 404 para nota inexistente', async () => {
    const response = await request(httpServer)
      .get(`/notes/${randomUUID()}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(404);
    const body = response.body as unknown as ErrorResponse;

    expect(body.message).toBe('Nota não encontrada');
  });

  it('RF05 retorna 404 ao visualizar nota de outro usuário', async () => {
    const response = await request(httpServer)
      .get(`/notes/${noteB.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(404);
    const body = response.body as unknown as ErrorResponse;

    expect(body.message).toBe('Nota não encontrada');
  });

  it('RF06 retorna 400 para atualização vazia ou acima do limite', async () => {
    await request(httpServer)
      .patch(`/notes/${noteA.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({})
      .expect(400);
    await request(httpServer)
      .patch(`/notes/${noteA.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({ conteudo: 'a'.repeat(10_001) })
      .expect(400);
  });

  it('RF06 atualiza somente a nota própria', async () => {
    const response = await request(httpServer)
      .patch(`/notes/${noteA.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({ titulo: 'Título atualizado' })
      .expect(200);
    const body = response.body as unknown as NoteResponse;

    expect(body.titulo).toBe('Título atualizado');
    expect(body.conteudo).toBe('Conteúdo original');
    expect(body).not.toHaveProperty('userId');
  });

  it('edita a categoria da nota própria', async () => {
    const response = await request(httpServer)
      .patch(`/notes/${noteA.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({ categoria: ' Estudos ' })
      .expect(200);
    const body = response.body as unknown as NoteResponse;

    expect(body.categoria).toBe('Estudos');
  });

  it('retorna lista vazia quando a categoria existe somente para o usuário B', async () => {
    const response = await request(httpServer)
      .get('/notes')
      .query({ categoria: 'Trabalho' })
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('RF06 retorna 404 ao editar nota de outro usuário', async () => {
    const response = await request(httpServer)
      .patch(`/notes/${noteB.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({ titulo: 'Tentativa de alteração' })
      .expect(404);
    const body = response.body as unknown as ErrorResponse;

    expect(body.message).toBe('Nota não encontrada');

    const unchangedNote = await prisma.note.findUnique({
      where: { id: noteB.id },
    });
    expect(unchangedNote?.titulo).toBe('Nota do usuário B');
  });

  it('RF07 retorna 404 ao remover nota de outro usuário', async () => {
    const response = await request(httpServer)
      .delete(`/notes/${noteB.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(404);
    const body = response.body as unknown as ErrorResponse;

    expect(body.message).toBe('Nota não encontrada');
    await expect(
      prisma.note.findUnique({ where: { id: noteB.id } }),
    ).resolves.not.toBeNull();
  });

  it('RF07 remove a própria nota e retorna 204 sem body', async () => {
    const response = await request(httpServer)
      .delete(`/notes/${noteA.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(204);

    expect(response.text).toBe('');
    await request(httpServer)
      .get(`/notes/${noteA.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(404);
  });
});
