# Publicação na Vercel

Projetos `frontend` e `backend`, equipe `ornicolas-projects`.

## Produção

- Site: https://frontend-seven-iota-54.vercel.app
- API usada pelo site: https://backend-ten-ecru-93.vercel.app
- Frontend: Vite, Node 24.x, `npm ci`, `npm run build`, saída `dist` e fallback de rotas para `index.html`.
- Backend: Express com entrada `app.js`, Node 24.x e duração máxima de função de 60 segundos.
- `backend/vercel.json` habilita `NODE_OPTIONS=--experimental-require-module` para compatibilidade das dependências do Firebase Admin no runtime Vercel.

## Variáveis

A configuração real fica no painel Vercel. Arquivos `.env`, testes e caches locais não são enviados no deploy.

- `FIREBASE_SERVICE_ACCOUNT`: configurada como segredo somente no backend, em Production e Preview. Permite acesso administrativo ao Firestore de `intelectusai`.
- `FIREBASE_PROJECT_ID`: `intelectusai`, no backend.
- `JWT_SECRET` e `YOUTUBE_API_KEY`: configuradas no backend.
- `GEMINI_API_KEY`: opcional, ainda não configurada nesta validação. Sem ela, os planos usam conteúdo de reserva adaptado a área, nível e objetivo; não se deve afirmar que foram gerados pelo Gemini.
- `VITE_FIREBASE_*` e `VITE_API_URL`: configuração do frontend. Nunca cadastrar a conta de serviço em variáveis `VITE_*`.

Não manter a conta de serviço no repositório. Para substituir uma chave, cadastrar a nova na Vercel, publicar e validar o backend, e revogar a anterior no Firebase/Google Cloud.

## Verificação antes de publicar

```powershell
npm test
npm run build --prefix frontend
npm run format:check
```

`npm run deploy:check` verifica arquivos locais; ele pode apontar a ausência da conta de serviço local mesmo quando ela está configurada corretamente no painel Vercel. Não baixar credenciais de produção para resolver apenas essa checagem.

Frontend e backend são publicados separadamente. A configuração de variáveis exige novo deployment para entrar em vigor. Verificar que o domínio em `VITE_API_URL` aponta para o novo backend, além de conferir o estado READY do deployment.

## Validação de personalização

Foi testada uma conta temporária no backend público: TI → Negócios → Negócios avançado/transição → Design → Dados. Cada geração foi conferida pela leitura HTTP e por leitura administrativa direta no Firestore. Progresso de TI não foi reaproveitado na nova trilha. A busca oficial do YouTube retornou quatro vídeos pertinentes ao módulo de proposta de valor. A conta e o documento de diagnóstico foram excluídos ao final.

Refazer o questionário é necessário para substituir uma trilha antiga. Os checks locais de vídeos assistidos continuam por navegador e conta; não são sincronizados pelo Firestore.

Regras Firestore publicadas e domínios autorizados do Firebase Authentication exigem verificação própria. Esta publicação não alterou as regras nem a lista de domínios autorizados.

Referências: https://vercel.com/docs/frameworks/frontend/vite e https://vercel.com/docs/frameworks/backend/express.
