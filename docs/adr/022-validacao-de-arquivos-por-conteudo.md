# 022 - Validação de arquivos por conteúdo

**Status:** Aceito

## Contexto

Extensão e `Content-Type` são informados pelo cliente e podem ser falsificados.
O backend precisa aceitar somente os formatos previstos para o MVP.

## Decisão

Usar `file-type` para identificar os magic bytes e comparar o par extensão/MIME
detectado com uma lista explícita: PDF, MP3, WAV, OGG, M4A, PNG, JPEG, WEBP e
GIF. O MIME persistido é sempre o detectado.

SVG, HTML, tipos desconhecidos e qualquer formato fora da lista são rejeitados
com HTTP 415. SVG permanece proibido porque pode conter scripts.

## Alternativa descartada

Confiar na extensão, no nome ou no `Content-Type` enviado pelo cliente.

## Consequências

A inspeção por assinatura reduz uploads disfarçados, mas não substitui
antivírus nem valida integralmente todo o conteúdo do arquivo.
