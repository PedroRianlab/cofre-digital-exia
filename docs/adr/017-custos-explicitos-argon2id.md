# 017 - Custos explícitos do Argon2id

**Status:** Aceito

## Contexto

Os padrões do pacote `argon2` podem mudar entre versões. Cadastro e hash falso
também precisam usar o mesmo custo para reduzir diferenças de tempo no login.

## Decisão

Usar uma única configuração com Argon2id, 19 MiB de memória, 2 iterações e
paralelismo 1. Cadastro e hash falso compartilham essa configuração.

## Alternativa considerada

Manter os padrões da biblioteca reduziria código, mas deixaria o custo implícito
e dependente da versão instalada.

## Consequências

O custo fica documentado e previsível. Hashes antigos continuam válidos porque
o formato do Argon2 registra os parâmetros usados em cada hash.
