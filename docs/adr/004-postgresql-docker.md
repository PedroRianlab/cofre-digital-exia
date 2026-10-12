# 004 - PostgreSQL em Docker

**Status:** Aceito

## Contexto

O desenvolvimento local precisa de um banco relacional reproduzível sem exigir
uma instalação manual de PostgreSQL com a mesma configuração em cada máquina.

## Decisão

O PostgreSQL 17 Alpine roda pelo `docker-compose.yml` da raiz. A porta local é
`5433`, os dados usam o volume `postgres_data` e há um healthcheck com
`pg_isready`. O contêiner lê `backend/.env`. A API continua rodando localmente.

## Alternativas consideradas

- PostgreSQL instalado diretamente na máquina: aumenta diferenças entre
  ambientes locais.
- Colocar também a API em Docker: não foi necessário para o modo de execução
  local definido no README.

## Consequências

O banco tem versão e configuração reproduzíveis, com dados persistentes no
volume. Em troca, o desenvolvimento depende do Docker e usa a porta local 5433.
