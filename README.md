# Cofre Digital EXIA

Aplicação web para guardar notas privadas. O usuário pode se cadastrar, fazer
login e gerenciar somente as próprias notas.

O projeto é um monorepo com frontend em React/Next e backend em NestJS. O
backend usa PostgreSQL, Prisma, Zod, JWT e Argon2id.

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

## Trade-offs do limite de tentativas

O Throttler identifica clientes pelo IP e armazena contadores em memória, opção
suficiente para este MVP local de instância única. Reiniciar a API limpa os
contadores. Em múltiplas instâncias seria necessário um armazenamento
compartilhado, como Redis.

Atrás de proxy ou load balancer, seria necessário configurar `trust proxy` para
usar o IP real do cliente. O limite atual é por IP, não por conta, então usuários
na mesma rede podem compartilhar o contador. Se Swagger for adicionado, o CSP
padrão do Helmet deverá ser revisado para a página `/docs`.
