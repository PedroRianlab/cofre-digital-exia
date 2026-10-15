# Requisitos

Resumo dos comportamentos implementados. A visão geral e as instruções de uso
estão no [README](../README.md).

## Requisitos funcionais

| ID | Requisito | Status | Evidência principal |
| --- | --- | --- | --- |
| RF01 | Cadastrar usuário com e-mail único e senha protegida por Argon2id | Implementado | `auth.e2e-spec.ts` |
| RF02 | Autenticar usuário e emitir JWT com expiração | Implementado | `auth.e2e-spec.ts` |
| RF03 | Criar nota com título, conteúdo e categoria opcional | Implementado | `notes.e2e-spec.ts` |
| RF04 | Listar as próprias notas e filtrar por categoria sem diferenciar maiúsculas | Implementado | `notes.e2e-spec.ts` |
| RF05 | Consultar somente uma nota própria | Implementado | `notes.e2e-spec.ts` |
| RF06 | Editar somente uma nota própria | Implementado | `notes.e2e-spec.ts` |
| RF07 | Excluir somente uma nota própria | Implementado | `notes.e2e-spec.ts` |
| RF08 | Enviar, listar, consultar, baixar e excluir arquivos privados | Implementado | `files.e2e-spec.ts` |
| RF09 | Cadastrar, entrar e sair pela interface web | Implementado | Validação manual e build do frontend |
| RF10 | Criar, buscar por categoria, abrir, editar e excluir notas pela interface | Implementado | Validação manual e build do frontend |
| RF11 | Enviar, listar, baixar, excluir e visualizar imagens e PDFs pela interface | Implementado | Validação manual e build do frontend |

## Regras obrigatórias

- Rotas privadas exigem JWT válido.
- O proprietário vem do token, nunca do payload enviado pelo cliente.
- Notas e arquivos são consultados com `id + userId`.
- Recurso inexistente ou pertencente a outra pessoa retorna o mesmo HTTP `404`.
- Zod rejeita campos extras e valores fora dos limites definidos.
- O upload aceita um único campo multipart chamado `file`.
- PDF, MP3, WAV, OGG, M4A, PNG, JPEG, WEBP e GIF são permitidos.
- O tipo do arquivo é validado pelos bytes reais do conteúdo.
- O conteúdo das notas é exibido como texto, sem renderização de HTML.

## Requisitos não funcionais

| Área | Implementação |
| --- | --- |
| Erros | Formato único com `statusCode`, `message`, `path` e `timestamp` |
| Senhas | Hash Argon2id e mensagem única para credenciais inválidas |
| Abuso | Limites por IP para login, cadastro, upload e rotas autenticadas |
| HTTP | Helmet, CORS restrito e corpo JSON limitado a 100 KB |
| Persistência | PostgreSQL com migrations Prisma |
| Arquivos | Pasta privada, nome UUID e limite configurável |
| Documentação | Swagger em `/docs` e ADRs em `docs/adr/` |
| Responsividade | Fluxos principais disponíveis em celular, tablet e desktop |

## Validação

O backend possui 61 testes E2E com Jest e Supertest. Eles cobrem autenticação,
CRUD, isolamento entre usuários, arquivos, erros, CORS, rate limit e hardening.

```powershell
Set-Location backend
npm.cmd run test:e2e
npm.cmd run build

Set-Location ../frontend
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
```

O frontend ainda não possui testes automatizados próprios. Os detalhes do
escopo não implementado estão em [Limitações conhecidas](../README.md#limitações-conhecidas).
