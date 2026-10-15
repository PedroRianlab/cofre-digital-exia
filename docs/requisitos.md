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

### RF03 - Criar nota

**Status:** Implementado

`POST /notes` recebe `titulo`, `conteudo` e a `categoria` opcional, associa a
nota ao `sub` do JWT e retorna HTTP 201. O título aceita até 120 caracteres, o
conteúdo até 10.000 e a categoria entre 1 e 50 após remover espaços nas pontas.
Campos extras ou valores fora dos limites retornam HTTP 400. O `userId` não é
aceito no payload nem exposto na resposta.

Como foi testado: `backend/test/notes.e2e-spec.ts` verifica criação, vínculo com
o usuário autenticado, limites do Zod, rejeição de campo extra e ausência de
token.

### RF04 - Listar notas

**Status:** Implementado

`GET /notes` filtra sempre pelo `userId` obtido do JWT e aceita o parâmetro
opcional `categoria`. A listagem mantém a ordenação por `updatedAt` decrescente.
Parâmetros desconhecidos ou categoria acima de 50 caracteres retornam HTTP 400.
A resposta contém `categoria`, mas não contém `userId`.

Como foi testado: dois usuários possuem notas com a mesma categoria, e o filtro
retorna somente a nota do usuário autenticado. Uma categoria existente apenas
para o outro usuário retorna uma lista vazia.

### RF05 - Visualizar nota

**Status:** Implementado

`GET /notes/:id` busca sempre por `id` e `userId`. Nota inexistente ou de outro
usuário retorna HTTP 404 com a mesma mensagem. O parâmetro `id` precisa ser um
UUID válido.

Como foi testado: nota própria retorna HTTP 200, UUID inválido retorna 400 e
nota inexistente ou alheia retorna 404.

### RF06 - Editar nota

**Status:** Implementado

`PATCH /notes/:id` permite alterar `titulo`, `conteudo` ou `categoria`. O payload
deve conter ao menos um campo. A operação usa `updateMany` filtrado por `id` e
`userId` e verifica `count`; nota inexistente ou alheia retorna HTTP 404.

Como foi testado: atualização parcial, inclusive da categoria, preserva campos
não enviados; payload vazio ou acima do limite retorna 400 e tentativa sobre
nota alheia retorna 404 sem modificá-la.

### RF07 - Remover nota

**Status:** Implementado

`DELETE /notes/:id` usa `deleteMany` filtrado por `id` e `userId` e verifica
`count`. A remoção de nota própria retorna HTTP 204 sem body; nota inexistente
ou alheia retorna HTTP 404.

Como foi testado: tentativa sobre nota alheia não a remove, enquanto a remoção
da própria nota retorna 204 e ela deixa de ser encontrada.

### RF08 - Gerenciar arquivos privados

**Status:** Implementado

`POST /files` recebe um único arquivo multipart, valida seu formato pelos bytes
reais e salva o conteúdo em pasta privada com nome UUID. PDF, MP3, WAV, OGG,
M4A, PNG, JPEG, WEBP e GIF são permitidos; tipos desconhecidos e SVG retornam
HTTP 415. O limite padrão é 20 MB e pode ser alterado por ambiente.

`GET /files`, `GET /files/:id`, `GET /files/:id/download` e
`DELETE /files/:id` usam sempre o `userId` do JWT. Um arquivo inexistente ou de
outro usuário retorna o mesmo HTTP 404. Respostas públicas não expõem
`storageKey` nem `userId`.

Como foi testado: `backend/test/files.e2e-spec.ts` cobre formatos válidos,
arquivos disfarçados e truncados, limite de tamanho, autenticação, UUID,
isolamento entre dois usuários, nomes UTF-8, download, exclusão e tentativa de
path traversal. `backend/test/files-throttling.e2e-spec.ts` cobre o limite de
frequência do upload.

### RNF05 - Tratamento padronizado de erros

**Status:** Implementado

O `HttpExceptionFilter` devolve `statusCode`, `message`, `path` e `timestamp`
para erros HTTP 400, 401, 403, 404 e 500. Erros de validação podem incluir
`fields`. No erro 500, o cliente recebe somente `Erro interno do servidor`,
enquanto método, rota e stack trace são registrados no log do servidor.

Como foi testado: `backend/test/errors.e2e-spec.ts` usa um módulo Nest exclusivo
do teste, sem `AppModule` ou banco, para provocar e conferir todos os status. O
teste também verifica que o detalhe interno não aparece na resposta e chega ao
logger.

### RNF06 - Limite de tentativas e Helmet

**Status:** Implementado

`POST /auth/login` aceita até 5 tentativas por IP em 60 segundos e
`POST /auth/register` aceita até 10. Ao exceder o limite, a API retorna HTTP 429
no formato global de erros. Os limites e a janela são configuráveis por
variáveis de ambiente. Helmet adiciona cabeçalhos HTTP de segurança globalmente.

Como foi testado: `backend/test/throttling.e2e-spec.ts` usa senha válida no
formato, confirma cinco respostas 401 e uma sexta resposta 429 no login, testa
o limite independente do cadastro e verifica cabeçalhos adicionados pelo Helmet.

### RNF07 - Documentação interativa da API

**Status:** Implementado

`GET /docs` disponibiliza a interface Swagger com cadastro e login públicos e
as rotas de notas identificadas como protegidas por JWT. Cada operação informa
o corpo, os limites dos campos, os status esperados e o formato padronizado de
erro. O botão **Authorize** usa o esquema bearer para enviar o token às rotas de
notas.

O Swagger fica ativo em todos os ambientes por se tratar de um MVP local. Seus
modelos servem somente para documentação; a validação real continua nos schemas
Zod. O CSP padrão do Helmet foi mantido porque a interface abriu com estilos e
scripts funcionando.

Como foi testado: a página foi aberta no Edge e o fluxo cadastro, login, criação,
listagem com filtro, consulta, edição e exclusão de nota foi executado contra a
API. O contrato OpenAPI também foi conferido para autenticação e status HTTP.

## Comportamentos de apoio implementados

- Payloads de cadastro e login usam schemas Zod estritos. Campos extras são
  rejeitados com HTTP 400.
- Todas as rotas de notas são protegidas pelo `JwtAuthGuard`.
- Schemas de notas validam bodies e parâmetros de rota com Zod.
- O filtro global devolve `statusCode`, `message`, `path` e `timestamp`.
- Erros HTTP 400 podem incluir a lista `fields`.
- Erros HTTP 500 não expõem a mensagem interna da exceção.
- O Prisma conecta na inicialização e desconecta no encerramento do módulo.

## Requisitos ainda não implementados

| Requisito | Status | Evidência atual |
| --- | --- | --- |
| Interface web | Não implementado | `frontend/` contém apenas `.gitkeep`. |

## Como executar os testes existentes

Com o PostgreSQL saudável e as migrations aplicadas:

```powershell
Set-Location backend
npm.cmd run test:e2e
```

As suítes que usam o banco configurado em `DATABASE_URL` removem somente os
dados criados durante os próprios testes. A suíte de erros não depende do banco.
