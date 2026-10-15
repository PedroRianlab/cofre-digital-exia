# Decisões de arquitetura

O projeto é um monorepo executado localmente. O backend é um monólito NestJS
organizado por feature e segue o fluxo controller → service → repository →
Prisma. O frontend usa Next.js com App Router e também é separado por feature.
Somente o PostgreSQL roda em Docker.

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
| 012 | Filtro global de erros | Substituído pelo ADR 014. | [ADR 012](adr/012-filtro-global-erros.md)   |
| 013 | Ocultar notas alheias  | Usa a mesma resposta 404 para notas inexistentes ou de outro usuário. | [ADR 013](adr/013-nao-revelar-notas-alheias.md) |
| 014 | Formato de erros       | Padroniza respostas e registra internamente as falhas 500. | [ADR 014](adr/014-formato-padronizado-erros.md) |
| 015 | Limite de tentativas   | Limita login e cadastro por IP usando armazenamento em memória. | [ADR 015](adr/015-limite-tentativas-em-memoria.md) |
| 016 | Finais de linha        | Padroniza arquivos de texto com finais de linha LF. | [ADR 016](adr/016-padronizacao-finais-de-linha.md) |
| 017 | Custos do Argon2id     | Define explicitamente os custos usados nos hashes de senha. | [ADR 017](adr/017-custos-explicitos-argon2id.md) |
| 018 | Limites de requisição  | Limita requisições autenticadas e o tamanho do body JSON. | [ADR 018](adr/018-limites-globais-requisicao-body.md) |
| 019 | Categoria de nota | Mantém categoria opcional diretamente na nota. | [ADR 019](adr/019-categoria-como-campo-da-nota.md) |
| 020 | Swagger | Documenta e permite testar manualmente os contratos HTTP. | [ADR 020](adr/020-swagger-documentacao-teste-manual.md) |
| 021 | Armazenamento local | Salva arquivos privados em disco usando nomes UUID. | [ADR 021](adr/021-armazenamento-local-em-disco.md) |
| 022 | Validação de arquivos | Confere magic bytes e uma lista explícita de formatos. | [ADR 022](adr/022-validacao-de-arquivos-por-conteudo.md) |
| 023 | JWT sem logout e refresh | Mantém o MVP stateless, sem revogação de tokens ou refresh token. | [ADR 023](adr/023-jwt-sem-logout-refresh.md) |
| 024 | Frontend Next.js por feature | Separa rotas, componentes, estado e acesso à API por responsabilidade. | [ADR 024](adr/024-frontend-nextjs-por-feature.md) |

## Estado atual

A implementação cobre autenticação, CRUD de notas, arquivos privados, preview
de imagens e PDFs, interface responsiva, tratamento de erros e isolamento entre
usuários. Os limites aceitos estão resumidos em [Segurança](seguranca.md).

## Próximos passos

1. Criptografia em repouso com AES-256-GCM e rotação de chaves.
2. Compartilhamento seguro e temporário com expiração e revogação.
3. Revogação de sessões, recuperação de senha, auditoria e deploy.
