# Segurança

Resumo das proteções presentes no código atual. As decisões completas estão nos
[ADRs](decisoes.md).

## Proteções implementadas

### Identidade e sessão

- Senhas recebem hash Argon2id antes de serem armazenadas.
- JWT usa HS256, expiração configurável e segredo de no mínimo 32 caracteres.
- Login inválido usa uma mensagem única e executa um hash falso quando o e-mail
  não existe.
- O frontend remove o token ao sair e redireciona sessões expiradas.

### Autorização

- Toda rota privada passa pelo `JwtAuthGuard`.
- O `userId` é extraído do JWT e nunca aceito no payload do recurso.
- Notas e arquivos são acessados sempre por `id + userId`.
- Recursos inexistentes e recursos de outra pessoa retornam o mesmo `404`.

### Entrada, HTTP e abuso

- Zod valida bodies, queries e parâmetros, limita tamanhos e rejeita campos
  extras.
- Helmet adiciona cabeçalhos de segurança e o CORS aceita uma origem definida.
- O corpo JSON possui limite de 100 KB.
- Login, cadastro, upload e rotas autenticadas possuem limites por IP.
- Erros `500` são registrados internamente sem expor detalhes ao cliente.

### Arquivos e conteúdo

- Uploads têm tamanho máximo configurável e formatos permitidos explícitos.
- O tipo real é conferido pela assinatura binária do arquivo.
- Arquivos físicos usam UUID e ficam fora de uma pasta pública.
- Downloads usam `attachment`, `nosniff` e `Cache-Control: private, no-store`.
- Notas são renderizadas como texto, sem `dangerouslySetInnerHTML`.

## Limitações aceitas no MVP

- O JWT fica no `sessionStorage`; uma falha XSS poderia expor o token.
- O logout não revoga no backend um token já emitido. Ele funciona até expirar.
- O blur dos cards é somente visual no frontend e não representa criptografia.
- Notas e arquivos não possuem criptografia em repouso.
- O rate limit usa memória e IP, sem estado compartilhado entre instâncias.
- Arquivos ficam no disco local, sem antivírus, cota por usuário ou remoção de
  metadados EXIF.
- HTTPS, auditoria independente e teste de penetração não fazem parte da entrega
  local.

## Evoluções planejadas

- Criptografia em repouso com AES-256-GCM e rotação segura de chaves.
- Compartilhamento seguro e temporário com expiração e revogação.
- Refresh token, revogação de sessões e recuperação de senha.
- Cookies `HttpOnly` com proteção CSRF, caso o modelo de sessão seja alterado.
- Armazenamento compartilhado, auditoria de acessos e rate limit distribuído.

## Verificação

Os testes E2E verificam autenticação, isolamento entre usuários, arquivos
disfarçados, limites, respostas `404`, erros sem vazamento, CORS, Helmet e rate
limit. Para uma revisão de dependências, execute `npm audit` em cada aplicação;
o resultado deve ser analisado antes de qualquer atualização automática.
