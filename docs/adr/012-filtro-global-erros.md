# 012 - Filtro global de erros HTTP

**Status:** Aceito

## Contexto

Erros de diferentes partes da API precisam ter um formato previsível. Falhas
internas não podem revelar mensagens técnicas ao cliente.

## Decisão

`HttpExceptionFilter`, em
`backend/src/common/filters/http-exception.filter.ts`, é registrado globalmente
em `backend/src/main.ts`. A resposta contém `statusCode`, `message`, `path` e
`timestamp`. Erros 400 podem incluir `fields`. Erros 500 recebem a mensagem
genérica `Erro interno do servidor`.

## Alternativas consideradas

- Usar apenas o filtro padrão do NestJS: não entregaria exatamente o formato
  definido pelo projeto.
- Tratar erros em cada controller: duplicaria o mapeamento e facilitaria
  respostas inconsistentes.

## Consequências

Os clientes recebem uma estrutura uniforme e detalhes internos de erros 500 são
ocultados. Em troca, o filtro global precisa conhecer os campos que podem ser
expostos. O comportamento de erro 500 é coberto pelo teste e2e.
