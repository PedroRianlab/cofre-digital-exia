# 013 - Não revelar a existência de notas alheias

**Status:** Aceito

## Contexto

Uma requisição pode usar o id de uma nota inexistente ou o id de uma nota que
pertence a outro usuário. Respostas diferentes permitiriam confirmar que um
recurso privado existe, mesmo sem autorização para acessá-lo.

## Decisão

Consultas, atualizações e remoções filtram sempre por `id` e `userId`. Quando
nenhum registro corresponde aos dois valores, a API retorna HTTP 404 com a
mensagem `Nota não encontrada`, tanto para nota inexistente quanto para nota de
outro usuário.

## Alternativas consideradas

- Retornar HTTP 403 para nota de outro usuário: seria semanticamente possível,
  mas revelaria que o id informado corresponde a uma nota existente.
- Buscar primeiro somente pelo id e depois conferir o proprietário: facilitaria
  distinguir os casos e violaria a regra de autorização no acesso ao banco.

## Consequências

O cliente não consegue usar as respostas para enumerar notas de outros
usuários. Em troca, ele não distingue uma nota inexistente de uma nota à qual
não possui acesso, comportamento intencional para este cofre privado.
