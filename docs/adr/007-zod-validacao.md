# 007 - Zod para validação

**Status:** Aceito

## Contexto

Os payloads HTTP precisam rejeitar dados inválidos, campos extras e entradas
grandes antes de chegar à regra de negócio.

## Decisão

Foram criados schemas Zod em `backend/src/auth/schemas/`. Eles usam limites de
tamanho, `.strict()` e normalização de e-mail. Cada rota aplica
`ZodValidationPipe`, definido em
`backend/src/common/pipes/zod-validation.pipe.ts`. Erros retornam HTTP 400 com
os campos inválidos.

## Alternativas consideradas

- `class-validator`: não foi adotado, conforme a escolha explícita registrada
  em `AGENTS.md`.
- Validação manual nos services: repetiria regras e misturaria entrada HTTP com
  regra de negócio.

## Consequências

Os schemas são explícitos e geram tipos com `z.infer`. Em troca, cada rota deve
declarar seu pipe e manter o schema correspondente. Hoje isso existe apenas nas
duas rotas de autenticação.
