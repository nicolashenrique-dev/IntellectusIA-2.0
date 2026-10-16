# Refinamento do Intellectus

## Interface

- Entrada e cadastro com composição editorial, tons naturais e textos voltados à descoberta e ao estudo.
- Painel com próximo passo, progresso real, catálogo de trilhas e navegação acessível por teclado.
- Menu para telas pequenas; estilos compartilhados de superfícies, campos e foco.
- Telas secundárias herdam a aparência escolhida. O padrão para novos visitantes é claro.
- Removidos indicadores inventados, plano Pro fixo e controles de notificação sem serviço implementado.

## Correções

- Sem “Lembrar de mim”, a autenticação fica somente em memória e termina ao recarregar ou fechar a página. Com a opção marcada, a sessão persiste. Navegação interna não encerra a conta.
- Recuperação de senha pelo Firebase e nome cadastrado no perfil de autenticação.
- Endereço do servidor centralizado em `frontend/src/utils/api.js`, com preferência por `VITE_API_URL`.
- Eliminadas a criação automática de conta com senha fictícia e a gravação duplicada da trilha no cliente.
- Falhas de carregamento são diferenciadas de ausência de trilha; falhas ao salvar progresso são informadas.
- Trilhas de reserva respeitam Design, Dados e Marketing; novas inscrições começam sem módulos concluídos.
- Cópias independentes dos módulos impedem compartilhamento acidental de progresso no modo de desenvolvimento.
- Rotas de trilhas verificam a conta autenticada antes de ler ou modificar os dados.
- Tokens sem assinatura só são aceitos mediante `ALLOW_MOCK_AUTH=true` fora de produção. A autenticação JWT interna exige `JWT_SECRET`; foi removido o segredo padrão conhecido. O login Firebase exige Firebase Admin corretamente configurado no servidor.

## Verificação realizada

- Compilação de produção do frontend aprovada.
- Testes automatizados de extração de vídeos, trilhas de reserva por interesse, desbloqueio do próximo módulo, isolamento de progresso, validação de status e autorização por conta aprovados.
- Prévia local iniciada em http://127.0.0.1:5173.

## Limites da validação

O navegador da ferramenta recusou os endereços locais (`ERR_BLOCKED_BY_CLIENT`). Assim, a aparência renderizada em desktop/celular e a navegação visual não foram confirmadas nesta sessão.

Não foram usados dados de contas reais nem disparados e-mails. Cadastro, entrada, recuperação de senha, persistência no Firestore, geração remota pelo Gemini e disponibilidade atual dos vídeos do YouTube ainda precisam de teste integrado com as credenciais do projeto. Os testes automatizados de trilhas usam armazenamento isolado em memória e não comprovam a disponibilidade desses serviços.

O build ainda informa um pacote inicial acima de 500 kB, predominantemente com as dependências compartilhadas. As telas de estudo são carregadas sob demanda.

## Como conferir

1. Rodar `npm run dev --prefix frontend` e abrir a prévia local.
2. Em ambiente de teste, cadastrar uma conta e verificar nome, sessão e recuperação de senha.
3. Responder ao questionário, abrir um módulo, carregar vídeos e concluir o módulo.
4. Reabrir a trilha e conferir desbloqueio e progresso no painel.
5. Conferir as mesmas telas em celular e alternar os temas nas configurações.
6. Rodar `npm run build --prefix frontend` e `node --test backend/tests/*.test.js`.

Nenhuma publicação ou alteração no aplicativo mobile foi realizada nesta revisão.

## Correção de trilhas repetidas e vídeos — revisão seguinte

A interface em desenvolvimento ainda apontava para o backend publicado, que não recebia as alterações locais. Agora usa `/backend`, encaminhado pelo Vite ao servidor local na porta 3000. `npm run dev` na raiz inicia os dois processos; `VITE_DEV_API_URL` permite escolher outro backend explicitamente. Builds de produção continuam usando `VITE_API_URL` e precisam de publicação separada para receber essas mudanças.

O questionário envia identificadores estáveis de área, experiência e objetivo. Os planos de reserva contemplam as 36 combinações, com assuntos diferentes por nível e atividades finais diferentes por objetivo. Respostas antigas por texto continuam aceitas. Conteúdo inválido da IA é rejeitado; falha na gravação do Firestore não é mais apresentada como sucesso com recuperação posterior da trilha antiga.

O backend local valida tokens Firebase com o projeto configurado, mesmo sem credenciais de escrita no Firestore. Nesse caso, guarda as trilhas em `backend/.local/roadmaps.json`, ignorado pelo Git, para manter o progresso entre reinicializações. Produção exige persistência no Firestore. Dados do backend remoto não são migrados automaticamente para o local.

A busca de vídeos não inventa títulos nem reaproveita vídeos fixos de outro assunto. Consultas externas têm tempo limite; falhas oferecem nova tentativa e pesquisa direta no YouTube. Foi confirmado via HTTP, através do proxy do frontend, que a busca de “Pesquisa com usuários” retorna vídeos reais sobre UX.

Verificação: build aprovado e 11 testes em quatro arquivos aprovados, incluindo as 36 combinações, substituição da trilha na mesma conta, validação da resposta da IA e indisponibilidade das fontes de vídeo. O acesso visual à aba do usuário e a geração com sua conta não foram confirmados pela ferramenta. Gemini não está configurado no ambiente local; os planos adaptados funcionam sem ele.
