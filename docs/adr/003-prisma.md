# 003 - Prisma

**Status:** Aceito

## Contexto

A aplicação precisa persistir usuários e notas em PostgreSQL com tipos
compatíveis com TypeScript e mudanças de banco versionadas.

## Decisão

Foi adotado Prisma 6. O schema está em `backend/prisma/schema.prisma` e a
migration inicial em `backend/prisma/migrations/`. `PrismaService`, em
`backend/src/common/prisma/prisma.service.ts`, controla conexão e desconexão.
Hoje, `UsersRepository` é o único repository que executa consultas.

## Alternativas consideradas

- SQL escrito diretamente: daria mais controle, mas exigiria mapeamento manual
  e mais código de infraestrutura.
- Outro ORM, como TypeORM: adicionaria um modelo diferente de entidades e
  migrations sem benefício necessário para este MVP.

## Consequências

O schema, o cliente tipado e as migrations ficam centralizados. Em troca, o
projeto depende da geração do Prisma Client e das convenções do Prisma.
