# 006 - Hash falso no login

**Status:** Aceito

## Contexto

Retornar antes da verificação de senha quando o e-mail não existe pode tornar
o tempo de resposta diferente e ajudar a descobrir quais e-mails estão
cadastrados.

## Decisão

`AuthService`, em `backend/src/auth/auth.service.ts`, cria um hash Argon2id falso
uma vez em `onModuleInit`. No login, esse hash é verificado quando o usuário não
existe. Senha errada e e-mail ausente também usam a mesma mensagem de erro.

## Alternativas consideradas

- Retornar assim que o e-mail não for encontrado: economiza processamento, mas
  aumenta a diferença de tempo entre os casos.
- Gerar um novo hash falso em cada login: aumenta o custo sem necessidade; o
  hash atual é reutilizado.

## Consequências

Os dois caminhos executam uma verificação Argon2 e reduzem um sinal de enumeração
de usuários. Em troca, há custo na inicialização e em todo login inválido. A
técnica reduz diferenças de tempo, mas não garante tempos idênticos.
