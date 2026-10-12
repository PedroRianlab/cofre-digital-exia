# Decisões de arquitetura

O projeto é um monólito NestJS executado localmente. O código é separado por
feature nos módulos `auth`, `users`, `notes` e `common`. O fluxo adotado é
controller → service → repository → Prisma. O PostgreSQL é o único componente
executado em Docker.

## Decisões registradas

| #   | Decisão                | Em uma frase                                                      | Link para o ADR                             |
| --- | ---------------------- | ----------------------------------------------------------------- | ------------------------------------------- |
| 001 | NestJS                 | Organiza a API TypeScript com módulos e injeção de dependências.  | [ADR 001](adr/001-nestjs.md)                |
| 002 | Jest                   | Executa os testes e2e da autenticação com Supertest.              | [ADR 002](adr/002-jest.md)                  |
| 003 | Prisma                 | Centraliza o acesso ao PostgreSQL e mantém o schema versionado.   | [ADR 003](adr/003-prisma.md)                |
| 004 | PostgreSQL em Docker   | Padroniza o banco local sem colocar a API em contêiner.           | [ADR 004](adr/004-postgresql-docker.md)     |
| 005 | Argon2id               | Protege as senhas antes de gravá-las no banco.                    | [ADR 005](adr/005-argon2id.md)              |
| 006 | Hash falso no login    | Executa uma verificação de hash mesmo quando o e-mail não existe. | [ADR 006](adr/006-hash-falso-no-login.md)   |
| 007 | Zod                    | Valida e normaliza os payloads por rota.                          | [ADR 007](adr/007-zod-validacao.md)         |
| 008 | JWT                    | Emite tokens HS256 após um login válido.                          | [ADR 008](adr/008-jwt.md)                   |
| 009 | Monólito por feature   | Mantém as funcionalidades em módulos de uma única aplicação.      | [ADR 009](adr/009-monolito-por-feature.md)  |
| 010 | Monorepo               | Mantém backend e espaço do frontend no mesmo repositório.         | [ADR 010](adr/010-monorepo.md)              |
| 011 | Configuração validada  | Valida as variáveis do JWT durante a inicialização.               | [ADR 011](adr/011-configuracao-validada.md) |
| 012 | Filtro global de erros | Padroniza respostas de erro e oculta detalhes de falhas internas. | [ADR 012](adr/012-filtro-global-erros.md)   |

## Limitações conhecidas

A implementação atual cobre a infraestrutura inicial e a autenticação. Os itens
restantes pertencem às etapas posteriores do MVP descritas em `AGENTS.md`.

## Próximos passos

1. Com mais tempo, avaliar criptografia das notas, auditoria, compartilhamento
   temporário, recuperação de senha e deploy.
