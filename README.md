# Cofre Digital EXIA

Backend do MVP de um cofre de notas privadas. Nesta primeira etapa existem a
estrutura NestJS, o banco PostgreSQL em Docker e o schema do Prisma. Ainda não
existem rotas de cadastro, login ou notas.

## Pré-requisitos

Instale antes de começar:

- Node.js 22 ou superior (`node --version`)
- npm (`npm.cmd --version` no PowerShell, se `npm` estiver bloqueado pela política de scripts)
- Docker Desktop aberto (`docker --version` e `docker compose version`)

> A API roda diretamente na máquina. Apenas o PostgreSQL roda no Docker.

## Rodar do zero

No PowerShell, dentro da pasta do projeto:

```powershell
# 1. Baixa as dependências descritas no package-lock.json
npm.cmd install

# 2. Cria sua configuração local, que não vai para o Git
Copy-Item .env.example .env

# 3. Edite o .env e escolha uma senha local para o PostgreSQL.
# A senha em POSTGRES_PASSWORD precisa ser a mesma presente em DATABASE_URL.

# 4. Inicia apenas o banco de dados
docker compose up -d

# 5. Aplica as migrations que já existem no repositório
npx.cmd prisma migrate deploy

# 6. Gera o cliente que o Nest usa para conversar com o banco
npm.cmd run prisma:generate

# 7. Inicia a API localmente, com recarregamento ao salvar arquivos
npm.cmd run start:dev
```

A API usa a porta `3000`. Como ainda não há endpoints, acessar
`http://localhost:3000` responde `404`, o que é esperado nesta etapa.

O PostgreSQL deste projeto fica em `localhost:5433`. A porta `5432` foi evitada
porque já havia outro PostgreSQL instalado nesta máquina. Se a sua `5432` estiver
livre, você pode usar essa porta, mas precisa alterar **os dois** locais:
`docker-compose.yml` e `DATABASE_URL` no `.env`.

## Comandos do dia a dia

```powershell
# Ver se o banco está saudável
docker compose ps

# Parar o banco, mantendo seus dados no volume Docker
docker compose stop

# Iniciar um banco que já existe
docker compose start

# Ver se as migrations do banco estão atualizadas
npx.cmd prisma migrate status

# Criar uma nova migration durante o desenvolvimento
npm.cmd run prisma:migrate -- --name nome_da_mudanca

# Conferir TypeScript e build de produção
npm.cmd run build

# Conferir estilo do código
npm.cmd run lint
```

## O que cada ferramenta faz

| Ferramenta | Responsabilidade |
| --- | --- |
| NestJS | Framework da API em TypeScript: módulos, controllers e services. |
| PostgreSQL | Banco relacional que armazena usuários e notas. |
| Docker Compose | Sobe somente o PostgreSQL de forma reproduzível. |
| Prisma | Define o modelo, cria migrations e fornece o cliente do banco. |
| `.env` | Guarda configuração local, especialmente credenciais; é ignorado pelo Git. |

## Como este boilerplate foi montado

Ele foi criado manualmente, em vez de usar `nest new`, para manter somente os
arquivos necessários ao desafio. A sequência foi:

1. Criar `package.json`, `tsconfig`, configuração do Nest, ESLint e Prettier.
2. Instalar NestJS, Prisma, TypeScript e ferramentas de desenvolvimento com npm.
3. Criar `src/main.ts` e `src/app.module.ts` para iniciar e reunir a aplicação.
4. Criar os módulos `auth`, `users` e `notes`, cada um com controller, service e
   repository ainda vazios. Isso prepara as camadas sem antecipar login ou CRUD.
5. Criar `PrismaModule` e `PrismaService` em `common`, o único ponto que abre a
   conexão com o banco.
6. Escrever `prisma/schema.prisma` com `User` e `Note`, incluindo email único,
   datas automáticas, relação entre as tabelas e índice por `userId`.
7. Criar `.env`, `.env.example`, `.gitignore` e `docker-compose.yml` para que
   segredos fiquem fora do Git e o banco seja fácil de iniciar.
8. Executar `prisma migrate dev --name init`, que criou e aplicou a migration em
   `prisma/migrations`.

### Relação entre as camadas

```text
Requisição HTTP
      ↓
Controller  → recebe entrada e devolve resposta HTTP
      ↓
Service     → concentra regras de negócio e autorização
      ↓
Repository  → único local que conversa com o Prisma
      ↓
PrismaService → PostgreSQL
```

Na próxima etapa, o controller de autenticação chamará o service; o service
usará repositories para gravar e buscar dados. Assim cada arquivo tem uma
responsabilidade clara, mas a estrutura continua simples para um MVP.

## Arquivos importantes

- `src/main.ts`: inicia a API.
- `src/app.module.ts`: registra os módulos do projeto.
- `src/common/prisma/prisma.service.ts`: gerencia a conexão do Prisma.
- `prisma/schema.prisma`: fonte da verdade dos modelos do banco.
- `prisma/migrations/`: histórico versionado de mudanças no banco.
- `.env.example`: exemplo seguro das variáveis que outra pessoa precisa criar.
- `docker-compose.yml`: definição do PostgreSQL local.

## Verificação feita nesta etapa

Os comandos abaixo foram executados com sucesso:

```powershell
npm.cmd run prisma:generate
npm.cmd run build
npm.cmd run lint
npx.cmd prisma migrate status
npm.cmd audit --omit=dev
```

O último comando verificou as dependências usadas em produção e retornou zero
vulnerabilidades conhecidas.
