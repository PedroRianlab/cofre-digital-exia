# 002 - Jest para testes e2e

**Status:** Aceito

## Contexto

Cadastro e login precisam ser verificados pela interface HTTP e com acesso real
ao banco.

## Decisão

Foi adotado Jest com `ts-jest`, `@nestjs/testing` e Supertest. O script
`test:e2e` está em `backend/package.json`. A configuração fica em
`backend/test/jest-e2e.json` e os casos atuais em
`backend/test/auth.e2e-spec.ts`.

## Alternativas consideradas

- Testes apenas unitários: não cobririam controller, validação, Prisma e banco
  no mesmo fluxo.
- O executor nativo do Node: não foi adotado porque o projeto já usa as
  ferramentas de teste integradas ao ecossistema NestJS.

## Consequências

Os testes exercitam a aplicação de ponta a ponta e detectam falhas de
integração. Em troca, precisam de PostgreSQL disponível e são mais lentos que
testes unitários.
