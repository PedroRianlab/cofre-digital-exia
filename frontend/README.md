# Frontend — Cofre de Notas

Interface do MVP de notas privadas, feita com Next.js. Nesta etapa existe apenas a base do projeto e suas dependências; as telas serão adicionadas nas próximas etapas.

## Requisitos

- Node.js 20.19 ou superior
- npm

## Como executar

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:3000` no navegador.

## Dependências instaladas

| Pacote | Versão | Uso no projeto |
| --- | --- | --- |
| `next` | 16.4.1 | Framework React e rotas do frontend. |
| `react` | 19.3.0 | Criação da interface. |
| `react-dom` | 19.3.0 | Renderização do React no navegador. |
| `tailwindcss` | 4.3.3 | Estilos por classes; será a base visual inspirada no Claude. |
| `@tailwindcss/turbopack` | 4.3.3 | Integração do Tailwind com o ambiente de desenvolvimento. |
| `axios` | 1.20.0 | Chamadas HTTP para a API NestJS. |
| `react-hook-form` | 7.90.0 | Controle dos formulários de login, cadastro e notas. |
| `lucide-react` | 1.57.0 | Ícones da interface. |
| `clsx` | 2.1.1 | Combina classes CSS condicionalmente. |
| `tailwind-merge` | 3.7.0 | Resolve conflitos entre classes do Tailwind. |
| `class-variance-authority` | 0.7.1 | Define variações reutilizáveis, como botão normal e botão de perigo. |
| `@radix-ui/react-dialog` | 1.3.1 | Comportamento acessível para diálogos, como confirmar exclusão. |
| `@radix-ui/react-label` | 2.1.17 | Rótulos de formulário acessíveis. |

## Ferramentas de desenvolvimento

| Pacote | Versão | Uso no projeto |
| --- | --- | --- |
| `shadcn` | 4.21.5 | CLI para adicionar componentes que ficam no nosso próprio código. |
| `typescript` | 5.9.3 | Tipagem estática. |
| `eslint` | 9.39.5 | Verificação de qualidade do código. |
| `eslint-config-next` | 16.4.1 | Regras de lint recomendadas pelo Next.js. |

## Decisão sobre componentes

Usaremos Shadcn para gerar apenas os componentes necessários. Ele usa Tailwind para o visual e Radix quando precisamos de comportamento mais complexo e acessível. Por enquanto, `Dialog` e `Label` são os únicos pacotes Radix instalados; novos pacotes só entram quando um componente real exigir.

