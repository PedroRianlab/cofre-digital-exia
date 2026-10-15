# 021 - Armazenamento local em disco em vez de S3

**Status:** Aceito

## Contexto

O MVP precisa armazenar arquivos privados e será executado localmente, sem
infraestrutura de nuvem ou necessidade de múltiplas instâncias da API.

## Decisão

Salvar os arquivos em uma pasta privada configurada por `STORAGE_DIR`. O nome
físico é um UUID gerado pela API e o nome original permanece somente como
metadado no banco.

## Alternativa descartada

Usar um serviço de objetos compatível com S3 nesta etapa.

## Consequências

A solução local é simples e suficiente para o MVP. O disco não escala entre
múltiplas instâncias, não possui redundância automática e exige estratégia de
backup em uma evolução futura.
