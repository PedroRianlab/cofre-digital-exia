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
