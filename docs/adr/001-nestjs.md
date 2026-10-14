# 001 - NestJS

**Status:** Aceito

## Contexto

A API precisa expor rotas HTTP em TypeScript e separar responsabilidades sem
introduzir uma arquitetura maior que o MVP.

## Decisão

Foi adotado NestJS 11. `backend/src/main.ts` cria a aplicação com
`NestFactory`. `backend/src/app.module.ts` reúne os módulos. Controllers,
services e repositories usam os decorators e a injeção de dependências do Nest.

## Alternativas consideradas

- Express direto: exigiria organizar manualmente módulos, ciclo de vida e
  injeção de dependências.
- Uma arquitetura com mais camadas: foi descartada pelo escopo simples do MVP
  registrado em `AGENTS.md`.

## Consequências

O projeto ganha estrutura consistente e integração entre módulos. Em troca,
fica acoplado às convenções e ao ciclo de vida do NestJS.
