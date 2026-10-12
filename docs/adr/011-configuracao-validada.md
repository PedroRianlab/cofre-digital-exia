# 011 - Configuração do ambiente validada na inicialização

**Status:** Aceito

## Contexto

A API depende de segredo e validade do JWT. Iniciar com esses valores ausentes
ou inválidos produziria erros posteriores e menos claros.

## Decisão

`ConfigModule` é global e chama `validateEnvironment` em
`backend/src/app.module.ts`. O schema de
`backend/src/common/config/env.schema.ts` exige `JWT_SECRET` com pelo menos 32
caracteres e `JWT_EXPIRES_IN` não vazio. Outras variáveis são aceitas com
`.passthrough()`.

## Alternativas consideradas

- Ler somente `process.env` nos pontos de uso: adiaria a descoberta de erros de
  configuração.
- Validar todas as variáveis no schema atual: não foi implementado; hoje o
  Prisma trata a necessidade de `DATABASE_URL` separadamente.

## Consequências

Erros nas variáveis do JWT interrompem a inicialização com indicação dos campos.
Em troca, existe um schema adicional para manter. A validação é parcial e não
cobre as variáveis do PostgreSQL.
