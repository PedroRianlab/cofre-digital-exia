# Cofre Digital EXIA

Aplicação web para guardar notas e arquivos privados. O usuário pode se
cadastrar, fazer login e gerenciar somente os próprios recursos.

O projeto é um monorepo com frontend em React/Next e backend em NestJS. O
backend usa PostgreSQL, Prisma, Zod, JWT e Argon2id.

## Documentação

- [Decisões de arquitetura](docs/decisoes.md)
- [Requisitos](docs/requisitos.md)
- [Segurança](docs/seguranca.md)

## Como rodar

### Pré-requisitos

- Node.js 22 ou superior
- npm
- Docker Desktop em execução

### 1. Configurar o backend

Na raiz do repositório:

```powershell
Set-Location backend
npm.cmd install
Copy-Item .env.example .env
```

Edite `backend/.env` e defina uma senha local. O valor de `POSTGRES_PASSWORD`
deve ser o mesmo usado em `DATABASE_URL`.

`STORAGE_DIR` define a pasta privada dos uploads, relativa ao diretório em que a
API é iniciada, e `MAX_UPLOAD_MB` define o limite por arquivo (20 MB por padrão).
A pasta padrão `backend/storage/` é criada automaticamente e ignorada pelo Git.

`npm.cmd install` é necessário somente na primeira execução, quando as
dependências forem alteradas ou se a pasta `backend/node_modules` for removida.

### 2. Subir o banco e preparar o Prisma

```powershell
Set-Location ..
docker compose up -d

Set-Location backend
npx.cmd prisma migrate deploy
npm.cmd run prisma:generate
```

O PostgreSQL fica disponível em `localhost:5433`.

### 3. Iniciar o backend

Em um terminal:

```powershell
Set-Location backend
npm.cmd run start:dev
```

A API roda em `http://localhost:3000`.

### Documentação Swagger

Com o backend em execução, acesse `http://localhost:3000/docs`. A documentação
fica ativa em todos os ambientes; essa foi uma escolha consciente porque o MVP
é executado apenas localmente. O Helmet continua ativo e o CSP padrão é
compatível com a interface atual do Swagger.

Fluxo para testar manualmente:

1. Abra `POST /auth/register`, clique em **Try it out** e cadastre um usuário.
2. Execute `POST /auth/login` com as mesmas credenciais e copie o `accessToken`.
3. Clique em **Authorize** e informe somente o token, sem o prefixo `Bearer`.
4. Teste a criação, listagem, consulta, edição e exclusão em `notes`.
5. Em `files`, envie PDF, áudio ou imagem pelo campo multipart `file` e teste os
   endpoints de metadados, download e exclusão.

O login aceita 5 tentativas por IP a cada 60 segundos. Se receber HTTP 429,
aguarde 60 segundos antes de tentar novamente.

Os modelos usados pelo Swagger repetem os limites definidos nos schemas Zod.
O Zod continua sendo a validação real; ao alterar uma regra, as duas descrições
precisam ser atualizadas. Uma evolução possível é gerar o OpenAPI a partir dos
schemas Zod para eliminar essa duplicação.

### Próximas execuções

Com as dependências já instaladas e o `.env` configurado, use apenas:

```powershell
# Na raiz do repositório
docker compose up -d

# Em outro terminal, dentro de backend
Set-Location backend
npm.cmd run start:dev
```

### 4. Iniciar o frontend

Em outro terminal:

```powershell
Set-Location frontend
npm.cmd install
npm.cmd run dev
```

### Testes do backend

Com o banco iniciado:

```powershell
Set-Location backend
npm.cmd run test:e2e
```

## Segurança do backend

- Senhas são armazenadas com Argon2id.
- Rotas privadas validam JWT e isolam notas por `id` e `userId`.
- Zod rejeita campos extras e limita o tamanho dos textos.
- Helmet adiciona cabeçalhos HTTP de segurança.
- Login aceita 5 tentativas por IP a cada 60 segundos; cadastro aceita 10.
- Rotas autenticadas aceitam 100 requisições por IP a cada 60 segundos.
- O corpo JSON de cada requisição possui limite de 100 KB.
- Uploads aceitam um arquivo de até `MAX_UPLOAD_MB`, validado pelos bytes reais.
- Arquivos usam nome físico UUID e só podem ser acessados pelo próprio usuário.

## Trade-offs do limite de tentativas

O Throttler identifica clientes pelo IP e armazena contadores em memória, opção
suficiente para este MVP local de instância única. Reiniciar a API limpa os
contadores. Em múltiplas instâncias seria necessário um armazenamento
compartilhado, como Redis.

Atrás de proxy ou load balancer, seria necessário configurar `trust proxy` para
usar o IP real do cliente. O limite atual é por IP, não por conta, então usuários
na mesma rede podem compartilhar o contador. O CSP padrão do Helmet foi
verificado com a página `/docs` e não precisou ser relaxado.
