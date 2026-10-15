# 024 - Frontend Next.js organizado por feature

**Status:** Aceito

## Contexto

O frontend precisava integrar autenticação, notas e arquivos privados sem
adicionar bibliotecas de estado ou aumentar a complexidade do MVP. A interface
também precisava compartilhar os contratos e erros da API de forma legível.

Este ADR atualiza a parte do [ADR 010](010-monorepo.md) que tratava o frontend
apenas como um espaço reservado.

## Decisão

Foi adotado Next.js com App Router e organização por feature:

- `app/` define rotas e layouts;
- `features/` reúne componentes, tipos, validações e chamadas HTTP de cada fluxo;
- `components/` contém apenas elementos compartilhados;
- `lib/api.ts` centraliza Axios, envio do JWT e mensagens de erro;
- `providers/` controla a sessão da interface.

React Hook Form é usado somente nos três formulários existentes: autenticação,
nota e upload. Ele controla validação, submissão e bloqueio durante o envio. O
restante da interface usa principalmente hooks nativos do React: `useState`
para busca, loading, coleções, diálogos e previews; Context e
`useSyncExternalStore` para a sessão.
O JWT fica no `sessionStorage`, conforme o [ADR 023](023-jwt-sem-logout-refresh.md).
Notas são exibidas como texto e previews de imagens e PDFs são carregados sob
demanda por uma rota autenticada.

## Alternativas consideradas

- Estado global com Zustand ou React Query: traria cache e sincronização, mas
  adicionaria dependências desnecessárias para o tamanho atual.
- Concentrar tudo nas páginas: reduziria arquivos, mas misturaria interface,
  validação e comunicação HTTP.
- Carregar previews automaticamente: melhoraria a descoberta visual, mas
  aumentaria consumo de rede e gerenciamento de blobs.

## Consequências

Cada funcionalidade pode evoluir isoladamente e as chamadas à API permanecem
centralizadas. Em troca, atualização de cache e sincronização são manuais.

O blur dos cards é somente visual; a proteção real continua no backend. O uso
de `sessionStorage` mantém o MVP simples, mas um XSS poderia expor o token. O
frontend ainda não possui testes automatizados próprios.
