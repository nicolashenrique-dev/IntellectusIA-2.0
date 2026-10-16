# Relatório de testes e correções — IntelectusIA

Data: 15/10/2026.

## Escopo e base dos casos

Foram usados os testes existentes em `backend/tests` e `mobile/IntelectusIA/tests`, os requisitos RF01 a RF09 de `doc/instrucoes.txt` e os passos de conferência de `REFINAMENTO.md`. Não foi identificado um arquivo separado com uma matriz formal de casos de teste nos arquivos textuais consultados. O PDF da sprint não foi extraído nesta execução. Os casos abaixo documentam a cobertura efetivamente executada, sem afirmar validação integral de todos os requisitos.

As alterações já existentes no diretório foram preservadas. Esta revisão alterou a validação do questionário em `backend/src/services/learningProfile.js`, a seleção de templates em `backend/src/controllers/roadmapController.js` e adicionou `backend/tests/inputValidation.test.js` e este relatório.

## Resultado

| Verificação | Antes das correções | Depois |
| --- | --- | --- |
| Suíte existente do backend | 20 aprovados | 20 aprovados |
| Novos testes de regressão | 3 falharam, reproduzindo os bugs | 3 aprovados |
| Sessão mobile | 6 aprovados | 6 aprovados |
| Build de produção web | Aprovado | Código web não alterado após o build |

Total final: 29 testes automatizados aprovados, zero falhas. O build web compilou 2.037 módulos com sucesso. O build comprova compilação; não comprova interação visual nem compatibilidade entre navegadores.

## Bugs encontrados e corrigidos

### BUG-01 — Questionário aceita códigos inválidos por herança de objetos

Severidade: média. Requisitos relacionados: RF02, RF04 e RF06.

Reprodução: chamar a geração com `profile: { interestCode: 'constructor' }`. Antes, a verificação por acesso direto ao catálogo considerava a propriedade herdada válida, e a criação da trilha terminava em erro 500. Códigos como `__proto__` e `toString` também podiam passar pela validação. Arrays podiam ser convertidos implicitamente em chaves, como `interestCode: ['TI']`.

Esperado: rejeitar entradas inválidas com 400 e não salvar trilha.

Correção: verificar o formato do perfil e dos códigos e usar `Object.hasOwn` nos catálogos de área, nível e objetivo, inclusive na compatibilidade com respostas antigas por texto.

Evidências: os testes de rejeição de códigos e de retorno 400 falharam antes da alteração e passaram depois. A regressão verifica os três campos de código, nomes herdados, arrays, objetos e perfis de formato inválido; também confirma que a tentativa inválida não criou uma trilha.

### BUG-02 — Inscrição com nome herdado causa erro interno

Severidade: média. Requisitos relacionados: RF04 e acesso às trilhas.

Reprodução: inscrever uma conta de teste em uma trilha chamada `constructor`, `__proto__` ou `toString`. Antes, o nome selecionava uma propriedade herdada de Object como se fosse um template; a leitura de `template.nodes.map` causava erro 500.

Esperado: seguir o comportamento já implementado para nomes sem template, criando uma trilha genérica com o nome solicitado.

Correção: selecionar templates somente quando o nome for uma propriedade própria de `TRILHAS_PADRAO`.

Evidência: o teste de inscrição falhou com 500 antes da alteração e passou depois, confirmando resposta 200, título correto e primeiro módulo disponível.

## Casos e cobertura executados

| Caso | Comportamento verificado | Resultado |
| --- | --- | --- |
| CT01 | Cadastro válido, e-mail duplicado, rejeição de UID informado e omissão de hash nas respostas | Aprovado |
| CT02 | Login interno válido e rejeição de tokens sem assinatura | Aprovado |
| CT03 | Bloqueio de leitura/modificação de outra conta e acesso administrativo | Aprovado |
| CT04 | As 36 combinações de área, experiência e objetivo produzem conteúdos distintos | Aprovado |
| CT05 | Compatibilidade de respostas antigas e rejeição de interesses desconhecidos | Aprovado |
| CT06 | Rejeição de respostas incompletas da IA | Aprovado com dados simulados |
| CT07 | Desbloqueio sequencial, bloqueio de salto de módulos e isolamento entre contas | Aprovado |
| CT08 | Rejeição de status inválido e substituição da trilha ao refazer questionário | Aprovado |
| CT09 | Pontuação por conclusão e ausência de bônus duplicado em repetição | Aprovado |
| CT10 | Rotas HTTP protegidas e seleção correta por ID de catálogo | Aprovado |
| CT11 | Extração de resultados do YouTube e falha externa sem vídeos inventados | Aprovado com fontes simuladas |
| CT12 | Sessão mobile: lembrar, restaurar, sair, falha de rede e concorrência de renovação/logout | 6 testes aprovados |
| CT13 | Códigos herdados, tipos inválidos e tentativa inválida sem persistência | Aprovado após correção |
| CT14 | Inscrição com nomes herdados de Object | Aprovado após correção |
| CT15 | Compilação de produção do frontend | Aprovado |

