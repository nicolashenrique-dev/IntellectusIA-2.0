# Limpeza e organização do código

Data: 15/10/2026.

## Alterações

- Extraído o catálogo de conteúdo de `roadmapController.js` para `services/roadmapCatalog.js`.
- Centralizadas as leituras e gravações de trilhas em `services/roadmapRepository.js`, preservando a seleção de armazenamento e o fallback de leitura existentes.
- Unificadas as duas implementações da chamada ao Gemini em `services/gemini.js`, mantendo endpoint, timeout, corpo da chamada e fallback nos controladores.
- Removidos status fixos dos templates: os pontos de criação já inicializam o progresso de cada conta separadamente.
- Extraída a página HTML do Swagger para `backend/config/swaggerPage.js`.
- Removidos 31 imports sem referência no frontend e imports sem uso na inicialização da API.
- Removidos componentes Toggle/ToggleRow e estado de notificações sem uso em Configuracao.
- Removido `src/pages/Roadmap.jsx`, arquivo vazio fora da árvore utilizada pelo Vite.
- Removida a segunda execução da autenticação na rota de recomendação, que já passa pelo middleware global da API. As demais proteções de acesso foram preservadas.
- Eliminadas alternativas de template que eram inalcançáveis por já existir a primeira opção.
- Padronizados frontend, backend, testes da API e scripts com Prettier 3.6.2. Estilos CSS receberam apenas formatação.
- Criados comandos de teste e de formatação na raiz e documentada a estrutura em README.md.

Não foram excluídos endpoints, telas, conteúdo de estudo ou funcionalidades de recuperação de senha. O mobile não teve código de execução alterado nesta limpeza. As alterações anteriores do diretório foram mantidas.

## Validação

- `npm test`: 27 testes de backend e 6 testes de sessão mobile aprovados, total de 33.
- Adicionados 4 testes do serviço compartilhado Gemini: contrato HTTP/JSON, falha HTTP, resposta inválida e ausência de chave sem chamada de rede.
- `npm run build --prefix frontend`: aprovado, 2.037 módulos compilados.
- `npm run format:check`: aprovado após aplicação final da formatação.

Os testes não comprovam login Firebase real, persistência remota, renderização em navegador ou funcionamento em dispositivo. As limitações da execução anterior continuam documentadas em RELATORIO_TESTES.md.

## Publicação

A consulta à Vercel confirmou acesso à equipe `ornicolas-projects` e aos projetos frontend/backend. A variável `FIREBASE_SERVICE_ACCOUNT` não estava cadastrada no backend de produção. A promoção da API depende dessa configuração para que as trilhas possam ser salvas. O resultado dos deploys será registrado abaixo após a conclusão.

## Compatibilidade do runtime Vercel

O primeiro preview compilou, mas a invocação HTTP falhou com `ERR_REQUIRE_ESM`: `jwks-rsa`, dependência do Firebase Admin, carrega `jose` por require. A falha foi reproduzida localmente com `node --no-experimental-require-module`. O carregamento passou com a opção habilitada.

Foi configurado `NODE_OPTIONS=--experimental-require-module` em `backend/vercel.json`, conforme a documentação oficial da Vercel. As versões das dependências foram preservadas.

Referências: [configuração Node.js na Vercel](https://vercel.com/docs/functions/runtimes/node-js/advanced-node-configuration) e [registro do problema no jwks-rsa](https://github.com/auth0/node-jwks-rsa/issues/507).

Também foi removido `backend/index.js`, servidor antigo de demonstração sem uso pelos scripts, que era detectado pela Vercel como uma segunda entrada. O backend continua usando `app.js`.

## Resultado final dos deploys

- Frontend publicado em produção: https://frontend-seven-iota-54.vercel.app.
- Deployment do frontend: `dpl_CcfmdpFcvwYgV2AoAXkW4cEZSV3N`, estado READY.
- `/login`, bundle principal e módulo compartilhado retornaram HTTP 200. A configuração publicada mantém o endereço atual da API de produção.
- Preview final do backend: https://backend-726wf87t5-ornicolas-projects.vercel.app, deployment `dpl_A78rqxA5Dm4KmxARFj1DnAthrgSh`, estado READY.
- Verificado pelo acesso autenticado da CLI Vercel: `/health` respondeu `status: ok` e `/api-docs.json` retornou HTTP 200. O preview possui proteção de acesso Vercel.
- A produção do backend não foi substituída: falta cadastrar `FIREBASE_SERVICE_ACCOUNT` em Production e Preview no projeto backend. O código de produção exige Firestore para salvar trilhas, portanto promover sem essa variável deixaria a gravação indisponível.
- Configuração pendente: https://vercel.com/ornicolas-projects/backend/settings/environment-variables. Após cadastrar o JSON da conta de serviço do projeto intelectusai, publicar um novo preview, validar persistência com uma conta de teste e promover o backend.

Não foi realizado teste visual de navegador nem teste de escrita real no Firestore. O sucesso do health check não comprova persistência.


Atualização final: a credencial de persistência foi cadastrada e o backend corrigido foi promovido para o domínio público usado pelo site. A personalização e a gravação foram confirmadas em teste integrado no Firestore; consulte a conclusão em RELATORIO_TESTES.md.
