# Contexto do projeto: Cofre de Notas (MVP)

## Quem sou eu e como quero trabalhar

Sou estagiário construindo um back-end. Quero ENTENDER o código, não só receber.
Regras de trabalho:

- Faça UMA etapa por vez, somente a que eu pedir. Não adiante etapas nem
  adicione funcionalidades extras.
- Ao final de cada etapa, explique em até 5 linhas o que cada arquivo novo faz
  e por que existe, e diga como testar.
- Prefira código simples e legível, com comentários curtos. Nada de
  abstrações desnecessárias.
- Nunca coloque segredos no código; tudo vai em variáveis de ambiente.
- Se houver mais de um caminho, diga qual escolheu e por quê, em 2 linhas.

## Objetivo

Desafio técnico: app de notas privadas (um "cofre"). O usuário se cadastra,
faz login e gerencia APENAS as próprias notas. Avaliação: backend e segurança
60%, frontend 20%, README com trade-offs 20%. Entrega: repositório público no
GitHub, rodando em ambiente local (não precisa de deploy).

## Stack

- Backend: NestJS + TypeScript
- Banco: PostgreSQL em Docker (docker-compose só para o banco; a API roda local)
- ORM: Prisma
- Validação: Zod, aplicada por um ZodValidationPipe por rota
  (schemas com .max() nos campos e .strict() para rejeitar campos extras).
  NÃO usar class-validator.
- Auth: JWT + Guard; senha com hash (bcrypt ou argon2)
- Abuso: @nestjs/throttler + Helmet
- Frontend: React/Next + Axios, com estados de loading e mensagens de erro
- Segredos: .env no .gitignore + .env.example

## Arquitetura

Camadas em módulos por funcionalidade: auth, users, notes, common.

- Controller: rota, entrada e saída, status HTTP
- Service: regra de negócio
- Repository: único ponto de acesso ao banco (Prisma)
- Schemas Zod: validação dos dados de entrada
- common: filtro global de erros
  Sem Clean Architecture, DDD ou microsserviços (é um MVP, de propósito).

## Regras de segurança (inegociáveis)

1. Toda rota privada passa pelo Guard JWT (sem token: 401).
2. Autorização por recurso: o Service NUNCA busca nota só pelo id; sempre por
   id + userId vindo do token.
3. Nota inexistente ou de outro usuário retorna 404 (não revelar que existe).
4. Validar TODO payload, com limite de tamanho nos campos (400 se inválido).
5. Senha nunca em texto puro; mensagem de login única ("credenciais inválidas").
6. Status padronizados: 400, 401, 403, 404, 409, 429, 500, em formato de erro único.

## Escopo

Dentro: cadastro, login, CRUD de notas de texto, isolamento por usuário,
validação, tratamento de erros, 3 telas (login/cadastro, lista, formulário), README.
Fora (só citar no README como próximos passos): PDF, criptografia das notas,
log de auditoria, compartilhamento temporário, deploy, recuperação de senha.

## Plano

- Sábado: projeto + Postgres/Docker + schema Prisma + cadastro + login + Guard + Zod.
- Domingo: CRUD de notas + autorização por recurso + erros + Throttler + testes
  do isolamento (usuário A não acessa nota do B).
- Segunda: telas, README (setup, arquitetura de segurança, trade-offs), entrega.

## Etapa atual

Etapa 1: crie o esqueleto do backend (Nest + Prisma + Postgres via
docker-compose + .env/.env.example/.gitignore), módulos auth, users e notes
com as camadas vazias, e o schema Prisma com User (id, email único, senhaHash,
datas) e Note (id, titulo, conteudo, userId, datas). Gere a migration.
NÃO implemente login nem CRUD ainda. Ao final, Executarei e revisarei cada etapa
