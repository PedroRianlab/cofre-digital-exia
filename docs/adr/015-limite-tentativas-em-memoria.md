# 015 - Limite de tentativas em memória por IP

**Status:** Aceito

## Contexto

Login e cadastro executam Argon2 e precisam de proteção básica contra abuso.

## Decisão

Usar `@nestjs/throttler` por IP, com contadores em memória: 5 tentativas de
login e 10 de cadastro em 60 segundos. Helmet protege os cabeçalhos HTTP.

## Alternativa considerada

Redis compartilhado manteria contadores entre instâncias e reinícios, mas
adicionaria infraestrutura desnecessária ao MVP local de instância única.

## Consequências

Reinícios limpam os contadores. Proxy exige `trust proxy`, e usuários no mesmo
IP compartilham o limite. Uma implantação distribuída deverá adotar Redis.