## Comandos reproduzíveis

```powershell
npm test --prefix backend
node --test mobile/IntelectusIA/tests/session.test.mjs
npm run build --prefix frontend
```

Para executar somente as novas regressões:

```powershell
node backend/tests/inputValidation.test.js
```

A primeira tentativa dos comandos com subprocessos falhou por restrição do ambiente (`spawn EPERM`). Os comandos foram executados novamente com autorização e passaram. Essa falha inicial foi de infraestrutura, não um bug da aplicação.

## Limitações e pendências de validação

- Os testes do backend usam configuração de teste e armazenamento isolado; não validam escrita real no Firestore.
- Gemini e YouTube foram verificados por respostas simuladas ou fallback; não foi validada a disponibilidade remota nem a qualidade de uma geração real do Gemini.
- Não foram criadas contas reais, enviados e-mails de recuperação ou validados provedores sociais.
- Não foram executados testes visuais no navegador ou no dispositivo/emulador. Árvore interativa, detalhes dos módulos, responsividade e compatibilidade Chrome/Firefox/Edge continuam pendentes de teste manual ou E2E.
- Os seis testes mobile cobrem o serviço de sessão, sem comprovar os fluxos completos das telas no Expo.
- Desempenho com carga, disponibilidade de 99%, conformidade integral com LGPD e banco publicado não foram certificados por esta execução.

As correções foram verificadas localmente; não houve publicação ou implantação.

## Atualização após limpeza do código

A revisão de organização posterior adicionou quatro testes do serviço compartilhado Gemini. O total passou a 27 testes de backend e 6 de sessão mobile, todos aprovados (33 no total). O build web e a checagem Prettier também passaram. Os resultados e deploys dessa etapa estão em `LIMPEZA_CODIGO.md`.

## Correção da busca de vídeos dos módulos

A requisição pública de diagnóstico a `/ia/videos?tema=HTML%20%26%20CSS%20Moderno&nivel=Iniciante` na API atual de produção retornou HTTP 401 com a mensagem de token ausente. A inspeção da Vercel confirmou que esse domínio ainda aponta ao deployment de backend de 19/06/2026, no qual essa rota exige autenticação.

As telas `frontend/src/pages/Roadmap.jsx` e `frontend/src/pages/MinhasTrilhasPage.jsx` buscavam vídeos sem Authorization. Ambas passaram a usar o helper existente `fetchComAuth`, que obtém o ID token da sessão Firebase e o envia no cabeçalho. A tela de recomendação já enviava o token.

Validação: teste isolado do helper real confirmou envio do token, preservação dos demais cabeçalhos e rejeição antes da chamada HTTP quando não há usuário. Build web e checagem de formatação aprovados. Não foram usadas credenciais de uma conta real; a reprodução completa do vídeo no navegador continua dependendo de uma sessão autenticada e da disponibilidade do YouTube.

Publicação da correção: frontend de produção atualizado no deployment `dpl_CDEoVPUfrKFocgPPbSXQT3851Hgx`, estado READY, em https://frontend-seven-iota-54.vercel.app. Verificação HTTP posterior confirmou `/roadmap` com status 200 e o bundle dessa tela importando o helper com `getIdToken` e `Authorization`.

### Reavaliação após repetição do erro

Foi criada uma conta Firebase isolada de diagnóstico, usada apenas para consultar vídeos, e excluída ao final. Com seu ID token, a API de produção respondeu HTTP 200 e retornou quatro vídeos para `HTML & CSS Moderno` no nível Iniciante. Não foram lidos nem alterados dados da conta do usuário.

O preflight CORS retornou HTTP 204, com origem `*` e cabeçalhos `Content-Type,Authorization` permitidos. No domínio `frontend-seven-iota-54.vercel.app`, os bundles publicados de Roadmap e Dashboard referenciam o helper de autenticação atualizado. O HTML usa `max-age=0, must-revalidate`.

