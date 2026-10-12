# 009 - Monólito organizado por feature

**Status:** Aceito

## Contexto

O MVP precisa separar responsabilidades sem o custo operacional de vários
serviços ou de uma arquitetura com muitas camadas.

## Decisão

A API é uma única aplicação NestJS. `backend/src/app.module.ts` reúne `auth`,
`users`, `notes` e `common`. As features usam controller, service e repository.
No fluxo implementado, `AuthController` chama `AuthService`, que usa
`UsersService`; este delega o acesso ao banco para `UsersRepository`.

## Alternativas consideradas

- Microsserviços: aumentariam comunicação, execução e observabilidade sem
  necessidade no tamanho atual.
- Clean Architecture ou DDD completos: criariam mais interfaces e camadas do
  que o MVP precisa, conforme a restrição registrada em `AGENTS.md`.

## Consequências

O fluxo fica simples de seguir e as features permanecem agrupadas. Em troca,
todos os módulos são publicados e executados como uma única aplicação.
