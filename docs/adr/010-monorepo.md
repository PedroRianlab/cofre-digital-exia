# 010 - Monorepo

**Status:** Aceito

## Contexto

O projeto prevê backend, frontend e documentação relacionados. Esses elementos
precisam permanecer fáceis de localizar e evoluir juntos.

## Decisão

Foi adotado um único repositório. A API e suas configurações ficam em
`backend/`. `frontend/` está reservado com `.gitkeep`. A documentação e o
`docker-compose.yml` ficam na raiz. Não há configuração de npm workspaces; os
comandos npm são executados dentro de `backend/`.

## Alternativas consideradas

- Repositórios separados: aumentariam a coordenação de versões e documentação
  para um MVP pequeno.
- Manter o backend na raiz: funcionava enquanto era a única aplicação, mas não
  deixava espaço equivalente para o frontend previsto.

## Consequências

Backend, futuro frontend e documentação compartilham histórico e revisão. Em
troca, comandos e referências precisam considerar o subdiretório correto.
