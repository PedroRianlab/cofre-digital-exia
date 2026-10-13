# 018 - Limite global de requisições e limite de body

**Status:** Aceito

## Contexto

Login e cadastro já possuíam limites próprios. As rotas autenticadas e o tamanho
total de uma requisição ainda precisavam de proteção básica contra abuso.

## Decisão

Aplicar globalmente o `ThrottlerGuard` e limitar rotas autenticadas a 100
requisições por IP a cada 60 segundos. Login e cadastro mantêm seus limites
separados. Limitar o corpo JSON a 100 KB e responder 413 quando ele for excedido.

## Alternativas consideradas

Um limite único para todas as rotas seria mais simples, mas poderia contar login
e cadastro duas vezes. Redis permitiria compartilhar contadores entre
instâncias, porém adicionaria infraestrutura fora do MVP.

## Consequências

As variáveis de ambiente permitem ajustar os limites. Os contadores continuam
em memória e são apagados quando a API reinicia.
