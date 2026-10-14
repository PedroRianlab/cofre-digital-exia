# Segurança

Este documento descreve somente as proteções presentes no código atual.

## Proteções implementadas

- O Prisma usa consultas parametrizadas. Não há SQL cru no projeto.
- O Zod usa `.strict()`, limites de tamanho e UUID no parâmetro `:id`.
- Notas são consultadas por `id` e `userId`. Nota inexistente ou alheia retorna
  404.
- O JWT usa HS256, possui expiração e exige segredo com no mínimo 32 caracteres.
- Senhas usam Argon2id com 19 MiB de memória, 2 iterações e paralelismo 1.
- O login usa a mesma mensagem para e-mail inexistente ou senha incorreta.
- Um hash falso mantém o custo do login quando o e-mail não existe.
- O Helmet adiciona cabeçalhos HTTP de segurança.
- Login, cadastro e rotas autenticadas possuem limites de requisição por IP.
- O corpo JSON possui limite de 100 KB.
- Erros 500 não devolvem detalhes internos ao cliente.
- O arquivo `.env` é ignorado pelo Git.

## Dependências

Os números abaixo foram conferidos com o registro do npm em 13 de outubro de
2026.

- Produção: `npm audit --omit=dev` retornou 0 vulnerabilidades conhecidas.
- Desenvolvimento: `npm audit` retornou 35 alertas, sendo 29 altos e 6
  moderados. Eles estão concentrados no Jest 29 e em dependências transitivas.
- As dependências de desenvolvimento não vão para produção quando a instalação
  usa `npm install --omit=dev`. Imagens Docker de deploy devem usar essa opção.
- A decisão atual é não atualizar Jest e `ts-jest` no prazo do MVP. Uma
  atualização principal poderia quebrar a suíte de testes.
- O próximo passo é atualizar Jest e `ts-jest` e executar novamente todos os
  testes e2e.
- Nunca executar `npm audit fix --force`. Esse comando pode instalar versões
  incompatíveis sem revisão.

O `npm audit` detecta somente vulnerabilidades já conhecidas e publicadas em sua
base. Ele não substitui revisão de código nem testes de segurança.

## Limitações conhecidas e próximos passos

- O JWT não possui `issuer` nem `audience`. Eles são desnecessários neste
  monólito com um único emissor e consumidor.
- HTTPS não está configurado. É obrigatório em um deploy, mas não é necessário
  para o ambiente local em `localhost`.
- O rate limit usa memória e identifica clientes por IP. Múltiplas instâncias
  exigiriam armazenamento compartilhado, como Redis.
- Atrás de proxy ou balanceador, será necessário configurar `trust proxy` para
  identificar o IP real.
- Não há refresh token, recuperação de senha nem verificação de e-mail. Esses
  recursos estão fora do MVP.
- CORS e o armazenamento do token serão definidos junto com o frontend.
