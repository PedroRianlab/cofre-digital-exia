# Requisitos

Este documento descreve somente comportamentos observados no código atual.

## Requisitos implementados

### RF01 - Cadastrar usuário

**Status:** Implementado

`POST /auth/register` recebe `email` e `senha`. O e-mail é normalizado com
remoção de espaços e conversão para minúsculas. A senha deve ter entre 8 e 128
caracteres e é armazenada como hash Argon2id. E-mail repetido retorna HTTP 409.
A resposta não contém `senhaHash`.

Arquivos principais:

- `backend/src/auth/auth.controller.ts`
- `backend/src/auth/auth.service.ts`
- `backend/src/auth/schemas/register.schema.ts`
- `backend/src/users/users.service.ts`
- `backend/src/users/users.repository.ts`

Como foi testado: `backend/test/auth.e2e-spec.ts` verifica payload inválido,
normalização do e-mail, hash Argon2id, ausência de `senhaHash` na resposta e
conflito de e-mail repetido.

### RF02 - Fazer login

**Status:** Implementado

`POST /auth/login` recebe `email` e `senha`. O e-mail é normalizado. Credenciais
válidas retornam `accessToken`, assinado com HS256 e com validade definida por
`JWT_EXPIRES_IN`. Senha errada e e-mail inexistente retornam HTTP 401 com a
mesma mensagem: `credenciais inválidas`.

Arquivos principais:

- `backend/src/auth/auth.controller.ts`
- `backend/src/auth/auth.service.ts`
- `backend/src/auth/auth.module.ts`
- `backend/src/auth/schemas/login.schema.ts`
- `backend/src/users/users.repository.ts`

Como foi testado: `backend/test/auth.e2e-spec.ts` verifica a emissão de um JWT
HS256 e a mensagem única para os dois casos de credenciais inválidas.

## Comportamentos de apoio implementados

- Payloads de cadastro e login usam schemas Zod estritos. Campos extras são
  rejeitados com HTTP 400.
- O filtro global devolve `statusCode`, `message`, `path` e `timestamp`.
- Erros HTTP 400 podem incluir a lista `fields`.
- Erros HTTP 500 não expõem a mensagem interna da exceção.
- O Prisma conecta na inicialização e desconecta no encerramento do módulo.

## Requisitos ainda não implementados

| Requisito | Status | Evidência atual |
| --- | --- | --- |
| RF03 - Proteger rotas com JWT | Não implementado | O token é emitido, mas não existe Guard ou estratégia JWT. |
| RF04 - Criar notas | Não implementado | `NotesController`, `NotesService` e `NotesRepository` estão vazios. |
| RF05 - Listar as próprias notas | Não implementado | Não há endpoint ou consulta de notas. |
| RF06 - Consultar uma nota própria | Não implementado | Não há busca por `id` e `userId`. |
| RF07 - Atualizar uma nota própria | Não implementado | Não há endpoint de atualização. |
| RF08 - Excluir uma nota própria | Não implementado | Não há endpoint de exclusão. |
| RF09 - Isolar notas entre usuários | Não implementado | Não existe regra de autorização nem teste de isolamento. |
| RF10 - Interface web | Não implementado | `frontend/` contém apenas `.gitkeep`. |

O schema Prisma já possui `User`, `Note`, relação por `userId`, índice e exclusão
em cascata. Isso prepara o banco, mas não implementa os requisitos de notas.

## Como executar os testes existentes

Com o PostgreSQL saudável e as migrations aplicadas:

```powershell
Set-Location backend
npm.cmd run test:e2e
```

A suíte atual possui seis casos e usa o banco configurado em `DATABASE_URL`.
