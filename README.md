# Cofre Digital EXIA

MVP full-stack para armazenar notas e arquivos privados. Cada pessoa cria uma
conta, autentica-se com JWT e acessa somente os próprios recursos.

O projeto prioriza segurança no backend, isolamento entre usuários e uma
execução local simples. O PostgreSQL roda em Docker; a API NestJS e o frontend
Next.js rodam diretamente na máquina.

## Sumário

- [O que está pronto](#o-que-está-pronto)
- [Executando localmente](#executando-localmente)
- [Como o projeto funciona](#como-o-projeto-funciona)
- [Tecnologias](#tecnologias)
- [API](#api)
- [Segurança](#segurança)
- [Testes e qualidade](#testes-e-qualidade)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Decisões e trade-offs](#decisões-e-trade-offs)
- [Limitações conhecidas](#limitações-conhecidas)
- [Próximos passos](#próximos-passos)
- [Documentação complementar](#documentação-complementar)

## O que está pronto

### Autenticação

- Cadastro e login com e-mail e senha.
- E-mail normalizado antes da consulta e gravação.
- Senha protegida com Argon2id.
- JWT HS256 com tempo de expiração configurável.
- Logout local, removendo o token da aba atual.
- Tratamento automático de sessão expirada no frontend.

### Notas privadas

- Criação, listagem, leitura, edição e exclusão.
- Título, conteúdo e categoria opcional.
- Busca local somente por categoria, sem diferenciar maiúsculas e minúsculas.
- Conteúdo renderizado como texto, preservando quebras de linha.
- Isolamento por proprietário em todas as operações.
- Mesma resposta `404` para uma nota inexistente ou pertencente a outra pessoa.

### Arquivos privados

- Upload, listagem, consulta de metadados, download e exclusão.
- PDF, MP3, WAV, OGG, M4A, PNG, JPEG, WEBP e GIF.
- Preview autenticado de imagens e PDFs.
- Validação do tipo real do arquivo por assinatura binária, não apenas extensão.
- Limite de tamanho configurável, com 20 MB como padrão.
- Armazenamento local privado usando nomes físicos UUID.

### Interface web

- Layout responsivo para celular, tablet e desktop.
- Estados de carregamento, erro e coleção vazia.
- Confirmação antes de excluir notas ou arquivos.
- Botões bloqueados durante requisições para evitar envio duplicado.
- Mensagens para erros HTTP comuns e confirmações de sucesso.

## Executando localmente

### Pré-requisitos

- Node.js 22 ou superior.
- npm.
- Git.
- Docker Desktop ou Docker Engine com Compose.

Não é necessário instalar PostgreSQL na máquina.

### 1. Clonar e configurar

```powershell
git clone https://github.com/PedroRianlab/cofre-digital-exia.git
Set-Location cofre-digital-exia

Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
```

Edite `backend/.env` e substitua os valores de exemplo. A senha usada em
`POSTGRES_PASSWORD` também precisa estar presente na `DATABASE_URL`.

### 2. Instalar as dependências

```powershell
Set-Location backend
npm.cmd install

Set-Location ../frontend
npm.cmd install

Set-Location ..
```

### 3. Iniciar o banco e aplicar as migrations

Na raiz do repositório:

```powershell
docker compose up -d

Set-Location backend
npx.cmd prisma migrate deploy
npm.cmd run prisma:generate
```

O PostgreSQL ficará disponível em `localhost:5433`. Os dados permanecem no
volume Docker `postgres_data` mesmo após parar o contêiner.

### 4. Iniciar a API

No diretório `backend`:

```powershell
npm.cmd run start:dev
```

A API estará em `http://localhost:3000` e o Swagger em
`http://localhost:3000/docs`.

### 5. Iniciar o frontend

Em outro terminal:

```powershell
Set-Location frontend
npm.cmd run dev
```

A aplicação estará em `http://localhost:3001`.

### Variáveis de ambiente

| Variável                  | Finalidade                          | Padrão de desenvolvimento |
| ------------------------- | ----------------------------------- | ------------------------- |
| `DATABASE_URL`            | Conexão do Prisma com PostgreSQL    | Porta `5433`              |
| `JWT_SECRET`              | Assinatura dos tokens               | Sem valor seguro padrão   |
| `JWT_EXPIRES_IN`          | Validade do token                   | `15m`                     |
| `CORS_ORIGIN`             | Origem aceita pela API              | `http://localhost:3001`   |
| `STORAGE_DIR`             | Pasta privada dos uploads           | `storage`                 |
| `MAX_UPLOAD_MB`           | Limite por arquivo                  | `20`                      |
| `LOGIN_THROTTLE_LIMIT`    | Tentativas de login por janela      | `5`                       |
| `REGISTER_THROTTLE_LIMIT` | Cadastros por janela                | `10`                      |
| `GLOBAL_THROTTLE_LIMIT`   | Requisições autenticadas por janela | `100`                     |
| `UPLOAD_THROTTLE_LIMIT`   | Uploads por janela                  | `10`                      |
| `NEXT_PUBLIC_API_URL`     | Endereço usado pelo frontend        | `http://localhost:3000`   |

Use um `JWT_SECRET` aleatório com pelo menos 32 caracteres. Nenhum segredo real
é mantido no código ou nos arquivos de exemplo.

## Como o projeto funciona

```text
Navegador
   |
   | Next.js + Axios + Bearer JWT
   v
API NestJS
   |
   +-- Helmet, CORS e Throttler
   +-- JwtAuthGuard e validação Zod
   |
   v
Controller -> Service -> Repository
                              |
                 +------------+------------+
                 |                         |
                 v                         v
          Prisma/PostgreSQL        storage/ no disco
          dados e metadados        conteúdo dos arquivos
```

O frontend envia o JWT no cabeçalho `Authorization`. O backend obtém o
`userId` exclusivamente do token e nunca aceita do cliente o proprietário de
uma nota ou arquivo.

Nas notas, as consultas de recurso usam `id + userId`. Nos arquivos, os
metadados ficam no PostgreSQL e o conteúdo fica na pasta configurada em
`STORAGE_DIR`. Essa pasta é criada automaticamente e ignorada pelo Git.

### Como o frontend funciona

```text
Navegador
   |
   v
Next.js App Router
   |
   +-- /login --------------------> AuthProvider
   |                                  |
   |                                  +-- cadastro e login
   |                                  +-- JWT no sessionStorage
   |
   +-- Rotas privadas ------------> PrivateShell
          |
          +-- /notas -------------> components -> notes.api.ts
          |
          +-- /arquivos ----------> components -> files.api.ts
                                                |
                                                v
                                     Cliente Axios compartilhado
                                                |
                                      Authorization: Bearer JWT
                                                |
                                                v
                                           API NestJS
```

O App Router separa a tela pública de autenticação das páginas privadas. O
`AuthProvider` controla a sessão da aba, enquanto cada feature mantém seus
componentes, tipos, validações e chamadas HTTP próximos uns dos outros.

## Tecnologias

| Área           | Tecnologias                                                                      |
| -------------- | -------------------------------------------------------------------------------- |
| Frontend       | Next.js 16, React 19, TypeScript, Tailwind CSS, Axios, React Hook Form, Radix UI |
| Backend        | NestJS 11, TypeScript, Zod, Swagger, Helmet, Throttler                           |
| Autenticação   | JWT HS256 e Argon2id                                                             |
| Persistência   | PostgreSQL 17, Prisma ORM e migrations versionadas                               |
| Arquivos       | Multer em memória, validação com `file-type` e armazenamento em disco            |
| Testes         | Jest e Supertest                                                                 |
| Ambiente local | Docker Compose para o PostgreSQL                                                 |

## API

Não há prefixo global. As rotas usam diretamente `/auth`, `/notes` e `/files`.

| Método   | Rota                  | JWT | Descrição                                             |
| -------- | --------------------- | --- | ----------------------------------------------------- |
| `POST`   | `/auth/register`      | Não | Cadastra uma pessoa                                   |
| `POST`   | `/auth/login`         | Não | Retorna um `accessToken`                              |
| `GET`    | `/notes`              | Sim | Lista as próprias notas e aceita `categoria` opcional |
| `POST`   | `/notes`              | Sim | Cria uma nota                                         |
| `GET`    | `/notes/:id`          | Sim | Consulta uma nota própria                             |
| `PATCH`  | `/notes/:id`          | Sim | Edita uma nota própria                                |
| `DELETE` | `/notes/:id`          | Sim | Exclui uma nota própria                               |
| `GET`    | `/files`              | Sim | Lista os próprios arquivos                            |
| `POST`   | `/files`              | Sim | Envia um arquivo no campo multipart `file`            |
| `GET`    | `/files/:id`          | Sim | Consulta os metadados de um arquivo próprio           |
| `GET`    | `/files/:id/download` | Sim | Baixa um arquivo próprio                              |
| `DELETE` | `/files/:id`          | Sim | Exclui um arquivo próprio                             |

### Teste manual pelo Swagger

1. Acesse `http://localhost:3000/docs`.
2. Cadastre uma conta em `POST /auth/register`.
3. Faça login em `POST /auth/login` e copie o `accessToken`.
4. Clique em **Authorize** e informe somente o token, sem escrever `Bearer`.
5. Teste as rotas protegidas de notas e arquivos.

### Formato de erro

As respostas de erro seguem uma estrutura única:

```json
{
  "statusCode": 400,
  "message": "Payload inválido",
  "path": "/notes",
  "timestamp": "2026-10-15T12:00:00.000Z",
  "fields": []
}
```

`fields` aparece somente quando um erro `400` possui detalhes de validação. Em
falhas `500`, detalhes internos ficam nos logs e não são enviados ao cliente.

## Segurança

- Todas as rotas privadas passam pelo `JwtAuthGuard`.
- Notas e arquivos são sempre localizados com o `userId` extraído do JWT.
- Recursos inexistentes e recursos de outra pessoa retornam o mesmo `404`.
- Schemas Zod usam limites de tamanho e rejeitam campos extras.
- Senhas recebem hash Argon2id antes de chegar ao banco.
- Login inválido usa uma mensagem única e executa um hash falso quando o e-mail
  não existe, reduzindo diferenças observáveis de tempo.
- Helmet adiciona cabeçalhos HTTP de segurança.
- CORS aceita apenas a origem configurada.
- O corpo JSON possui limite de 100 KB.
- Login, cadastro, upload e rotas autenticadas possuem limites por IP.
- O tipo do upload é identificado pelos bytes reais do conteúdo.
- Downloads usam `attachment`, `nosniff` e `Cache-Control: private, no-store`.
- O conteúdo das notas é renderizado como texto, sem `dangerouslySetInnerHTML`.
- Arquivos físicos recebem UUID e não ficam expostos por uma rota estática.

### JWT no frontend

O token fica em `sessionStorage`: ele é removido ao fechar a aba e não é enviado
automaticamente pelo navegador. O custo dessa escolha é a exposição do token
caso exista uma vulnerabilidade XSS. Essa escolha foi feita para manter o MVP
simples dentro do prazo; em produção, seria avaliado o uso de cookies
`HttpOnly`, `Secure` e `SameSite` com proteção CSRF.

O logout atual remove o JWT no frontend. Como o backend é stateless e não mantém
uma lista de revogação, um token já emitido permanece válido até expirar.

## Testes e qualidade

Com o PostgreSQL iniciado e as migrations aplicadas:

```powershell
Set-Location backend
npm.cmd run test:e2e
npm.cmd run build
```

O backend possui 61 testes E2E distribuídos entre autenticação, notas,
arquivos, isolamento por usuário, erros, CORS, rate limit e hardening HTTP.

Para validar o frontend:

```powershell
Set-Location frontend
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
```

O frontend ainda não possui uma suíte automatizada própria. Seus principais
fluxos são conferidos manualmente com a API local.

## Estrutura do repositório

```text
cofre-digital-exia/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── auth/
│   │   ├── common/
│   │   ├── files/
│   │   ├── notes/
│   │   └── users/
│   └── test/
├── frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── features/
│       ├── lib/
│       └── providers/
├── docs/
│   ├── adr/
│   ├── decisoes.md
│   ├── requisitos.md
│   └── seguranca.md
├── docker-compose.yml
└── README.md
```

O backend segue o fluxo `controller -> service -> repository -> Prisma`. O
frontend é organizado por funcionalidade em `features/auth`, `features/notes`
e `features/files`.

## Decisões e trade-offs

| Decisão                      | Motivo                                                      | Trade-off                                                       |
| ---------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------- |
| Monólito modular             | Mantém o MVP simples e separa responsabilidades por feature | Escala como uma única aplicação                                 |
| PostgreSQL somente no Docker | Padroniza o banco sem conteinerizar todo o desenvolvimento  | API e frontend exigem Node.js local                             |
| JWT stateless                | Evita armazenamento de sessão no backend                    | Não permite revogação imediata                                  |
| `sessionStorage`             | Sessão limitada à aba e implementação direta                | Um XSS poderia ler o token                                      |
| Arquivos no disco            | Adequado à execução local e fácil de compreender            | Não atende múltiplas instâncias                                 |
| Throttler em memória por IP  | Suficiente para uma instância local                         | Reinícios apagam contadores e redes podem compartilhar o limite |
| Preview sob demanda          | Evita baixar arquivos automaticamente                       | Exige clique antes de visualizar                                |
| Validação Zod por rota       | Contratos explícitos e payloads estritos                    | Modelos Swagger repetem parte dos limites                       |

As justificativas completas estão registradas nos
[ADRs](docs/decisoes.md).

## Limitações conhecidas

- Não há refresh token, logout no backend, recuperação ou alteração de senha.
- Notas e arquivos não possuem criptografia em repouso.
- O blur dos cards de arquivo existe somente no frontend e serve apenas para
  ocultar visualmente as informações na tela. Ele não criptografa o arquivo e
  não substitui a autorização aplicada pelo backend.
- HTTPS e infraestrutura de produção não fazem parte da entrega local.
- O rate limit não compartilha estado entre várias instâncias.
- O armazenamento local não possui cota total por usuário, antivírus ou remoção
  de metadados EXIF.
- O preview interno cobre imagens e PDFs, mas não áudio.
- Não há barra detalhada de progresso de upload nem carregamento automático com
  `IntersectionObserver`.
- O frontend não possui testes automatizados.

## Próximos passos

- Migrar arquivos para um serviço como S3, R2 ou MinIO.
- Adicionar refresh token e revogação de sessões.
- Implementar recuperação segura de senha e verificação de e-mail.
- Avaliar cookies `HttpOnly` com proteção CSRF.
- Implementar criptografia em repouso com AES-256-GCM, incluindo gerenciamento
  e rotação segura das chaves.
- Implementar compartilhamento seguro e temporário, com prazo de expiração,
  controle de acesso e possibilidade de revogação.
- Criar auditoria de acessos aos recursos privados.
- Adicionar testes automatizados do frontend e pipeline de CI.
- Preparar deploy com HTTPS, proxy reverso e armazenamento compartilhado.

## Documentação complementar

- [Requisitos implementados](docs/requisitos.md): resumo do escopo atendido pelo MVP.
- [Segurança](docs/seguranca.md): controles adotados, riscos aceitos e limites da solução.
- [Decisões arquiteturais](docs/decisoes.md): índice dos ADRs que justificam as principais escolhas técnicas.
- [Frontend](frontend/README.md): organização, configuração e execução da interface.
- [Como contribuir](CONTRIBUICAO.md): orientações para colaborar com o projeto.

## Licença

Este projeto foi desenvolvido como desafio técnico e não possui uma licença de
uso definida nesta versão.

## Uso de inteligência artificial

O Claude foi utilizado como mentor técnico e consultor de segurança. O Codex
auxiliou na implementação de atividades manuais e features repetitivas. O
projeto foi validado e revisado pelo autor.
