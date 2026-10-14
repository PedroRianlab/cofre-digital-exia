# 005 - Argon2id para senhas

**Status:** Aceito

## Contexto

Senhas não podem ser armazenadas em texto puro. O cadastro precisa produzir um
hash resistente a ataques de força bruta.

## Decisão

Foi adotado Argon2id por meio do pacote `argon2`. `AuthService.register`, em
`backend/src/auth/auth.service.ts`, gera o hash antes de chamar `UsersService`.
O login usa `argon2.verify`. O teste e2e confirma o prefixo `$argon2id$` e que a
senha original não foi armazenada.

## Alternativas consideradas

- bcrypt: era uma opção aceita no escopo, mas Argon2id foi escolhido no código.
- Hash rápido, como SHA-256: não é adequado sozinho para armazenamento de
  senhas, pois facilita tentativas em grande volume.

## Consequências

As senhas recebem um algoritmo próprio para esse uso. Em troca, cadastro e
login consomem mais CPU e dependem do pacote nativo `argon2`.
