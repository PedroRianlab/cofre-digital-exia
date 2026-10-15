import { Controller, HttpCode, INestApplication, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import * as request from 'supertest';
import { configureCors } from '../src/common/http/configure-cors';

@Controller('__test')
class CorsTestController {
  @Post('cors')
  @HttpCode(204)
  testCors() {}
}

describe('CORS (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;

  const allowedOrigin = 'http://localhost:3001';

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      controllers: [CorsTestController],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureCors(app, allowedOrigin);
    await app.init();
    httpServer = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('libera a origem configurada no preflight', async () => {
    const response = await request(httpServer)
      .options('/__test/cors')
      .set('Origin', allowedOrigin)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'authorization,content-type')
      .expect(204);

    expect(response.headers['access-control-allow-origin']).toBe(allowedOrigin);
    expect(response.headers['access-control-allow-methods']).toContain('POST');
    expect(response.headers['access-control-allow-headers']).toContain(
      'Authorization',
    );
  });

  it('nao libera uma origem diferente', async () => {
    const response = await request(httpServer)
      .options('/__test/cors')
      .set('Origin', 'http://origem-nao-permitida.example')
      .set('Access-Control-Request-Method', 'POST');

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
