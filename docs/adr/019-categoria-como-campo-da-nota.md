# 019 - Categoria como campo da nota

**Status:** Aceito

## Contexto

As notas precisam de uma classificação opcional e de filtro por essa
classificação, mantendo o escopo simples do MVP.

## Decisão

Armazenar `categoria` como um campo textual opcional da própria nota, limitado a
50 caracteres. A listagem combina o filtro de categoria com o `userId` do JWT.

## Alternativa descartada

Criar uma tabela separada de pastas e relacioná-la às notas.

## Motivo

O campo direto é mais simples e exige menos relacionamentos para o MVP.