O erro relatado novamente ainda não foi reproduzido nessa combinação de domínio e sessão autenticada. Foi solicitado o endereço exato da página afetada para verificar se o usuário acessa outro deployment ou o ambiente local. Nenhuma nova alteração especulativa foi publicada nesta reavaliação.

## Personalização — reprodução em produção e correção preparada

A troca foi reproduzida com uma conta Firebase temporária isolada, excluída ao final. Foram enviados os campos do Quiz, primeiro TI e depois MARKETING, na mesma conta. A API de produção respondeu HTTP 200 nas duas tentativas, mas devolveu Desenvolvimento Web Fullstack e HTML & CSS Moderno em ambas. As leituras posteriores repetiram esses módulos. O domínio de produção ainda usa o backend antigo.

Correções adicionais: inscrição por nomes como Negocios, Marketing Digital e Produto e Negócios seleciona conteúdo de marketing. A normalização aceita negócios com ou sem acento e referências a produto. O Quiz valida os códigos de área, nível e objetivo da resposta e confirma por releitura que os módulos gerados foram salvos antes de navegar. Essa confirmação desconsidera a ordem dos campos dos objetos retornados pelo Firestore, mas exige a mesma sequência de módulos e conteúdo.

Novos testes HTTP trocam TI, MARKETING, DESIGN e DATA na mesma conta, verificam conteúdo salvo e progresso reiniciado e mudam nível e objetivo de MARKETING. Usam armazenamento isolado em memória. Os cinco testes frontend rejeitam o fallback Fullstack sem perfil, perfil divergente e módulos antigos; aceitam gravação correta mesmo com campos reordenados.

Validação final: 28 testes backend, 5 frontend e 6 de sessão mobile aprovados (39 no total). O teste adicional de ordenação foi executado depois da suíte completa. Build e formatação verificados.

Preview atualizado do backend: https://backend-8v1raneq1-ornicolas-projects.vercel.app — deployment dpl_4RTahuDCda9rYBg5NC95Xv7oupfp, READY.

A produção não foi substituída nesta revisão. A consulta à Vercel ainda mostrou apenas FIREBASE_PROJECT_ID, JWT_SECRET e YOUTUBE_API_KEY no backend, sem FIREBASE_SERVICE_ACCOUNT. É necessário cadastrar essa credencial do projeto Firebase intelectusai em Production e Preview para validar a persistência real e promover o backend junto ao frontend. Foi solicitada essa configuração ao usuário, sem pedir que envie a chave na conversa.
## Conclusão da publicação com Firestore — 15/10/2026

A credencial administrativa foi validada com uma leitura de diagnóstico e cadastrada como segredo no backend Vercel, em Production e Preview. O projeto Firebase do backend foi confirmado como intelectusai. Não foram gravadas credenciais no código-fonte ou nos relatórios.

O deployment backend dpl_99UHw2JpJ29PcKr6X7K3DaEz12v1 foi testado, promovido e recebeu o alias público https://backend-ten-ecru-93.vercel.app, que é usado pelo frontend. Assim, a produção deixou de usar a versão antiga de junho.

Validação integrada com conta temporária na URL pública:

| Perfil | Primeiro módulo retornado e salvo |
| --- | --- |
| TI / iniciante / emprego | Lógica de programação |
| Negócios / iniciante / emprego | Fundamentos de marketing e proposta de valor |
| Negócios / avançado / transição | Estratégia de crescimento de negócios |
| Design / intermediário / especialização | Entrevistas e síntese de pesquisa UX |
| Dados / intermediário / emprego | SQL para análise de dados |

Cada resposta foi comparada com a releitura HTTP e com o documento real no Firestore. Também foi concluído um módulo de TI antes da troca, e a nova trilha iniciou com progresso zerado. A busca oficial do YouTube retornou quatro vídeos sobre proposta de valor, posicionamento e fundamentos de marketing. A conta e o documento temporários do teste final foram excluídos.

A validação integrada passou no deployment protegido e depois no endereço público. A suíte local desta revisão permaneceu com 39 testes aprovados. A chave compartilhada na conversa deve ser substituída por outra cadastrada diretamente na Vercel e depois revogada no Firebase/Google Cloud. Os arquivos locais temporários de configuração e diagnóstico foram removidos ao encerrar a publicação.
Frontend final publicado: deployment dpl_CDGUcJMuGjJE59ActNHpYX2mpMo8, READY, em https://frontend-seven-iota-54.vercel.app. Backend de produção e frontend foram atualizados juntos nesta conclusão. Para substituir uma trilha antiga, refazer o questionário com a área desejada.