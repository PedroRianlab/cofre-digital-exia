# Guia de Contribuição para o Cofre de Notas.

## 📁 Estrutura de Pastas

- `backend/`: API NestJS, schema e migrations do Prisma e testes do backend.
- `frontend/`: aplicação web (pasta reservada nesta etapa).
- Raiz: documentação, regras do projeto e `docker-compose.yml` do PostgreSQL.

## 📂 Estrutura do Repositório

- main: versão estável em produção.
- develop: versão de integração e homologação.
- feature/*: novas funcionalidades.
- fix/*: correções de bugs.
- hotfix/*: correções urgentes em produção.
- docs/*: alterações na documentação.
- test/*: experimentos e provas de conceito.

## 🌱 Nomeação de Branches

Padrão:
tipo/id-descritivo

Tipos válidos:

- feature/: nova funcionalidade
- fix/: correção de erro identificado
- hotfix/: correção crítica em produção
- refactor/: refatoração sem alterar comportamento
- docs/: alterações na documentação
- test/: testes ou protótipos

Exemplos:

- feature/RF05-cadastro-de-materiais
- fix/RF12-corrigir-calculo-estoque
- docs/atualizar-readme

## 📝 Commits

Tipos:

- feat: nova funcionalidade
- fix: correção
- refactor: refatoração
- docs: documentação
- test: testes
- chore: tarefas diversas (build, configs, CI/CD)

Exemplos:

- feat(RF03): implementar controle de entrada de materiais
- fix(RF08): corrigir bug na baixa de estoque
- docs: adicionar guia de contribuição
