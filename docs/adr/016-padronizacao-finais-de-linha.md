# 016 - Padronização de finais de linha como LF

**Status:** Aceito

## Contexto

O projeto é desenvolvido em sistemas operacionais que usam formatos diferentes
para o fim de linha. Windows costuma usar CRLF (`\r\n`), enquanto Linux e macOS
usam LF (`\n`).

Essa diferença não altera a lógica da aplicação, mas pode causar avisos no
Prettier, diffs desnecessários no Git e PRs com arquivos inteiros marcados como
modificados.

## Decisão

Adotar LF como padrão para todos os arquivos de texto do repositório.

O arquivo `.gitattributes` na raiz define a regra `* text=auto eol=lf`, para que
o Git mantenha esse padrão independentemente do sistema operacional utilizado.

## Alternativa considerada

Configurar o Prettier com `endOfLine: auto` evitaria os avisos, mas permitiria
que diferentes formatos de fim de linha continuassem no repositório.

## Consequências

Arquivos de texto ficam consistentes em Windows, Linux e macOS. Diffs e PRs
ficam mais limpos, e Prettier e ESLint deixam de sinalizar erros de CRLF.
