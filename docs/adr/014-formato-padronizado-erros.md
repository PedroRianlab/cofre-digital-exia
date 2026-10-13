# 014 - Formato padronizado de erros e mensagens genéricas no 500

**Status:** Aceito

## Contexto

A API pode produzir erros de validação, autenticação, autorização, recurso não
encontrado e falhas internas. O cliente precisa receber um formato previsível,
mas detalhes de uma falha interna não podem ser expostos. Ao mesmo tempo, omitir
esses detalhes também do servidor dificultaria a investigação do problema.

## Decisão

O `HttpExceptionFilter` é registrado globalmente e devolve `statusCode`,
`message`, `path` e `timestamp`. Erros HTTP 400 podem acrescentar `fields` para
informar falhas de validação.

Erros HTTP 500 sempre respondem ao cliente com `Erro interno do servidor`. O
filtro registra método, rota e stack trace com `Logger.error`, mantendo os
detalhes disponíveis somente no servidor.

Uma suíte e2e isolada cria um controller apenas dentro de
`Test.createTestingModule`. Ela comprova o formato de 400, 401, 403, 404 e 500
sem importar o `AppModule` e sem depender do banco.

## Alternativas consideradas

- Usar apenas o filtro padrão do NestJS: não garantiria exatamente o contrato de
  resposta adotado pelo projeto.
- Tratar erros em cada controller: duplicaria código e facilitaria respostas
  inconsistentes.
- Enviar a mensagem original no 500: ajudaria o cliente a depurar, mas poderia
  revelar dados internos da aplicação.
- Ocultar o erro sem registrá-lo: protegeria a resposta, mas dificultaria a
  investigação no servidor.

## Consequências

Os clientes recebem um contrato uniforme sem detalhes internos de falhas 500.
Os desenvolvedores ainda conseguem investigar essas falhas pelo log local. Os
logs podem conter informações técnicas e, por isso, não devem ser enviados ao
cliente nem armazenar segredos presentes em payloads.

Este ADR substitui o ADR 012.
