# Frontend — Cofre Digital EXIA

Interface web do cofre de notas e arquivos privados. Foi construída com Next.js
e consome a API NestJS usando Axios.

Para instalar e executar o projeto completo, consulte o
[README principal](../README.md).

## Funcionalidades

- Cadastro, login, logout local e tratamento de sessão expirada.
- CRUD completo de notas.
- Busca local de notas por categoria, sem diferenciar maiúsculas e minúsculas.
- Upload, listagem, download e exclusão de arquivos privados.
- Preview autenticado de imagens e PDFs.
- Estados de loading, erro, vazio e sucesso.
- Confirmação antes de excluir e bloqueio durante requisições.
- Layout responsivo para celular, tablet e desktop.

## Como executar

O backend precisa estar disponível em `http://localhost:3000`.

```powershell
Set-Location frontend
Copy-Item .env.example .env.local
npm.cmd install
npm.cmd run dev
```

Acesse `http://localhost:3001`.

O endereço da API pode ser alterado em `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Como funciona

```text
Next.js App Router
   |
   +-- /login --------------------> AuthProvider
   |                                  |
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

As páginas definem as rotas e delegam a interface e as regras de apresentação
para componentes dentro de cada feature. O acesso HTTP fica nos arquivos
`*.api.ts`; configuração, autenticação e mensagens de erro ficam em
`src/lib/api.ts`.

## Organização

```text
src/
├── app/                 # Rotas e layouts do App Router
├── components/
│   ├── feedback/        # Loading, erro, vazio e confirmação
│   ├── layout/          # Estrutura das páginas privadas
│   └── ui/              # Componentes visuais compartilhados
├── features/
│   ├── auth/            # Login, cadastro, tipos e validação
│   ├── notes/           # Lista, busca, formulário e API de notas
│   └── files/           # Upload, cards, preview e API de arquivos
├── lib/                 # Axios, erros, datas e utilitários
└── providers/           # Sessão e providers globais
```

A decisão arquitetural está registrada no
[ADR 024](../docs/adr/024-frontend-nextjs-por-feature.md).

## Formulários e estado

React Hook Form é usado somente nos três formulários existentes:

- autenticação;
- criação e edição de notas;
- upload de arquivo.

Ele controla validação, submissão e bloqueio durante o envio. Busca, coleções,
loading, diálogos e previews usam principalmente `useState`. A sessão usa
Context e `useSyncExternalStore`.

Não foram adicionados Zustand ou React Query. Para o tamanho atual do MVP, o
estado local mantém o fluxo mais direto; atualização e sincronização das listas
são feitas manualmente após cada requisição.

## Sessão e segurança

O token JWT fica no `sessionStorage` e é enviado pelo Axios no cabeçalho
`Authorization`. Ao receber HTTP `401`, o frontend limpa a sessão e redireciona
para o login.

A proteção de rota no navegador evita exibir páginas privadas sem sessão, mas a
segurança real está no backend. A API valida o JWT e o proprietário de cada
recurso.

Notas são renderizadas como texto, sem `dangerouslySetInnerHTML`. O blur dos
cards de arquivo é apenas visual e não representa criptografia ou autorização.

## Preview de arquivos

Imagens e PDFs são buscados somente quando a pessoa abre o preview. A resposta
autenticada é convertida em uma URL temporária com `URL.createObjectURL`, que é
liberada com `URL.revokeObjectURL` ao fechar o diálogo.

Áudios continuam disponíveis para download, mas não possuem preview interno.
Também não há progresso detalhado de upload nem carregamento automático com
`IntersectionObserver`.

## Validação

```powershell
Set-Location frontend
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
```

O frontend ainda não possui testes automatizados próprios. Os fluxos principais
são testados manualmente com a API local; regras críticas de autenticação,
isolamento e arquivos são cobertas pelos testes E2E do backend.
