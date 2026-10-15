# 023 - JWT sem logout no backend e sem refresh token

**Status:** Aceito

## Contexto

O MVP usa um access token JWT stateless. O frontend armazena esse token em
`sessionStorage` e o envia no cabeçalho `Authorization` das requisições
privadas. Não existe uma sessão mantida pelo backend para ser encerrada.

## Decisão

O MVP terá somente `POST /auth/register` e `POST /auth/login`. Não serão
implementados uma rota de logout no backend, refresh token, recuperação de
senha ou alteração de senha.

O logout atual remove o access token do `sessionStorage` e redireciona o usuário
para a tela de login. O token que já foi emitido continua válido até expirar,
conforme `JWT_EXPIRES_IN`.

## Alternativas consideradas

- Lista de tokens revogados no backend: permitiria invalidar tokens antes da
  expiração, mas exigiria armazenamento e consulta em todas as requisições.
- Sessão no servidor: permitiria logout imediato, mas deixaria de ser um fluxo
  stateless e exigiria persistência de sessões.
- Cookie `HttpOnly` com refresh token: reduziria a exposição do token ao
  JavaScript, mas exigiria cookies, credenciais CORS e proteção contra CSRF.

## Consequências

O fluxo permanece simples e adequado ao MVP local. O logout impede novas
requisições pelo navegador atual, mas não revoga tokens já emitidos. Revogação,
refresh token e recuperação de senha ficam como próximos passos.
