# 020 - Swagger como documentação e teste manual

**Status:** Aceito

## Contexto

O backend precisa expor seus contratos de forma legível e permitir que os
endpoints sejam testados manualmente sem manter comandos HTTP separados.

## Decisão

Usar `@nestjs/swagger` e disponibilizar a interface em `/docs` em todos os
ambientes. As rotas de notas usam autenticação bearer, enquanto cadastro e login
permanecem públicos. O Zod continua sendo a fonte da validação em execução.

Os decorators do Swagger permanecem junto aos métodos do controller para manter
a documentação próxima da rota que ela descreve. Se a repetição crescer, podem
ser substituídos por decorators compostos. Interfaces não são usadas para essa
finalidade porque não existem em runtime e não fornecem os metadados que o
Swagger precisa.

## Alternativa descartada

Manter uma collection do Postman versionada no repositório.

Separar a documentação em interfaces implementadas pelos controllers. Apesar de
deixar os controllers menores, interfaces TypeScript são removidas na execução
e não são lidas pelo Swagger.

## Consequências

O Swagger facilita a consulta e o teste manual no navegador. Como os modelos de
documentação são separados dos schemas Zod, seus limites ficam duplicados e
precisam ser atualizados em conjunto. Uma evolução futura é gerar o OpenAPI a
partir do Zod.
